import { useEffect, useState } from "react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";

export default function UpdateAdmin() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [search] = useSearchParams();
  const type = search.get("type");

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

  const handleClick = async () => {
    setResult(null);
    const response = await api.post(`/admin/${type}`, { chat_id: input });
    const success = response?.data?.success;
    setTimeout(() => {
      if (success) setResult(true);
      else setResult(false);
    }, 2000);
  };

  return (
    <div className="w-full mt-5 flex flex-col gap-10">
      <p>{type === "add" ? "افزودن Admin" : "حذف Admin"}</p>
      <div className="flex  flex-col gap-5 px-4">
        {type === "delete" && (
          <div className="text-xs">
            <p>ادمین ها</p>
            <div className="flex flex-col mt-2">
              {admins?.map((admin, index) => (
                <p>
                  admin{index + 1} : {admin}
                </p>
              ))}
            </div>
          </div>
        )}
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
