import type { MetadataRoute } from "next";
import { GUIDE_LINKS } from "@/lib/content/guides/catalog";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/guides",
    "/regulations",
    "/partners",
    "/premium",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/regulations" || path === "/guides" ? 0.8 : 0.6,
  }));

  const guides: MetadataRoute.Sitemap = GUIDE_LINKS.map((guide) => ({
    url: `${base}${guide.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guides];
}
