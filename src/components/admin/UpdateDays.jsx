import { useState } from "react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import Loading from "../Loading";

export default function UpdateDays() {
  const [input, setInput] = useState("");
  const [inputDays, setInputDays] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search] = useSearchParams();
  const type = search.get("type");

  const handleClick = async () => {
    setResult(null);
    let delay = 2000;
    if (type === "all") {
      setLoading(true);
      delay = 0;
    }
    const response =
      type === "all"
        ? await api.post(`/admin/add-days/${type}`, { days: inputDays })
        : await api.post(`/admin/add-days/${type}`, {
            chat_id: input,
            days: inputDays,
          });
    const success = response?.data?.success;
    setTimeout(() => {
      if (success) setResult(true);
      else setResult(false);
      setLoading(false);
    }, delay);
  };

  return (
    <div className="w-full mt-5 flex flex-col gap-10">
      {loading && <Loading />}
      <p>
        {type === "all"
          ? "افزودن روز به همه کاربران VIP"
          : "افزودن روز به کاربر VIP خاص"}
      </p>
      <div className="flex items-center flex-col gap-5 px-4">
        {type === "vip" && (
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
        )}
        <div className="flex flex-col w-full text-sm  gap-2">
          <p>تعداد روز را وارد کنید</p>
          <input
            onChange={(e) => setInputDays(e.target.value)}
            className={`rounded-md outline-none p-2 bg-white border ${type === "vip" ? "w-1/2" : "w-full"}`}
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
            با موفقیت اضافه گردید
          </p>
        ) : (
          result == false && <p className="text-red-500">افزودن ناموفق!</p>
        )}
      </div>
    </div>
  );
}
