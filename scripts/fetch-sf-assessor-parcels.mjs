#!/usr/bin/env node
/**
 * Download SF assessor parcels (DataSF acdm-wktn) into a local GeoJSON snapshot.
 *
 * Full city (~228k active parcels) is too large for git — write to
 * public/data/sf-assessor-parcels.geojson (gitignored) or pass --out.
 *
 * Usage:
 *   node scripts/fetch-sf-assessor-parcels.mjs
 *   node scripts/fetch-sf-assessor-parcels.mjs --bbox=37.76,-122.48,37.74,-122.45
 *   node scripts/fetch-sf-assessor-parcels.mjs --limit=500 --out=./tmp/sample.geojson
 *
 * Dataset: https://data.sfgov.org/d/acdm-wktn (Parcels – Active and Retired, PDDL)
 * Runtime app code never calls DataSF — only this offline script.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "public/data/sf-assessor-parcels.geojson");
const VIEW_ID = "acdm-wktn";
const PAGE_SIZE = 2000;

function parseArgs(argv) {
  const opts = {
    out: DEFAULT_OUT,
    bbox: null,
    limit: null,
    activeOnly: true,
  };
  for (const arg of argv) {
    if (arg.startsWith("--out=")) {
      opts.out = path.resolve(arg.slice("--out=".length));
    } else if (arg.startsWith("--bbox=")) {
      // north,west,south,east (within_box order for Socrata)
      const parts = arg.slice("--bbox=".length).split(",").map(Number);
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        throw new Error(
          "Invalid --bbox. Use north,west,south,east (e.g. 37.76,-122.48,37.74,-122.45)",
        );
      }
      opts.bbox = parts;
    } else if (arg.startsWith("--limit=")) {
      opts.limit = Number(arg.slice("--limit=".length));
      if (!Number.isFinite(opts.limit) || opts.limit <= 0) {
        throw new Error("Invalid --limit");
      }
    } else if (arg === "--include-retired") {
      opts.activeOnly = false;
    } else if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

function buildWhere(opts) {
  const clauses = [];
  if (opts.activeOnly) {
    clauses.push("active='true'");
  }
  if (opts.bbox) {
    const [north, west, south, east] = opts.bbox;
    clauses.push(`within_box(shape,${north},${west},${south},${east})`);
  }
  return clauses.length > 0 ? clauses.join(" AND ") : null;
}

async function fetchPage(offset, opts) {
  const url = new URL(`https://data.sfgov.org/resource/${VIEW_ID}.geojson`);
  url.searchParams.set("$limit", String(PAGE_SIZE));
  url.searchParams.set("$offset", String(offset));
  url.searchParams.set("$order", "mapblklot");
  const where = buildWhere(opts);
  if (where) {
    url.searchParams.set("$where", where);
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `DataSF HTTP ${response.status}: ${await response.text().then((t) => t.slice(0, 200))}`,
    );
  }
  const body = await response.json();
  if (body?.type !== "FeatureCollection" || !Array.isArray(body.features)) {
    throw new Error("Unexpected DataSF GeoJSON payload");
  }
  return body.features;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(`Fetch SF assessor parcels (DataSF ${VIEW_ID})

Options:
  --out=PATH           Output GeoJSON (default: public/data/sf-assessor-parcels.geojson)
  --bbox=N,W,S,E       within_box filter (degrees)
  --limit=N            Cap total features
  --include-retired    Include inactive / retired parcels
`);
    return;
  }

  const features = [];
  let offset = 0;
  console.log(`Fetching DataSF ${VIEW_ID} → ${opts.out}`);

  while (true) {
    if (opts.limit != null && features.length >= opts.limit) break;
    const page = await fetchPage(offset, opts);
    if (page.length === 0) break;
    for (const feature of page) {
      features.push(feature);
      if (opts.limit != null && features.length >= opts.limit) break;
    }
    console.log(`  … ${features.length} features`);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  const collection = {
    type: "FeatureCollection",
    features,
  };

  await mkdir(path.dirname(opts.out), { recursive: true });
  await writeFile(opts.out, JSON.stringify(collection));
  console.log(`Wrote ${features.length} features to ${opts.out}`);
  console.log(
    "Remember: runtime adapters read this file only — do not commit the full city extract.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
