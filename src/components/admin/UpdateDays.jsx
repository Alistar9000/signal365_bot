import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";

export default function UpdateDays() {
  const [input, setInput] = useState("");
  const [inputDays, setInputDays] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();
  const [search] = useSearchParams();
  const type = search.get("type");
  const forAll = type === "all";

  const handleClick = () =>
    run(
      () =>
        forAll
          ? api.post(`/admin/add-days/${type}`, { days: inputDays })
          : api.post(`/admin/add-days/${type}`, {
              chat_id: input,
              days: inputDays,
            }),
      {
        format: (response) => {
          const success = Boolean(response?.data?.success);
          return {
            success,
            title: success
              ? "با موفقیت اضافه گردید"
              : "افزودن ناموفق بود",
            message: response?.data?.message,
          };
        },
      },
    );

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <CalendarPlus size={15} />
          </span>
          {forAll
            ? "افزودن روز به همه کاربران VIP"
            : "افزودن روز به کاربر VIP خاص"}
        </h2>

        <div className="flex flex-col gap-4">
          {!forAll && (
            <div>
              <label className="field-label" htmlFor="days-chat-id">
                چت آی دی را وارد کنید
              </label>
              <input
                id="days-chat-id"
                dir="ltr"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="۱۲۳۴۵۶۷۸۹"
              />
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="days-count">
              تعداد روز
            </label>
            <input
              id="days-count"
              dir="ltr"
              type="number"
              value={inputDays}
              onChange={(e) => setInputDays(e.target.value)}
              placeholder="۳۰"
            />
          </div>

          <AdminActionButton
            loading={loading}
            icon={CalendarPlus}
            loadingLabel="در حال ثبت..."
            onClick={handleClick}
          >
            ثبت
          </AdminActionButton>
        </div>
      </div>

      <AdminResultModal result={result} onClose={clearResult} />
    </div>
  );
}
