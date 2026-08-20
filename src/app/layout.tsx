import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ADU Eligibility Checker",
  description:
    "Check California ADU and SB 9 eligibility for San Francisco properties",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="border-b border-slate-200 bg-white px-4 py-6 shadow-sm">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-800">
              ADU Eligibility Checker
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Check California ADU and SB 9 eligibility for San Francisco
              properties
            </p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
