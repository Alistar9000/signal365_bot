import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import AppContext from "../components/AppContext";
import BackButtonHandler from "../components/BackButton";

const Layout = () => {
  return (
    <div className="h-screen px-1 bg-[var(--app-secondary-bg-color)]  flex flex-col">
      <AppContext>
      <BackButtonHandler />
        <Header />
        <div className="bg-[var(--app-bg-color)] border relative shadow-sm border-neutral-400/30  overflow-hidden flex-1 rounded-t-3xl p-4">
          <Outlet />
        </div>
      </AppContext>
    </div>
  );
};

export default Layout;
