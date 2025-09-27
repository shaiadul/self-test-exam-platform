interface Stat {
  label: string;
  value: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="border rounded-lg p-4 flex flex-col items-center justify-center text-center"
        >
          <p className="text-gray-500 text-sm">{stat.label}</p>
          <p className="text-xl font-bold text-[#dd6b01]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
