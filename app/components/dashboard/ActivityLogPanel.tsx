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
    <aside className="space-y-4">
      {/* Title Heading synced with Dashboard Panels */}
      <h2 className="text-lg font-bold text-slate-800 tracking-tight px-1">{title}</h2>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Relative timeline grid line wrapper */}
        <div className="relative border-l border-slate-100 pl-4 ml-1.5 space-y-6 my-2">
          {activities.map(({ title: activityTitle, time, dot }) => (
            <div key={activityTitle} className="relative group">
              {/* Chronological Vertical Dot Anchor Node */}
              <span
                className={`absolute -left-[22px] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ring-offset-0 transition-transform duration-200 group-hover:scale-110 ${
                  dot ?? 'bg-[#203f99] ring-[#203f99]/10'
                }`}
              />
              
              {/* Metadata content context layout blocks */}
              <div>
                <p className="text-[13px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#203f99]">
                  {activityTitle}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Button Execution Control Footer Element */}
        <button
          className="mt-6 h-10 w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white transition-all duration-150 shadow-sm active:scale-[0.99] hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </aside>
  );
}