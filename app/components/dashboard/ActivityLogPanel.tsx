import type { DashboardActivity } from './types';

interface ActivityLogPanelProps {
  title: string;
  activities: DashboardActivity[];
  actionLabel?: string;
}

export default function ActivityLogPanel({
  title,
  activities,
  actionLabel = 'View Full Log',
}: ActivityLogPanelProps) {
  return (
    <aside>
      <h2 className="text-[22px] font-bold text-[#00143f]">{title}</h2>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-9">
          {activities.map(({ title: activityTitle, time, dot }) => (
            <div key={activityTitle} className="relative pl-6">
              <span
                className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
                  dot ?? 'bg-[#0f3f8f]'
                }`}
              />
              <p className="text-[12px] font-bold leading-5 text-[#00143f]">
                {activityTitle}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{time}</p>
            </div>
          ))}
        </div>
        <button
          className="mt-10 h-11 w-full rounded border border-slate-300 text-[11px] font-bold uppercase text-[#061b55] transition hover:border-[#203f99] hover:bg-blue-50"
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </aside>
  );
}
