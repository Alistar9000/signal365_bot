import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Check,
  CheckCheck,
  CheckSquare,
  CheckSquare2,
  ChevronDown,
  Plus,
  Square,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../util/axios";
import Loading from "../components/Loading";
import { useDebounce } from "../hooks/useDebounce";
import { CgClose } from "react-icons/cg";
import { BiCheckSquare } from "react-icons/bi";
import { MiniAppContext } from "../components/AppContext";
import NotVipMessage from "../components/admin/NotVipMessage";

const Alarms = () => {
  const [showValidSymbols, setShowValidSymbols] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [buttonSelect, setButtonSelect] = useState(null);
  const [messageModal, setMessageModal] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [checkVip, setCheckVip] = useState(false);
  const [removeingSymbols, setRemovingSymbols] = useState([]);
  const [newSymbols, setNewSymbols] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchContent, setSearchContent] = useState([]);
  const listRef = useRef();
  const queryClient = useQueryClient();
  const { search } = useDebounce(searchInput);
  const { userData,isLoading:loading } = MiniAppContext();
  const { data, isLoading } = useQuery({
    queryKey: ["alarms"],
    queryFn: () => api.get("/alarms"),
    enabled:!loading
  });

  const addMut = useMutation({
    mutationFn: (payload) => api.put("/alarms/add", { list: payload }),
    onSuccess: (data) => {
      
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      
      if(data?.data?.reach_max){
        const message = data.data.reach_max.map(e=>e.name).join(' - ')
        // setMessageModal('gdfgdf')
      setTimeout(() => {
        
        setMessageModal(`⚠️ نمادهایی که بدلیل پر شدن ظرفیت لیست (100 سهم) ثبت نشدند : ${message} `)
        
      }, 2000);
      }
    },
    
  });
  const deleteMut = useMutation({
    mutationFn: (payload) => api.put("/alarms/delete", { list: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
    },
  });

  const sandoq = [
    "اهرم",
    "عیار",
    "موج",
    "جهش",
    "دارا یکم",
    "پالایش",
    "دوایکس",
    "نارنج اهرم",
    "بیدار",
    "شتاب",
    "توان",
    "اطلس",
    "کلید",
    "ارزش مسکن",
    "صنم",
    "سیلور",
    "سینرژی",
  ];
  const list = data?.data?.data || [];

  const handleSymbolCheck = (e) => {
    if (e.checked) {
      setRemovingSymbols((i) => [...i, e.name]);
    } else {
      setRemovingSymbols(
        removeingSymbols.filter((symbol) => symbol !== e.name),
      );
    }
  };
  const handleDelete = () => {
    setShowValidSymbols(false);
    setButtonSelect(null);
    setNewSymbols([]);

    if (removeingSymbols.length === 0 && showDeleteIcon) {
      setMessageModal("برای حذف نماد حداقل یک مورد را انتخاب نمایید");
      return;
    }
    if (!showDeleteIcon) {
      setShowDeleteIcon(true);
      return;
    }

    setShowDeleteIcon(false);
    setUpdateLoading(true);
    deleteMut.mutate(removeingSymbols);
    setTimeout(() => {
      setUpdateLoading(false);
      setCheckAll(false);
      setRemovingSymbols([]);
    }, 2000);
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    setCheckAll((e) => !e);
  };

  useEffect(() => {
    if (checkAll) {
      document.querySelectorAll("input").forEach((i) => (i.checked = true));
      setRemovingSymbols(list.map((i) => i.code));
    } else {
      document.querySelectorAll("input").forEach((i) => (i.checked = false));
      setRemovingSymbols([]);
    }
  }, [checkAll]);

  const handleRulesBtn = () => {
    setShowDeleteIcon(false);
    setRemovingSymbols([]);
    setCheckAll(false);

    if (buttonSelect === 0 && showValidSymbols) {
      setShowValidSymbols(false);
      setButtonSelect(null);
      setNewSymbols([]);
    }
    if (!buttonSelect && !showValidSymbols) {
      setShowValidSymbols(true);
      setButtonSelect(0);
    }
    if (buttonSelect === 1 && showValidSymbols) {
      setButtonSelect(0);
    }
  };

  const handleAddSymbolBtn = () => {
    setShowDeleteIcon(false);
    setRemovingSymbols([]);
    setCheckAll(false);

    if (buttonSelect === 1 && showValidSymbols) {
      setShowValidSymbols(false);
      setButtonSelect(null);
      setNewSymbols([]);
    }
    if (!buttonSelect && !showValidSymbols) {
      setShowValidSymbols(true);
      setButtonSelect(1);
    }
    if (buttonSelect === 0 && showValidSymbols) {
      setButtonSelect(1);
    }
  };

  // useEffect(() => {
  //   if (!userData?.is_vip) {
  //     setCheckVip(true);
  //   }
  // }, [userData.is_vip]);

  const handleAddSymbols = () => {
    if(!userData?.is_vip){
      setCheckVip(true)
      return
    }
    setUpdateLoading(true);
    addMut.mutate(newSymbols);
    setTimeout(() => {
      setShowValidSymbols(false);
      setButtonSelect(null);
      setUpdateLoading(false);
      setNewSymbols([]);
    }, 2000);
  };

  const handleSymbolSearch = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const fetchSearch = async () => {
      const response = await api.post("/symbols", { search: search });
      const result = response.data.data;
      setSearchContent(result);
    };
    if (searchInput !== "") fetchSearch();
  }, [search]);

  const handleSelectedNewSymbols = async (symbol) => {
    setSearchContent([]);
    setSearchInput("");
    if (
      newSymbols.some((e) => e.name === symbol.name) ||
      list.some((e) => e.name === symbol.name)
    ) {
      setMessageModal("ثبت ناموفق! نماد تکراری است و در لیست وجود دارد");
      setTimeout(() => {
        setMessageModal(null);
      }, 3000);
      return;
    }

    setNewSymbols((n) => [...n, symbol]);
  };

  if (loading || isLoading) return <Loading />;

  return (
    <div className="p-2 h-full relative">
      {updateLoading && (
        <div className="w-full h-full backdrop-blur-sm z-20 absolute top-0 left-0">
          <Loading />
        </div>
      )}
      <div className="flex  items-center justify-between">
        <p className="font-bold">لیست هشدار</p>
        <Link
          to={"/mini-app/guide"}
          className="text-xs text-[var(--app-accent-text-color)] bg-amber-100 border border-amber-200 rounded-md px-2 cursor-pointer py-1"
        >
          راهنما
        </Link>
      </div>
      <div className="mt-5 w-full flex flex-col gap-1 ">
        <div className="w-full *:flex-1 gap-2 flex items-center">
          <div
            onClick={handleRulesBtn}
            className="flex justify-center  border border-amber-300 hover:bg-amber-100  text-amber-400 p-2 rounded-md cursor-pointer items-center gap-2 text-xs mt-5"
          >
            <p className="">قوانین </p>
            <ChevronDown
              size={15}
              className={`transition-transform duration-300 ${!showValidSymbols ? "rotate-90" : "rotate-0"}`}
            />
          </div>
          <div
            onClick={handleAddSymbolBtn}
            className="flex  justify-center text-[var(--app-accent-text-color)] hover:bg-green-100 border border-[var(--app-accent-text-color)]  p-2 rounded-md  cursor-pointer items-center gap-1 text-xs mt-5"
          >
            <p className="mt-0.5">افزودن نماد</p>
            <Plus size={15} />
          </div>
          <div
            onClick={handleDelete}
            className={`flex justify-center transition-all duration-300 relative text-red-500  border ${showDeleteIcon && "rounded-b-none"} hover:bg-red-100 border-red-300  p-2 rounded-md w-max cursor-pointer items-center gap-1 text-xs mt-5`}
          >
            <div className="w-full  flex items-center gap-1">
              <p className="mt-0.5">حذف نماد</p>
              <Trash size={15} className="text-red-400" />

              <div
                onClick={handleSelectAll}
                className={`flex w-full cursor-pointer hover:bg-red-50 text-[var(--app-text-color)] border  border-red-300 bg-white absolute ${showDeleteIcon ? "top-full  opacity-100" : "top-0 opacity-0  pointer-events-none"} left-0 cursor-default py-2 transition-all duration-300   items-center justify-center gap-1`}
              >
                {checkAll ? <BiCheckSquare size={15} /> : <Square size={15} />}
                <p>انتخاب همه</p>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteIcon(false);
                  setRemovingSymbols([]);
                  setCheckAll(false);
                }}
                className={`bg-amber-400 w-full delay-100 text-center absolute  ${showDeleteIcon ? "opacity-100 top-[200%]" : "opacity-0 pointer-events-none top-0"}  left-0 transition-all duration-300 py-2 text-[var(--app-text-color)] rounded-b-md`}
              >
                <p>لغو انتخاب</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={` border ${showValidSymbols ? "grid grid-rows-[1fr] opacity-100 mb-4" : "grid grid-rows-[0fr] pointer-events-none opacity-0"} p-2 rounded-xl transition-all duration-300`}
        >
          <div className="overflow-hidden relative ">
            <div
              className={`flex  ${buttonSelect === 0 ? "opacity-100" : "opacity-0 pointer-events-none"} transition-all duration-300 flex-col gap-4 text-xs`}
            >
              <p className="font-bold">نمادهای معتبر و قابل ذخیره : </p>
              <p className="flex items-center gap-2">
                {" "}
                <Check size={15} /> سهام بازارهای اصلی بورس و فرابورس
              </p>
              <div className="flex items-center flex-wrap gap-2">
                <Check size={15} />
                صندوق های
                {sandoq.map((i) => (
                  <div
                    key={i}
                    className="rounded-md px-2 py-1 bg-amber-100 text-[var(--app-accent-text-color)] w-max"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="rounded-md bg-red-400 text-white px-2 py-1 text-xs w-max">
                بازار پایه و سایر صندوق ها معتبر نیستند
              </p>
              <p className="rounded-md px-2 py-1 w-max bg-amber-300">
                ظرفیت لیست : حداکثر 100 نماد
              </p>
            </div>

            <div
              className={`w-full ${buttonSelect === 1 ? "opacity-100" : "opacity-0 pointer-events-none"} absolute top-0 right-0 p-4 transition-all duration-300 flex-col gap-4 text-xs`}
            >
              {checkVip ? (
                <div className="flex w-full justify-center flex-wrap">
                  <NotVipMessage
                    text={"ثبت نمادهای جدید"}
                    gap={"gap-5"}
                    wrap={true}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col gap-4">
                  <div className="flex gap-2 w-full items-center">
                    <div className="w-max">
                      <p>جستجوی نماد</p>
                    </div>
                    <div className="relative flex-1">
                      <input
                        value={searchInput}
                        onChange={handleSymbolSearch}
                        className="rounded-md outline-none w-full px-2 py-1 flex-1 border bg-white"
                      />
                      {searchContent?.length > 0 && searchInput !== "" && (
                        <div className="absolute mt-0.5 bg-white z-30 top-full overflow-auto border-amber-300 h-max max-h-[30vh] w-full border rounded-md p-2">
                          <ul>
                            {searchContent.map((symbol) => (
                              <li
                                onClick={() => handleSelectedNewSymbols(symbol)}
                                className="p-2 text-[var(--app-text-color)] rounded-md cursor-pointer hover:bg-amber-100"
                                key={symbol.code}
                              >
                                {symbol.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-neutral-400 text-[.6rem]">
                    موارد انتخاب شده
                  </span>
                  <div className="border -mt-4 overflow-auto flex gap-2  flex-wrap rounded-md flex-1 p-2 w-full">
                    {newSymbols.map((symbol) => (
                      <div className="rounded-md relative h-max py-1 px-2 text-[var(--app-accent-text-color)] border w-max border-[var(--app-accent-text-color)] bg-white">
                        {symbol.name}
                        <div
                          onClick={() =>
                            setNewSymbols(
                              newSymbols.filter((e) => e.code !== symbol.code),
                            )
                          }
                          className="absolute cursor-pointer bg-red-500 text-white -right-1 border border-red-500 rounded-full  -top-2"
                        >
                          <CgClose size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="w-full text-center">
                    <button
                      onClick={handleAddSymbols}
                      className="bg-[var(--app-accent-text-color)] text-white px-6 text-sm py-1 rounded-md"
                    >
                      ثبت
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex overflow-auto mt-5 gap-5 items-start flex-col">
          <div className="flex items-center gap-2">
            <p>لیست هشدار من :</p>
            {list?.length === 0 ? (
              "خالی"
            ) : (
              <p>
                <span className="font-bold text-[var(--app-accent-text-color)]">
                  {list?.length}
                </span>{" "}
                نماد
              </p>
            )}
          </div>
          {list?.length === 0 && (
            <div className="border text-center bg-red-50 mt-5 text-red-500 border-red-100 rounded-xl p-2">
              شما هنوز نمادی به لیست اضافه نکردید
            </div>
          )}
          <div className="flex w-full overflow-auto h-[calc(100vh-45vh)] pb-4 pt-1 flex-col gap-4">
            <div ref={listRef} className="flex flex-wrap px-2 gap-2">
              {list?.map((symbol, index) => (
                <div
                  className={`rounded-md text-xs relative px-2 py-1 border ${removeingSymbols.some((e) => e === symbol.code) ? "bg-red-500 border-red-600 text-white" : "bg-yellow-100 border-yellow-200 text-[var(--app-accent-text-color)]"}`}
                >
                  {showDeleteIcon && (
                    <input
                      name={symbol.code}
                      type="checkbox"
                      className="absolute -top-1 scale-90 -right-2"
                      onChange={(e) => handleSymbolCheck(e.target)}
                    />
                  )}
                  {symbol.name}
                </div>
              ))}
            </div>
            <div
              onClick={() => setMessageModal(null)}
              className={`fixed flex items-center ${!messageModal ? "opactiy-0 pointer-events-none" : "opacity-100 bg-black/30"} transition-all duration-300 px-6 justify-center inset-0`}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`rounded-xl transition-all duration-300 ${!messageModal ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"} text-wrap   p-4 shadow text-[var(--app-text-color)] bg-white text-xs`}
              >
                {messageModal}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alarms;
