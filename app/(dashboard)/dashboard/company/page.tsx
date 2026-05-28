import {
  HiOutlineAdjustments,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCode,
  HiOutlineDatabase,
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ActivityLogPanel from '@/app/components/dashboard/ActivityLogPanel';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
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
import mongoose from 'mongoose';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },

];


const jobs: DashboardJobItem[] = [];



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

  const companyJobs = await Job.find({
    companyId:companyId as any,
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const totalJobsCount = await Job.countDocuments({ companyId: companyId as any });

  const stats: DashboardStat[] = [
    {
      label: 'Total Jobs',
      value: String(totalJobsCount),
      detail: '',
      icon: HiOutlineBriefcase,
      tone: 'text-emerald-600',
    },
  ];

  if (!company) {
    redirect('/login');
  }

  const dashboardJobs: DashboardJobItem[] = companyJobs.map((job) => ({
    title: job.title,
    meta: `${job.location} • ${job.jobType}`,
    posted: `Posted ${new Date(job.createdAt).toLocaleDateString()}`,
    match: job.salaryRange || 'Salary not listed',
    icon: HiOutlineBriefcase,
    tone: job.salaryRange ? 'bg-[#1f3f99] text-white' : 'bg-blue-50 text-[#1f3f99]',
    dot: 'bg-[#1f3f99]',
  }));

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title={company.companyName}
          items={sidebarItems}
          profile={{
            name: company.companyName,
            subtitle: 'Company Account',
            initials: company.companyName.slice(0, 2).toUpperCase(),
          }}
        />
      }
      topbar={
        <DashboardTopbar/>
      }
      footer={
        <DashboardFooter
          copyright="(c) 2026 HireSense . All rights reserved."

        />
      }
    >
      <DashboardHero
        title={`Welcome, ${company.companyName}`}
        description="Here's what's happening with your hiring pipeline today."
        action={{ label: 'Create New Job', icon: HiOutlinePlus, href: '/dashboard/company/post-job' }}
      />

      <DashboardStatGrid stats={stats} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_292px]">
        <JobPostingsPanel title="Active Job Postings" jobs={dashboardJobs} matchLabel="Salary" />
      </div>
    </DashboardShell>
  );
}

function CompanyDashboardSkeleton() {
  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Hiring Hub"
          items={sidebarItems}
          profile={{
            name: 'Loading',
            subtitle: 'Company Account',
            initials: 'HS',
          }}
        />
      }
      topbar={
        <DashboardTopbar/>
      }
      footer={
        <DashboardFooter
          copyright="(c) 2026 HireSense . All rights reserved."
          links={['Privacy Policy', 'Terms of Service', 'Help Center']}
        />
      }
    >
      <div className="animate-pulse">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-9 w-72 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-12 w-full rounded-md bg-slate-200 md:w-44" />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-31.5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-7 h-8 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_292px]">
          <div>
            <div className="h-7 w-56 rounded bg-slate-200" />
            <div className="mt-5 space-y-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-20.5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="h-7 w-44 rounded bg-slate-200" />
            <div className="mt-5 h-82.5 rounded-lg border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
