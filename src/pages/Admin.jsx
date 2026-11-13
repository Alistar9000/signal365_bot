import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { api } from "../util/axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => api.get("/admin/users"),
  });

  const items = [
    {
      title: "جتسجوی کاربر",
      url: "/mini-app/admin/check-user",
    },
    {
      title: "افزودن کاربر VIP",
      url: "/mini-app/admin/update-vip?type=add",
    },
    {
      title: "حذف کاربر VIP",
      url: "/mini-app/admin/update-vip?type=delete",
    },
    { title: "افزودن admin", url: "/mini-app/admin/update-admin?type=add" },
    { title: "حذف admin", url: "/mini-app/admin/update-admin?type=delete" },
    {
      title: "افزودن روز به تمام کاربران",
      url: "/mini-app/admin/update-days?type=all",
    },
    {
      title: "افزودن روز به کاربر خاص",
      url: "/mini-app/admin/update-days?type=vip",
    },
    { title: "تغییر آستانه سیگنال", url: "/mini-app/admin/update-range" },
    { title: "تغییر مبلغ پلن ها", url: "/mini-app/admin/update-plans" },

    // {
    //   title: "ارسال پیام به VIP",
    //   url: "/mini-app/admin/send-message?type=vip",
    // },
    // {
    //   title: "ارسال پیام به همه",
    //   url: "/mini-app/admin/send-message?type=all",
    // },
  ];
  const users = data?.data?.data;

  const handleClick = async (api) => {
    const response = await api.get(`/admin/${api}`);
    const result = response.data.data;
    if (result.success) setSuccess(true);
    else setSuccess(false);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-full relative gap-5 flex flex-col ">
      <div className="flex w-full  text-xs items-center justify-between">
        <div className="flex items-center gap-2">
          <p>کاربران VIP : </p>
          <span className="text-sm text-[var(--app-accent-text-color)]">
            {users?.vip}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p>کل کاربران : </p>
          <span className="text-sm text-[var(--app-accent-text-color)]">
            {users?.all}
          </span>
        </div>
      </div>
      <div className="mt-5 gap-4  grid grid-cols-3 sm:grid-cols-4">
        {items.map((item, index) => (
          <Link
            to={item.url}
            className="cursor-pointer text-[var(--app-text-color)] border border-[var(--app-accent-text-color)] rounded-xl min-h-20  flex items-center justify-center bg-white text-center p-4 hover:bg-slate-200 text-sm"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Admin;
