import { toPersianDigits } from "../util/format";

const SignalHistoryCollapse = ({ data, loading, error = false, symbol_name }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 text-[10px] text-muted">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
        در حال بارگذاری سابقه...
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-3.5 py-3 text-center text-[10px] text-rose-500">
        بارگذاری سابقه سیگنال با مشکل مواجه شد.
      </p>
    );
  }

  const history = data?.history || [];

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 py-2">
      <p className="mb-1.5 text-[9px] flex items-center gap-1 font-extrabold text-muted">
        سابقه سیگنالهای 
        <span className="text-emerald-600">{symbol_name}</span>
      </p>
      {history.length ? (
        <div className="max-h-36 space-y-1 overflow-y-auto overscroll-contain">
          {history.map((signal, index) => {
            const positive = Number(signal?.return) >= 0;
            const isOpen = !signal?.sell_date;
            const buyDate = signal?.buy_date
              ? toPersianDigits(signal.buy_date)
              : null;
            const sellDate = signal?.sell_date
              ? toPersianDigits(signal.sell_date)
              : null;

            return (
              <div
                key={`${signal?.buy_date ?? "signal"}-${index}`}
                className="flex items-center gap-2 rounded-lg bg-white px-2 py-1"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    positive ? "bg-emerald-500" : "bg-rose-500"
                  } ${isOpen ? "animate-pulse-shadow" : ""}`}
                />
                <span
                  dir="ltr"
                  className={`text-[10px] font-extrabold ${
                    positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {toPersianDigits(signal?.return)}%
                </span>
                {isOpen && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                    باز
                  </span>
                )}
                {(buyDate || sellDate) && (
                  <span
                    dir="rtl"
                    className="mr-auto flex items-center gap-1 text-[9px]"
                  >
                    {buyDate && (
                      <span className="text-emerald-600">{buyDate}</span>
                    )}
                    {buyDate && sellDate && (
                      <span className="text-muted">←</span>
                    )}
                    {sellDate && (
                      <span className="text-rose-600">{sellDate}</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-1 text-center text-[10px] text-muted">
          سابقه ای یافت نشد
        </p>
      )}
    </div>
  );
};

export default SignalHistoryCollapse;
