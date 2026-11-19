export default function AdminActionButton({
  loading,
  icon: Icon,
  danger = false,
  loadingLabel = "در حال پردازش...",
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`${
        danger ? "btn-danger" : "btn-primary"
      } btn-block disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <Icon size={15} />
      )}
      {loading ? loadingLabel : children}
    </button>
  );
}
