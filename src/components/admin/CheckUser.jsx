import { useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../util/axios";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";
import { toPersianDigits } from "../../util/format";

export default function CheckUser() {
  const [input, setInput] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();

  const handleClick = () =>
    run(() => api.post(`/admin/check-user?id=${input}`), {
      format: (response) => {
        const user = response?.data?.data;
        if (!user) {
          return {
            success: false,
            title: "کاربر موجود نمی باشد",
            message: "چت آیدی وارد شده یافت نشد.",
          };
        }

        return {
          success: true,
          title: "اطلاعات کاربر",
          details: [
            ["چت آیدی", toPersianDigits(user.chat_id)],
            ["نام", user.name],
            ["نام کاربری", user.username],
            ["تعداد روز باقیمانده", toPersianDigits(user.remaining_days)],
            ["تعداد دفعات خریداری", toPersianDigits(user.purchase_count)],
            ["VIP", user.is_vip ? "بله" : "خیر"],
          ],
        };
      },
    });

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Search size={15} />
          </span>
          جستجوی کاربر
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="check-user-id">
              چت آی دی را وارد کنید
            </label>
            <input
              id="check-user-id"
              dir="ltr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="۱۲۳۴۵۶۷۸۹"
            />
          </div>
          <AdminActionButton
            loading={loading}
            icon={Search}
            loadingLabel="در حال جستجو..."
            onClick={handleClick}
          >
            جستجو
          </AdminActionButton>
        </div>
      </div>

      <AdminResultModal result={result} onClose={clearResult} />
    </div>
  );
}
