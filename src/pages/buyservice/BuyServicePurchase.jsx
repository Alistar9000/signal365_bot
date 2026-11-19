import { useEffect, useState } from "react";
import { Check, CheckSquare, Copy, Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { formatPrice, toPersianDigits } from "../../util/format";

// Kept in Latin digits on purpose — this is the bank card number.
const CARD_NUMBER = "6104337611152057";

function Step({ number, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
        {toPersianDigits(number)}
      </span>
      <div className="min-w-0 flex-1 pt-0.5 text-[12px] leading-6 text-ink">
        {children}
      </div>
    </div>
  );
}

const BuyServicePurchase = () => {
  const { plan_number, price } = useParams();
  const [load, setLoad] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoad(true), 100);
    return () => clearTimeout(id);
  }, []);

  const copyCard = async () => {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const openSupport = () => {
    const url = "https://t.me/signal365_support";
    if (window.Telegram?.WebApp?.openLink) window.Telegram.WebApp.openLink(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`transition-all duration-700 ${
        load ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="card overflow-hidden animate-fade-up">
        <div className="bg-gradient-to-l from-brand-600 to-brand-800 p-5 text-white">
          <p className="text-[11px] text-white/70">پلن انتخابی شما</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <h2 className="text-lg font-extrabold">
              {toPersianDigits(plan_number)} ماهه
            </h2>
            <p
              dir="ltr"
              className="flex items-baseline gap-1 text-xl font-extrabold"
            >
              <span className="text-[10px] font-normal text-white/70">تومان</span>
              {formatPrice(price)}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-2">
            <CheckSquare size={15} className="text-brand-600" />
            <p className="text-xs font-extrabold text-ink">مراحل خرید</p>
          </div>

          <Step number={1}>
            <p>
              مبلغ{" "}
              <span
                dir="ltr"
                className="inline-flex items-baseline gap-1 font-bold text-brand-700"
              >
                <span className="text-[10px] font-normal text-brand-700/70">تومان</span>
                {formatPrice(price)}
              </span>{" "}
              را به شماره کارت زیر واریز کنید:
            </p>
            <button
              type="button"
              onClick={copyCard}
              className="mt-2 flex w-full items-center justify-between rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-3 py-2.5 transition hover:bg-brand-50"
            >
              <span dir="ltr" className="font-sans text-sm font-bold tracking-wide text-brand-800">
                {CARD_NUMBER}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-brand-700">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "کپی شد" : "کپی"}
              </span>
            </button>
            <p className="mt-1.5 text-[11px] text-muted">بنام علی مصدق</p>
          </Step>

          <Step number={2}>ارسال رسید پرداخت به پشتیبانی.</Step>

          <Step number={3}>
            ارسال <span className="font-bold">شناسه چت</span> (عدد بالای صفحه) به
            پشتیبانی.
          </Step>

          <button
            type="button"
            onClick={openSupport}
            className="btn-primary btn-block"
          >
            <Send size={15} />
            ارسال رسید به پشتیبانی
          </button>
          <p className="text-center text-[11px] text-muted">
            آدرس پشتیبانی:{" "}
            <span dir="ltr" className="font-sans font-bold text-brand-700">
              @signal365_support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyServicePurchase;
