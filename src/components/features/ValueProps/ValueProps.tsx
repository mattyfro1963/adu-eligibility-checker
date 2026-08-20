import { House, Map, Ruler } from "lucide-react";

const ITEMS = [
  {
    icon: House,
    title: "Ease of use",
    body: "Simple address input with fast results.",
  },
  {
    icon: Map,
    title: "Instant mapping",
    body: "GIS parcel context for your lot.",
  },
  {
    icon: Ruler,
    title: "Compliance check",
    body: "ADU and SB 9 status from parcel facts.",
  },
] as const;

export function ValueProps() {
  return (
    <ul className="rule-grid grid grid-cols-1 sm:grid-cols-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.title}
            className="flex flex-col items-center gap-3 px-4 py-4 text-center sm:py-5"
          >
            <span className="flex size-10 items-center justify-center rounded-thumb border border-border text-foreground">
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="font-label text-caption text-muted-foreground">
                {item.title}
              </p>
              <p className="text-[13px] leading-snug text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
