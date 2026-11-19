import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { api } from "../../util/axios";
import { useQuery } from "@tanstack/react-query";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";
import { toPersianDigits } from "../../util/format";

export default function UpdateRange() {
  const [input, setInput] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();

  const { data } = useQuery({
    queryKey: ["signal-range", result],
    queryFn: () => api.get("/admin/range"),
  });
  const range = data?.data?.data || "";

  const handleClick = () =>
    run(
      () =>
        api.post(`/admin/range`, {
          range: parseFloat(input),
        }),
      {
        format: (response) => {
          const success = Boolean(response?.data?.success);
          return {
            success,
            title: success
              ? "با موفقیت آپدیت شد"
              : "آپدیت ناموفق بود",
            message: response?.data?.message,
          };
        },
        onSuccess: () => setInput(""),
      },
    );

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <SlidersHorizontal size={15} />
          </span>
          تغییر آستانه سیگنال
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="text-[11px] text-muted">آستانه فعلی</span>
            <span dir="ltr" className="font-sans text-sm font-extrabold text-brand-700">
              {toPersianDigits(range || "—")}
            </span>
          </div>

          <div>
            <label className="field-label" htmlFor="signal-range">
              آستانه جدید
            </label>
            <input
              id="signal-range"
              dir="ltr"
              type="number"
              step="0.1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="۰.۰"
            />
          </div>

          <AdminActionButton
            loading={loading}
            icon={SlidersHorizontal}
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
