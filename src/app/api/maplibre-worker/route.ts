import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-static";

const log = logger.child({ route: "maplibre-worker" });

const WORKER_FILE = path.join(
  process.cwd(),
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
);

let cachedWorker: Buffer | null = null;

/**
 * Same-origin MapLibre module worker. InteractiveSiteMap calls setWorkerUrl
 * here so Next’s bundled `import.meta.url` is not used to locate the file.
 */
export async function GET() {
  try {
    if (!cachedWorker) {
      cachedWorker = await readFile(WORKER_FILE);
    }
    return new NextResponse(new Uint8Array(cachedWorker), {
      status: 200,
      headers: {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    log.error({ err }, "Failed to read MapLibre worker");
    return new NextResponse("Worker unavailable", { status: 500 });
  }
}
