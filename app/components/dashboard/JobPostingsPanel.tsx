import type { DashboardJobItem } from './types';
import Link from 'next/link';
import { HiOutlineBriefcase, HiOutlinePlus } from 'react-icons/hi';

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
  matchLabel = 'Match Score',
}: JobPostingsPanelProps) {
  return (
    <section className="w-full space-y-6">
      {/* Panel Heading Grid */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-slate-950 tracking-tight">{title}</h2>
      </div>

      {/* Empty State Layout */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-400 shadow-xs">
            <HiOutlineBriefcase className="h-6 w-6 text-[#18317a]" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">No Recommended Openings</h3>
          <p className="mt-1 max-w-sm text-sm font-medium text-slate-700 leading-relaxed">
            There are no structural match recommendations matching your evaluation records currently inside the queue.
          </p>
          <Link
            href="/dashboard/user/job-openings"
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#18317a] px-5 h-10 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-slate-950"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Explore Job Openings
          </Link>
        </div>
      ) : (
        /* Response Grid: Responsive 4-Column Card Array Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {jobs.map(({ title: jobTitle, meta, posted, match, icon: Icon, tone, dot, id, href }) => {
            const cardKey = id ?? jobTitle;

            const content = (
              <article className="h-full flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-400 hover:shadow-sm">
                
                {/* Upper Section: Core Platform Badge Row & Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 ${tone ?? 'bg-slate-50 text-slate-700'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Compact Processing Metrics Score Box */}
                    <div className="flex flex-col items-end rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-right">
                      <span className="text-sm font-black text-slate-950 leading-none">{match}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-700 mt-0.5">
                        {matchLabel}
                      </span>
                    </div>
                  </div>

                  {/* Text Title Wrap */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-950 tracking-tight line-clamp-2 group-hover:text-[#18317a] transition-colors">
                      {jobTitle}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
                      {meta}
                    </p>
                  </div>
                </div>

                {/* Lower Section: Verification Footnote Metadata */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dot ?? 'bg-[#18317a]'}`} />
                    Active Pipeline
                  </span>
                  <span className="font-medium text-slate-700">{posted}</span>
                </div>

              </article>
            );

            return href ? (
              <Link key={cardKey} href={href} className="group block no-underline h-full">
                {content}
              </Link>
            ) : (
              <div key={cardKey} className="h-full">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}