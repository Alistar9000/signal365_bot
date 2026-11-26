import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { toPersianDigits } from "../util/format";

const returnTone = (value) =>
  Number(value) >= 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-rose-50 text-rose-600 ring-1 ring-rose-100";

/**
 * Bottom sheet showing a symbol's signal history.
 * Mount it only while open so the drag/enter state resets on every open.
 */
export default function SignalHistorySheet({
  symbolName,
  signalHistory,
  totalReturn,
  isVip = true,
  error = false,
  onClose,
}) {
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sheetEntered, setSheetEntered] = useState(false);

  const handleDragStart = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragStartY.current = event.clientY;
    setDragging(true);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture can fail for synthetic events; dragging still works.
    }
  };

  const handleDragMove = (event) => {
    if (dragStartY.current === null) return;
    dragOffsetRef.current = Math.max(0, event.clientY - dragStartY.current);
    setDragOffset(dragOffsetRef.current);
  };

  const handleDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;

    const height = sheetRef.current?.offsetHeight ?? 0;
    const threshold = Math.min(120, height * 0.25);

    if (dragOffsetRef.current >= threshold) {
      onClose();
    } else {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
    setDragging(false);
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        ref={sheetRef}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setSheetEntered(true);
        }}
        style={{ transform: `translateY(${dragOffset}px)` }}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-80px)] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-float ${
          dragging
            ? "select-none"
            : sheetEntered
              ? "transition-transform duration-200 ease-out"
              : "animate-slide-up"
        }`}
      >
        {/* Fixed header — grab area for drag-to-dismiss */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="relative shrink-0 cursor-grab touch-none select-none px-5 pt-4 active:cursor-grabbing"
        >
          <div className="relative flex h-8 items-center justify-center">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onClose}
              className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
              aria-label="بستن"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative mt-2 flex h-14 items-center">
            <span className="chip bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
              {symbolName}
            </span>
            <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center">
              <p className="text-[10px] text-muted">بازدهی کل (مرکب)</p>
              <p
                dir="ltr"
                className={`mt-0.5 text-base font-extrabold ${
                  Number(totalReturn) >= 0 ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {totalReturn === null || totalReturn === undefined
                  ? "—"
                  : `${toPersianDigits(totalReturn)}%`}
              </p>
            </div>
          </div>

          <div className="divider" />
        </div>

        {/* Scrollable body — the last signal is always reachable */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
          {error ? (
            <p className="py-8 text-center text-xs text-rose-500">
              نتوانستم سابقهٔ این نماد را بارگذاری کنم.
            </p>
          ) : !signalHistory?.length ? (
            <p className="py-8 text-center text-xs text-muted">
              سابقهٔ سیگنالی برای این نماد ثبت نشده است.
            </p>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>سیگنال</th>
                  <th>بازدهی</th>
                  <th>
                    <span className="flex items-center justify-center gap-1">
                      تاریخ <CalendarDays size={13} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {signalHistory
                  ?.filter((e) => (!isVip ? e.sell_date : e))
                  .map((signal, index) => (
                    <tr key={index}>
                      <td>
                        <span
                          className={`mx-auto block h-3.5 w-3.5 rounded-full ${
                            Number(signal?.return) >= 0
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          } ${
                            !signal?.sell_date
                              ? `animate-pulse-shadow ${
                                  Number(signal?.return) >= 0 ? "" : "pulse-rose"
                                }`
                              : ""
                          }`}
                        />
                      </td>
                      <td>
                        <span
                          dir="ltr"
                          className={`inline-block rounded-lg px-2 py-1 text-[11px] font-bold ${returnTone(
                            signal?.return
                          )}`}
                        >
                          {toPersianDigits(signal?.return)}%
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col items-center gap-1">
                          {signal?.sell_date && (
                            <span className="chip bg-rose-50 text-rose-600">
                              {toPersianDigits(signal.sell_date)}
                            </span>
                          )}
                          <span className="chip bg-emerald-50 text-emerald-600">
                            {toPersianDigits(signal?.buy_date)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
