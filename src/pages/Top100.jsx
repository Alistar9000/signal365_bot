import { useCallback, useMemo, useState } from "react";
import { MiniAppContext } from "../components/AppContext";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBasket } from "lucide-react";
import { api } from "../util/axios";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import NotVipMessage from "../components/admin/NotVipMessage";
import SymbolSignalTable from "../components/SymbolSignalTable";
import BuyOptionsModal from "../components/BuyOptionsModal";
import { toPersianDigits } from "../util/format";

const Top100 = () => {
  const { userData, isLoading: loading } = MiniAppContext();
  const [pendingCode, setPendingCode] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);
  const [historyByCode, setHistoryByCode] = useState({});
  const [historyErrors, setHistoryErrors] = useState({});
  const [showBuyOptions, setShowBuyOptions] = useState(false);
  // null = ترتیب اصلی سرور، "desc" = بیشترین بازدهی، "asc" = کمترین بازدهی
  const [sortDir, setSortDir] = useState(null);
  const isVip = Boolean(userData?.is_vip);

  const { data, isLoading } = useQuery({
    queryKey: ["top-100"],
    queryFn: () => api.get("/top100"),
    enabled: !loading,
    refetchInterval: 60 * 1000,
  });
  const rawSymbols = data?.data?.data || [];

  // Symbols whose last signal is still within 0–10% of the buy point.
  const buyOptions = useMemo(
    () =>
      rawSymbols
        .filter((symbol) => {
          const last = symbol?.last_signal_return;
          return (
            last !== null &&
            last !== undefined &&
            Number(symbol?.close_percent) >= 2.5 &&
            Number(last) >= 0 &&
            Number(last) <= 10
          );
        })
        .sort((a, b) => Number(a.last_signal_return) - Number(b.last_signal_return)),
    [rawSymbols]
  );

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

  const handleSort = useCallback(() => {
    setSortDir((current) =>
      current === null ? "desc" : current === "desc" ? "asc" : null
    );
  }, []);

  const closeBuyOptions = useCallback(() => setShowBuyOptions(false), []);

  const handleSymbolClick = async (symbol) => {
    if (!isVip || pendingCode) return;

    const code = symbol?.symbol_code;
    if (!code) return;

    if (expandedCode === code) {
      setExpandedCode(null);
      return;
    }

    setExpandedCode(code);
    if (historyByCode[code]) return;

    setPendingCode(code);
    setHistoryErrors((current) => ({ ...current, [code]: false }));
    try {
      const response = await api.post("/stock-history", {
        search: code,
        vip: userData?.is_vip || null,
      });
      const payload = response.data?.data;
      setHistoryByCode((current) => ({
        ...current,
        [code]: { history: payload?.history ?? [] },
      }));
    } catch {
      setHistoryErrors((current) => ({ ...current, [code]: true }));
    } finally {
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

      {isVip && (
        <div className="-mt-3 mb-3 flex animate-fade-up justify-end">
          <button
            type="button"
            onClick={() => setShowBuyOptions(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-3 py-2 text-xs font-bold text-brand-700 shadow-card transition hover:bg-brand-50 active:scale-[.97]"
          >
            <ShoppingBasket size={14} />
            گزینه های خرید
            {buyOptions.length > 0 && (
              <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
                {toPersianDigits(buyOptions.length)}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <SymbolSignalTable
          symbols={symbols}
          isVip={isVip}
          sortDir={sortDir}
          onSort={handleSort}
          onSymbolClick={handleSymbolClick}
          pendingCode={pendingCode}
          expandedCode={expandedCode}
          historyByCode={historyByCode}
          historyLoading={pendingCode}
          historyErrors={historyErrors}
          showSort
        />
      </div>

      <BuyOptionsModal
        open={showBuyOptions}
        onClose={closeBuyOptions}
        symbols={buyOptions}
        isVip={isVip}
        onSymbolClick={handleSymbolClick}
        pendingCode={pendingCode}
        expandedCode={expandedCode}
        historyByCode={historyByCode}
        historyLoading={pendingCode}
        historyErrors={historyErrors}
      />
    </div>
  );
};

export default Top100;
