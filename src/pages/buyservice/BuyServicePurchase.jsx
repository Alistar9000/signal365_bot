import { CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BuyServicePurchase = () => {
  const { plan_number, price } = useParams();
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    }, 100);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-700 ${load ? "translate-y-0 opacity-100" : "-translate-y-2 ease-in-out opacity-0"} `}
    >
      <div className="mt-2 border text-[var(--app-text-color)] flex flex-col items-center   gap-4 w-full text-sm  p-6 rounded-xl">
        <p className="text-xs text-neutral-500 mb-2 w-full  font-bold">
          برای خرید پلن{" "}
          <span className="px-2 pb-1 py-0.5 rounded-md bg-[var(--app-accent-text-color)] text-[var(--app-bg-color)]">
            {plan_number} ماهه
          </span>{" "}
          مراحل زیر را انجام دهید{" "}
        </p>
        <div className="flex flex-col gap-3">
          {/* <p className="text-xs bg-amber-100 px-2 py-1 text-[var(--app-link-color)] rounded-md">
            شماره کارت را کپی کنید و در قسمت خدمات بله روی گزینه کارت به کارت
            بزنید
          </p> */}
          <div className="w-full">
            <div className="flex w-max items-center gap-2">
              <CheckSquare size={12} />
              <p className="flex  items-center gap-1">
                واریز مبلغ <span className="font-bold">{price}</span> تومان به
                شماره کارت
              </p>
            </div>

            <p className="text-xs text-[var(--app-subtitle-text-color)]">
              (بزن روش کپی شه{" "}
              <span
                onClick={() =>
                  navigator.clipboard.writeText("6104337611152057")
                }
                className="cursor-pointer font-sans text-sm text-[var(--app-link-color)]"
              >
                6104337611152057
              </span>
              ){" "}
              <span className="text-sm text-[var(--app-text-color)] ">
                {" "}
                بنام علی مصدق
              </span>
            </p>
          </div>
          <p className="flex items-center gap-2">
            <CheckSquare size={12} />
            ارسال رسید پرداخت به پشتیبانی
          </p>
          <div className="">
            <p className="flex items-center gap-2">
              <CheckSquare size={12} />
              ارسال ID (عدد بالای صفحه) به پشتیبانی
            </p>
            <span className="text-xs text-[var(--app-subtitle-text-color)]">
              (بزن روش کپی میشه)
            </span>
          </div>
          <p>
            آدرس پشتیبانی :{" "}
            <span
              onClick={() =>
                // window.Bale.WebApp.openLink("https://ble.ir/signal365_support")
                window.Telegram.WebApp.openLink("https://t.me/signal365_support")
              }
              className="cursor-pointer text-[var(--app-link-color)]"
            >
              signal365_support@
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyServicePurchase;
