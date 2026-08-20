import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Inter,
  Source_Serif_4,
} from "next/font/google";
import { isMapboxConfigured } from "@/lib/env";
import { SkipToContent } from "@/components/features/PageShell/PageShell";
import { SiteChrome } from "@/components/features/SiteChrome/SiteChrome";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ADU & SB 9 Eligibility Checker",
  description:
    "Embeddable California ADU and SB 9 parcel eligibility search with SF pilot zoning coverage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const mapboxConfigured = isMapboxConfigured();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-background text-foreground selection:bg-muted selection:text-foreground"
        data-mapbox-configured={mapboxConfigured ? "1" : "0"}
      >
        <SkipToContent />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
