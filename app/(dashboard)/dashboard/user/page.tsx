import { redirect } from 'next/navigation';
import { requireCandidateSession } from '@/lib/auth';
import {
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineStar,
} from 'react-icons/hi';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardStatGrid from '@/app/components/dashboard/DashboardStatGrid';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import JobPostingsPanel from '@/app/components/dashboard/JobPostingsPanel';
import type {
  DashboardJobItem,
  DashboardNavItem,
  DashboardStat,
} from '@/app/components/dashboard/types';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Job from '@/database/Job.model';
import { getRecommendedJobsForCandidate } from '@/lib/ranking/recommendations';
import { Suspense } from 'react';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/user' },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Resumes', icon: HiOutlineClipboardList, href: '/dashboard/user/resumes' },
  { label: 'Applications', icon: HiOutlineChartBar, href: '/dashboard/user/applications' },
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

  const userId = (session.userId ?? session.accountId) as string;

  const user = await User.findById(userId)
    .select('name email location')
    .lean<{
      name: string;
      email: string;
      location: string;
    }>();

  // Guard execution early before running heavy aggregations or queries
  if (!user) {
    redirect('/login');
  }

  const [totalJobsCount, recommendations] = await Promise.all([
    Job.countDocuments(),
    getRecommendedJobsForCandidate(userId)
  ]);

  const topRecommendations = recommendations.slice(0, 6);

  const stats: DashboardStat[] = [
    {
      label: 'Active Jobs',
      value: totalJobsCount.toString(),
      detail: 'Apply Now',
      icon: HiOutlineBriefcase,
      tone: 'text-emerald-600',
    },
    {
      label: 'Recommended for You',
      value: recommendations.length.toString(),
      detail: 'Based on your profile matrix',
      icon: HiOutlineStar,
      tone: 'text-amber-600',
    },
  ];

  const dashboardJobs: DashboardJobItem[] = topRecommendations.map((job) => {
    const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
    
    return {
      title: job.title,
      meta: `${job.companyName || 'Unknown'} • ${job.location || 'Remote'} • ${job.jobType || 'Full-time'}`,
      posted: `Posted ${jobDate.toLocaleDateString()}`,
      match: `${job.matchScore}%`,
      icon: HiOutlineBriefcase,
      tone: job.matchScore >= 70 
        ? 'bg-emerald-100 text-emerald-700' 
        : job.matchScore >= 40 
          ? 'bg-amber-100 text-amber-700' 
          : 'bg-slate-100 text-slate-700',
      dot: job.matchScore >= 70 ? 'bg-emerald-500' : job.matchScore >= 40 ? 'bg-amber-500' : 'bg-slate-400',
      id: job.jobId,
      href: `/dashboard/user/job-openings/${job.jobId}`,
    };
  });

  const profileData = {
    name: user.name,
    subtitle: 'User Account',
    initials: user.name ? user.name.slice(0, 2).toUpperCase() : 'US',
  };

  return (
  <DashboardShell
    sidebar={
      <DashboardSidebar
        title={user.name}
        items={sidebarItems}
        profile={profileData}
      />
    }
    topbar={<DashboardTopbar profile={profileData} />}
  >
    <DashboardHero
      title={`Welcome back, ${user.name}`}
      description="Explore matching open data positions, evaluate processing queues, and track submission progress states."
    />

    <DashboardStatGrid stats={stats} />

    {/* CHANGED: Removed the rigid multi-column grid that forced everything to the left. 
        This div now allows the job postings panel to scale horizontally and fill the workspace. */}
    <div className="mt-10 w-full">
      <JobPostingsPanel 
        title="Recommended for You" 
        jobs={dashboardJobs} 
        matchLabel="Match Score" 
      />
    </div>
  </DashboardShell>
);
}
function UserDashboardSkeleton() {
  const mockProfile = {
    name: 'Loading Profile',
    subtitle: 'User Account',
    initials: 'HD',
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="User Space"
          items={sidebarItems}
          profile={mockProfile}
        />
      }
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse space-y-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="h-9 w-72 rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-12 w-full rounded-md bg-slate-200 md:w-44" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-32 rounded-lg border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-7 h-8 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_292px]">
          <div className="space-y-5">
            <div className="h-7 w-56 rounded bg-slate-200" />
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-lg border border-slate-200 bg-white p-4 shadow-xs"
                />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="h-7 w-44 rounded bg-slate-200" />
            <div className="h-80 rounded-lg border border-slate-200 bg-white shadow-xs" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
