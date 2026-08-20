import { logger } from "@/lib/logger";

const log = logger.child({ module: "dispatch-webhook" });

/**
 * Fire an optional Slack/Discord-compatible webhook.
 * Never throws — lead/builder APIs must succeed even if the webhook fails.
 */
export async function dispatchWebhook(
  url: string | undefined,
  content: string,
): Promise<void> {
  if (!url?.trim()) {
    return;
  }

  try {
    const res = await fetch(url.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      log.warn(
        { status: res.status, statusText: res.statusText },
        "Webhook dispatch non-2xx",
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.warn({ err: message }, "Webhook dispatch failed");
  }
}

export function leadWebhookUrl(): string | undefined {
  return process.env.LEAD_WEBHOOK_URL;
}

export function builderWebhookUrl(): string | undefined {
  return process.env.BUILDER_WEBHOOK_URL;
}
