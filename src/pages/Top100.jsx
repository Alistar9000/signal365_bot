import { useEffect, useState } from "react";
import { MiniAppContext } from "../components/AppContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "../components/Loading";
import { ArrowBigLeft, ArrowLeft, CalendarDays, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../util/axios";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import NotVipMessage from "../components/admin/NotVipMessage";
import { TbArrowBigDownFilled, TbArrowBigUpFilled } from "react-icons/tb";

const Top100 = () => {
  const { userData,isLoading : loading } = MiniAppContext();
  const [showDetailPanel,setShowDetailPanel] = useState(false)
  const [signalHistory, setSignalHistory] = useState(null);
  const [totalReturn, setTotalReturn] = useState(null);
  const [symbolName, setSymbolName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["top-100"],
    queryFn: () => api.get("/top100"),
    enabled:!loading
  });
  const symbols = data?.data?.data;
 
    const handleSymbolClick = async (symbol) => {
    if(!userData?.is_vip) return;  
    setShowDetailPanel(true);
    setSymbolName(symbol.symbol_name);
   
    const response = await api.post("/stock-history", {
      search: symbol.symbol_code,
      vip: userData?.is_vip | null,
    });
   
    if (response.data.data) {
     
      setSignalHistory(response.data.data.history);
      setTotalReturn(response.data.data.totalReturn);
    }
  };
  if (loading || isLoading ) return <Loading />;

  return (
    <div className="w-full p-2 text-xs overflow-hidden relative flex flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-[1rem] font-bold">سهام برتر</h1>
        <Link
          to={"/mini-app/guide"}
          className="text-[var(--app-accent-text-color)] bg-amber-100 border border-amber-200 rounded-md px-2 cursor-pointer py-1"
        >
          راهنما
        </Link>
      </div>
      {!userData?.is_vip && <NotVipMessage text={"مشاهده نام نمادها"} />}
      <div
        className={`w-full relative  ${userData?.is_vip ? "h-[calc(100vh-25vh)]" : "h-[calc(100vh-35vh)]"} overflow-auto `}
      >
        <table className="w-full overflow-auto">
          <thead>
            <tr className="text-neutral-500 *:bg-white *:sticky *:z-20 *:top-0 text-nowrap *:p-2 border-b">
              <th>رتبه</th>
              <th>نماد</th>
              <th className="text-start">
                <span className="flex flex-nowrap gap-1 ">
                  5 سیگنال آخر
                  <ArrowLeft size={12} />
                </span>
              </th>
              <th>بهترین</th>
              <th>بدترین</th>
              {userData?.is_vip && <th>آخرین</th>}
            </tr>
          </thead>
          <tbody>
            {symbols?.map((symbol, index) => (
              <tr
                key={symbol?.id}
                
                className="*:text-center text-nowrap border-b last:border-b-0  *:p-2 *:text-xs"
              >
                <td className="">{index + 1}</td>
                <td onClick={ () => handleSymbolClick(symbol)} className="cursor-pointer">
                  {symbol?.symbol_name ?? "نماد"}
                </td>
                <td className="!text-start text-nowrap">
                  {[...symbol.pairs]?.reverse().map((pair, index2) => 
                    (
                    (symbol?.last_signal_return === null || symbol?.last_signal_return !== null && symbol?.pairs?.length < 5  || symbol?.last_signal_return !== null && index2 !== 0) &&
                      <span
                      key={index2}
                      className={`w-4 inline-flex  rounded-full ${pair?.status === "u" ? "bg-green-500" : "bg-red-500"} aspect-square `}
                      ></span>
                  )
                  )}
                  {symbol?.last_signal_return !== null && userData?.is_vip && (
                    <span
                      className={`w-4 inline-flex  rounded-full ${symbol.last_signal_return >= 0 ? "bg-green-500" : "bg-red-500"} animate-pulse aspect-square `}
                    ></span>
                  )}
                </td>
                <td dir="ltr">
                  {symbol.pairs?.reduce(
                    (max, i) => (max > i.return ? max : i.return),
                    symbol?.pairs[0].return,
                  ) + "%"}
                </td>
                <td dir="ltr">
                  {" "}
                  {symbol.pairs?.reduce(
                    (min, i) => (min < i.return ? min : i.return),
                    symbol?.pairs[0].return,
                  ) + "%"}
                </td>
                {symbol?.symbol_name && (
                  <td className="place-items-center">
                    <div
                      dir="ltr"
                      className={`w-max ${symbol?.last_signal_return !==null && "animate-pulse"} p-1 rounded-md ${symbol?.last_signal_return !== null && symbol?.last_signal_return >= 0 ? "bg-[var(--app-accent-text-color)] text-white" : symbol?.last_signal_return !== null && symbol?.last_signal_return < 0 ? "bg-red-500 text-white" : "text-neutral-400"} `}
                    >
                      {symbol?.last_signal_return !== null
                        ? symbol?.last_signal_return + "%"
                        : symbol.pairs[0]?.return + "%"}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`flex flex-col gap-4 z-20 absolute ${showDetailPanel ? 'translate-y-0' : 'translate-y-full'} right-0 left-0 -bottom-2 transition-transform duration-300  bg-[var(--app-bg-color)] shadow-sm p-4 border rounded-t-3xl`}>
            <X onClick={() => setShowDetailPanel(false)} size={20} className="text-slate-400 cursor-pointer" />
             {

          symbolName !== "" && 
          <div className="flex justify-between w-full items-center">
          <p className="rounded-md w-max px-4 py-1 text-[var(--app-accent-text-color)] border-[var(--app-accent-hover-color)] text-xs mb-2 font-bold border">{symbolName}</p>
             <div className="flex gap-2 text-sm items-center">
            <p>بازدهی کل <span className="text-xs">(مرکب)</span>: </p>
            <span dir="ltr" className={`${totalReturn > 0 ? "text-[var(--app-accent-text-color)]" : "text-red-500"} font-bold`}>{totalReturn}%</span>
         </div>
          </div>
          }   
               <table className="w-full  text-sm ">
            <thead>
              <tr className="*:sticky *:py-1 *:text-center *:bg-[var(--app-bg-color)] *:border-b  *:z-0 *:top-0">
                <th className="">سیگنال</th>
                <th className="">بازدهی</th>
                <th>
                  <span className="flex items-center gap-1 w-full justify-center">
                    تاریخ
                    <CalendarDays size={15} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {signalHistory
                ?.filter((e) => (!userData?.is_vip ? e.sell_date : e))
                .map((signal, index) => (
                  <tr
                    key={index}
                    className={` *:text-center  *:p-2 border-b last:border-b-0 ${!signal?.sell_date && "animate-pulse"}   w-full`}
                  >
                    <td className="place-items-center">
                      {signal?.return >= 0 ? (
                        <TbArrowBigUpFilled
                          className={`text-[var(--app-accent-text-color)] ${!signal?.sell_date && "animate-pulse"}`}
                          size={20}
                        />
                      ) : (
                        <TbArrowBigDownFilled
                          className="text-red-500"
                          size={20}
                        />
                      )}
                    </td>
                    <td
                      dir="ltr"
                      className={`text-sm ${signal?.return >= 0 ? "text-[var(--app-accent-text-color)]" : "text-red-500"} font-bold`}
                    >
                      {signal?.return}%
                    </td>
                    <td className="place-items-center">
                      <div className="*:border *:rounded-xl py-0.5 *:px-2 *:py-0.5">
                        {signal?.sell_date && (
                          <p className="mb-1 border-red-500 text-red-500">
                            {signal?.sell_date}
                          </p>
                        )}
                        <p className="border-[var(--app-accent-text-color)] text-[var(--app-accent-text-color)]">
                          {signal?.buy_date}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table> 
      </div>
    </div>
  );
};

export default Top100;
