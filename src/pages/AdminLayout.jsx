import { Outlet } from "react-router-dom";
import PageHeader from "../components/PageHeader";

function AdminLayout() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="پنل مدیریت"
        subtitle="مدیریت کاربران، اشتراک ها و تنظیمات ربات"
      />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
