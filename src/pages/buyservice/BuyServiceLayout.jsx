import { Outlet } from "react-router-dom";
import { Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";

const BuyServiceLayout = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="پلن های اشتراک VIP"
        subtitle="با انتخاب پلن مورد نظر، از تمام سیگنال های ربات بهره مند شوید."
      />
      <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">
        <Info size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <p>
          سیگنال های این ربات فقط در حوزه{" "}
          <span className="font-bold text-amber-900">بورس ایران</span> می باشد.
        </p>
      </div>
      <Outlet />
    </div>
  );
};

export default BuyServiceLayout;
