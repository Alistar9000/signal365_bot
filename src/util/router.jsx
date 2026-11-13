import { createBrowserRouter } from "react-router-dom";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import BuyServiceLayout from "../pages/buyservice/BuyServiceLayout";
import BuyServicePlans from "../pages/buyservice/BuyServicePlans";
import BuyServicePurchase from "../pages/buyservice/BuyServicePurchase";
import Top100 from "../pages/Top100";
import CheckHistory from "../pages/CheckHistory";
import Alarms from "../pages/Alarms";
import Guide from "../pages/Guide";
import TodaySignals from "../pages/TodaySignals";
import NotFound from "../pages/NotFound";
import Admin from "../pages/Admin";
import UpdateDays from "../components/admin/UpdateDays";
import UpdateRange from "../components/admin/UpdateRange";
import UpdatePlans from "../components/admin/UpdatePlans";
import SendMessage from "../components/admin/SendMessage";
import UpdateAdmin from "../components/admin/UpdateAdmin";
import UpdateVip from "../components/admin/UpdateVip";
import AdminLayout from "../pages/AdminLayout";
import CheckUser from "../components/admin/CheckUser";

export const router = createBrowserRouter([
  {
    path: "/mini-app",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "buy-service",
        element: <BuyServiceLayout />,
        children: [
          {
            index: true,
            element: <BuyServicePlans />,
          },
          {
            path: ":plan_number/:price",
            element: <BuyServicePurchase />,
          },
        ],
      },
      {
        path: "top-100",
        element: <Top100 />,
      },
      {
        path: "check-history",
        element: <CheckHistory />,
      },
      {
        path: "alarms",
        element: <Alarms />,
      },
      {
        path: "guide",
        element: <Guide />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index:true,
            element: <Admin />,
          },
          {
            path: "check-user",
            element: <CheckUser />,
          },
          {
            path: "update-vip",
            element: <UpdateVip />,
          },
          {
            path: "update-admin",
            element: <UpdateAdmin />,
          },
          {
            path: "update-days",
            element: <UpdateDays />,
          },
          {
            path: "update-range",
            element: <UpdateRange />,
          },
          {
            path: "update-plans",
            element: <UpdatePlans />,
          },
          {
            path: "send-message",
            element: <SendMessage />,
          },
        ],
      },
      {
        path: "today-signals",
        element: <TodaySignals />,
      },
      
      {
        path: "not-found",
        element: <NotFound />,
      },
    ],
  },
]);
