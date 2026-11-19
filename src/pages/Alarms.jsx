import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  Info,
  ListChecks,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../util/axios";
import Loading from "../components/Loading";
import { useDebounce } from "../hooks/useDebounce";
import { MiniAppContext } from "../components/AppContext";
import PageHeader from "../components/PageHeader";
import NotVipMessage from "../components/admin/NotVipMessage";
import SearchResults from "../components/SearchResults";
import AlarmsNoticeModal from "../components/AlarmsNoticeModal";
import { alarmsNotice } from "../util/alarmsNotice";
import { toPersianDigits } from "../util/format";

const sandoq = [
  "اهرم", "عیار", "موج", "جهش", "دارا یکم", "پالایش", "دوایکس",
  "نارنج اهرم", "بیدار", "شتاب", "توان", "اطلس", "کلید",
  "ارزش مسکن", "صنم", "سیلور", "سینرژی",
];

const Collapse = ({ open, children }) => (
  <div
    className={`grid transition-all duration-300 ${
      open ? "mb-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
);

const PanelTitle = ({ icon: Icon, title, subtitle, tone }) => (
  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        tone === "amber"
          ? "bg-amber-50 text-amber-600"
          : "bg-brand-50 text-brand-600"
      }`}
    >
      <Icon size={18} />
    </span>
    <div className="min-w-0">
      <p className="text-[13px] font-extrabold text-ink">{title}</p>
      <p className="text-[10px] text-muted">{subtitle}</p>
    </div>
  </div>
);

const RuleItem = ({ children }) => (
  <p className="flex items-start gap-2 text-slate-600">
    <Check size={14} className="mt-0.5 shrink-0 text-brand-600" />
    <span>{children}</span>
  </p>
);

const checkboxClass = (checked) =>
  `flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
    checked
      ? "border-brand-500 bg-brand-500 text-white"
      : "border-slate-300 bg-white text-transparent"
  }`;

