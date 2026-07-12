import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import { HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineCog, HiOutlineDatabase, HiOutlineChartBar, HiOutlineMail, HiOutlinePhone, HiOutlineUserCircle } from 'react-icons/hi';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import RankingResult from '@/database/RankingResult.model';
import RecalculateRankingsButton from './RecalculateRankingsButton';

type ApplicantApplication = {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills?: string[];
  matchPercentage?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  rankingCalculatedAt?: Date | string | null;
  createdAt: Date | string;
};

type ApplicantRanking = {
  applicationId: unknown;
  score: number;
  rank?: number;
  isRecommended?: boolean;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  createdAt?: Date | string;
};

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

type ApplicantsPageProps = {
  params: Promise<{ id: string }>;
};

export default function ApplicantsPage({ params }: ApplicantsPageProps) {
  return (
    <Suspense fallback={<ApplicantsSkeleton />}>
      <ApplicantsContent params={params} />
    </Suspense>
  );
}

async function ApplicantsContent({ params }: ApplicantsPageProps) {
  const { id } = await params;
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) redirect('/dashboard/company');

  const company = await Company.findById(companyId).select('companyName').lean();
  if (!company) redirect('/dashboard/company');

  const job = await Job.findById(id).lean();
  if (!job) redirect('/dashboard/company/my-jobs');

  if (String(job.companyId) !== String(companyId)) {
    redirect('/dashboard/company/my-jobs');
  }

  const [applications, rankingResults] = await Promise.all([
    Application.find({ jobId: id }).sort({ createdAt: 1 }).lean<ApplicantApplication[]>(),
    RankingResult.find({ jobId: id }).sort({ score: -1, createdAt: 1 }).lean<ApplicantRanking[]>(),
  ]);

  const rankingsByApplicationId = new Map(
    rankingResults.map((ranking) => [String(ranking.applicationId), ranking])
  );

  const rankedApplications = applications
    .map((application) => ({
      application,
      ranking: rankingsByApplicationId.get(String(application._id)),
    }))
    .sort((first, second) => {
      const firstScore = Number(first.ranking?.score ?? first.application.matchPercentage ?? 0);
      const secondScore = Number(second.ranking?.score ?? second.application.matchPercentage ?? 0);

      if (secondScore !== firstScore) return secondScore - firstScore;

      return new Date(first.application.createdAt).getTime() - new Date(second.application.createdAt).getTime();
    });

  const companyProfile = {
    name: company.companyName,
    subtitle: 'Company Account',
    initials: company.companyName.slice(0, 2).toUpperCase(),
  };

  return (
    <DashboardShell
      sidebar={<DashboardSidebar title={company.companyName} items={sidebarItems} profile={companyProfile} />}
      topbar={<DashboardTopbar profile={companyProfile} />}
    >
      <DashboardHero 
        title={`Applicants for ${job.title}`} 
        description="Review smart-ranked candidate applications and pipeline matrices for this job profile." 
      />

      <div className="max-w-5xl mt-10 space-y-6">
        
        {/* Management Actions Row */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-2">
            Total Applicants {rankedApplications.length}
          </span>
          <RecalculateRankingsButton jobId={id} />
        </div>

        {rankedApplications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm font-medium text-slate-500">
            No applicants yet for this job profile. Active submissions will appear here.
          </div>
        ) : (
          <div className="space-y-5">
            {rankedApplications.map(({ application: app, ranking }, index) => {
              const score = Number(ranking?.score ?? app.matchPercentage ?? 0);
              const hasRanking = Boolean(ranking || app.rankingCalculatedAt);
              const displayRank = ranking?.rank && ranking.rank > 0 ? ranking.rank : index + 1;

              return (
                <div key={String(app._id)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    
                    {/* Left Side: Candidate Identity Meta */}
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-[#203f99]/10 px-2.5 text-xs font-black text-[#203f99] tracking-wide">
                          #{displayRank}
                        </span>
                        <div className="text-lg font-bold text-slate-900 tracking-tight">{app.name}</div>
                      </div>

                      {/* Contact Channels */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <HiOutlineMail className="h-4 w-4 text-slate-400" />
                          {app.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HiOutlinePhone className="h-4 w-4 text-slate-400" />
                          {app.phone}
                        </span>
                      </div>

                      {/* Summary Experience text */}
                      <div className="text-sm font-medium leading-relaxed text-slate-600">
                        {app.experience}
                      </div>

                      {/* Candidate Base Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(app.skills || []).map((skill: string) => (
                          <span key={skill} className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Side: Balanced Action Stack */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 min-w-[200px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6">
                      
                      {/* Metric Score Unit */}
                      <div className="w-full text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <HiOutlineChartBar className="h-3.5 w-3.5" />
                          Match Index
                        </div>
                        <div className="mt-1 text-2xl font-black text-slate-800 tracking-tight">
                          {hasRanking ? `${score.toFixed(1)}%` : 'Pending'}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {/* Primary Unified Action Button */}
                      <Link
                        href={`/dashboard/company/my-jobs/${id}/applicants/${String(app._id)}`}
                        className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#203f99] px-5 text-xs font-bold text-white hover:bg-[#18317a] transition-all shadow-sm active:scale-[0.99]"
                      >
                        <HiOutlineUserCircle className="h-4.5 w-4.5" />
                        View Full File
                      </Link>
                      
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function ApplicantsSkeleton() {
  return (
    <DashboardShell
      sidebar={<DashboardSidebar title="Loading" items={sidebarItems} profile={{ name: 'Loading', subtitle: 'Company Account', initials: 'LD' }} />}
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-48 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    </DashboardShell>
  );
}