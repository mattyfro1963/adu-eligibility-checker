import Image from "next/image";

/**
 * Landing visual: backyard tiny home on wheels photo.
 * Unused on the current home composition — kept for optional reuse.
 * No overlay stickers (brand: no hero callout chrome).
 */
export function LandingHeroMedia() {
  return (
    <aside
      className="landing-hero-media relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-[10px] sm:min-h-[340px] lg:aspect-auto lg:min-h-full lg:h-full"
      aria-label="Backyard tiny home on wheels example"
    >
      <Image
        src="/tiny-home-hero.png"
        alt="Wood-clad backyard tiny home on wheels with large windows in a landscaped yard"
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent"
        aria-hidden="true"
      />
    </aside>
  );
}
