import { BookOpen, ClipboardCheck, House } from "lucide-react";

const ITEMS = [
  {
    icon: House,
    title: "Placement path",
    body: "Local THOW / park-model path.",
  },
  {
    icon: BookOpen,
    title: "GIS mapping",
    body: "Instant GIS of your parcel.",
  },
  {
    icon: ClipboardCheck,
    title: "Lot readiness",
    body: "Utilities and occupancy reading.",
  },
] as const;

export function ValueProps() {
  return (
    <ul className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-3 sm:gap-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title} className="flex flex-col items-start gap-2">
            <Icon
              size={18}
              strokeWidth={1.6}
              className="text-slate-500"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                {item.title}
              </p>
              <p className="text-[12px] leading-snug text-slate-500">
                {item.body}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
