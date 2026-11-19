import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "../../util/axios";
import { useSearchParams } from "react-router-dom";
import AdminActionButton from "./AdminActionButton";
import AdminResultModal from "./AdminResultModal";
import { useAdminAction } from "../../hooks/useAdminAction";

export default function SendMessage() {
  const [messageText, setMessageText] = useState("");
  const { loading, result, run, clearResult } = useAdminAction();
  const [search] = useSearchParams();
  const type = search.get("type");

  const handleClick = () =>
    run(() =>
      api.post(`/admin/send-message`, {
        type: type,
        text: messageText,
      }), {
        format: (response) => {
          const success = Boolean(response?.data?.success);
          return {
            success,
            title: success
              ? "پیام با موفقیت ارسال شد"
              : "ارسال ناموفق بود",
            message: response?.data?.message,
          };
        },
        onSuccess: () => setMessageText(""),
      },
    );

  return (
    <div className="animate-fade-in">
      <div className="card p-5">
        <h2 className="section-title">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Send size={15} />
          </span>
          {type === "all"
            ? "ارسال پیام به همه کاربران ربات"
            : "ارسال پیام به کاربران VIP"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="broadcast-text">
              متن پیام
            </label>
            <textarea
              id="broadcast-text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="min-h-[170px] resize-none"
            />
          </div>

          <AdminActionButton
            loading={loading}
            icon={Send}
            loadingLabel="در حال ارسال..."
            onClick={handleClick}
          >
            ارسال
          </AdminActionButton>
        </div>
      </div>

      <AdminResultModal result={result} onClose={clearResult} />
    </div>
  );
}
