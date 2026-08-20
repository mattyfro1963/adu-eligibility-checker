import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isMapboxConfigured } from "@/lib/env";
import { SiteHeader } from "@/components/features/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/features/SiteFooter/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "doihave.space — ADU & SB 9 Eligibility",
  description:
    "Institutional-grade California ADU and SB 9 spatial analysis for San Francisco parcels.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const mapboxConfigured = isMapboxConfigured();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-[#F5F5F7] text-slate-900 selection:bg-slate-200 selection:text-black"
        data-mapbox-configured={mapboxConfigured ? "1" : "0"}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
