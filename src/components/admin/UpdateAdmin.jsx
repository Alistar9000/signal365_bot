import { useEffect, useState } from "react";
import { ShieldPlus, ShieldMinus } from "lucide-react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";
import { toPersianDigits } from "../../util/format";

export default function UpdateAdmin() {
  const [input, setInput] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();
  const [admins, setAdmins] = useState([]);
  const [search] = useSearchParams();
  const type = search.get("type");
  const isAdd = type === "add";

  useEffect(() => {
    if (type === "add") return;

    const fetchAdmin = async () => {
      const response = await api.get("/admin/get");
      const result = response?.data?.data;
      if (response.data.success) setAdmins(result);
      else setAdmins(["خطا در دریافت ادمین ها"]);
    };
    fetchAdmin();
  }, [type, result]);

  const handleClick = () =>
    run(
      () => api.post(`/admin/${type}`, { chat_id: input }),
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
      },
    );

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isAdd ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {isAdd ? <ShieldPlus size={15} /> : <ShieldMinus size={15} />}
          </span>
          {isAdd ? "افزودن Admin" : "حذف Admin"}
        </h2>

        <div className="flex flex-col gap-4">
          {!isAdd && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-2 text-[11px] font-bold text-slate-600">
                ادمین های فعلی
              </p>
              <div className="flex flex-col gap-1.5">
                {admins?.map((admin, index) => (
                  <p
                    key={index}
                    dir="ltr"
                    className="font-sans text-[11px] font-bold text-ink"
                  >
                    {toPersianDigits(admin)}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="admin-chat-id">
              چت آی دی را وارد کنید
            </label>
            <input
              id="admin-chat-id"
              dir="ltr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="۱۲۳۴۵۶۷۸۹"
            />
          </div>

          <AdminActionButton
            loading={loading}
            icon={isAdd ? ShieldPlus : ShieldMinus}
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
