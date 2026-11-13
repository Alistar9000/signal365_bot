import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../util/axios";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { TbArrowBigDownFilled, TbArrowBigUpFilled } from "react-icons/tb";
import { MiniAppContext } from "../components/AppContext";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const CheckHistory = () => {
  const [searchInput, setSearchInput] = useState("");
  const [symbolName, setSymbolName] = useState("");
  const { search } = useDebounce(searchInput);
  const [searchContent, setSearchContent] = useState([]);
  const [signalHistory, setSignalHistory] = useState(null);
  const [totalReturn, setTotalReturn] = useState(null);
  const [flag, setFlag] = useState(false);
  const [visitedCount, setVisitedCount] = useState(false);
  const inputRef = useRef();
  const { userData,isLoading } = MiniAppContext();
  
  useEffect(() => {
    const fetch = async () => {
      const response = await api.post("/symbols", { search: search });
      setSearchContent(response.data.data);
    };

    searchInput !== "" && !flag && fetch();
  }, [search]);

  const handleSearch = async (symbol) => {
    setSearchInput(symbol.name);
    setSymbolName(symbol.name);
    setFlag(true);
    setSearchContent([]);
    const response = await api.post("/stock-history", {
      search: symbol.code,
      vip: userData?.is_vip | null,
    });
    if (response.data.max_visited) {
      setVisitedCount(true);
      return;
    }
    if (response.data.data) {
      setVisitedCount(false);
      setSignalHistory(response.data.data.history);
      setTotalReturn(response.data.data.totalReturn);
    }
  };

  if(isLoading) return <Loading />

  return (
    <div className="flex h-full flex-col  w-full">
      <div className="flex w-full items-center justify-between">
        <div className="font-bold">
          <p>بررسی سابقه سهم</p>
        </div>
        <Link to={"/mini-app/guide"} className="text-xs">
          <p className="rounded-md bg-yellow-100 border border-yellow-200 px-2 py-1 text-[var(--app-accent-text-color)]">
            راهنما
          </p>
        </Link>
      </div>
      

      <div className="w-full text-xs pl-6 mt-10 flex  items-start gap-2">
        <p className="mt-2">جستجوی نماد</p>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            onChange={(e) => {
              setFlag(false);
              setSearchInput(e.target.value);
            }}
            value={searchInput}
            type="text"
            name=""
            id=""
            className="outline-none w-full border p-2 rounded-md "
          />
          {!userData?.is_vip && (
        <p className="text-red-500 text-wrap py-1 px-2 text-[.6rem]">
          سقف تعداد جستجو برای کاربران عادی 10 نماد است
        </p>
      )}
          <div
            className={`absolute ${(searchInput === "" || searchContent.length == 0) && "hidden"} ${userData?.is_vip ? 'top-full mt-1' : 'top-1/2'}  z-10 rounded-md bg-white  max-h-44 overflow-auto w-full left-0 border p-2`}
          >
            <ul>
              {searchContent.map((symbol) => (
                <li
                  className="hover:bg-amber-100 p-2 cursor-pointer rounded-md"
                  onClick={() => handleSearch(symbol)}
                >
                  {symbol.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {!visitedCount && symbolName!=="" && (
        <div className="overflow-hidden flex justify-between items-center mt-4 p-1">
          
          {

          symbolName !== "" && <p className="rounded-md w-max px-2 py-1 text-[var(--app-accent-text-color)] border-[var(--app-accent-hover-color)] text-xs mb-2 font-bold border">{symbolName}</p>
          } 
          <div className="">
          
          <p className=" mb-1 flex items-center gap-1 text-[.6rem]">
           
            توالی سیگنال ها <ArrowLeft size={12} />
          </p>
          <div className="flex flex-wrap overflow-auto max-h-20 pb-2">
            {[...(signalHistory || [])]?.reverse().filter((e) => (!userData?.is_vip ? e.sell_date : e)).map((item) => (
              <div
                className={`${item.return >= 0 ? "bg-[var(--app-accent-text-color)]" : "bg-red-500"} rounded-full ${!item.sell_date && 'animate-pulse'} aspect-square w-5`}
              ></div>
            ))}
          </div>
          </div>
        </div>
      )}
      <div className="flex-1 relative  overflow-auto">
        {signalHistory?.length > 0 && !visitedCount ? (
         <div className="overflow-auto flex flex-1 gap-2 flex-col w-full">
         <div className="flex gap-2 text-sm items-center">
            <p>بازدهی کل <span className="text-xs">(مرکب)</span>: </p>
            <span dir="ltr" className={`${totalReturn > 0 ? "text-[var(--app-accent-text-color)]" : "text-red-500"} font-bold`}>{totalReturn}%</span>
         </div>
       
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
        ) : (
          signalHistory &&
          !visitedCount && (
            <div className="w-full flex justify-center">
              <div className=" w-max rounded-md bg-yellow-200 px-4 py-2 border border-yellow-300">
                سابقه ای یافت نشد
              </div>
            </div>
          )
        )}
        {visitedCount && (
          <div className="w-full text-xs flex-col  mt-6 flex items-center justify-center">
            <div className=" w-max rounded-md text-red-500 font-bold px-4 py-2">
              شما به سقف مجاز 10 نماد رسیده اید
            </div>
            <div className="flex flex-col gap-2 px-6 items-center">
              <p className="text-center">
                به منظور بررسی نمادهای بیشتر سطح کاربری خود را به VIP ارتقا دهید.
              </p>
              <Link
                to={"/mini-app/buy-service"}
                className="rounded-md px-4 py-1 bg-yellow-200 text-[var(--app-accent-text-color)] border-yellow-300 border"
              >
                مشاهده پلن های VIP
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckHistory;
