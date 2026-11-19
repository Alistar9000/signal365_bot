import { Crown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotVipMessage({ text }) {
  return (
    <div className="flex flex-wrap items-start gap-2.5 rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-3 text-[11px] leading-5 text-amber-900 animate-fade-in">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <Crown size={14} />
      </span>
      <p className="min-w-0 flex-1">
        {text} فقط با سطح{" "}
        <span className="font-bold text-amber-700">VIP</span> قابل دسترسی است.
        <Link
          to="/mini-app/buy-service"
          className="mt-0.5 inline-flex items-center gap-1 font-bold text-brand-700 underline decoration-brand-300 underline-offset-2"
        >
          مشاهده پلن ها <ArrowLeft size={11} />
        </Link>
      </p>
    </div>
  );
}
