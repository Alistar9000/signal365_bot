import {
  Bell,
  ChartBar,
  HelpCircle,
  Phone,
  Search,
  Settings,
  StarIcon,
  TrendingUp,
} from "lucide-react";

import MenuItem from "../components/MenuItem";
import { MiniAppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";

const menuItems = [
  {
    id: 1,
    title: "خرید / تمدید سرویس VIP",
    icon: <StarIcon />,
    to: "/mini-app/buy-service",
    desc: "ارائه سیگنال های بورس ایران شامل سهام و صندوق های مختلف",
  },
  {
    id: 2,
    title: "سهام برتر",
    icon: <ChartBar />,
    to: "/mini-app/top-100",
    desc: "سهامی که بهترین سابقه بازدهی توسط ربات را دارند.",
  },
  {
    id: 3,
    title: "لیست هشدار",
    icon: <Bell />,
    to: "/mini-app/alarms",
    desc: "ذخیره سهام دلخواه برای سیگنال خرید و فروش",
  },
  {
    id: 4,
    title: "سیگنال های امروز",
    icon: <TrendingUp />,
    to: "/mini-app/today-signals",
    desc: "سیگنال هایی که در تایم روزانه معاملات بازار ارائه می شوند.",
  },
  {
    id: 5,
    title: "بررسی سابقه سهم",
    icon: <Search />,
    to: "/mini-app/check-history",
    desc: "بررسی عملکرد و میزان موفقیت ربات روی هر سهم دلخواه.",
  },

  {
    id: 8,
    title: "راهنمای ربات",
    icon: <HelpCircle />,
    to: "/mini-app/guide",
    desc: "راهنمای کامل از معرفی بخش های مختلف ربات.",
  },

  {
    id: 9,
    title: "مدیریت",
    icon: <Settings />,
    to: "/mini-app/admin",
    desc: "تنظیمات کاربران ویژه.",
  },
];

export default function Home() {
  const { userData ,isLoading } = MiniAppContext();
  const [flag,setFlag] = useState(false)

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col h-full  overflow-auto  gap-2">
      <div className="flex flex-col gap-2">
        {menuItems.map((item, index) => {
          if (item.id === 9 && userData?.role === "admin")
            return <MenuItem key={index} {...item} />;
          if (item.id !== 9) return <MenuItem key={index} {...item} />;
        })}

        <div
          style={{ lineHeight: 1 }}
          onClick={() =>
            //  window.Bale.WebApp.openLink("https://ble.ir/signal365_support")
             window.Telegram.WebApp.openLink("https://t.me/signal365_support")
          }
          className=" h-20 items-center cursor-pointer hover:bg-neutral-100/40  overflow-hidden w-full border gap-2  rounded-xl p-2  flex"
        >
          <div className="text-lg">
            <div className="p-3 flex rounded-xl text-[var(--app-subtitle-text-color)] bg-[var(--app-secondary-bg-color)] items-center justify-center">
              <Phone />
            </div>
          </div>
          <div className="w-full flex flex-col">
            <p className="text-sm font-bold text-[var(--app-accent-text-color)]">
              ارتباط با ما
            </p>
            <p className="text-xs text-[var(--app-subtitle-text-color)]">
              پشتیبانی سیگنال هوشمند 
              <span className="text-[var(--app-link-color)]">@signal365_support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
