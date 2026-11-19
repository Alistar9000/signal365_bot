import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const tones = {
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function MenuItem({ to, icon, title, desc, tone = "slate" }) {
  return (
    <Link
      to={to}
      className="group card relative flex min-h-[124px] flex-col gap-3 overflow-hidden p-3.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-float active:scale-[.98]"
    >
      <div className={`icon-tile ring-1 ${tones[tone] ?? tones.slate}`}>
        {icon}
      </div>
      <div className="min-w-0 pl-1">
        <p className="text-[13px] font-bold leading-5 text-ink">{title}</p>
        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted">
          {desc}
        </p>
      </div>
      <ChevronLeft
        size={14}
        className="absolute left-3 top-4 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-brand-500"
      />
    </Link>
  );
}
