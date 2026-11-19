import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MiniAppContext } from "../components/AppContext";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  X,
} from "lucide-react";
import { api } from "../util/axios";
import PageHeader from "../components/PageHeader";
import NotVipMessage from "../components/admin/NotVipMessage";
import { toPersianDigits } from "../util/format";

const returnTone = (value) =>
  Number(value) >= 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-rose-50 text-rose-600 ring-1 ring-rose-100";

const rankClass = (index) =>
  index === 0
    ? "bg-amber-100 text-amber-700"
    : index === 1
      ? "bg-slate-200 text-slate-600"
      : index === 2
        ? "bg-orange-100 text-orange-700"
        : "bg-slate-50 text-slate-400";

const Top100 = () => {
  const { userData, isLoading: loading } = MiniAppContext();
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [signalHistory, setSignalHistory] = useState(null);
  const [totalReturn, setTotalReturn] = useState(null);
  const [symbolName, setSymbolName] = useState("");
  // null = ترتیب اصلی سرور، "desc" = بیشترین بازدهی، "asc" = کمترین بازدهی
  const [sortDir, setSortDir] = useState(null);
  const isVip = Boolean(userData?.is_vip);

  // drag-to-dismiss for the detail bottom sheet
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
      setShowDetailPanel(false);
    } else {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
    setDragging(false);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["top-100"],
    queryFn: () => api.get("/top100"),
    enabled: !loading,
  });
  const rawSymbols = data?.data?.data || [];

  // سهام بدون last_signal_return همیشه در انتها میمانند (در هر دو جهت مرتب سازی)
  const symbols = useMemo(() => {
    if (!sortDir) return rawSymbols;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rawSymbols].sort((a, b) => {
      const aValue = a?.last_signal_return;
      const bValue = b?.last_signal_return;
      const aEmpty = aValue === null || aValue === undefined;
      const bEmpty = bValue === null || bValue === undefined;

      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      return (Number(aValue) - Number(bValue)) * factor;
    });
  }, [rawSymbols, sortDir]);

  const handleSymbolClick = async (symbol) => {
    if (!isVip) return;
    dragStartY.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDragging(false);
    setSheetEntered(false);
    setShowDetailPanel(true);
    setSymbolName(symbol.symbol_name);

    const response = await api.post("/stock-history", {
      search: symbol.symbol_code,
      vip: userData?.is_vip || null,
    });

    if (response.data.data) {
      setSignalHistory(response.data.data.history);
      setTotalReturn(response.data.data.totalReturn);
    }
  };

  if (loading || isLoading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="سهام برتر"
        subtitle="سهامی که بهترین سابقه بازدهی را از ربات ثبت کرده اند."
      />

      {!isVip && (
        <div className="mb-4">
          <NotVipMessage text="مشاهده نام نمادها" />
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="table-modern">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>نماد</th>
              <th className="whitespace-nowrap">۵ سیگنال آخر</th>
              {isVip && (
                <th className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      setSortDir((current) =>
                        current === null ? "desc" : current === "desc" ? "asc" : null
                      )
                    }
                    title={
                      sortDir === "desc"
                        ? "مرتب سازی صعودی"
                        : sortDir === "asc"
                          ? "خاموش کردن مرتب سازی"
                          : "مرتب سازی نزولی"
                    }
                    aria-label="مرتب سازی بر اساس آخرین سیگنال"
                    className={`inline-flex items-center justify-center gap-1 transition ${
                      sortDir ? "text-brand-700" : "text-slate-500 hover:text-brand-600"
                    }`}
                  >
                    آخرین سیگنال
                    {sortDir === "desc" ? (
                      <ArrowDown size={12} strokeWidth={2.5} />
                    ) : sortDir === "asc" ? (
                      <ArrowUp size={12} strokeWidth={2.5} />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-400" />
                    )}
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {symbols.map((symbol, index) => (
              <tr
                key={symbol?.id ?? index}
                onClick={() => handleSymbolClick(symbol)}
                className={`transition-colors ${
                  isVip ? "cursor-pointer hover:bg-brand-50/60" : ""
                }`}
              >
                <td>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${rankClass(index)}`}
                  >
                    {toPersianDigits(index + 1)}
                  </span>
                </td>
                <td className="whitespace-nowrap font-bold text-ink">
                  {symbol?.symbol_name ?? "نماد"}
                  {isVip && (
                    <ChevronLeft
                      size={12}
                      className="mr-1 inline text-slate-300"
                    />
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap justify-center gap-1">
                    {[...(symbol?.pairs ?? [])].reverse().map((pair, i) =>
                      (symbol?.last_signal_return === null ||
                        (symbol?.last_signal_return !== null &&
                          symbol?.pairs?.length < 5) ||
                        (symbol?.last_signal_return !== null && i !== 0)) && (
                        <span
                          key={i}
                          className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                            pair?.status === "u" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      ),
                    )}
                    {symbol?.last_signal_return !== null && isVip && (
                      <span
                        className={`h-2.5 w-2.5 animate-pulse-shadow rounded-full ring-2 ring-white ${
                          Number(symbol?.last_signal_return) >= 0
                            ? "bg-emerald-500"
                            : "bg-rose-500 pulse-rose"
                        }`}
                      />
                    )}
                  </div>
                </td>
                {isVip && (
                  <td>
                    <span
                      dir="ltr"
                      className={`inline-block rounded-lg px-2 py-1 text-[11px] font-bold ${
                        symbol?.last_signal_return === null
                          ? "bg-slate-100 text-slate-400"
                          : Number(symbol?.last_signal_return) >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {toPersianDigits(
                        symbol?.last_signal_return !== null
                          ? `${symbol?.last_signal_return}%`
                          : `${symbol?.pairs[0]?.return ?? 0}%`,
                      )}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail bottom sheet — portaled to body so it escapes the scroll container
          and always stacks above the bottom navigation. */}
      {showDetailPanel &&
        createPortal(
          <>
            <div
              onClick={() => setShowDetailPanel(false)}
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
                    onClick={() => setShowDetailPanel(false)}
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
                      {toPersianDigits(totalReturn)}%
                    </p>
                  </div>
                </div>

                <div className="divider" />
              </div>

              {/* Scrollable body — the last (5th) signal is always reachable */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
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
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default Top100;
