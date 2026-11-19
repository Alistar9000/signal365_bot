import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../util/axios";
import { formatPrice, toPersianDigits } from "../../util/format";
import Loading from "../../components/Loading";

const byShortestFirst = (a, b) =>
  (Number(a.type) || Number.MAX_SAFE_INTEGER) -
  (Number(b.type) || Number.MAX_SAFE_INTEGER);

const BuyServicePlans = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans"),
  });

  const vipServices = [...(data?.data?.data || [])].sort(byShortestFirst);

  if (isLoading) return <Loading label="در حال بارگذاری پلن ها..." />;

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {vipServices.length === 0 && (
        <div className="empty-state">
          <Crown size={22} className="text-slate-300" />
          <p className="text-xs text-muted">در حال حاضر پلنی موجود نیست.</p>
        </div>
      )}

      {vipServices.map((item) => (
        <Link
          key={item.id}
          to={`/mini-app/buy-service/${item.type}/${item.off_price}`}
          className="group card relative overflow-hidden p-5 pt-7 transition duration-200 hover:-translate-y-0.5 hover:shadow-float active:scale-[.99]"
        >
          <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand-50" />

          <span className="absolute right-0 top-0 rounded-bl-2xl bg-brand-500 px-3 py-1.5 text-[11px] font-bold text-white">
            {toPersianDigits(item.type)} ماهه
          </span>

          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted">مدت اشتراک</p>
              <p className="mt-1 text-lg font-extrabold text-ink">
                {toPersianDigits(item.period)} روز
              </p>
            </div>
            <div className="text-left">
              <p className="text-[11px] text-muted">قیمت ویژه</p>
              <p
                dir="ltr"
                className="mt-1 flex items-baseline gap-1 text-xl font-extrabold text-brand-700"
              >
                <span className="text-[10px] font-semibold text-muted">تومان</span>
                {formatPrice(item.off_price)}
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            {Number(item.off_percent) > 0 && (
              <div className="flex items-center gap-2">
                <span className="chip bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                  {toPersianDigits(item.off_percent)}% تخفیف
                </span>
                <span dir="ltr" className="text-[11px] text-slate-400 line-through">
                  {formatPrice(item.price)}
                </span>
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600">
              انتخاب <ArrowLeft size={13} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BuyServicePlans;
