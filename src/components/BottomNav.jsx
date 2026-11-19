import { Bell, History, Home, Trophy, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/mini-app/", label: "خانه", icon: Home, end: true },
  { to: "/mini-app/today-signals", label: "سیگنال", icon: Zap },
  { to: "/mini-app/top-100", label: "برترها", icon: Trophy },
  { to: "/mini-app/alarms", label: "هشدارها", icon: Bell },
  { to: "/mini-app/check-history", label: "سابقه", icon: History },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom z-20 flex shrink-0 items-stretch border-t border-slate-100 bg-white/95 px-1 pt-1 shadow-[0_-8px_24px_-16px_rgba(15,23,42,.3)] backdrop-blur-xl">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="nav-item"
        >
          {({ isActive }) => (
            <>
              <span
                className={`relative flex h-8 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive ? "bg-brand-50" : ""
                }`}
              >
                {isActive && (
                  <span className="absolute -top-[5px] h-1 w-6 rounded-full bg-brand-500" />
                )}
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? "text-brand-600" : "text-slate-400"}
                />
              </span>
              <span className={isActive ? "text-brand-700" : ""}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
