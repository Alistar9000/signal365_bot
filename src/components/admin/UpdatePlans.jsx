import { useEffect, useRef, useState } from "react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import Loading from "../Loading";
import { useQuery } from "@tanstack/react-query";
import { list } from "postcss";

export default function UpdatePlans() {
  const [result, setResult] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["plans", result],
    queryFn: () => api.get("/plans"),
  });
  const plans = data?.data?.data || [];
  const [plan, setPlan] = useState();
  const selectedPlanRef = useRef();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setPlan(plans[0])
    selectedPlanRef.current = plans[0]?.type
  }, [plans])
  
  const handleAddPlan = (e) => {
    e.preventDefault();
  };
  const handleSubmit = async () => {
    
    setResult(null);
    setLoading(true);
    const response = await api.post(`/admin/plans`, { type:selectedPlanRef.current,plan:plan });
    const success = response?.data?.success;
    setTimeout(() => {
      if (success) setResult(true);
      else setResult(false);
      setLoading(false);
      
    }, 2000);
  };
  const handleChange = (e) => {
    setPlan(plan => ({...plan,[e.target.name]:e.target.value}))
    
  };
  
  return (
    <div className="w-full  mt-5 flex flex-col gap-10">
      {loading && <Loading />}
      <p className="text-amber-400">ویرایش پلن ها</p>
      <div className="mt-2 flex items-center gap-2">
        <p>پلن</p>
        <select
          value={selectedPlanRef.current}
          onChange={(s) =>
            {setPlan(() => plans.filter((e) => +e.type === +s.target.value)[0]); selectedPlanRef.current = s.target.value}
          }
          className="border rounded-md px-2 py-1"
          name=""
          id=""
        >
          {plans.map((plan) => (
            <option value={plan.type}>{plan.type}</option>
          ))}
        </select>
      </div>
      <div className="flex border rounded-xl p-4 items-center flex-col gap-5 px-4">
        <form
          onSubmit={handleAddPlan}
          className="flex  flex-wrap w-full text-xs  gap-4"
        >
          <div className="flex flex-1 flex-col min-w-24">
            <label htmlFor="">نوع (ماه)</label>
            <input
              value={plan?.type}
              onChange={handleChange}
              className="border rounded-md px-2 py-1 outline-none w-full "
              type="text"
              name="type"
              id=""
            />
          </div>
          <div className="flex flex-1 flex-col min-w-24">
            <label htmlFor="">مدت (روز)</label>
            <input
              value={plan?.period}
              onChange={handleChange}
              className="border rounded-md px-2 py-1 outline-none w-full "
              type="text"
              name="period"
              id=""
            />
          </div>
          <div className="flex flex-1 flex-col min-w-24">
            <label htmlFor="">قیمت (تومان)</label>
            <input
              value={plan?.price}
              onChange={handleChange}
              className="border rounded-md px-2 py-1 outline-none w-full "
              type="text"
              name="price"
              id=""
            />
          </div>
          <div className="flex flex-1 flex-col min-w-24">
            <label htmlFor="">قیمت تخفیفی (تومان)</label>
            <input
              value={plan?.off_price}
              onChange={handleChange}
              className="border rounded-md px-2 py-1 outline-none w-full "
              type="text"
              name="off_price"
              id=""
            />
          </div>
          <div className="flex flex-1 flex-col min-w-24">
            <label htmlFor="">درصد تخفیف</label>
            <input
              value={plan?.off_percent}
              onChange={handleChange}
              placeholder="%"
              className="border rounded-md px-2 py-1 outline-none w-full "
              type="text"
              name="off_percent"
              id=""
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
         
          <button
            onClick={handleSubmit}
            className={`rounded-md bg-[var(--app-accent-text-color)] hover:bg-[var(--app-accent-hover-color)]  text-white px-6 py-2 mt-5 `}
          >
            ثبت 
          </button>
        </div>

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
