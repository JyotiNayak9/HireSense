import type { DashboardJobItem } from './types';

interface JobPostingsPanelProps {
  title: string;
  jobs: DashboardJobItem[];
  viewAllLabel?: string;
  matchLabel?: string;
}

export default function JobPostingsPanel({
  title,
  jobs,
  viewAllLabel = 'View All',
  matchLabel = 'Avg. Match',
}: JobPostingsPanelProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#00143f]">{title}</h2>
        
      </div>

      <div className="mt-5 space-y-4">
        {jobs.map(({ title: jobTitle, meta, posted, match, icon: Icon, tone, dot }) => (
          <article
            key={jobTitle}
            className="grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-md ${
                tone ?? 'bg-blue-50 text-[#1f3f99]'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-bold text-[#00143f]">
                {jobTitle}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#24375f]">
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${dot ?? 'bg-[#1f3f99]'}`} />
                  {meta}
                </span>
                <span>{posted}</span>
              </div>
            </div>
            <div className="flex h-16 w-12 flex-col items-center justify-center rounded-lg border-2 border-teal-600 text-teal-700">
              <span className="text-[13px] font-bold">{match}</span>
              <span className="mt-1 text-[8px] font-semibold uppercase text-[#24375f]">
                {matchLabel}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
