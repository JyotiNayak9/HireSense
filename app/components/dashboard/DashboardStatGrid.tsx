import type { DashboardStat } from './types';

interface DashboardStatGridProps {
  stats: DashboardStat[];
}

export default function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {stats.map(({ label, value, detail, icon: Icon, tone }) => (
        <article
          key={label}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#061b55]">
              {label}
            </h2>
            <Icon className="h-5 w-5 text-[#0f3f8f]" />
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-[34px] font-bold leading-none text-[#00143f]">
              {value}
            </span>
            <span className={`pb-1 text-[12px] font-bold ${tone ?? ''}`}>
              {detail}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
