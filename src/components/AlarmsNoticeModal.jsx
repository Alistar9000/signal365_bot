import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";

export default function AlarmsNoticeModal({ open, onClose, onAdd }) {
  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-slate-900/65 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarms-notice-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-xs animate-pop overflow-hidden rounded-3xl bg-white p-6 pt-7 text-center shadow-float"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-amber-400 via-orange-400 to-rose-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
          aria-label="بستن"
        >
          <X size={15} />
        </button>

        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-amber-100/70 ring-4 ring-amber-50" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Bell size={24} strokeWidth={2.2} />
          </span>
        </div>

        <p className="text-[10px] font-bold text-amber-600">
          پیام مهم · کاربران VIP
        </p>
        <h2
          id="alarms-notice-title"
          className="mt-1 text-base font-extrabold leading-6 text-ink"
        >
          نمادهایتان را به لیست هشدار اضافه کنید
        </h2>
        <p className="mx-auto mt-2 max-w-[270px] text-[12px] leading-6 text-muted">
          هر سهمی که الان در پرتفو دارید یا در آینده خرید می کنید باید به لیست
          هشدار اضافه کنید وگرنه سیگنال فروش آن سهم برای شما ارسال نخواهد شد
        </p>

        <div className="mt-5 flex flex-col gap-1">
          <button type="button" onClick={onClose} className="btn-primary btn-block">
            متوجه شدم
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="py-2 text-[12px] font-semibold text-brand-600 transition hover:text-brand-700"
          >
            افزودن نماد
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
