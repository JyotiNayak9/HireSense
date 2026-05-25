import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineAdjustments,
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineDatabase,
} from 'react-icons/hi';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
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
  { label: 'Analysis', icon: HiOutlineChartBar },
  { label: 'Settings', icon: HiOutlineAdjustments },
];

const stats: DashboardStat[] = [
  {
    label: 'Active Jobs',
    value: '24',
    detail: '+12%',
    icon: HiOutlineBriefcase,
    tone: 'text-emerald-600',
  },
  {
    label: 'New Applicants',
    value: '148',
    detail: '8 new today',
    icon: HiOutlineUsers,
    tone: 'text-blue-700',
  },
  {
    label: 'Interviews',
    value: '12',
    detail: 'scheduled this week',
    icon: HiOutlineCalendar,
    tone: 'text-amber-600',
  },
];

const mapJobs = (jobs: Array<any>): DashboardJobItem[] =>
  jobs.map((job) => ({
    title: job.title,
    meta: `${job.location} • ${job.jobType}`,
    posted: `Posted ${new Date(job.createdAt).toLocaleDateString()}`,
    match: job.salaryRange || 'No salary listed',
    icon: HiOutlineBriefcase,
    tone: job.salaryRange ? 'bg-[#1f3f99] text-white' : 'bg-blue-50 text-[#1f3f99]',
    dot: 'bg-[#1f3f99]',
  }));

export default async function CompanyMyJobsPage() {
  return (
    <Suspense fallback={<CompanyMyJobsSkeleton />}>
      <CompanyMyJobsContent />
    </Suspense>
  );
}

async function CompanyMyJobsContent() {
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) {
    redirect('/dashboard/company');
  }

  const company = await Company.findById(companyId)
    .select('companyName email location')
    .lean();

  if (!company) {
    redirect('/dashboard/company');
  }

  const jobs = await Job.find({ companyId: companyId as any })
    .sort({ createdAt: -1 })
    .lean();

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
      topbar={<DashboardTopbar />}
    
    >
      <DashboardHero
        title="My Jobs"
        description="Review all job postings created by your company."
        action={{ label: 'Create New Job', href: '/dashboard/company/post-job' }}
      />

      <div className="mt-10">
        <JobPostingsPanel
          title="All Job Postings"
          jobs={mapJobs(jobs)}
          matchLabel="Salary"
        />
      </div>
    </DashboardShell>
  );
}

function CompanyMyJobsSkeleton() {
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
      topbar={<DashboardTopbar />}
   
    >
      <div className="space-y-6">
        <div className="h-14 rounded-2xl bg-slate-200" />
        <div className="h-130 rounded-3xl bg-slate-200" />
      </div>
    </DashboardShell>
  );
}
