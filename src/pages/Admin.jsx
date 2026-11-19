import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Crown,
  Search,
  Settings2,
  ShieldPlus,
  ShieldMinus,
  SlidersHorizontal,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { api } from "../util/axios";
import { toPersianDigits } from "../util/format";

const items = [
  {
    title: "جستجوی کاربر",
    url: "/mini-app/admin/check-user",
    icon: <Search size={19} />,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    title: "افزودن کاربر VIP",
    url: "/mini-app/admin/update-vip?type=add",
    icon: <UserPlus size={19} />,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "حذف کاربر VIP",
    url: "/mini-app/admin/update-vip?type=delete",
    icon: <UserMinus size={19} />,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    title: "افزودن ادمین",
    url: "/mini-app/admin/update-admin?type=add",
    icon: <ShieldPlus size={19} />,
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "حذف ادمین",
    url: "/mini-app/admin/update-admin?type=delete",
    icon: <ShieldMinus size={19} />,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    title: "افزودن روز به همه",
    url: "/mini-app/admin/update-days?type=all",
    icon: <CalendarDays size={19} />,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    title: "افزودن روز به کاربر",
    url: "/mini-app/admin/update-days?type=vip",
    icon: <CalendarDays size={19} />,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    title: "آستانه سیگنال",
    url: "/mini-app/admin/update-range",
    icon: <SlidersHorizontal size={19} />,
    tone: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "ویرایش پلن ها",
    url: "/mini-app/admin/update-plans",
    icon: <Settings2 size={19} />,
    tone: "bg-slate-100 text-slate-600",
  },
];

const Admin = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => api.get("/admin/users"),
  });

  const users = data?.data?.data;

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="icon-tile bg-amber-50 text-amber-600">
            <Crown size={19} />
          </span>
          <div>
            <p className="text-[10px] text-muted">کاربران VIP</p>
            <p className="mt-0.5 text-lg font-extrabold text-ink">
              {toPersianDigits(users?.vip ?? "—")}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="icon-tile bg-brand-50 text-brand-600">
            <Users size={19} />
          </span>
          <div>
            <p className="text-[10px] text-muted">کل کاربران</p>
            <p className="mt-0.5 text-lg font-extrabold text-ink">
              {toPersianDigits(users?.all ?? "—")}
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="section-title">
          <span className="h-5 w-1 rounded-full bg-brand-500" />
          ابزارهای مدیریت
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className="card flex min-h-[104px] flex-col justify-between gap-3 p-3.5 transition hover:-translate-y-0.5 hover:shadow-float active:scale-[.98]"
            >
              <span className={`icon-tile ${item.tone}`}>{item.icon}</span>
              <span className="text-[12px] font-bold leading-4 text-ink">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;
