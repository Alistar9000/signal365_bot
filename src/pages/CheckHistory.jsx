import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../util/axios";
import { MiniAppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import SearchResults from "../components/SearchResults";
import { toPersianDigits } from "../util/format";

const isPositive = (value) => Number(value) >= 0;
const returnTone = (value) =>
  isPositive(value)
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-rose-50 text-rose-600 ring-1 ring-rose-100";

const CheckHistory = () => {
  const [searchInput, setSearchInput] = useState("");
  const [symbolName, setSymbolName] = useState("");
  const { search } = useDebounce(searchInput);
  const [searchContent, setSearchContent] = useState([]);
  const [signalHistory, setSignalHistory] = useState(null);
  const [totalReturn, setTotalReturn] = useState(null);
  const [flag, setFlag] = useState(false);
  const [visitedCount, setVisitedCount] = useState(false);
  const inputRef = useRef();
  const { userData, isLoading } = MiniAppContext();
  const isVip = Boolean(userData?.is_vip);

  useEffect(() => {
    const fetch = async () => {
      const response = await api.post("/symbols", { search });
      setSearchContent(response.data.data);
    };

    if (searchInput !== "" && !flag) fetch();
  }, [search]);

  const handleSearch = async (symbol) => {
    setSearchInput(symbol.name);
    setSymbolName(symbol.name);
    setFlag(true);
    setSearchContent([]);

    const response = await api.post("/stock-history", {
      search: symbol.code,
      vip: userData?.is_vip || null,
    });

    if (response.data.max_visited) {
      setVisitedCount(true);
      return;
    }
    if (response.data.data) {
      setVisitedCount(false);
      setSignalHistory(response.data.data.history);
      setTotalReturn(response.data.data.totalReturn);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="بررسی سابقه سهم"
        subtitle="عملکرد و میزان موفقیت ربات را روی هر سهم ببینید."
      />

      {/* Search */}
      <div className="relative">
        <div className="card p-3">
          <label className="field-label" htmlFor="symbol-search">
            جستجوی نماد
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10">
            <SearchIcon
              size={16}
              className="pointer-events-none shrink-0 text-slate-400"
            />
            <input
              id="symbol-search"
              ref={inputRef}
              value={searchInput}
              onChange={(e) => {
                setFlag(false);
                setSearchInput(e.target.value);
              }}
              onFocus={(e) => e.target.scrollIntoView({ block: "start" })}
              placeholder="نام سهم را وارد کنید..."
              className="!border-0 !bg-transparent !p-0 !shadow-none focus:!ring-0"
            />
          </div>
          {!isVip && (
            <p className="mt-2 text-[10px] text-rose-500">
              سقف جستجو برای کاربران عادی ۱۰ نماد است.
            </p>
          )}
        </div>

        <SearchResults
          open={searchInput !== "" && searchContent.length > 0}
          anchorRef={inputRef}
          items={searchContent}
          onClose={() => setSearchContent([])}
          renderItem={(symbol) => (
            <button
              key={symbol.code}
              type="button"
              onClick={() => handleSearch(symbol)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-[13px] font-semibold text-ink transition hover:bg-brand-50"
            >
              {symbol.name}
              <ArrowLeft size={13} className="text-slate-300" />
            </button>
          )}
        />
      </div>

      {/* Symbol summary */}
      {!visitedCount && symbolName !== "" && (
        <div className="card mt-4 flex animate-fade-up items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] text-muted">سهم انتخابی</p>
            <span className="chip mt-1 bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
              {symbolName}
            </span>
          </div>
          <div className="max-w-[55%] text-left">
            <p className="mb-1.5 flex items-center justify-end gap-1 text-[10px] text-muted">
              توالی سیگنال ها <ArrowLeft size={11} />
            </p>
            <div className="flex flex-wrap justify-end gap-1">
              {[...(signalHistory || [])]
                .reverse()
                .filter((e) => (!isVip ? e.sell_date : e))
                .map((item, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full ${
                      isPositive(item.return) ? "bg-emerald-500" : "bg-rose-500"
                    } ${
                      !item.sell_date
                        ? `animate-pulse-shadow ${
                            isPositive(item.return) ? "" : "pulse-rose"
                          }`
                        : ""
                    }`}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mt-4">
        {visitedCount ? (
          <div className="card animate-fade-up border-rose-100 p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Crown size={22} />
            </span>
            <p className="mt-3 text-sm font-extrabold text-ink">
              به سقف ۱۰ جستجو رسیدید
            </p>
            <p className="mx-auto mt-1 max-w-[240px] text-[11px] leading-5 text-muted">
              برای بررسی نمادهای بیشتر، سطح کاربری خود را به VIP ارتقا دهید.
            </p>
            <Link to="/mini-app/buy-service" className="btn-primary mt-4">
              <Sparkles size={14} /> مشاهده پلن های VIP
            </Link>
          </div>
        ) : signalHistory?.length > 0 ? (
          <div className="card animate-fade-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <p className="text-xs font-bold text-ink">بازدهی کل (مرکب)</p>
              <span
                dir="ltr"
                className={`inline-flex rounded-lg px-2.5 py-1 text-base font-extrabold ${returnTone(
                  totalReturn
                )}`}
              >
                {isPositive(totalReturn) ? "+" : ""}
                {toPersianDigits(totalReturn)}%
              </span>
            </div>
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
                  .filter((e) => (!isVip ? e.sell_date : e))
                  .map((signal, index) => (
                    <tr key={index}>
                      <td>
                        <span
                          className={`mx-auto block h-3.5 w-3.5 rounded-full ${
                            isPositive(signal?.return)
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          } ${
                            !signal?.sell_date
                              ? `animate-pulse-shadow ${
                                  isPositive(signal?.return) ? "" : "pulse-rose"
                                }`
                              : ""
                          }`}
                        />
                      </td>
                      <td dir="ltr">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-extrabold ${returnTone(
                            signal?.return
                          )}`}
                        >
                          {isPositive(signal?.return) ? "+" : ""}
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
        ) : (
          signalHistory && (
            <div className="empty-state animate-fade-up">
              <SearchIcon size={24} className="text-slate-300" />
              <p className="text-xs font-semibold text-ink">سابقه ای یافت نشد</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CheckHistory;
