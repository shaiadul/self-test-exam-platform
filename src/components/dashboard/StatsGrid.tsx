import { Stat } from "@/lib/types";
import { FaCheckCircle, FaTimesCircle, FaPercentage, FaHistory } from "react-icons/fa";

interface StatsGridProps {
  stats: Stat[];
}

const getIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'completed exams': return <FaHistory />;
    case 'average mark': return <FaPercentage />;
    case 'passed': return <FaCheckCircle />;
    case 'failed': return <FaTimesCircle />;
    default: return null;
  }
};

const getColorClass = (label: string) => {
  switch (label.toLowerCase()) {
    case 'passed': return 'text-green-600 bg-green-50';
    case 'failed': return 'text-red-600 bg-red-50';
    default: return 'text-primary bg-primary/10';
  }
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover-lift"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${getColorClass(stat.label)}`}>
            {getIcon(stat.label)}
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
          <p className="text-3xl font-black text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
