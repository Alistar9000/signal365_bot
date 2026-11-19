import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Crown,
  Inbox,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "../util/axios";
import { toPersianDigits } from "../util/format";

export default function UpgradeSignalsModal({ open, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["today-signals"],
    queryFn: () => api.get("/today-signals"),
    enabled: open,
  });

  if (!open) return null;

  const signals = data?.data?.data || [];

  return createPortal(
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/60 p-5 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="relative flex max-h-[82dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-float animate-pop">
        {/* Celebratory header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 px-5 pb-4 pt-5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-md">
              <Crown size={22} className="text-amber-200" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-emerald-100">
                اشتراک VIP فعال شد 🎉
              </p>
              <h2 id="upgrade-modal-title" className="mt-0.5 text-base font-extrabold">
                سیگنال های امروز
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-white/80">
                از الان می­tونی نام نمادها و جزئیات کامل سیگنال­ها رو ببینی.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label="بستن"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Signals list */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted">
              <Sparkles size={22} className="animate-pulse text-brand-500" />
              <p className="text-xs font-semibold">در حال بارگذاری سیگنال­ها...</p>
            </div>
          ) : signals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Inbox size={26} className="text-slate-300" />
              <p className="text-xs font-semibold text-ink">
                در حال حاضر سیگنالی وجود ندارد
              </p>
              <p className="text-[11px] text-muted">
                با شروع معاملات، سیگنال­ها نمایش داده می­شوند.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {signals.map((signal, index) => {
                const isBuy = signal?.type === "buy";
                return (
                  <div
                    key={index}
                    className="card flex items-center gap-3 p-3"
                  >
                    <span
                      className={`icon-tile ring-1 ${
                        isBuy
                          ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                          : "bg-rose-50 text-rose-600 ring-rose-100"
                      }`}
                    >
                      {isBuy ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-ink">
                        {signal?.name ?? "نماد"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`chip ${
                            isBuy
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isBuy ? "خرید" : "فروش"}
                        </span>
                        {signal?.source && (
                          <span className="chip bg-slate-100 text-slate-500">
                            {signal.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="flex items-center justify-end gap-1 text-[10px] text-muted">
                        <Timer size={11} /> زمان
                      </p>
                      <p
                        dir="ltr"
                        className={`mt-0.5 font-sans text-xs font-bold ${
                          isBuy ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {toPersianDigits(signal?.time1 ?? "-")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <Link
            to="/mini-app/today-signals"
            onClick={onClose}
            className="btn-primary btn-block"
          >
            مشاهده کامل سیگنال­ها <ArrowLeft size={14} className="mr-auto" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
