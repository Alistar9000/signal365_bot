import { Outlet } from "react-router-dom";

const BuyServiceLayout = () => {
  return (
    <div className="h-full flex flex-col gap-10 items-center p-4">
      <div className="w-full flex flex-col gap-2 font-bold text-[var(--app-text-color)]">
        <p>پلن های اشتراک VIP</p>
        <p className="text-xs bg-yellow-100 py-1 rounded-md w-full text-center text-neutral-500">
          سیگنال های این ربات فقط در حوزه{" "}
          <span className="text-sm text-[var(--app-accent-text-color)]">
            بورس ایران
          </span>{" "}
          می باشد
        </p>
      </div>
      <Outlet />
    </div>
  );
};

export default BuyServiceLayout;
