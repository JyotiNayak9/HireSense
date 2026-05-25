import { redirect } from 'next/navigation';
import { requireCandidateSession } from '@/lib/auth';
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
import Job from '@/database/Job.model';
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
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import { Suspense } from 'react';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Pipeline', icon: HiOutlineClipboardList },
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

const jobs: DashboardJobItem[] = [];

const activities: DashboardActivity[] = [
  {
    title: 'Alex Rivera ranked #1 for Frontend Dev.',
    time: '18 mins ago',
    dot: 'bg-[#0f3f8f]',
  },
  {
    title: 'Team Meeting scheduled for interviews.',
    time: '2 hrs ago',
    dot: 'bg-amber-400',
  },
  {
    title: 'New AI Score generated for Data Architect pool.',
    time: '4 hrs ago',
    dot: 'bg-[#0f3f8f]',
  },
  {
    title: 'Offer Extended to candidate ID #4492.',
    time: 'Yesterday',
    dot: 'bg-teal-600',
  },
];

export default async function UserDashboardPage() {
  return (
    <Suspense fallback={<UserDashboardSkeleton />}>
      <UserDashboardContent />
    </Suspense>
  );
}
async function UserDashboardContent() {
  const session = await requireCandidateSession();
  await initializeDatabase();
  const user = await User.findById(session.userId ?? session.accountId)
    .select('name email location')
    .lean<{
      name: string;
      email: string;
      location: string;
    }>();

  const recentJobs = await Job.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  if (!user) {
    redirect('/login');
  }

  const dashboardJobs: DashboardJobItem[] = recentJobs.map((job) => ({
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
            title={user.name}
            items={sidebarItems}
            profile={{
              name: user.name,
              subtitle: 'user Account',
              initials: user.name.slice(0, 2).toUpperCase(),
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
          title={"Welcome, " + user.name}
          description="Here's what's happening with your hiring pipeline today."
          action={{ label: 'Create New Job', icon: HiOutlinePlus }}
        />
  
        <DashboardStatGrid stats={stats} />
  
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_292px]">
          <JobPostingsPanel title="Active Job Postings" jobs={dashboardJobs} matchLabel="Salary" />
          <ActivityLogPanel title="Recent Activity" activities={activities} />
        </div>
      </DashboardShell>
    );
  }
  
  function UserDashboardSkeleton() {
    return (
      <DashboardShell
        sidebar={
          <DashboardSidebar
            title="Hiring Hub"
            items={sidebarItems}
            profile={{
              name: 'Loading',
              subtitle: 'user Account',
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
  

