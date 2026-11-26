import { useMemo, useState } from "react";
import { MiniAppContext } from "../components/AppContext";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, Inbox, X } from "lucide-react";
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

// Last-price percentage shown under the symbol name — no extra column needed.
const ClosePercent = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;

  const raw = String(value).trim();
  const cleaned = raw
    .replace(/[٪%]/g, "")
    .replace(/[،,]/g, ".")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return null;

  const positive = numeric > 0;
  const negative = numeric < 0;
  const sign = positive && !raw.startsWith("+") ? "+" : "";
  const tone = positive
    ? "text-emerald-600/80"
    : negative
      ? "text-rose-600/80"
      : "text-slate-400";

  return (
    <span dir="ltr" className={`text-[10px] font-semibold leading-none ${tone}`}>
      {toPersianDigits(`${sign}${cleaned}%`)}
    </span>
  );
};

const Top100 = () => {
  const { userData, isLoading: loading } = MiniAppContext();
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [signalHistory, setSignalHistory] = useState(null);
  const [totalReturn, setTotalReturn] = useState(null);
  const [symbolName, setSymbolName] = useState("");
  const [pendingCode, setPendingCode] = useState(null);
  const [historyError, setHistoryError] = useState(false);
  const [floatingSignals, setFloatingSignals] = useState(false);
  // null = ترتیب اصلی سرور، "desc" = بیشترین بازدهی، "asc" = کمترین بازدهی
  const [sortDir, setSortDir] = useState(null);
  const isVip = Boolean(userData?.is_vip);

  const { data, isLoading } = useQuery({
    queryKey: ["top-100"],
    queryFn: () => api.get("/top100"),
    enabled: !loading,
    refetchInterval: 60 * 1000
  });
  const rawSymbols = data?.data?.data || [];
  const signalSymbols = rawSymbols ? rawSymbols.filter(e=>e.last_signal_return !== null && e.close_percent >= 2.5 && e.last_signal_return >= 0 && e.last_signal_return <= 10 ).sort((a,b)=> a.last_signal_return - b.last_signal_return) : null;
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
    if (!isVip || pendingCode) return;

    // Fetch first, then mount the sheet at its final height. Mounting it while
    // empty makes it grow after the slide-up animation, which looks like a hitch.
    setPendingCode(symbol.symbol_code);
    setHistoryError(false);
    try {
      const response = await api.post("/stock-history", {
        search: symbol.symbol_code,
        vip: userData?.is_vip || null,
      });
      const payload = response.data?.data;
      setSignalHistory(payload?.history ?? []);
      setTotalReturn(payload?.totalReturn ?? null);
    } catch {
      setSignalHistory([]);
      setTotalReturn(null);
      setHistoryError(true);
    } finally {
      setSymbolName(symbol.symbol_name);
      setShowDetailPanel(true);
      setPendingCode(null);
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

      {
        isVip && (
          <div className="w-full animate-fade-up -mt-4 bg-transparent text-end">
            <button onClick={()=> setFloatingSignals(true)} className="text-xs border border-emerald-200 font-bold px-3 mb-2 py-2 bg-emerald-50 text-emerald-600 rounded-2xl">گزینه های خرید</button>
          </div>
        )

      }

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
                  <span className="relative flex items-center justify-center">
                    {symbol?.symbol_name ?? "نماد"}
                    {isVip &&
                      (pendingCode === symbol.symbol_code ? (
                        <span className="absolute left-0 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
                      ) : (
                        <ChevronLeft
                          size={12}
                          className="absolute left-0 text-slate-300"
                        />
                      ))}
                  </span>
                  {(symbol?.close_percent !== null &&
                    symbol?.close_percent !== undefined) && (
                    <span className="mt-1 flex justify-center">
                      <ClosePercent value={symbol.close_percent} />
                    </span>
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
       {

      //floating signal box
       <div onClick={()=>setFloatingSignals(false)} className={`${floatingSignals ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-50 transition duration-300 fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center px-4`}>
        <div onClick={(e)=>{e.stopPropagation()}} className={`bg-white w-full rounded-2xl max-h-[65vh] overflow-auto   ${floatingSignals ? 'scale-100 opacity-100' : 'scale-90 pointer-events-none opacity-0'} transition duration-300`}>
        <div dir="ltr" className="p-4 w-full flex flex-col gap-4 sticky z-50 top-0 bg-white">
         <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={()=>setFloatingSignals(false)}
              className=" flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200"
              aria-label="بستن"
            >
              <X size={16} />
            
            </button>
            <p dir="rtl" className="text-xs bg-amber-50 text-center font-bold text-amber-600 py-2 px-3 rounded-2xl w-full text-wrap ">
              سیگنال های قبلی ربات که فاصله آنها با نقطه سیگنال بین 0 تا 10 درصد هست و همچنان برای خرید مناسب هستند
            </p>
        </div>
        {

        signalSymbols && signalSymbols.length > 0 ?
        <table className="table-modern">
          <thead>
            <tr className="*:!static">
              <th className="w-10">#</th>
              <th>نماد</th>
              <th className="whitespace-nowrap">۵ سیگنال آخر</th>
              {/* {isVip && (
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
              )} */}
              <th>آخرین سیگنال</th>
            </tr>
          </thead>
          <tbody>
            {signalSymbols.map((symbol, index) => (
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
                  <span className="relative flex items-center justify-center">
                    {symbol?.symbol_name ?? "نماد"}
                    {isVip &&
                      (pendingCode === symbol.symbol_code ? (
                        <span className="absolute left-0 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
                      ) : (
                        <ChevronLeft
                          size={12}
                          className="absolute left-0 text-slate-300"
                        />
                      ))}
                  </span>
                  {(symbol?.close_percent !== null &&
                    symbol?.close_percent !== undefined) && (
                    <span className="mt-1 flex justify-center">
                      <ClosePercent value={symbol.close_percent} />
                    </span>
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
        :
          <div className="empty-state">
          <Inbox size={26} className="text-slate-300" />
          <p className="text-xs font-semibold text-ink">
            در حال حاضر گزینه خریدی وجود ندارد
          </p>
        </div>
      
        }
        </div>
        </div>
       }
      
      </div>

      {showDetailPanel && (
        <SignalHistorySheet
          symbolName={symbolName}
          signalHistory={signalHistory}
          totalReturn={totalReturn}
          isVip={isVip}
          error={historyError}
          onClose={() => setShowDetailPanel(false)}
        />
      )}
    </div>
  );
};

export default Top100;
