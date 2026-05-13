import Spinner from "./Spinner";

const VARIANTS = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white disabled:bg-indigo-300",
  outline:
    "border border-indigo-300 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 bg-white disabled:opacity-50",
  danger:
    "border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 bg-white disabled:opacity-50",
};

/**
 * Reusable button with loading state support.
 */
export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  className = "",
  type = "button",
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl transition-all duration-150
        active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100
        py-3 px-5 text-sm
        ${VARIANTS[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}
