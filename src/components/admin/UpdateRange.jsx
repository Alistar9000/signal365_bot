import { useState } from "react";
import { api } from "../../util/axios";
import { useQuery } from "@tanstack/react-query";

export default function UpdateRange() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["signal-range", result],
    queryFn: () => api.get("/admin/range"),
  });
  const range = data?.data?.data || "";

  const handleClick = async () => {
    setResult(null);
    const response = await api.post(`/admin/range`, {
      range: parseFloat(input),
    });
    const success = response?.data?.success;
    setTimeout(() => {
      if (success) {
        setResult(true);
        setInput("");
      } else setResult(false);
    }, 2000);
  };

  return (
    <div className="w-full mt-5 flex flex-col gap-10">
      <p>تغییر آستانه سیگنال</p>
      <div className="flex items-center flex-col gap-5 px-4">
        <div className="flex flex-col w-full text-sm  gap-2">
          <p>آستانه سیگنال را وارد کنید ( {range} )</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-md outline-none p-2 bg-white border w-full"
            type="text"
            name=""
            id=""
          />
        </div>
        <button
          onClick={handleClick}
          className={`rounded-md bg-[var(--app-accent-text-color)] hover:bg-[var(--app-accent-hover-color)]  text-white px-6 py-2 mt-5 `}
        >
          ثبت
        </button>
        {result ? (
          <p className="text-[var(--app-accent-text-color)]">
            با موفقیت آپدیت شد
          </p>
        ) : (
          result == false && <p className="text-red-500">آپدیت ناموفق!</p>
        )}
      </div>
    </div>
  );
}
