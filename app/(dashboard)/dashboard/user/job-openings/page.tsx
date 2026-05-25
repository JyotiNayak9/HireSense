import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HiOutlineBriefcase, HiOutlineCalendar, HiOutlineChartBar, HiOutlineClipboardList, HiOutlineAdjustments, HiOutlineUsers, HiOutlineViewGrid } from 'react-icons/hi';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCandidateSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Job from '@/database/Job.model';
import Company from '@/database/Company.model';
import Link from 'next/link';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Pipeline', icon: HiOutlineClipboardList },
  { label: 'Analysis', icon: HiOutlineChartBar },
  { label: 'Settings', icon: HiOutlineAdjustments },
];

export default async function JobOpeningsPage() {
  return (
    <Suspense fallback={<JobOpeningsSkeleton />}>
      <JobOpeningsContent />
    </Suspense>
  );
}

async function JobOpeningsContent() {
  const session = await requireCandidateSession();
  await initializeDatabase();

  const user = await User.findById(session.userId ?? session.accountId)
    .select('name email location')
    .lean<{
      name: string;
      email: string;
      location: string;
    }>();

  if (!user) {
    redirect('/login');
  }

  const jobs = await Job.find()
    .populate('companyId', 'companyName location industry')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title={user.name}
          items={sidebarItems}
          profile={{
            name: user.name,
            subtitle: 'User Account',
            initials: user.name.slice(0, 2).toUpperCase(),
          }}
        />
      }
      topbar={<DashboardTopbar />}
      footer={
        <DashboardFooter copyright="(c) 2026 HireSense . All rights reserved." />
      }
    >
      <DashboardHero
        title="Job Openings"
        description="Browse all available job opportunities from various companies."
      />

      <div className="mt-10">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No job openings available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Link
                key={job._id?.toString()}
                href={`/dashboard/user/job-openings/${job._id?.toString()}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {(job.companyId as any)?.companyName || 'Unknown Company'} • {(job.companyId as any)?.location || 'Location not specified'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {job.jobType}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      Posted {new Date(job.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-[120px]">
                    <div className="text-xs text-slate-500">
                      Deadline: {new Date(job.deadline || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function JobOpeningsSkeleton() {
  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Loading"
          items={sidebarItems}
          profile={{
            name: 'Loading',
            subtitle: 'User Account',
            initials: 'LD',
          }}
        />
      }
      topbar={<DashboardTopbar />}
      footer={
        <DashboardFooter copyright="(c) 2026 HireSense . All rights reserved." />
      }
    >
      <div className="animate-pulse">
        <div className="h-9 w-48 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
        <div className="mt-10 space-y-4">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
