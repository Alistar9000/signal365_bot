import {
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  ChartBar,
  Crown,
  HelpCircle,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import MenuItem from "../components/MenuItem";
import { MiniAppContext } from "../components/AppContext";
import { toPersianDigits } from "../util/format";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";

const menuItems = [
  {
    id: 2,
    title: "سهام برتر",
    icon: <ChartBar size={20} />,
    to: "/mini-app/top-100",
    desc: "سهامی که بهترین بازدهی را از ربات ثبت کرده اند.",
    tone: "emerald",
  },
  {
    id: 3,
    title: "لیست هشدار",
    icon: <Bell size={20} />,
    to: "/mini-app/alarms",
    desc: "ذخیره سهام دلخواه برای سیگنال خرید و فروش.",
    tone: "rose",
  },
  {
    id: 4,
    title: "سیگنال های امروز",
    icon: <TrendingUp size={20} />,
    to: "/mini-app/today-signals",
    desc: "سیگنال های لحظه ای معاملات بازار امروز.",
    tone: "amber",
  },
  {
    id: 5,
    title: "بررسی سابقه سهم",
    icon: <Search size={20} />,
    to: "/mini-app/check-history",
    desc: "ببینید ربات روی هر سهم چقدر موفق بوده است.",
    tone: "sky",
  },
  {
    id: 8,
    title: "راهنمای ربات",
    icon: <HelpCircle size={20} />,
    to: "/mini-app/guide",
    desc: "آشنایی کامل با تمام بخش های ربات.",
    tone: "violet",
  },
  {
    id: 9,
    title: "مدیریت",
    icon: <Settings size={20} />,
    to: "/mini-app/admin",
    desc: "پنل مدیریت و تنظیمات کاربران ویژه.",
    tone: "slate",
  },
];

const SUPPORT_URL = "https://t.me/signal365_support";

export default function Home() {
  const { userData, isLoading } = MiniAppContext();

  if (isLoading) return <Loading />;

  const openSupport = () => {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(SUPPORT_URL);
    } else {
      window.open(SUPPORT_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* VIP hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-slate-900 via-brand-900 to-brand-800 p-5 text-white shadow-float">
        <div className="pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-300 ring-1 ring-white/15">
            <Crown size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-white/60">
              سرویس اشتراک سیگنال هوشمند
            </p>
            <h2 className="mt-1 text-base font-extrabold leading-6">
              {userData?.is_vip
                ? "شما عضو VIP هستید 🎉"
                : "بورس را حرفه ای دنبال کنید"}
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-white/70">
              {userData?.is_vip
                ? `${toPersianDigits(userData?.remaining_day ?? 0)} روز از اشتراک شما باقی مانده است.`
                : "سیگنال های خرید و فروش، سهام برتر و هشدارهای لحظه ای."}
            </p>
          </div>
        </div>

        <Link
          to="/mini-app/buy-service"
          className="relative mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-bold ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-300" />
            {userData?.is_vip ? "تمدید یا ارتقای اشتراک" : "مشاهده پلن های VIP"}
          </span>
          <ArrowLeft size={16} />
        </Link>
      </section>

      {/* Quick access */}
      <section>
        <div className="section-title">
          <span className="h-5 w-1 rounded-full bg-brand-500" />
          دسترسی سریع
          <span className="mr-auto text-[10px] font-normal text-muted">
            همه خدمات در یک جا
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => {
            if (item.id === 9 && userData?.role !== "admin") return null;
            return <MenuItem key={item.id} {...item} />;
          })}
        </div>
      </section>

      {/* Support */}
      <button
        type="button"
        onClick={openSupport}
        className="card flex w-full items-center gap-3 p-3.5 text-right transition hover:shadow-float active:scale-[.99]"
      >
        <span className="icon-tile bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <MessageCircle size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink">
            ارتباط با پشتیبانی
          </span>
          <span dir="ltr" className="mt-0.5 block text-[11px] text-brand-700">
            @signal365_support
          </span>
        </span>
        <ArrowUpLeft size={16} className="text-slate-300" />
      </button>
    </div>
  );
}
