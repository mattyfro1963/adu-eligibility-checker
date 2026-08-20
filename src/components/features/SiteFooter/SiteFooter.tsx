import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Checker" },
  { href: "/regulations", label: "Regulations" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            doihave
            <span className="font-normal text-slate-400">.space</span>
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            California ADU &amp; SB 9 spatial analysis with pilot parcel
            coverage, plus statewide tiny-home regulation context.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Navigate
          </p>
          <ul className="flex flex-col gap-1 sm:items-end">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400 sm:px-6">
          Informational only — not legal advice. Confirm requirements with your
          local planning and building departments.
        </p>
      </div>
    </footer>
  );
}
