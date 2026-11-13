import axios from "axios";
import { useNavigate } from "react-router-dom";
import { router } from "./router";
import { LockIcon } from "lucide-react";

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
   config.headers['Authorization'] = window.Telegram.WebApp.initData
      // config.headers['Authorization'] = localStorage.getItem('initData1')
      return config;
    });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       router.navigate('/mini-app/not-found')
    }
    return Promise.reject(error);
  },
);
