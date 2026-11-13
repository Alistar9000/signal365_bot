import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { Link } from "react-router-dom";

export default function NotVipMessage({ text, gap = null, wrap = null }) {
  return (
    <p
      style={{ lineHeight: gap && 2.2 }}
      className="text-wrap flex flex-wrap justify-center items-center gap-1"
    >
      {text} نیاز به{" "}
      <span className="bg-yellow-200 animate-pulse border border-yellow-300 rounded-md px-1 ">
        سطح کاربری VIP
      </span>
      دارد
      <Link
        to={"/mini-app/buy-service"}
        className={` text-[var(--app-link-color)] flex items-center`}
      >
        <RxDoubleArrowLeft size={10} /> مشاهده پلن ها{" "}
        <RxDoubleArrowRight size={10} />
      </Link>
    </p>
  );
}
