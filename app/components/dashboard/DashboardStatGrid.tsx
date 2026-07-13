import type { DashboardStat } from './types';

interface DashboardStatGridProps {
  stats: DashboardStat[];
}

export default function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
      {stats.map(({ label, value, detail, icon: Icon, tone }) => (
        <article
          key={label}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80"
        >
          {/* Header row containing Badge Title and Dynamic Icon */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {label}
            </h2>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-[#203f99]/10 group-hover:text-[#203f99]">
              <Icon className="h-4.5 w-4.5" />
            </div>
          </div>

          {/* Metric Value row */}
          <div className="mt-4 flex flex-col justify-end gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-slate-800">
              {value}
            </span>
            {detail && (
              <span className="text-xs font-semibold text-slate-500">
                {detail}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}