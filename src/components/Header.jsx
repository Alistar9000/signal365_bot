import {
  AlarmCheck,
  AlarmClock,
  Bell,
  MessageCircle,
  MessageCircleMore,
  MessageCircleWarning,
  MessageCircleX,
  MessageSquare,
} from "lucide-react";
import { MiniAppContext } from "./AppContext";
import { GoStarFill } from "react-icons/go";
import { RxDoubleArrowDown } from "react-icons/rx";
import { Link, useLocation } from "react-router-dom";
import Alarms from "../pages/Alarms";
import { CgAlarm } from "react-icons/cg";
import { BiMessage, BiNotification } from "react-icons/bi";
import { BsBellFill } from "react-icons/bs";
import { useEffect, useState } from "react";

const Header = () => {
  const { userData } = MiniAppContext();
  const location = useLocation();
  // const userData = data ?? JSON.parse(localStorage.getItem('userData1'))
 

  const [showNotif, setShowNotif] = useState(false);
  const handleCopy = (e) => {
    navigator.clipboard.writeText(e.target.textContent);
  };

  return (
    <div className="h-24 w-full relative">
      <div
        onClick={() => setShowNotif(false)}
        className={`${showNotif ? "opacity-100" : "opacity-0 pointer-events-none"} z-30 fixed inset-0`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={` absolute ${showNotif ? "opacity-100" : "opacity-0 pointer-events-none"}  top-14 left-10 right-10 min-h-80 rounded-md bg-white p-2 shadow`}
        ></div>
      </div>
      <div className="w-full p-4  text-[var(--app-text-color)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-full aspect-square border border-neutral-300   overflow-hidden w-10 h-10">
              <img
                src={"images/user.jpg"}
                className="object-cover  translate-y-0.5"
              />
            </div>
            {/* <p className="">کاربر : </p> */}
            <div className="font-bold text-[var(--app-accent-text-color)]">
              <p
                onClick={handleCopy}
                className="h-full font-sans cursor-pointer  text-sm"
              >
                {userData?.chat_id | ""}
              </p>
            </div>
          </div>

          <div className="flex items-center text-[var(--app-accent-text-color)] justify-center text-xs border-yellow-300  font-bold rounded-lg bg-yellow-100 px-2 py-1 border gap-1">
            <p className="text-[var(--app-text-color)]">کاربر : </p>

            {userData?.is_vip ? (
              <div className="flex font-bold text-sm gap-1 items-center">
                <span>VIP</span>{" "}
                <GoStarFill className="text-yellow-400 pb-1" size={20} />
              </div>
            ) : (
              <p className="font-bold text-sm">عادی</p>
            )}
          </div>
        </div>
        <div
          className={`w-full flex items-center ${userData?.is_vip | userData?.vip ? "justify-between" : "justify-end"} `}
        >
          {userData?.is_vip ? (
            <div className="h-full mt-3 font-bold flex gap-1 items-center  text-[var(--app-accent-text-color)]">
              {userData?.remaining_day | ""}

              <span className="text-xs font-normal text-[var(--app-text-color)]">
                روز از اشتراک شما باقی مانده{" "}
              </span>
            </div>
          ) : (
            userData?.vip && (
              <div className="h-full mt-3  flex gap-1 items-center  text-[var(--app-accent-text-color)]">
                <span className="text-xs animate-pulse  text-red-500">
                  اشتراک شما به پایان رسیده
                </span>
              </div>
            )
          )}

          {/* {!location.pathname.endsWith("mini-app/") && (
            <Link
              to={"/mini-app/"}
              className="text-xs mt-3 cursor-pointer text-[var(--app-accent-text-color)] flex items-center gap-1"
            >
              <p>بازگشت به منو</p>
              <RxDoubleArrowDown className="rotate-90" />
            </Link>
          )} */}
          {/* <div onClick={() => setShowNotif(e => !e)} className="cursor-pointer ml-2 mt-1 relative w-max">
            <MessageCircle className="text-[var(--app-accent-text-color)]" size={20} />
            <div className="w-[1.2rem] rounded-full aspect-square absolute text-xs bg-red-500 text-white flex items-center justify-center -top-2 pt-0.5 -right-2 ">3</div>
            
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
