import { Link } from "react-router-dom";

export default function MenuItem(props) {
  return (
    <Link
      to={props.to}
      key={props.id}
      style={{ lineHeight: 1 }}
      className="  shrink-0 hide-scroll overflow-hidden h-20 items-center hover:bg-neutral-100/40   p-2 border  rounded-xl w-full gap-2 flex"
    >
      <div className="">
        <div className="rounded-xl text-[var(--app-subtitle-text-color)] p-3 bg-[var(--app-secondary-bg-color)]  flex justify-center items-center">
          {props.icon}
        </div>
      </div>
      <div className="flex w-full flex-col">
        <p className="text-sm font-bold text-[var(--app-accent-text-color)]">
          {props.title}
        </p>
        <p className="text-xs text-[var(--app-subtitle-text-color)]">
          {props.desc}
        </p>
      </div>
    </Link>
  );
}
