import { useState } from "react";

const defaultFormat = (response) => ({
  success: Boolean(response?.data?.success),
  message: response?.data?.message,
});

/**
 * Shared request state for admin actions: tracks the button spinner, builds the
 * result shown in the modal, and turns network errors into a failure result.
 */
export function useAdminAction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (request, { format = defaultFormat, onSuccess } = {}) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await request();
      const nextResult = format(response);
      if (nextResult.success) onSuccess?.();
      setResult(nextResult);
    } catch (error) {
      setResult({
        success: false,
        title: "عملیات ناموفق بود",
        message:
          error?.response?.data?.message ||
          "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, run, clearResult: () => setResult(null) };
}
