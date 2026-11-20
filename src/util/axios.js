import axios from "axios";
import { router } from "./router";

export const api = axios.create({
  baseURL: "/api/mini-app",
  // baseURL: "https://signal365.ir/api/mini-app",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});
  
 api.interceptors.request.use((config) => {
  // if(window.Bale.WebApp)    
   config.headers['Authorization'] = window.Telegram?.WebApp?.initData ?? ""
      // config.headers['Authorization'] = localStorage.getItem('initData1')
      return config;
    });

// TEMP MOCK
if (new URLSearchParams(window.location.search).has("mock-alarms-show")) {
  const isVip = new URLSearchParams(window.location.search).get("vip") === "1";
  api.get = async (url) => {
    if (url.includes("/alarms")) {
      return { data: { data: [
        { code: "FOLD", name: "فولاد", last_signal: { status: "open", return: 2.5, date: "1403/05/10" } },
        { code: "ARAZ", name: "آرا", last_signal: { status: "close", return: -1.2, date: "1403/05/12" } },
        { code: "KHOD", name: "خودرو", last_signal: { status: "open", return: -0.8, date: "1403/06/01" } },
      ] } };
    }
    return { data: { data: {} } };
  };
  api.post = async (url, payload) => {
    if (url.includes("/auth")) return { data: { data: { is_vip: isVip, chat_id: 123 } } };
    if (url.includes("/stock-history")) {
      // فولاد = سیگنال باز → ردیف بدون تاریخ فروش (سیگنال جاری) داخل سابقه هست و باید مخفی شود
      // آرا = سیگنال بسته → همهٔ ردیفها نمایش داده میشوند
      const isOpenSymbol = payload?.search === "FOLD";
      const history = isOpenSymbol
        ? [
            { return: 2.5, buy_date: "1403/04/01", sell_date: "1403/04/20" },
            { return: 4.8, buy_date: "1403/06/01", sell_date: "1403/06/15" },
            { return: 1.9, buy_date: "1403/07/01" }, // سیگنال باز جاری → مخفی میشود
          ]
        : [
            { return: 2.5, buy_date: "1403/04/01", sell_date: "1403/04/20" },
            { return: -1.2, buy_date: "1403/05/01" },
            { return: 4.8, buy_date: "1403/06/01", sell_date: "1403/06/15" },
          ];
      return { data: { data: { totalReturn: 12.5, history } } };
    }
    return { data: { data: {} } };
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       router.navigate('/mini-app/not-found')
    }
    return Promise.reject(error);
  },
);
