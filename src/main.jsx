if (typeof window !== 'undefined') {
  window.TelegramWebApp = window.TelegramWebApp || {};
  
  // تعریف متد postEvent برای جلوگیری از خطا
  window.TelegramWebApp.postEvent = function(eventType, eventData) {
    // اگر در محیط iframe هستیم (داخل تلگرام/بله)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(JSON.stringify({
        eventType: eventType,
        eventData: eventData
      }), '*');
    }
  };
}



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}  >
    <App />
    </QueryClientProvider>
  </StrictMode>,
)
