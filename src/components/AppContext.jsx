import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // فرض بر این است که از react-query استفاده می‌کنی
import { api } from '../util/axios';

const miniContext = createContext();

export default function AppContext({ children }) {
  // ۱. چک می‌کنیم که آیا اسکریپت بله لود شده و initData داره یا نه
  const [isBaleReady, setIsBaleReady] = useState(false);
  const [initData, setInitData] = useState(null);

  // ۲. یک افکت برای صبر کردن تا لود شدن اسکریپت بله
  useEffect(() => {
    const checkBale = () => {
      // چک می‌کنیم که آیا window.Bale.WebApp وجود داره و initData هم داره؟
      // if (window.Bale && window.Bale.WebApp && window.Bale.WebApp.initData) {
      //   setInitData(window.Bale.WebApp.initData);
      //   window.Bale.WebApp.setHeaderColor('#00b894')
      //   setIsBaleReady(true);
      // }
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        setInitData(window.Telegram.WebApp.initData);
        window.Telegram.WebApp.setHeaderColor('#00b894')
        setIsBaleReady(true);
       
      }
      
      else {
        // اگر هنوز لود نشده، دوباره چک کن (مثلا هر ۱۰۰ میلی‌ثانیه)
        setTimeout(checkBale, 100);
      }
    };

    // checkBale();
  }, []);

  // ۳. حالا درخواست به بک‌اند رو فقط زمانی انجام بده که initData آماده باشه
  const { data, isLoading, error } = useQuery({
    queryKey: ["auth"], // وقتی initData تغییر کرد، دوباره کوئری رو اجرا کن
    queryFn: () => {
      // اگر initData هنوز null بود، اصلا درخواست نزن (هرچند با enabled کنترل میشه)
      // if (!initData) return Promise.reject(new Error("InitData not ready"));
      
      return api.post("/auth");
    },
    // ✅ این خط خیلی مهمه: فقط وقتی initData وجود داشته باشه، درخواست رو بزن
    // enabled: !!initData, 

    refetchInterval : 10000,
    // اگر می‌خوای هر بار که initData عوض شد (مثلا کاربر عوض شد) دوباره چک کن
    // staleTime: 1000 * 60 * 5, // ۵ دقیقه
  });


  const userData = data?.data?.data;

  // useEffect(() => {
  //   if(!initData && !data) return
  //   const a = {
  //     is_vip : userData?.is_vip,
  //     chat_id: userData?.chat_id,
  //     vip:userData?.vip,
  //     remaining_day:userData?.remaining_day,
  //     role : userData?.role
  //   }
  //   // localStorage.setItem('initData1',initData)
  //   // localStorage.setItem('userData1',JSON.stringify(a))
 
  // }, [initData,data])

  return (
    <miniContext.Provider value={{ userData, isLoading, error }}>
      {children}
    </miniContext.Provider>
  );
}

export const MiniAppContext = () => useContext(miniContext);