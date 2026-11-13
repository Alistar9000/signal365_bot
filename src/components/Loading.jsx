const Loading = () => {
  return (
    <div className="absolute backdrop-blur-sm flex items-center justify-center left-0 top-0 w-full h-full">
      <div className="rounded-xl flex items-center justify-center border bg-white p-4 shadow-sm">
        <div className="w-6 rounded-full aspect-square border-[4px] border-neutral-300 border-t-[var(--app-accent-text-color)] animate-spin"></div>
      </div>
    </div>
  );
};

export default Loading;
