import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="w-full flex flex-col gap-5">
      <p>پنل مدیریت</p>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
