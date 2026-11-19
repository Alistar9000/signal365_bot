import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../util/axios";
import UpgradeSignalsModal from "./UpgradeSignalsModal";

const miniContext = createContext();

export default function AppContext({ children }) {
  // Apply the Telegram theme once the SDK + initData are available.
  useEffect(() => {
    let interval;
    let stop;

    const applyTheme = () => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp?.initData) return false;
      webApp.setHeaderColor("#047857");
      webApp.setBackgroundColor("#f4f7f9");
      if (typeof webApp.expand === "function") webApp.expand();
      return true;
    };

    if (!applyTheme()) {
      interval = setInterval(() => {
        if (applyTheme()) {
          clearInterval(interval);
          clearTimeout(stop);
        }
      }, 300);
      stop = setTimeout(() => clearInterval(interval), 5000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["auth"],
    queryFn: () => api.post("/auth"),
    refetchInterval: 10000,
  });

  const userData = data?.data?.data;

  // Detect the exact moment the account turns VIP (normal/expired -> VIP).
  // `null` means we have not received real user data yet, so an already-VIP
  // user opening the app does not trigger the modal.
  const previousVip = useRef(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!userData) return;
    const isVip = Boolean(userData.is_vip);
    if (previousVip.current === false && isVip) {
      setShowUpgradeModal(true);
    }
    previousVip.current = isVip;
  }, [userData]);

  return (
    <miniContext.Provider value={{ userData, isLoading, error }}>
      {children}
      <UpgradeSignalsModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </miniContext.Provider>
  );
}

export const MiniAppContext = () => useContext(miniContext);
