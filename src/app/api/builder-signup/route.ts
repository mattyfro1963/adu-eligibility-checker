import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  builderWebhookUrl,
  dispatchWebhook,
} from "@/lib/leads/dispatch-webhook";
import { logger } from "@/lib/logger";
import { builderSignupBodySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const SIGNUP_LATENCY_MS = 400;
const log = logger.child({ route: "builder-signup" });

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = builderSignupBodySchema.safeParse(json);
  if (!parsed.success) {
    log.warn(
      {
        issues: parsed.error.issues,
        message: parsed.error.issues[0]?.message ?? "Invalid builder signup",
        status: 400,
      },
      "Builder signup validation failed",
    );
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid builder signup",
      },
      { status: 400 },
    );
  }

  const body = parsed.data;
  log.info(
    {
      company: body.company,
      licenseNumber: body.licenseNumber,
      email: body.email,
      serviceZips: body.serviceZips,
    },
    "Incoming builder signup",
  );
  console.log("Incoming Builder Signup:", body);

  await new Promise((resolve) => setTimeout(resolve, SIGNUP_LATENCY_MS));

  try {
    const content = [
      "**Builder partner signup**",
      `Company: ${body.company}`,
      `License: ${body.licenseNumber}`,
      `Email: ${body.email}`,
      `Service ZIPs: ${body.serviceZips}`,
      body.notes ? `Notes: ${body.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await dispatchWebhook(builderWebhookUrl(), content);

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "builder-signup" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ err: message, status: 500 }, "Builder signup failed");
    return NextResponse.json(
      { error: "Builder signup failed" },
      { status: 500 },
    );
  }
}