const Alarms = () => {
  const [panel, setPanel] = useState(null);
  const [messageModal, setMessageModal] = useState(null);
  const [newSymbols, setNewSymbols] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchContent, setSearchContent] = useState([]);
  const [checkVip, setCheckVip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCodes, setDeletingCodes] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [showNotice, setShowNotice] = useState(false);

  const alarmSearchRef = useRef(null);
  const toastTimer = useRef(null);

  const queryClient = useQueryClient();
  const { search } = useDebounce(searchInput);
  const { userData, isLoading: loading } = MiniAppContext();

  const { data, isLoading } = useQuery({
    queryKey: ["alarms"],
    queryFn: () => api.get("/alarms"),
    enabled: !loading,
  });

  const notify = (text) => {
    setMessageModal(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setMessageModal(null);
      toastTimer.current = null;
    }, 4000);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Show the VIP warning once per mini-app session (not on every page switch).
  useEffect(() => {
    if (!userData?.is_vip || alarmsNotice.shown) return;
    alarmsNotice.shown = true;
    queueMicrotask(() => setShowNotice(true));
  }, [userData?.is_vip]);

  const addMut = useMutation({
    mutationFn: (payload) => api.put("/alarms/add", { list: payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      if (res?.data?.reach_max) {
        const names = res.data.reach_max.map((s) => s.name).join("، ");
        notify(`ظرفیت لیست پر است؛ ${names} ثبت نشدند.`);
      }
      setPanel(null);
      setNewSymbols([]);
      setSearchInput("");
      setSearchContent([]);
    },
    onSettled: () => setSubmitting(false),
  });

  const deleteMut = useMutation({
    mutationFn: (codes) => api.put("/alarms/delete", { list: codes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alarms"] }),
    onSettled: () => {
      setDeletingCodes([]);
      setSelectMode(false);
      setSelectedCodes([]);
    },
  });

  const list = data?.data?.data || [];

  const togglePanel = (name) => {
    if (panel === name) {
      setPanel(null);
      setNewSymbols([]);
      setSearchInput("");
      setSearchContent([]);
      setCheckVip(false);
    } else {
      setPanel(name);
      setSearchInput("");
      setSearchContent([]);
      if (name === "add") setCheckVip(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchSearch = async () => {
      const response = await api.post("/symbols", { search });
      if (active) setSearchContent(response.data.data ?? []);
    };
    if (search.trim() !== "") fetchSearch();
    return () => {
      active = false;
    };
  }, [search]);

  const handleSelectedNewSymbols = (symbol) => {
    setSearchContent([]);
    setSearchInput("");
    if (
      newSymbols.some((e) => e.code === symbol.code) ||
      list.some((e) => e.code === symbol.code)
    ) {
      notify("این نماد از قبل در لیست وجود دارد.");
      return;
    }
    setNewSymbols((n) => [...n, symbol]);
  };

  const handleAddSymbols = () => {
    if (!userData?.is_vip) {
      setCheckVip(true);
      return;
    }
    if (newSymbols.length === 0) {
      notify("حداقل یک نماد را انتخاب کنید.");
      return;
    }
    setSubmitting(true);
    addMut.mutate(newSymbols);
  };

  const handleDelete = (symbol) => {
    if (deletingCodes.includes(symbol.code)) return;
    setDeletingCodes((codes) => [...codes, symbol.code]);
    deleteMut.mutate([symbol.code]);
  };

  const startSelectMode = () => {
    setSelectMode(true);
    setSelectedCodes([]);
  };

  const cancelSelectMode = () => {
    setSelectMode(false);
    setSelectedCodes([]);
  };

  const toggleCode = (code) => {
    setSelectedCodes((codes) =>
      codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code],
    );
  };

  const allSelected = list.length > 0 && selectedCodes.length === list.length;

  const toggleAll = () => {
    setSelectedCodes(allSelected ? [] : list.map((s) => s.code));
  };

  const handleBulkDelete = () => {
    if (selectedCodes.length === 0) {
      notify("حداقل یک نماد را انتخاب کنید.");
      return;
    }
    setDeletingCodes([...selectedCodes]);
    deleteMut.mutate(selectedCodes);
  };

  if (loading || isLoading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="لیست هشدار"
        subtitle="نمادهای دلخواه خود را ذخیره و سیگنال هایشان را دنبال کنید."
      />

      {/* Actions */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => togglePanel("rules")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-bold transition active:scale-[.97] ${
            panel === "rules"
              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              : "bg-white text-slate-500 ring-1 ring-slate-200"
          }`}
        >
          <Info size={15} />
          قوانین
        </button>
        <button
          type="button"
          onClick={() => togglePanel("add")}
          className={`btn-primary flex-1 ${
            panel === "add" ? "ring-4 ring-brand-500/15" : ""
          }`}
        >
          {panel === "add" ? <X size={16} /> : <Plus size={16} />}
          {panel === "add" ? "بستن" : "افزودن نماد"}
        </button>
      </div>

      {/* Rules panel */}
      <Collapse open={panel === "rules"}>
        <div className="card overflow-hidden">
          <PanelTitle
            icon={Info}
            title="نمادهای معتبر"
            subtitle="فقط نمادهای زیر قابل ذخیره در لیست هستند"
            tone="amber"
          />
          <div className="space-y-3 p-4 text-[11px] leading-5">
            <RuleItem>سهام بازارهای اصلی بورس و فرابورس</RuleItem>
            <div className="flex items-start gap-2 text-slate-600">
              <Check size={14} className="mt-1 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <span>صندوق های معتبر:</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sandoq.map((i) => (
                    <span
                      key={i}
                      className="chip bg-slate-50 text-slate-600 ring-1 ring-slate-100"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="chip bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                بازار پایه و سایر صندوق ها معتبر نیستند
              </span>
              <span className="chip bg-slate-100 text-slate-500">
                حداکثر ۱۰۰ نماد
              </span>
            </div>
          </div>
        </div>
      </Collapse>

      {/* Add panel */}
      <Collapse open={panel === "add"}>
        <div className="card overflow-hidden">
          <PanelTitle
            icon={Plus}
            title="افزودن نماد جدید"
            subtitle="نام سهم را جستجو و از لیست انتخاب کنید"
          />
          <div className="space-y-4 p-4">
            {checkVip ? (
              <NotVipMessage text="ثبت نمادهای جدید" />
            ) : (
              <>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="alarm-search"
                    ref={alarmSearchRef}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={(e) => e.target.scrollIntoView({ block: "start" })}
                    placeholder="نام سهم را وارد کنید..."
                    className="!pr-10"
                  />
                  <SearchResults
                    open={searchInput !== "" && searchContent?.length > 0}
                    anchorRef={alarmSearchRef}
                    items={searchContent}
                    onClose={() => setSearchContent([])}
                    renderItem={(symbol) => (
                      <button
                        key={symbol.code}
                        type="button"
                        onClick={() => handleSelectedNewSymbols(symbol)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-[12px] font-semibold text-ink transition hover:bg-brand-50"
                      >
                        {symbol.name}
                        <Plus size={13} className="text-brand-500" />
                      </button>
                    )}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">
                      نمادهای انتخاب شده
                    </p>
                    <span className="chip bg-slate-100 text-slate-500">
                      {toPersianDigits(newSymbols.length)}
                    </span>
                  </div>
                  {newSymbols.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-center text-[11px] text-muted">
                      هنوز نمادی انتخاب نکردید
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {newSymbols.map((symbol) => (
                        <span
                          key={symbol.code}
                          className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                        >
                          {symbol.name}
                          <button
                            type="button"
                            onClick={() =>
                              setNewSymbols((n) =>
                                n.filter((s) => s.code !== symbol.code),
                              )
                            }
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-brand-700 transition hover:bg-brand-500 hover:text-white"
                            aria-label="حذف از انتخاب"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddSymbols}
                  disabled={submitting}
                  className="btn-primary btn-block disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      در حال ثبت...
                    </>
                  ) : (
                    "ثبت در لیست هشدار"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </Collapse>

      {/* My watchlist */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-brand">
              <Bell size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-extrabold text-ink">
                لیست هشدار من
              </h2>
              <p className="truncate text-[10px] text-muted">
                {selectMode
                  ? `${toPersianDigits(selectedCodes.length)} نماد انتخاب شده`
                  : "سیگنال های این نمادها را دنبال می کنید"}
              </p>
            </div>
          </div>

          {selectMode ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAll}
                className="chip bg-brand-50 font-bold text-brand-700 ring-1 ring-brand-100"
              >
                {allSelected ? "لغو انتخاب همه" : "انتخاب همه"}
              </button>
              <button
                type="button"
                onClick={cancelSelectMode}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200 transition hover:bg-slate-100"
                aria-label="لغو حذف گروهی"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="chip bg-brand-50 font-bold text-brand-700 ring-1 ring-brand-100">
                {toPersianDigits(list.length)} نماد
              </span>
              {list.length > 0 && (
                <button
                  type="button"
                  onClick={startSelectMode}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label="حذف گروهی"
                  title="حذف گروهی"
                >
                  <ListChecks size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <div className="card flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Bell size={26} />
            </span>
            <p className="mt-3 text-[13px] font-bold text-ink">
              لیست هشدار شما خالی است
            </p>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              با افزودن نخستین نماد، سیگنال های آن را دنبال کنید.
            </p>
            <button
              type="button"
              onClick={() => setPanel("add")}
              className="btn-soft mt-4"
            >
              <Plus size={15} />
              افزودن نخستین نماد
            </button>
          </div>
        ) : (
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {list.map((symbol) => {
              const deleting = deletingCodes.includes(symbol.code);
              const selected = selectedCodes.includes(symbol.code);
              return (
                <div
                  key={symbol.code}
                  onClick={selectMode ? () => toggleCode(symbol.code) : undefined}
                  className={`flex items-center gap-3 px-3.5 py-3 transition ${
                    selectMode
                      ? `cursor-pointer ${selected ? "bg-brand-50/70" : "hover:bg-slate-50/70"}`
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  {selectMode && (
                    <span className={checkboxClass(selected)}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[13px] font-extrabold text-brand-700">
                    {symbol.name?.[0] ?? "؟"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">
                      {symbol.name}
                    </p>
                    <p dir="ltr" className="truncate text-[10px] text-muted">
                      {symbol.code}
                    </p>
                  </div>
                  {!selectMode && (
                    <button
                      type="button"
                      onClick={() => handleDelete(symbol)}
                      disabled={deleting}
                      aria-label={`حذف ${symbol.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 active:scale-90 disabled:opacity-40"
                    >
                      {deleting ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bulk delete action bar */}
      {selectMode &&
        createPortal(
          <div className="fixed inset-x-0 bottom-[76px] z-[55] mx-auto max-w-md animate-fade-up px-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/95 p-2 shadow-float backdrop-blur-xl">
              <button
                type="button"
                onClick={cancelSelectMode}
                className="btn-soft flex-1 !py-2 text-[12px]"
              >
                لغو
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedCodes.length === 0}
                className="btn-danger flex-[1.4] !py-2 text-[12px] disabled:opacity-50"
              >
                {deletingCodes.length > 0 ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Trash2 size={15} />
                )}
                حذف {toPersianDigits(selectedCodes.length)} نماد
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Toast */}
      {createPortal(
        <div
          className={`pointer-events-none fixed inset-x-0 ${
            selectMode ? "bottom-36" : "bottom-20"
          } z-[60] mx-auto flex max-w-md justify-center px-4 transition-all duration-300 ${
            messageModal ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex w-full items-start gap-2.5 rounded-2xl bg-slate-900/90 px-4 py-3 text-white shadow-float backdrop-blur">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Info size={14} />
            </span>
            <p className="flex-1 text-[11px] leading-5">{messageModal}</p>
            <button
              type="button"
              onClick={() => setMessageModal(null)}
              className="pointer-events-auto text-white/60 transition hover:text-white"
              aria-label="بستن پیام"
            >
              <X size={14} />
            </button>
          </div>
        </div>,
        document.body,
      )}

      <AlarmsNoticeModal
        open={showNotice}
        onClose={() => setShowNotice(false)}
        onAdd={() => {
          setShowNotice(false);
          setPanel("add");
        }}
      />
    </div>
  );
};

export default Alarms;
