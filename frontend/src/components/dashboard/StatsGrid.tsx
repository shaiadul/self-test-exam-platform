import { Stat } from "../../lib/types";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPercentage,
  FaHistory,
  FaBookOpen,
  FaAward,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";

interface StatsGridProps {
  stats: Stat[];
}

const getIcon = (label: string) => {
  const normLabel = label.toLowerCase();
  if (normLabel.includes("completed") || normLabel.includes("attempts"))
    return <FaHistory />;
  if (
    normLabel.includes("average") ||
    normLabel.includes("accuracy") ||
    normLabel.includes("rating")
  )
    return <FaPercentage />;
  if (
    normLabel.includes("passed") ||
    normLabel.includes("active") ||
    normLabel.includes("registered")
  )
    return <FaCheckCircle />;
  if (normLabel.includes("failed") || normLabel.includes("pending"))
    return <FaTimesCircle />;
  if (normLabel.includes("question") || normLabel.includes("pack"))
    return <FaBookOpen />;
  if (normLabel.includes("leaderboard") || normLabel.includes("rank"))
    return <FaAward />;
  return <FaHistory />;
};

const getColorClass = (label: string) => {
  const normLabel = label.toLowerCase();
  if (
    normLabel.includes("passed") ||
    normLabel.includes("registered") ||
    normLabel.includes("accuracy") ||
    normLabel.includes("rating")
  ) {
    return "text-emerald-600 bg-emerald-50 border-emerald-100";
  }
  if (normLabel.includes("failed") || normLabel.includes("pending")) {
    return "text-rose-600 bg-rose-50 border-rose-100";
  }
  if (
    normLabel.includes("question") ||
    normLabel.includes("pack") ||
    normLabel.includes("attempts")
  ) {
    return "text-blue-600 bg-blue-50 border-blue-100";
  }
  return "text-[#dd6b01] bg-orange-50 border-orange-100";
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-100/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
        >
          {/* Subtle colored card glow */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gray-50 rounded-full blur-xl group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none"></div>

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-3.5 border shadow-sm ${getColorClass(stat.label)}`}
          >
            {getIcon(stat.label)}
          </div>

          <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
            {stat.label}
          </p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
