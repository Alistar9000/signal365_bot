import { useState } from "react";
import { Crown, Trash2 } from "lucide-react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";
import { toPersianDigits } from "../../util/format";

export default function UpdateVip() {
  const [input, setInput] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();
  const [search] = useSearchParams();
  const type = search.get("type");
  const isAdd = type === "add";
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans"),
  });
  const sortedPlans = [...(data?.data?.data || [])].sort(
    (a, b) => Number(a.type) - Number(b.type),
  );
  const planTypes = sortedPlans.map((plan) => String(plan.type));

  // Plans arrive asynchronously, so derive the default instead of freezing it
  // in useState's initial value (which runs while the list is still empty).
  const [selectedPlan, setSelectedPlan] = useState("");
  const inputPlan =
    selectedPlan && planTypes.includes(selectedPlan)
      ? selectedPlan
      : (planTypes[0] ?? "");

  const handleClick = () =>
    run(
      () =>
        isAdd
          ? api.post(`/admin/vips/${type}`, {
              chat_id: input,
              plan: inputPlan,
            })
          : api.post(`/admin/vips/${type}`, { chat_id: input }),
      {
        format: (response) => {
          const success = Boolean(response?.data?.success);
          return {
            success,
            title: success
              ? `با موفقیت ${isAdd ? "اضافه" : "حذف"} گردید`
              : `${isAdd ? "افزودن" : "حذف"} ناموفق بود`,
            message: response?.data?.message,
          };
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] }),
      },
    );

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isAdd ? "bg-brand-50 text-brand-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {isAdd ? <Crown size={15} /> : <Trash2 size={15} />}
          </span>
          {isAdd ? "افزودن کاربر VIP" : "حذف کاربر VIP"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="vip-chat-id">
              چت آی دی را وارد کنید
            </label>
            <input
              id="vip-chat-id"
              dir="ltr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="۱۲۳۴۵۶۷۸۹"
            />
          </div>

          {isAdd && (
            <div>
              <label className="field-label" htmlFor="vip-plan">
                پلن اشتراک
              </label>
              <select
                id="vip-plan"
                value={inputPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                {sortedPlans.map((plan) => (
                  <option key={plan.id ?? plan.type} value={plan.type}>
                    {toPersianDigits(plan.type)} ماهه
                  </option>
                ))}
              </select>
            </div>
          )}

          <AdminActionButton
            loading={loading}
            icon={isAdd ? Crown : Trash2}
            danger={!isAdd}
            loadingLabel={isAdd ? "در حال افزودن..." : "در حال حذف..."}
            onClick={handleClick}
          >
            {isAdd ? "افزودن" : "حذف"}
          </AdminActionButton>
        </div>
      </div>

      <AdminResultModal result={result} onClose={clearResult} />
    </div>
  );
}
