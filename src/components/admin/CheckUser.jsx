import { useState } from "react";
import { api } from "../../util/axios";
import Loading from "../Loading";
import { CheckCircle, X, XCircle } from "lucide-react";

export default function CheckUser() {
  // return <div className=""></div>
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
 
  const handleClick = async () => {
    setResult(null);
    setLoading(true);
     
    const response = await api.post(`/admin/check-user?id=${input}`);
    setResult(response?.data?.data);
  
      setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full mt-5 flex flex-col gap-10">
      {loading && <Loading />}
      <p className="font-bold">
     جستجوی کاربر
      </p>
      <div className="flex  flex-col gap-3 px-4">
       
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
          className={`rounded-md bg-[var(--app-accent-text-color)] hover:bg-[var(--app-accent-hover-color)]  text-white px-6 py-2 mt-5 `}
        >
          جستجو
        </button>
           {
            result ?
             <ul className="flex flex-col w-full mt-2 text-sm list-none gap-2">
              <li>چت آیدی: <span className="mx-1 text-[var(--app-accent-text-color)] font-bold">{result?.chat_id}</span></li>
              <li>نام: <span className="mx-1 text-[var(--app-accent-text-color)] font-bold">{result?.name}</span></li>
              <li>نام کاربری:<span className="mx-1 text-[var(--app-accent-text-color)] font-bold">{result?.username}</span></li>
              <li className="flex items-center gap-2">VIP: {result?.is_vip ? <CheckCircle size={15} className="text-[var(--app-accent-text-color)]" /> : <XCircle size={15} className="text-red-600" />}</li>
              <li>تعداد روز باقیمانده:<span className="mx-1 text-[var(--app-accent-text-color)] font-bold">{result?.remaining_days}</span></li>
              <li>تعداد دفعات خریداری:<span className="mx-1 text-[var(--app-accent-text-color)] font-bold">{result?.purchase_count}</span></li>
            </ul>
            :
           <p className="text-red-500 font-bold">کاربر موجود نمی باشد</p>
            }
        
      </div>
    </div>
  );
}
