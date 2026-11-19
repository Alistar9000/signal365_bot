const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const normalizeDigits = (value) =>
  String(value)
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0));

/** Display every digit in Persian (۰–۹), leaving other characters as-is. */
export const toPersianDigits = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return normalizeDigits(value).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
};

/** Prices: Persian digits with a thousands separator (1500 → ۱,۵۰۰). */
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const normalized = normalizeDigits(value).replace(/[،,]/g, "");
  const [integer, ...fraction] = normalized.split(".");
  if (!/^\d+$/.test(integer)) return toPersianDigits(value);

  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return toPersianDigits(
    fraction.length ? `${grouped}.${fraction.join(".")}` : grouped,
  );
};
