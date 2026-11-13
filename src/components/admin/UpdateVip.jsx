import { useState } from "react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "../Loading";

export default function UpdateVip() {
  const [input, setInput] = useState("");
  const [inputPlan, setInputPlan] = useState("3");
  const [result, setResult] = useState(null);
  const [search] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const type = search.get("type");
  const queryClient = useQueryClient();

  const handleClick = async () => {
    setResult(null);
    setLoading(true)
    const response =
      type === "add"
        ? await api.post(`/admin/vips/${type}`, {
            chat_id: input,
            plan: inputPlan,
          })
        : await api.post(`/admin/vips/${type}`, { chat_id: input });
    const success = response?.data?.success;
    setLoading(false)
    setTimeout(() => {
      if (success){
       queryClient.invalidateQueries({ queryKey: ['auth'] });
        setResult(true);
      } 
      else setResult(false);
    }, 2000);
  };

  return (
    <div className="w-full mt-5 flex flex-col gap-10">
      {loading && <Loading />}
      <p>{type === "add" ? "افزودن کاربر VIP" : "حذف کاربر VIP"}</p>
      <div className="flex  flex-col gap-5 px-4">
        <div className="flex flex-col w-full text-sm  gap-2">
          <p>چت آی دی را وارد کنید</p>
          <input
            onChange={(e) => setInput(e.target.value)}
            className="rounded-md outline-none p-2 bg-white border w-full"
            type="text"
            name=""
            id=""
          />
        </div>
        {type === "add" && (
          <div className="flex items-center gap-2">
            <p>پلن</p>
            <select
              value={inputPlan}
              onChange={(e) => setInputPlan(e.target.value)}
              className="outline-none w-full border rounded-md bg-white px-2 py-1"
            >
              <option value={3}>3 ماهه</option>
              <option value={6}>6 ماهه</option>
              <option value={12}>12 ماهه</option>
            </select>
          </div>
        )}
        <button
          onClick={handleClick}
          className={`rounded-md ${type === "add" ? "bg-[var(--app-accent-text-color)] hover:bg-[var(--app-accent-hover-color)]" : "bg-red-500 hover:bg-red-400"}  text-white px-6 py-2 mt-5 `}
        >
          {type === "add" ? "افزودن" : "حذف"}
        </button>
        {result ? (
          <p className="text-[var(--app-accent-text-color)]">
            با موفقیت <span>{type === "add" ? "اضافه" : "حذف"}</span> گردید
          </p>
        ) : (
          result == false && (
            <p className="text-red-500">
              {type === "add" ? "افزودن ناموفق!" : "حذف ناموفق!"}
            </p>
          )
        )}
      </div>
    </div>
  );
}
