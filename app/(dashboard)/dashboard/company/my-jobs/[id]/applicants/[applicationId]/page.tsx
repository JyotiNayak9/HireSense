import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import UpdateApplicationStatus from '@/app/components/dashboard/UpdateApplicationStatus';
import {
  HiOutlineViewGrid, 
  HiOutlineClipboardList, 
  HiOutlineCog,
  HiOutlineDatabase, 
  HiOutlineBriefcase, 
  HiOutlinePaperClip, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineChartBar,
  HiOutlineArrowLeft,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
} from 'react-icons/hi';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import RankingResult from '@/database/RankingResult.model';
import Resume from '@/database/Resume.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

type ApplicantDetailPageProps = {
  params: Promise<{ id: string; applicationId: string }>;
};

export default function ApplicantDetailPage({ params }: ApplicantDetailPageProps) {
  return (
    <Suspense fallback={<ApplicantDetailSkeleton />}>
      <ApplicantDetailContent params={params} />
    </Suspense>
  );
}

async function ApplicantDetailContent({ params }: ApplicantDetailPageProps) {
  const { id, applicationId } = await params;
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) redirect('/dashboard/company');

  const company = await Company.findById(companyId).select('companyName').lean();
  if (!company) redirect('/dashboard/company');

  const job = await Job.findById(id).lean();
  if (!job) redirect('/dashboard/company/my-jobs');
  if (String(job.companyId) !== String(companyId)) redirect('/dashboard/company/my-jobs');

  const application = await Application.findById(applicationId).lean();
  if (!application || String(application.jobId) !== String(job._id)) {
    redirect(`/dashboard/company/my-jobs/${id}/applicants`);
  }

  const [rankingResult, resume] = await Promise.all([
    RankingResult.findOne({ applicationId: application._id }).lean(),
    application.resumeId ? Resume.findById(application.resumeId).lean() : null,
  ]);
  
  const displayScore = Number(rankingResult?.score ?? application.matchPercentage ?? 0);

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
      {/* <DashboardHero 
        title={application.name} 
        description={`Reviewing full file profile submitted for the position of ${job.title}.`} 
      /> */}

      <div className="max-w-5xl mt-2 space-y-6">
        
        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/company/my-jobs/${id}/applicants`}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Applicants
          </Link>
          
          <UpdateApplicationStatus
            applicationId={String(application._id)}
            currentStatus={application.status || 'pending'}
          />
        </div>

        {/* Master Matrix Breakdown Layout */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          
          {/* Main Dossier Content Block */}
          <div className="space-y-6">
            
            {/* Primary Candidate Card */}
            <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Candidate Profile</span>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{application.name}</h2>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">ID: {String(application._id)}</p>
              </div>

              {/* Direct Channels Grid */}
              <div className="grid gap-3 sm:grid-cols-2 pt-1 border-t border-slate-300 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <HiOutlineMail className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="truncate">{application.email}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HiOutlinePhone className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>{application.phone}</span>
                </div>
              </div>

              {/* Summary Description Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Experience Summary</h4>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed font-medium text-slate-600 whitespace-pre-wrap">
                  {application.experience}
                </div>
              </div>

              {/* Custom Core Competencies Tag Array */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Skills & Core Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(application.skills || []).length > 0 ? (
                    application.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200/40">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-slate-600 italic">No exact skill definitions parsed.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Matrix Keyword Delta Evaluation Blocks */}
            {(application.matchedKeywords?.length || application.missingKeywords?.length) && (
              <div className="grid gap-4 sm:grid-cols-2">
                
                {application.matchedKeywords?.length ? (
                  <div className="rounded-3xl border border-emerald-300/60 bg-emerald-100/40 p-5 space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {application.matchedKeywords.map((keyword) => (
                        <span key={keyword} className="inline-flex items-center rounded-lg bg-white border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {application.missingKeywords?.length ? (
                  <div className="rounded-3xl border border-rose-200/60 bg-rose-50/40 p-5 space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {application.missingKeywords.map((keyword) => (
                        <span key={keyword} className="inline-flex items-center rounded-lg bg-white border border-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 shadow-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

              </div>
            )}
          </div>

          {/* Right Sidebar Status Action Layout Stack */}
          <aside className="space-y-6">
            
            {/* Match Scoring Card Block */}
            <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Match Index Score</h4>
                  <div className="mt-1 text-3xl font-black text-slate-700 tracking-tight">
                    {typeof displayScore === 'number' ? `${displayScore.toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#203f99]/10 flex items-center justify-center text-[#203f99]">
                  <HiOutlineChartBar className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                <HiOutlineCalendar className="h-3.5 w-3.5" />
                <span>Computed: {application.rankingCalculatedAt ? new Date(application.rankingCalculatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Not Available'}</span>
              </div>
            </div>


            <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Target Profile</h4>
                  <p className="mt-0.5 text-base font-bold text-slate-800 tracking-tight truncate">{job.title}</p>
                </div>
                <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <HiOutlineBriefcase className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-2 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-600">
                {job.location && <div className="flex items-center gap-1.5"><HiOutlineLocationMarker className="h-3.5 w-3.5 text-slate-600" />{job.location}</div>}
                {job.jobType && <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-600 ml-1 mr-1" />{job.jobType}</div>}
                {job.salaryRange && <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-600 ml-1 mr-1" />{job.salaryRange}</div>}
                {job.deadline && <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mt-1 pt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</div>}
              </div>
            </div>


            <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Attached File</h4>
                  <p className="mt-0.5 text-sm font-bold text-slate-800 truncate">{resume?.originalName ?? 'Resume.pdf'}</p>
                </div>
                <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <HiOutlinePaperClip className="h-4 w-4" />
                </div>
              </div>


              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`/api/application/${String(application._id)}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#203f99] px-4 text-xs font-bold text-white hover:bg-[#18317a] transition-all shadow-sm active:scale-[0.99]"
                >
                  <HiOutlineEye className="h-4 w-4" />
                  View Original Resume
                </a>
                
                <a
                  href={`/api/application/${String(application._id)}/resume?download=1`}
                  className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.99]"
                >
                  <HiOutlineDownload className="h-4 w-4" />
                  Download File
                </a>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function ApplicantDetailSkeleton() {
  return (
    <DashboardShell
      sidebar={<DashboardSidebar title="Loading" items={sidebarItems} profile={{ name: 'Loading', subtitle: 'Company Account', initials: 'LD' }} />}
      topbar={<DashboardTopbar />}
    >
      <div className="max-w-5xl mt-8 animate-pulse space-y-6">
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-28 bg-slate-200 rounded-3xl" />
            <div className="h-40 bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}