import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@mapbox/mapbox-sdk"],
};

export default withSentryConfig(nextConfig, {
  org: "envirostar-app",
  project: "adu-eligibility-checker",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  widenClientFileUpload: true,

  // Proxy Sentry requests through the app to reduce ad-blocker drops.
  tunnelRoute: "/monitoring",

  silent: !process.env.CI,
});
