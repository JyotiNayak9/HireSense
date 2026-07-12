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
  matchLabel = 'Avg. Match',
}: JobPostingsPanelProps) {
  return (
    <section className="w-full">
      {/* Panel Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      {/* Render Clean Empty State UI if no jobs exist */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <HiOutlineBriefcase className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">No active job postings</h3>
          <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
            You haven't created any job opportunities yet. Create your first listing to start accepting candidates.
          </p>
          <Link
            href="/dashboard/company/post-job"
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#203f99] px-4 h-10 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Create Your First Job
          </Link>
        </div>
      ) : (
        /* Jobs List Container */
        <div className="space-y-3.5">
          {jobs.map(({ title: jobTitle, meta, posted, match, icon: Icon, tone, dot, id, href }) => {
            const content = (
              <article
                key={id ?? jobTitle}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80"
              >
                {/* Job Icon Block */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    tone ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Job Details Text metadata */}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-800 transition-colors group-hover:text-[#203f99]">
                    {jobTitle}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${dot ?? 'bg-[#203f99]'}`} />
                      <span className="text-slate-700 font-medium">{meta}</span>
                    </span>
                    <span className="text-slate-400 font-normal">{posted}</span>
                  </div>
                </div>

                {/* Streamlined Premium Salary Display */}
                <div className="flex flex-col items-end justify-center rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2 text-right">
                  <span className="text-xs font-bold text-slate-800">{match}</span>
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {matchLabel}
                  </span>
                </div>
              </article>
            );

            return href ? (
              <Link key={id ?? jobTitle} href={href} className="group block no-underline">
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      )}
    </section>
  );
}