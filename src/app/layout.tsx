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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_URL ?? "https://doihave.space",
  ),
  title: {
    default:
      "Tiny Home on Wheels Lot Eligibility Checker — doihave.space",
    template: "%s — doihave.space",
  },
  description:
    "THOW / park-model lot screening for California, Oregon, and Washington — placement, certification, transport, and lot readiness. ADU is an optional pathway, not automatic. Informational only — confirm locally.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "doihave.space",
    title: "Tiny Home on Wheels Lot Eligibility Checker",
    description:
      "Screen CA/OR/WA lots for certified THOW or park-model placement — lot GIS where available, jurisdiction guidance elsewhere.",
    images: [{ url: "/tiny-home-hero.png", alt: "doihave.space" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny Home on Wheels Lot Eligibility Checker",
    description:
      "Cascadia THOW lot candidacy — placement, certification, transport, utilities. Informational parcel check.",
    images: ["/tiny-home-hero.png"],
  },
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
