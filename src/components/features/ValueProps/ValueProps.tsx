import { House, Map, Ruler } from "lucide-react";

const ITEMS = [
  {
    icon: House,
    title: "Ease of Use",
    body: "Simple address input with fast results.",
  },
  {
    icon: Map,
    title: "Instant Mapping",
    body: "Instant GIS mapping of your parcel.",
  },
  {
    icon: Ruler,
    title: "Compliance Check",
    body: "Immediate ADU & SB 9 compliance status.",
  },
] as const;

export function ValueProps() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title} className="flex gap-3 sm:flex-col sm:gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F7] text-slate-700 sm:size-8">
              <Icon size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
