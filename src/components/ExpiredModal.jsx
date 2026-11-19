import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock3, Sparkles, X } from "lucide-react";

export default function ExpiredModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/65 p-6 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expired-modal-title"
    >
      <div className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white p-6 pt-7 text-center shadow-float animate-pop">
        {/* attention-grabbing top accent */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-rose-500 via-amber-400 to-rose-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
          aria-label="بستن"
        >
          <X size={15} />
        </button>

        {/* pulsing icon */}
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-100" />
          <span className="absolute inset-1 rounded-full bg-rose-50 ring-4 ring-rose-100" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30">
            <Clock3 size={24} strokeWidth={2.2} />
          </span>
        </div>

        <h2
          id="expired-modal-title"
          className="text-lg font-extrabold text-rose-600"
        >
          اشتراک شما تمام شده
        </h2>
        <p className="mx-auto mt-2 max-w-[240px] text-[12px] leading-6 text-muted">
          برای دسترسی دوباره به تمام سیگنال­ها و قابلیت­ها، لطفاً اشتراک خود را
          تمدید کنید.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/mini-app/buy-service"
            onClick={onClose}
            className="btn-primary btn-block"
          >
            <Sparkles size={15} /> تمدید اشتراک
            <ArrowLeft size={14} className="mr-auto" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 text-[12px] font-semibold text-slate-400 transition hover:text-slate-600"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
