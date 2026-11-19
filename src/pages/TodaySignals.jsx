import { useQuery } from "@tanstack/react-query";
import { Inbox, Timer, TrendingDown, TrendingUp } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { api } from "../util/axios";
import Loading from "../components/Loading";
import { MiniAppContext } from "../components/AppContext";
import NotVipMessage from "../components/admin/NotVipMessage";
import { toPersianDigits } from "../util/format";

const TodaySignals = () => {
  const { userData, isLoading: loading } = MiniAppContext();
  const { data, isLoading } = useQuery({
    queryKey: ["today-signals"],
    queryFn: () => api.get("/today-signals"),
    enabled: !loading,
  });

  const signals = data?.data?.data || [];
  const isVip = Boolean(userData?.is_vip);

  if (loading || isLoading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="سیگنال های امروز"
        subtitle="سیگنال های خرید و فروش صادر شده در معاملات امروز"
      />

      {signals.length === 0 ? (
        <div className="empty-state">
          <Inbox size={26} className="text-slate-300" />
          <p className="text-xs font-semibold text-ink">
            در حال حاضر سیگنالی وجود ندارد
          </p>
          <p className="text-[11px] text-muted">با شروع معاملات، سیگنال ها نمایش داده می شوند.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {!isVip && (
            <div className="mb-1">
              <NotVipMessage text="مشاهده نام نمادها" />
            </div>
          )}

          {signals.map((signal, index) => {
            const isBuy = signal?.type === "buy";
            return (
              <div
                key={index}
                className="card flex animate-fade-up items-center gap-3 p-3.5"
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
              >
                <span
                  className={`icon-tile ring-1 ${
                    isBuy
                      ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                      : "bg-rose-50 text-rose-600 ring-rose-100"
                  }`}
                >
                  {isBuy ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">
                    {isVip ? signal?.name ?? "نماد" : "نماد"}
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
                    {isVip && signal?.source && (
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
                    {toPersianDigits(isVip ? signal?.time1 ?? "-" : "-")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaySignals;
