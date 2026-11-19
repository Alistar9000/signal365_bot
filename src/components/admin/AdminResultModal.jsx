import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { toPersianDigits } from "../../util/format";

export default function AdminResultModal({ result, onClose }) {
  if (!result) return null;

  const success = Boolean(result.success);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-slate-900/65 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-result-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-xs animate-pop overflow-hidden rounded-3xl bg-white p-6 pt-8 text-center shadow-float"
      >
        <div
          className={`absolute inset-x-0 top-0 h-1.5 ${
            success
              ? "bg-gradient-to-l from-emerald-400 via-brand-400 to-emerald-500"
              : "bg-gradient-to-l from-rose-400 via-orange-400 to-rose-500"
          }`}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
          aria-label="بستن"
        >
          <X size={15} />
        </button>

        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <span
            className={`absolute inset-0 rounded-full ring-4 ${
              success ? "bg-emerald-50/80 ring-emerald-100" : "bg-rose-50/80 ring-rose-100"
            }`}
          />
          <span
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${
              success
                ? "bg-gradient-to-br from-emerald-400 to-brand-500 shadow-emerald-500/30"
                : "bg-gradient-to-br from-rose-400 to-orange-500 shadow-rose-500/30"
            }`}
          >
            {success ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
          </span>
        </div>

        <p
          className={`text-[10px] font-bold ${
            success ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {success ? "عملیات موفق" : "عملیات ناموفق"}
        </p>
        <h2
          id="admin-result-title"
          className="mt-1 text-base font-extrabold leading-6 text-ink"
        >
          {toPersianDigits(result.title)}
        </h2>
        {result.message && (
          <p className="mx-auto mt-2 max-w-[270px] text-[12px] leading-6 text-muted">
            {toPersianDigits(result.message)}
          </p>
        )}

        {result.details?.length > 0 && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-right">
            {result.details.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 text-[11px] last:border-0"
              >
                <span className="shrink-0 text-muted">{label}</span>
                <span className="min-w-0 break-words font-bold text-ink">
                  {value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`${success ? "btn-primary" : "btn-danger"} btn-block mt-5`}
        >
          باشه
        </button>
      </div>
    </div>,
    document.body,
  );
}
