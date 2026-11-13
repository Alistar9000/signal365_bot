import { useState } from "react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import Loading from "../Loading";

export default function SendMessage() {
  const [messageText, setMessageText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search] = useSearchParams();
  const type = search.get("type");

  const handleClick = async () => {
    setResult(null);
    setLoading(true)
    const response = await api.post(`/admin/send-message`,{type:type,text:messageText})
        
    const result1 = response?.data;

      if (result1?.success) setResult({success:true,message:result1?.message});
      else setResult({success:false,message:result1?.message});
      setLoading(false)
   
  };

  return (
    <div className="w-full mt-5 overflow-y-auto flex-1 flex flex-col gap-10">
     {loading && <Loading />}
      <p>{type === 'all' ? 'ارسال پیام به همه کاربران ربات':'ارسال پیام به کاربران VIP'}</p>
      <div className="flex items-center flex-col gap-5 px-4">
          <div className="flex flex-col w-full text-xs  gap-2">
            <p>متن پیام</p>
            <textarea
              onChange={(e) => setMessageText(e.target.value)}
              className="rounded-md h-72 outline-none p-2 bg-white border w-full"
              type="text"
              name=""
              id=""
            />
          </div>
       
        
        <button
          onClick={handleClick}
          className={`rounded-md bg-[var(--app-accent-text-color)] hover:bg-[var(--app-accent-hover-color)]  text-white px-6 py-2 mt-5 `}
        >
          ارسال
        </button>

        {
        result?.success == true ? (
          <p className="text-[var(--app-accent-text-color)]">
        {result?.message}
          </p>
        ) : (
        result?.success == false &&  <p className="text-red-500">ارسال ناموفق! {result?.message}</p>
        )}
      </div>
    </div>
  );
}
