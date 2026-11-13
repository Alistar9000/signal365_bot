import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MiniAppContext } from './AppContext';

function BackButtonHandler() {
  const navigate = useNavigate();
  const { isLoading } = MiniAppContext();
  const location = useLocation();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isSetupRef.current) return;

    // چک کردن وجود Bale
    // if (!window.Bale || !window.Bale.WebApp) {
    //   return;
    // }
    if (!window.Telegram || !window.Telegram.WebApp) {
      return;
    }

    // const WebApp = window.Bale.WebApp;
    const WebApp = window.Telegram.WebApp;

    // لیست مسیرهایی که باید دکمه بازگشت داشته باشند
    const routesToShowBackButton = [
      '/buy-service', '/top-100', '/alarms', '/today-signals', 
      '/guide', '/settings', '/check-history', '/1', '/2', '/3', 
      '/admin', '/update-vip', '/update-admin', '/update-days', 
      '/update-range', '/update-plans', '/send-message', '/not-found','/check-user'
    ];

    const currentPath = location.pathname;
    
    // ✅ چک کردن دقیق مسیر
    // اگر مسیر دقیقاً برابر بود یا با یکی از مسیرهای لیست شروع می‌شد
    const shouldShowBackButton = routesToShowBackButton.some(path => 
      currentPath.endsWith(path)) || currentPath.includes('/buy-service/')
  

    if (shouldShowBackButton) {
      // ۱. تلاش برای استفاده از متد SDK
      if (WebApp.BackButton) {
        WebApp.BackButton.show();
      }
      
      // ۲. ارسال مستقیم پیام به Parent برای اطمینان
      // تلگرام/بله معمولاً این پیام‌ها رو برای کنترل UI می‌فرستند
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(JSON.stringify({
          eventType: 'showBackButton'
        }), '*');
      }
    } else {
      // ۱. تلاش برای استفاده از متد SDK
      if (WebApp.BackButton) {
        WebApp.BackButton.hide();
      }
      
      // ۲. ارسال مستقیم پیام به Parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(JSON.stringify({
          eventType: 'hideBackButton'
        }), '*');
      }
    }

    // هندلر دکمه بازگشت
    const handleBackButton = () => {
      if (window.history.length <= 1) {
        WebApp.close();
      } else {
        navigate(-1);
      }
    };

    // ثبت رویداد
    if (WebApp.onEvent) {
      // WebApp.onEvent('backButtonPressed', handleBackButton);
      WebApp.BackButton.onClick(handleBackButton);
    }

    isSetupRef.current = true;

    // پاکسازی
    return () => {
      if (WebApp.offEvent) {
        // WebApp.offEvent('backButtonPressed', handleBackButton);
        WebApp.BackButton.offClick(handleBackButton);
      }
      // مخفی کردن دکمه هنگام خروج از کامپوننت
      if (WebApp.BackButton) {
        WebApp.BackButton.hide();
      }
      isSetupRef.current = false;
    };
  }, [isLoading, navigate, location]);

  return null;
}

export default BackButtonHandler;
