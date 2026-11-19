const Loading = ({ label = "در حال بارگذاری..." }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-6 py-5 shadow-float">
        <div className="relative h-9 w-9">
          <div className="absolute inset-0 rounded-full border-[3px] border-brand-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-500" />
        </div>
        <p className="text-[11px] font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
};

export default Loading;
