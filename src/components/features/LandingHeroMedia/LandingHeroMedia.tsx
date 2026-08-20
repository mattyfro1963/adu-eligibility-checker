import Image from "next/image";
import { Check } from "lucide-react";

/**
 * Right-column landing visual: 4K-style tiny-home ADU photo with
 * a parcel-style callout matching the product hero mock.
 */
export function LandingHeroMedia() {
  return (
    <aside
      className="landing-hero-media relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[340px] lg:aspect-auto lg:min-h-full lg:h-full"
      aria-label="Modern backyard tiny home ADU example"
    >
      <Image
        src="/tiny-home-hero.png"
        alt="Modern wood-clad backyard tiny home ADU with large windows in a landscaped California yard"
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Soft lot highlight — decorative product chrome */}
      <div
        className="landing-hero-lot pointer-events-none absolute top-[18%] right-[12%] bottom-[28%] left-[18%] rounded-lg border-2 border-sky-300/90 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_0_24px_rgba(56,189,248,0.45)]"
        aria-hidden="true"
      />

      <div className="landing-hero-callout absolute bottom-6 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto">
        <div className="inline-flex max-w-[16rem] items-start gap-2.5 rounded-lg bg-slate-800/95 px-3.5 py-2.5 text-left text-white shadow-lg backdrop-blur-sm">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Check size={12} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="text-sm leading-snug font-medium tracking-tight">
            ADU &amp; SB 9 Potential
          </span>
        </div>
      </div>
    </aside>
  );
}
