import {
  HiOutlineAdjustments,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCode,
  HiOutlineCog,
  HiOutlineDatabase,
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ActivityLogPanel from '@/app/components/dashboard/ActivityLogPanel';
// import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardStatGrid from '@/app/components/dashboard/DashboardStatGrid';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import JobPostingsPanel from '@/app/components/dashboard/JobPostingsPanel';
import type {
  DashboardActivity,
  DashboardJobItem,
  DashboardNavItem,
  DashboardStat,
} from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

export default async function CompanyDashboardPage() {
  return (
    <Suspense fallback={<CompanyDashboardSkeleton />}>
      <CompanyDashboardContent />
    </Suspense>
  );
}

async function CompanyDashboardContent() {
  const session = await requireCompanySession();

  await initializeDatabase();
  const companyId = session.companyId || session.accountId;
  
  if (!companyId) {
    console.error('[COMPANY_DASHBOARD_ERROR] No companyId found in session:', session);
    redirect('/login');
  }

  const company = await Company.findById(companyId)
    .select('companyName email location')
    .lean<{
      companyName: string;
      email: string;
      location: string;
    }>();

  if (!company) {
    redirect('/login');
  }

  const companyJobs = await Job.find({
    companyId: companyId as any,
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const companyJobIds = await Job.distinct('_id', { companyId: companyId as any });
  const totalJobsCount = companyJobIds.length;
  const totalCandidates = companyJobIds.length > 0
    ? (await Application.distinct('userId', { jobId: { $in: companyJobIds } })).length
    : 0;

  const stats: DashboardStat[] = [
    {
      label: 'Active Jobs',
      value: String(totalJobsCount),
      detail: 'Live job listings',
      icon: HiOutlineBriefcase,
      tone: 'text-[#203f99]',
    },
    {
      label: 'Total Candidates',
      value: String(totalCandidates),
      detail: 'Across all pipelines',
      icon: HiOutlineUsers,
      tone: 'text-[#203f99]',
    },
    // {
    //   label: 'Interviews',
    //   value: '0',
    //   detail: 'Scheduled this week',
    //   icon: HiOutlineCalendar,
    //   tone: 'text-slate-600',
    // },
  ];

  const dashboardJobs: DashboardJobItem[] = companyJobs.map((job) => ({
    title: job.title,
    meta: `${job.location} • ${job.jobType}`,
    posted: `Posted ${new Date(job.createdAt).toLocaleDateString()}`,
    match: job.salaryRange || 'Salary not listed',
    icon: HiOutlineBriefcase,
    tone: job.salaryRange ? 'bg-[#203f99] text-white' : 'bg-slate-100 text-slate-700',
    dot: 'bg-[#203f99]',
    id: job._id.toString(),
    href: `/dashboard/company/my-jobs/${job._id.toString()}`,
  }));

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title={company.companyName}
          items={sidebarItems}
        />
      }
      topbar={
        <DashboardTopbar
          profile={{
            name: company.companyName,
            subtitle: 'Company Account',
            initials: company.companyName.slice(0, 2).toUpperCase(),
          }}
        />
      }
      // footer={
      //   <DashboardFooter
      //     copyright="(c) 2026 HireSense . All rights reserved."
      //   />
      // }
    >
      <div className="space-y-8">
        {/* Main Dashboard Hero */}
        <DashboardHero
          title={`Welcome, ${company.companyName}`}
          description="Here's what's happening with your hiring pipeline today."
          action={{ label: 'Create New Job', icon: HiOutlinePlus, href: '/dashboard/company/post-job' }}
        />

        {/* Scaled Statistics Grid Section */}
        <div>
          <DashboardStatGrid stats={stats} />
        </div>

        {/* Active Workspace List Panel */}
        <div>
          <JobPostingsPanel title="Active Job Postings" jobs={dashboardJobs} matchLabel="Salary" />
        </div>
      </div>
    </DashboardShell>
  );
}

function CompanyDashboardSkeleton() {
  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Recruitment"
          items={sidebarItems}
        />
      }
      topbar={
        <DashboardTopbar />
      }
      // footer={
      //   <DashboardFooter
      //     copyright="(c) 2026 HireSense . All rights reserved."
      //     links={['Privacy Policy', 'Terms of Service', 'Help Center']}
      //   />
      // }
    >
      {/* Consistent color matching skeleton structure */}
      <div className="animate-pulse space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-8 w-64 rounded-xl bg-slate-200" />
            <div className="mt-3 h-4 w-80 rounded-xl bg-slate-200" />
          </div>
          <div className="h-11 w-full rounded-xl bg-slate-200 md:w-40" />
        </div>

        {/* Stat Cards Skeleton Loader */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-5 h-7 w-14 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Content Box Skeleton Loader */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 h-64 shadow-sm">
          <div className="h-5 w-44 rounded bg-slate-200" />
          <div className="mt-6 space-y-4">
            {[0, 1].map((item) => (
              <div key={item} className="h-14 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}