import { Fragment } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { toPersianDigits } from "../util/format";
import SignalHistoryCollapse from "./SignalHistoryCollapse";

const rankClass = (index) =>
  index === 0
    ? "bg-amber-100 text-amber-700"
    : index === 1
      ? "bg-slate-200 text-slate-600"
      : index === 2
        ? "bg-orange-100 text-orange-700"
        : "bg-slate-50 text-slate-400";

// Last-price percentage shown under the symbol name — no extra column needed.
const ClosePercent = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;

  const cleaned = String(value)
    .trim()
    .replace(/[٪%]/g, "")
    .replace(/[،,]/g, ".")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return null;

  const tone =
    numeric > 0
      ? "text-emerald-600/80"
      : numeric < 0
        ? "text-rose-600/80"
        : "text-slate-400";
  const sign = numeric > 0 && !String(value).trim().startsWith("+") ? "+" : "";

  return (
    <span dir="ltr" className={`text-[10px] font-semibold leading-none ${tone}`}>
      {toPersianDigits(`${sign}${cleaned}%`)}
    </span>
  );
};

const SignalDots = ({ symbol, isVip }) => {
  const pairs = symbol?.pairs ?? [];
  const hasSignal = symbol?.last_signal_return !== null &&
    symbol?.last_signal_return !== undefined;

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {[...pairs].reverse().map((pair, i) => {
        if (hasSignal && pairs.length >= 5 && i === 0) return null;

        return (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${
              pair?.status === "u" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        );
      })}
      {hasSignal && isVip && (
        <span
          className={`h-2.5 w-2.5 animate-pulse-shadow rounded-full ring-2 ring-white ${
            Number(symbol.last_signal_return) >= 0
              ? "bg-emerald-500"
              : "bg-rose-500 pulse-rose"
          }`}
        />
      )}
    </div>
  );
};

const LastSignal = ({ symbol }) => {
  const hasSignal =
    symbol?.last_signal_return !== null &&
    symbol?.last_signal_return !== undefined;
  const value = hasSignal
    ? symbol.last_signal_return
    : symbol?.pairs?.[0]?.return ?? 0;
  const tone = !hasSignal
    ? "bg-slate-100 text-slate-400"
    : Number(value) >= 0
      ? "bg-emerald-50 text-emerald-600"
      : "bg-rose-50 text-rose-600";

  return (
    <span
      dir="ltr"
      className={`inline-block rounded-lg px-2 py-1 text-[11px] font-bold ${tone}`}
    >
      {toPersianDigits(`${value}%`)}
    </span>
  );
};

/**
 * Shared table for the top-100 page and the "buy options" modal.
 * The only difference is the sortable last-signal header on the main page.
 */
export default function SymbolSignalTable({
  symbols,
  isVip = false,
  sortDir = null,
  onSort,
  onSymbolClick,
  pendingCode = null,
  showSort = false,
  expandedCode = null,
  historyByCode = {},
  historyLoading = null,
  historyErrors = {},
}) {
  return (
    <table className="table-modern">
      <thead>
        <tr>
          <th className="w-10">#</th>
          <th>نماد</th>
          <th className="whitespace-nowrap">۵ سیگنال آخر</th>
          {showSort ? (
            <th className="whitespace-nowrap">
              <button
                type="button"
                onClick={onSort}
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
          ) : (
            <th>آخرین سیگنال</th>
          )}
        </tr>
      </thead>
      <tbody>
        {symbols.map((symbol, index) => (
          <Fragment key={symbol?.id ?? symbol?.symbol_code ?? index}>
          <tr
            className="transition-colors"
          >
            <td>
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${rankClass(index)}`}
              >
                {toPersianDigits(index + 1)}
              </span>
            </td>
            <td className="whitespace-nowrap font-bold text-ink">
              <button
                type="button"
                disabled={!isVip || pendingCode === symbol.symbol_code}
                onClick={() => onSymbolClick?.(symbol)}
                className={`relative flex w-full items-center justify-center ${
                  isVip ? "cursor-pointer hover:text-brand-600" : "cursor-default"
                }`}
              >
                {symbol?.symbol_name ?? "نماد"}
                {isVip &&
                  (pendingCode === symbol.symbol_code ? (
                    <span className="absolute left-0 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
                  ) : (
                    <ChevronDown
                      size={12}
                      className={`absolute left-0 text-slate-300 transition-transform ${
                        expandedCode === symbol.symbol_code ? "rotate-180" : ""
                      }`}
                    />
                  ))}
              </button>
              {(symbol?.close_percent !== null &&
                symbol?.close_percent !== undefined) && (
                <span className="mt-1 flex justify-center">
                  <ClosePercent value={symbol.close_percent} />
                </span>
              )}
            </td>
            <td>
              <SignalDots symbol={symbol} isVip={isVip} />
            </td>
            {isVip && (
              <td>
                <LastSignal symbol={symbol} />
              </td>
            )}
          </tr>
          {isVip && (
            <tr key={`${symbol?.symbol_code ?? index}-history`}>
              <td colSpan={4} className="!p-0 !border-b-0">
                <div
                  className={`grid transition-all duration-300 ${
                    expandedCode === symbol?.symbol_code
                      ? "mb-1 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <SignalHistoryCollapse
                      data={historyByCode[symbol?.symbol_code]}
                      loading={historyLoading === symbol?.symbol_code}
                      error={Boolean(historyErrors[symbol?.symbol_code])}
                      symbol_name={symbol?.symbol_name}
                    />
                  </div>
                </div>
              </td>
            </tr>
          )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
