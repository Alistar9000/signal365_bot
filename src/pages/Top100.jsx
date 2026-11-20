import { useMemo, useState } from "react";
import { MiniAppContext } from "../components/AppContext";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft } from "lucide-react";
import { api } from "../util/axios";
import PageHeader from "../components/PageHeader";
import NotVipMessage from "../components/admin/NotVipMessage";
import SignalHistorySheet from "../components/SignalHistorySheet";
import { toPersianDigits } from "../util/format";

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
    setSymbolName(symbol.symbol_name);
    setSignalHistory(null);
    setTotalReturn(null);
    setShowDetailPanel(true);

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

      {showDetailPanel && (
        <SignalHistorySheet
          symbolName={symbolName}
          signalHistory={signalHistory}
          totalReturn={totalReturn}
          isVip={isVip}
          onClose={() => setShowDetailPanel(false)}
        />
      )}
    </div>
  );
};

export default Top100;
