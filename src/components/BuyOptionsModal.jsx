import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Inbox, Info, ShoppingBasket, X } from "lucide-react";
import SymbolSignalTable from "./SymbolSignalTable";
import { toPersianDigits } from "../util/format";

/**
 * Bottom sheet with the symbols that are still good buy options.
 * Not rendered at all while closed; a short exit state keeps the close smooth.
 */
export default function BuyOptionsModal({
  open,
  onClose,
  symbols = [],
  isVip = false,
  onSymbolClick,
  pendingCode = null,
}) {
  const [leaving, setLeaving] = useState(false);
  const isLeaving = leaving && !open;

  const requestClose = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    onClose();
    // Fallback for cases where transitionend is skipped (hidden tab, reduced motion).
    setTimeout(() => setLeaving(false), 250);
  }, [leaving, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, requestClose]);

  if (!open && !leaving) return null;
  
  return createPortal(
    <div
      onClick={requestClose}
      className={`fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px] ${
        isLeaving
          ? "pointer-events-none opacity-0 transition-opacity duration-200"
          : "animate-fade-in"
      }`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && isLeaving) setLeaving(false);
        }}
        role="dialog"
        aria-modal="true"
        aria-label="گزینه های خرید"
        className={`flex max-h-[calc(100dvh-56px)] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-float ${
          isLeaving
            ? "translate-y-full transition-transform duration-200 ease-in"
            : "animate-slide-up"
        }`}
      >
        <div className="shrink-0 px-5 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="icon-tile bg-brand-50 text-brand-600">
                <ShoppingBasket size={18} />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-ink">گزینه های خرید</h2>
                <p className="text-[10px] font-medium text-muted">
                  {toPersianDigits(symbols.length)} نماد واجد شرایط
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
              aria-label="بستن"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-[11px] font-semibold leading-relaxed text-amber-700 ring-1 ring-amber-100">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>
              سیگنال های قبلی ربات که فاصله آنها با نقطه سیگنال بین{" "}
              {toPersianDigits("0 تا 10")} درصد است و همچنان برای خرید مناسب هستند.
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {symbols.length > 0 ? (
            <div className="card overflow-hidden">
              <SymbolSignalTable
                symbols={symbols}
                isVip={isVip}
                onSymbolClick={onSymbolClick}
                pendingCode={pendingCode}
              />
            </div>
          ) : (
            <div className="empty-state m-3">
              <Inbox size={26} className="text-slate-300" />
              <p className="text-xs font-semibold text-ink">
                در حال حاضر گزینه خریدی وجود ندارد
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
