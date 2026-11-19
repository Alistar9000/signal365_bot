import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Check, Copy, Crown, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { MiniAppContext } from "./AppContext";
import ExpiredModal from "./ExpiredModal";
import { toPersianDigits } from "../util/format";

const Header = () => {
  const { userData } = MiniAppContext();
  const [copied, setCopied] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState(null);
  const timer = useRef(null);
  const modalShown = useRef(false);

  const isVip = Boolean(userData?.is_vip);
  const expired = Boolean(!isVip && userData?.vip);

  // Prefer the URL returned by /auth, fall back to the WebApp SDK payload.
  const rawPhotoUrl =
    userData?.photo_url || window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
  const photoUrl =
    typeof rawPhotoUrl === "string" && /^https?:\/\//i.test(rawPhotoUrl)
      ? rawPhotoUrl
      : null;
  const showPhoto = Boolean(photoUrl) && failedAvatar !== photoUrl;

  useEffect(() => () => clearTimeout(timer.current), []);

  // Show the renewal modal once per mini-app load, only for expired accounts.
  useEffect(() => {
    if (expired && !modalShown.current) {
      modalShown.current = true;
      setShowExpiredModal(true);
    }
  }, [expired]);

  const handleCopy = async () => {
    if (!userData?.chat_id) return;
    try {
      await navigator.clipboard.writeText(String(userData.chat_id));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    } catch {
      /* clipboard may be unavailable outside the mini app */
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
    <div className="safe-top relative shrink-0 overflow-hidden rounded-b-[30px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-5 pb-6 pt-5 text-white shadow-brand">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="h-12 w-12 overflow-hidden rounded-2xl border-2 border-white/50 bg-white/20 shadow-lg">
            {showPhoto ? (
              <img
                src={photoUrl}
                alt="عکس پروفایل کاربر"
                className="h-full w-full object-cover object-top"
                onError={() => setFailedAvatar(photoUrl)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-white/85">
                <UserRound size={26} strokeWidth={1.8} />
              </span>
            )}
          </div>
          <span className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-brand-700 bg-emerald-300" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/70">{userData?.name} خوش آمدید 👋</p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-0.5 flex items-center gap-2 text-right"
            title="کپی شناسه چت"
          >
            <span
              dir="ltr"
              className="font-sans text-base font-extrabold tracking-wide text-white"
            >
              {userData?.chat_id ?? "—"}
            </span>
            {copied ? (
              <Check size={14} className="text-emerald-200" />
            ) : (
              <Copy size={14} className="text-white/60" />
            )}
          </button>
          <p className="mt-0.5 text-[10px] text-white/50">
            شناسه چت شما — برید روش کپی شه
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ${
            isVip
              ? "bg-amber-100/95 text-amber-700 ring-amber-200"
              : "bg-white/10 text-white/90 ring-white/20"
          }`}
        >
          {isVip ? <Crown size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-white/70" />}
          {isVip ? "VIP" : "عادی"}
        </span>
      </div>

      <div className={`relative mt-5 grid gap-2 ${isVip || expired ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
          <p className="text-[10px] text-white/60">وضعیت اشتراک</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold">
            <span
              className={`h-2 w-2 rounded-full ${
                isVip
                  ? "bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"
                  : expired
                    ? "bg-rose-300"
                    : "bg-white/50"
              }`}
            />
            {isVip ? "فعال" : expired ? "منقضی شده" : "عادی"}
          </p>
        </div>
        {(isVip || expired) && (
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
            <p className="text-[10px] text-white/60">روزهای باقیمانده</p>
            <p className="mt-1 text-xs font-bold">
              {toPersianDigits(expired ? 0 : (userData?.remaining_day ?? 0))} روز
            </p>
          </div>
        )}
      </div>

      {!isVip && (
        <Link
          to="/mini-app/buy-service"
          className="relative mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px] font-semibold ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-200" />
            {expired
              ? "اشتراک شما به پایان رسیده — تمدید کنید"
              : "با VIP به تمام سیگنال ها دسترسی پیدا کنید"}
          </span>
          <ArrowUpLeft size={14} className="text-white/70" />
        </Link>
      )}
    </div>

    <ExpiredModal
      open={showExpiredModal}
      onClose={() => setShowExpiredModal(false)}
    />
    </>
  );
};

export default Header;
