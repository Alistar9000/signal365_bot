import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import AppContext from "../components/AppContext";
import BackButtonHandler from "../components/BackButton";
import BottomNav from "../components/BottomNav";

const Layout = () => {
  return (
    <div className="app-shell">
      <AppContext>
        <BackButtonHandler />
        <Header />
        <main className="app-content hide-scroll">
          <Outlet />
        </main>
        <BottomNav />
      </AppContext>
    </div>
  );
};

export default Layout;
