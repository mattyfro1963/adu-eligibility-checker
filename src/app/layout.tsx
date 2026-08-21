import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { isMapboxConfigured } from "@/lib/env";
import { SkipToContent } from "@/components/features/PageShell/PageShell";
import { SiteChrome } from "@/components/features/SiteChrome/SiteChrome";
import "./globals.css";

// Licensed Söhn files: src/app/fonts/sohn/*.woff2 — see README in that folder.
const sohn = localFont({
  src: [
    {
      path: "./fonts/sohn/Sohn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sohn/Sohn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sohn/Sohn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sohn/Sohn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sohn",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "ADU & SB 9 Eligibility Checker",
  description:
    "California ADU and SB 9 eligibility for every county — Mapbox geocode plus county requirements; SF lot GIS where available.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const mapboxConfigured = isMapboxConfigured();

  return (
    <html
      lang="en"
      className={`${sohn.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground selection:bg-muted selection:text-foreground"
        data-mapbox-configured={mapboxConfigured ? "1" : "0"}
      >
        <SkipToContent />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
