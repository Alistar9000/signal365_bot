import { useQuery } from "@tanstack/react-query";
import { api } from "../util/axios";
import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { MiniAppContext } from "../components/AppContext";
import NotVipMessage from "../components/admin/NotVipMessage";

const TodaySignals = () => {
  const { userData,isLoading : loading } = MiniAppContext();
  const { data, isLoading } = useQuery({
    queryKey: ["today-signals"],
    queryFn: () => api.get("/today-signals"),
    enabled:!loading,
  });

  const signals = data?.data?.data || [];
  if (loading || isLoading) return <Loading />;

  return (
    <div className="h-full flex flex-col w-full">
      <div className="w-full flex justify-between items-center">
        <p className="font-bold">سیگنال های امروز</p>
        <Link
          to={"/mini-app/guide"}
          className="text-xs px-2 py-1 border border-yellow-200 rounded-md bg-yellow-100 text-[var(--app-accent-text-color)]"
        >
          راهنما
        </Link>
      </div>
      {signals.length === 0 ? (
        <div className="w-full h-full mt-10 text-center">
          <p className="border border-yellow-200 bg-yellow-100 p-2 rounded-md">
            در حال حاضر سیگنالی وجود ندارد
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-auto mt-10 relative flex-1">
            {!userData?.is_vip && (
              <div className="text-xs mb-5">
                <NotVipMessage text={"مشاهده نام نمادها"} />
              </div>
            )}
            <table className="w-full  text-xs">
              <thead>
                <tr className="*:sticky *:py-1 *:text-center *:bg-[var(--app-bg-color)] *:border-b  *:z-0 *:top-0">
                  <th>نماد</th>
                  <th>سیگنال</th>
                  <th>
                    <span className="flex items-center gap-1 w-full justify-center">
                      زمان
                      <Timer size={15} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {signals
                  ?.map((signal) => (
                    <tr className="border-b last:border-b-0 *:p-2 text-center">
                      <td
                        className={`font-bold ${signal?.type === "buy" ? "text-[var(--app-accent-text-color)]" : "text-red-500"}`}
                      >
                        {userData?.is_vip ? (
                          <>
                            <p>{signal?.name}</p>
                            <p
                              className={`mt-1 font-normal ${signal?.type === "buy" ? "border-[var(--app-accent-text-color)]" : "border-red-500"} text-[.6rem] border rounded-xl`}
                            >
                              {signal?.source}
                            </p>
                          </>
                        ) : (
                          <p>نماد</p>
                        )}
                      </td>
                      <td className="place-items-center">
                        <div
                          className={` rounded-lg px-2 w-16 py-1 ${signal?.type === "buy" ? "bg-[var(--app-accent-text-color)]" : "bg-red-500"} text-white border`}
                        >
                          {signal?.type === "buy" ? "خرید" : "فروش"}
                        </div>
                      </td>
                      <td
                        className={`text-sm ${signal?.type === "buy" ? "text-[var(--app-accent-text-color)]" : "text-red-500"}`}
                      >
                        {userData?.is_vip ? signal?.time1 : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TodaySignals;
