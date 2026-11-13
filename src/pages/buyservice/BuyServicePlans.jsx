import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  ChevronLeft,
  SkipBack,
  Square,
  Star,
  StepBack,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../util/axios";
import { MiniAppContext } from "../../components/AppContext";
import Loading from "../../components/Loading";

const BuyServicePlans = () => {
  const { isLoading} = MiniAppContext()
  const { data } = useQuery({
    queryKey: ["vip-plans"],
    queryFn: () => api.get("/plans"),
    enabled:!isLoading,
  });
  const vipServices = data?.data?.data || [];
  const handleBuy = (title) => {
    const handlePayment = (invoiceData) => {
      if (invoiceData.is_paid) {
        setSuccess(true);
      } else {
        setSuccess(false);
      }
      const url = "https://www.zarinpal.com/pg/StartPay/111252025";
      window.Bale.WebApp.openInvoice(
        `سرویس VIP ${title} ربات سیگنال هوشمند`,
        url,
        handlePayment,
      );
    };
  };

  if(isLoading) return <Loading />

  return (
    <div className="flex w-full flex-col gap-8">
      {vipServices.map((item, index) => (
        <Link
          to={`/mini-app/buy-service/${item.type}/${item.off_price}`}
          key={item.id}
          className="border cursor-pointer shadow hover:bg-neutral-50 hover:shadow-md hover:scale-105 transition-all duration-300 rounded-xl flex flex-col justify-center  px-4 py-8 w-full relative bg-[var(--app-bg-color)]"
        >
          <div className="absolute -top-2 -right-2 rounded-xl  p-2 shadow  text-white bg-[var(--app-accent-text-color)] text-sm">
            {item.type} ماه کاری ( {item.period} روز )
          </div>

          <p className="text-[var(--app-text-color)] font-bold w-full justify-end flex items-center">
            {item.off_price}{" "}
            <span className="text-xs px-1 text-[var(--app-subtitle-text-color)]">
              تومان
            </span>
          </p>

          <div className="flex w-full h-full items-center justify-between">
            <div className="flex gap-2 items-center">
              <p className="bg-[var(--app-red-bg-color)] rounded-md text-sm px-1 py-0.5 text-white">
                {item.off_percent}%
              </p>
              <span className="text-xs font-bold text-[var(--app-subtitle-text-color)]">
                تخفیف
              </span>
            </div>
            <p className=" text-end w-full line-through text-neutral-500 pl-9 text-xs">
              {item.price}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BuyServicePlans;
