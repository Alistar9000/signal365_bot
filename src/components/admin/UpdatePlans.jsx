import { useState } from "react";
import { Plus, Save, Settings2 } from "lucide-react";
import { api } from "../../util/axios";
import Loading from "../Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";
import { toPersianDigits } from "../../util/format";

const fields = [
  { name: "type", label: "نوع (ماه)", placeholder: "۳" },
  { name: "period", label: "مدت (روز)", placeholder: "۹۰" },
  { name: "price", label: "قیمت (تومان)", placeholder: "۰" },
  { name: "off_price", label: "قیمت تخفیفی", placeholder: "۰" },
  { name: "off_percent", label: "درصد تخفیف", placeholder: "%" },
];

const emptyPlan = {
  type: "",
  period: "",
  price: "",
  off_price: "",
  off_percent: "",
};

export default function UpdatePlans() {
  const { loading, result, run, clearResult } = useAdminAction();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("edit");
  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans"),
  });
  const plans = data?.data?.data || [];
  const [selectedType, setSelectedType] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [newPlan, setNewPlan] = useState(emptyPlan);

  const selectedPlan = plans.find((p) => String(p.type) === String(selectedType)) ?? plans[0];
  const plan = { ...(selectedPlan ?? {}), ...overrides };

  const handleAddPlan = (e) => e.preventDefault();

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    clearResult();
    if (next === "create") setNewPlan(emptyPlan);
    else setOverrides({});
  };

  const handleSubmit = () => {
    if (mode === "create") {
      return run(
        () => api.post("/admin/plans/add", { plan: newPlan }),
        {
          format: (response) => {
            const success = Boolean(response?.data?.success);
            return {
              success,
              title: success
                ? "پلن جدید با موفقیت ثبت شد"
                : "ثبت پلن ناموفق بود",
              message: response?.data?.message,
            };
          },
          onSuccess: () => {
            const createdType = newPlan.type;
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            setNewPlan(emptyPlan);
            setOverrides({});
            setSelectedType(createdType);
            setMode("edit");
          },
        },
      );
    }

    return run(
      () =>
        api.post(`/admin/plans`, {
          type: selectedType ?? plans[0]?.type,
          plan,
        }),
      {
        format: (response) => {
          const success = Boolean(response?.data?.success);
          return {
            success,
            title: success
              ? "با موفقیت ثبت گردید"
              : "ثبت ناموفق بود",
            message: response?.data?.message,
          };
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
      },
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (mode === "create") {
      setNewPlan((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setSelectedType(selectedPlan?.type ?? null);
    setOverrides((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Settings2 size={15} />
          </span>
          ویرایش پلن ها
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchMode("edit")}
            className={`rounded-lg py-2 text-[12px] font-bold transition ${
              mode === "edit"
                ? "bg-white text-brand-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            ویرایش پلن
          </button>
          <button
            type="button"
            onClick={() => switchMode("create")}
            className={`rounded-lg py-2 text-[12px] font-bold transition ${
              mode === "create"
                ? "bg-white text-brand-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            ثبت پلن جدید
          </button>
        </div>

        {mode === "edit" ? (
          <div className="mb-4">
            <label className="field-label" htmlFor="plan-select">
              انتخاب پلن
            </label>
            <select
              id="plan-select"
              value={selectedType ?? selectedPlan?.type ?? ""}
              onChange={(s) => {
                setSelectedType(s.target.value);
                setOverrides({});
              }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.type}>
                  {toPersianDigits(p.type)} ماهه
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="mb-4 rounded-xl bg-brand-50 px-3 py-2.5 text-[11px] leading-5 text-brand-700">
            فیلدهای نوع، مدت و قیمت الزامی هستند. نوع پلن نباید تکراری باشد.
          </p>
        )}

        <form onSubmit={handleAddPlan} className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="field-label" htmlFor={`plan-${field.name}`}>
                {field.label}
                {mode === "create" &&
                  ["type", "period", "price"].includes(field.name) &&
                  " *"}
              </label>
              <input
                id={`plan-${field.name}`}
                dir="ltr"
                value={
                  mode === "create"
                    ? newPlan[field.name] ?? ""
                    : plan?.[field.name] ?? ""
                }
                onChange={handleChange}
                placeholder={field.placeholder}
                name={field.name}
              />
            </div>
          ))}
        </form>

        <div className="mt-5">
          <AdminActionButton
            loading={loading}
            icon={mode === "create" ? Plus : Save}
            loadingLabel={mode === "create" ? "در حال ثبت..." : "در حال ذخیره..."}
            onClick={handleSubmit}
          >
            {mode === "create" ? "ثبت پلن جدید" : "ثبت تغییرات"}
          </AdminActionButton>
        </div>
      </div>

      <AdminResultModal result={result} onClose={clearResult} />
    </div>
  );
}
