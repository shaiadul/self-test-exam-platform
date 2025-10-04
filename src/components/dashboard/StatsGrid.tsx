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
          className="border border-[#dd6b01] rounded-lg p-4 flex flex-col items-center justify-center"
        >
          <p className="text-gray-500 text-xl">{stat.label}</p>
          <p className="text-4xl font-bold text-[#dd6b01]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
