import { House, Map, Ruler } from "lucide-react";

const ITEMS = [
  {
    icon: House,
    title: "Zoning district",
    body: "SF DataSF pilot overlay for the lot — not a statewide ordinance catalog.",
  },
  {
    icon: Map,
    title: "Parcel facts",
    body: "Coordinates and assessor block/lot when the point-in-polygon lookup hits.",
  },
  {
    icon: Ruler,
    title: "ADU & SB 9 checks",
    body: "Engine reasons from Gov. Code Chapter 13 and § 65852.21 — not legal advice.",
  },
] as const;

export function ValueProps() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.title}
            className="rounded-xl border border-border bg-white p-4 shadow-registry"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border bg-[#F5F5F7]">
              <Icon size={16} className="text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
              {item.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
