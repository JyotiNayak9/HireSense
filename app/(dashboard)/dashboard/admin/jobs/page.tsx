import Link from 'next/link';
import { Suspense } from 'react';
import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineChevronRight,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import Company from '@/database/Company.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default async function AdminJobsPage() {
  return (
    <Suspense fallback={<JobsSkeleton />}>
      <AdminJobsContent />
    </Suspense>
  );
}

async function AdminJobsContent() {
  const session = await requireAdminSession();
  await initializeDatabase();

  const jobs = await Job.find()
    .populate('companyId', 'companyName')
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; title: string; companyId: { companyName: string }; location: string; jobType: string; salaryRange: string; createdAt: Date; deadline: Date }[]>();

  const jobIds = jobs.map((j) => j._id);
  const applicationCounts = jobIds.length > 0
    ? await Application.aggregate<{ _id: unknown; count: number }>([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } },
      ])
    : [];
  const appCountMap = new Map(applicationCounts.map((a) => [String(a._id), a.count]));

  const profileData = {
    name: 'Admin',
    subtitle: 'Administrator',
    initials: 'AD',
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar title="Admin Panel" items={sidebarItems} profile={profileData} />
      }
      topbar={<DashboardTopbar profile={profileData} />}
    >
      <DashboardHero
        title="Job Management"
        description="View all job postings across the platform."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 font-bold text-slate-700">Title</th>
                <th className="px-5 py-4 font-bold text-slate-700">Company</th>
                <th className="px-5 py-4 font-bold text-slate-700">Type</th>
                <th className="px-5 py-4 font-bold text-slate-700">Location</th>
                <th className="px-5 py-4 font-bold text-slate-700">Salary</th>
                <th className="px-5 py-4 font-bold text-slate-700">Applicants</th>
                <th className="px-5 py-4 font-bold text-slate-700">Posted</th>
                <th className="px-5 py-4 font-bold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={String(job._id)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-800">{job.title}</td>
                  <td className="px-5 py-4 text-slate-600">{job.companyId?.companyName || 'Unknown'}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {job.jobType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineLocationMarker className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{job.location}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineCurrencyDollar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{job.salaryRange || 'Not listed'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#203f99]">{appCountMap.get(String(job._id)) ?? 0}</span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/admin/jobs/${String(job._id)}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#203f99] transition-colors"
                    >
                      <HiOutlineChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineBriefcase className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-600">No jobs posted yet</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function JobsSkeleton() {
  const mockProfile = { name: 'Admin', subtitle: 'Administrator', initials: 'AD' };

  return (
    <DashboardShell
      sidebar={<DashboardSidebar title="Admin Panel" items={sidebarItems} profile={mockProfile} />}
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
