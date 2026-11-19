import {
  Bell,
  BookOpen,
  ChartBar,
  Crown,
  History,
  MessageCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const sections = [
  {
    icon: <Crown size={18} />,
    tone: "bg-amber-50 text-amber-600",
    title: "اشتراک VIP",
    text: "با خرید پلن VIP به تمام سیگنال ها، نام نمادها و سوابق کامل دسترسی پیدا می کنید. پلن ها را از صفحه اصلی مشاهده کنید.",
  },
  {
    icon: <TrendingUp size={18} />,
    tone: "bg-emerald-50 text-emerald-600",
    title: "سیگنال های امروز",
    text: "سیگنال های خرید و فروش صادر شده در طول روز معاملات به همراه زمان صدور نمایش داده می شوند.",
  },
  {
    icon: <ChartBar size={18} />,
    tone: "bg-sky-50 text-sky-600",
    title: "سهام برتر",
    text: "فهرست سهامی که بهترین بازدهی را در سیگنال های ثبت شده ربات داشته اند. با لمس هر سهم، سوابق سیگنال آن نمایش داده می شود.",
  },
  {
    icon: <Bell size={18} />,
    tone: "bg-rose-50 text-rose-600",
    title: "لیست هشدار",
    text: "نمادهای مورد علاقه خود را ذخیره کنید تا سیگنال های خرید و فروش آنها را به راحتی دنبال نمایید. حداکثر ۱۰۰ نماد قابل ذخیره است.",
  },
  {
    icon: <History size={18} />,
    tone: "bg-violet-50 text-violet-600",
    title: "بررسی سابقه سهم",
    text: "با جستجوی نام هر سهم، توالی سیگنال ها و میزان بازدهی مرکب ربات روی آن سهم را مشاهده کنید.",
  },
  {
    icon: <Search size={18} />,
    tone: "bg-indigo-50 text-indigo-600",
    title: "نمادهای معتبر",
    text: "سهام بازارهای اصلی بورس و فرابورس به همراه صندوق های معرفی شده در بخش قوانین لیست هشدار، قابل ثبت هستند.",
  },
];

const Guide = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="راهنمای ربات"
        subtitle="آشنایی سریع با بخش های مختلف سیگنال ۳۶۵"
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-gradient-to-l from-brand-50 to-white p-4">
        <span className="icon-tile bg-white text-brand-600 shadow-sm">
          <BookOpen size={19} />
        </span>
        <p className="text-[11px] leading-5 text-slate-600">
          سیگنال ۳۶۵ یک دستیار هوشمند برای{" "}
          <span className="font-bold text-brand-700">بورس ایران</span> است که
          سیگنال های خرید و فروش را بر اساس الگوهای تاریخی ارائه می دهد.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className="card flex animate-fade-up items-start gap-3 p-4"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className={`icon-tile ${section.tone}`}>{section.icon}</span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold text-ink">{section.title}</h2>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                {section.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/mini-app/buy-service"
        className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-l from-brand-600 to-brand-800 p-4 text-white shadow-brand transition hover:brightness-110"
      >
        <span className="flex items-center gap-2 text-xs font-bold">
          <Crown size={16} className="text-amber-300" />
          مشاهده پلن های VIP
        </span>
        <MessageCircle size={16} className="text-white/70" />
      </Link>
    </div>
  );
};

export default Guide;
