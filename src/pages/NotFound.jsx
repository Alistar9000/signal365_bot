import { Compass, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center animate-fade-in">
      <div className="card w-full max-w-xs p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <Compass size={30} />
        </span>
        <h1 className="mt-4 text-base font-extrabold text-ink">
          صفحه مورد نظر یافت نشد
        </h1>
        <p className="mt-2 text-[11px] leading-5 text-muted">
          ممکن است آدرس اشتباه باشد یا صفحه جابه جا شده است.
        </p>
        <Link to="/mini-app/" className="btn-primary mt-5 w-full">
          <Home size={15} /> بازگشت به منو
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
