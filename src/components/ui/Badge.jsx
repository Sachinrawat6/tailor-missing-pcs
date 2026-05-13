const COLORS = {
  green: "bg-green-50 border-green-200 text-green-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  red: "bg-red-50 border-red-200 text-red-600",
};

/**
 * Stat badge card (used in scan summary).
 */
export default function Badge({ label, value, color = "indigo" }) {
  return (
    <div className={`flex-1 border rounded-xl p-3 text-center ${COLORS[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}
