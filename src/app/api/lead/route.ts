import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  builderWebhookUrl,
  dispatchWebhook,
  leadWebhookUrl,
} from "@/lib/leads/dispatch-webhook";
import { matchContractors } from "@/lib/leads/match-contractors";
import { logger } from "@/lib/logger";
import { leadBodySchema, type LeadBody } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const LEAD_LATENCY_MS = 600;
const log = logger.child({ route: "lead" });

function formatLeadWebhookContent(body: LeadBody): string {
  if (body.type === "project") {
    return [
      "**New project lead**",
      `Address: ${body.address}`,
      `Contact: ${body.name} (${body.email})`,
      body.phone ? `Phone: ${body.phone}` : null,
      `Intent: ${body.propertyIntent}`,
      `Structure: ${body.structure}`,
      `Budget: ${body.budget}`,
      body.overallStatus ? `Checker status: ${body.overallStatus}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (body.type === "quote_interest") {
    return [
      "**Quote interest**",
      `Contractor: ${body.contractorId}`,
      `Address: ${body.address}`,
      `Contact: ${body.name} (${body.email})`,
      body.phone ? `Phone: ${body.phone}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "**Restricted expert review**",
    `Address: ${body.address}`,
    `Contact: ${body.name} (${body.email})`,
    body.phone ? `Phone: ${body.phone}` : null,
    `Intent: ${body.intent}`,
    `Budget: ${body.budget}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadBodySchema.safeParse(json);
  if (!parsed.success) {
    log.warn(
      {
        issues: parsed.error.issues,
        message: parsed.error.issues[0]?.message ?? "Invalid lead body",
        status: 400,
      },
      "Lead validation failed",
    );
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid lead body" },
      { status: 400 },
    );
  }

  const body = parsed.data;
  log.info(
    {
      type: body.type,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
    },
    "Incoming lead payload",
  );

  await new Promise((resolve) => setTimeout(resolve, LEAD_LATENCY_MS));

  try {
    const structure =
      body.type === "project"
        ? body.structure
        : body.type === "quote_interest"
          ? (body.structure ?? "permanent_adu")
          : "permanent_adu";

    const matches = matchContractors({
      lat: body.lat,
      lng: body.lng,
      structure,
      limit: 3,
    });

    await dispatchWebhook(leadWebhookUrl(), formatLeadWebhookContent(body));

    if (!leadWebhookUrl() && builderWebhookUrl()) {
      await dispatchWebhook(
        builderWebhookUrl(),
        formatLeadWebhookContent(body),
      );
    }

    return NextResponse.json({ ok: true, success: true, matches });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "lead" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ err: message, status: 500 }, "Lead processing failed");
    return NextResponse.json(
      { error: "Lead processing failed" },
      { status: 500 },
    );
  }
}
