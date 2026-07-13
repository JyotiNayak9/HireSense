import Link from 'next/link';
import Application from '@/database/Application.model';
import Job from '@/database/Job.model';
import RankingResult from '@/database/RankingResult.model';
import { initializeDatabase } from '@/lib/initializeDatabase';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

type Props = { userId?: string };

export default async function ApplicationsInner({ userId }: Props) {
  await initializeDatabase();

  if (!userId) {
    return (
      <div className="max-w-5xl p-6">
        <p className="text-sm text-slate-600">Unable to load applications (missing user session).</p>
      </div>
    );
  }

  const [applications, rankingResults] = await Promise.all([
    Application.find({ userId }).sort({ createdAt: -1 }).lean(),
    RankingResult.find({ userId }).sort({ score: -1, createdAt: 1 }).lean(),
  ]);

  const jobIds = Array.from(new Set(applications.map((application) => String(application.jobId))));
  const jobs = await Job.find({ _id: { $in: jobIds } }).lean();
  const jobsById = new Map(jobs.map((job) => [String(job._id), job]));
  const rankingsByApplicationId = new Map(rankingResults.map((ranking) => [String(ranking.applicationId), ranking]));

  return (
    <div className="max-w-5xl p-6 space-y-6">
      {applications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-navy">No applications yet</h2>
          <p className="mt-3 text-sm text-slate-600">Submit applications and review them on this page.</p>
          <Link
            href="/dashboard/user/job-openings"
            className="mt-6 inline-flex rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-mid transition"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const job = jobsById.get(String(application.jobId));
            const ranking = rankingsByApplicationId.get(String(application._id));
            const displayScore = Number(ranking?.score ?? application.matchPercentage ?? 0);
            return (
              <div key={String(application._id)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{job?.title ?? 'Unknown role'}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{job?.title ?? 'Job not available'}</p>
                    <div className="mt-2 text-sm text-slate-600">
                      {job?.location ? `${job.location} • ${job.jobType}` : 'Job details unavailable'}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                      <span className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[application.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {application.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Applied</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(application.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Match</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {typeof displayScore === 'number' ? `${displayScore.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600 max-h-20 overflow-hidden">{application.experience}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
