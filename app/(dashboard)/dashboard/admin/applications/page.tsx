import { Suspense } from 'react';
import Link from 'next/link';
import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineChevronRight,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Application from '@/database/Application.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default async function AdminApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsSkeleton />}>
      <AdminApplicationsContent />
    </Suspense>
  );
}

async function AdminApplicationsContent() {
  const session = await requireAdminSession();
  await initializeDatabase();

  const applications = await Application.find()
    .populate('userId', 'name email')
    .populate('jobId', 'title')
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; userId: { _id: unknown; name: string; email: string }; jobId: { _id: unknown; title: string }; status: string; matchPercentage: number; createdAt: Date }[]>();

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
        title="Application Management"
        description="View all job applications across the platform."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 font-bold text-slate-700">Candidate</th>
                <th className="px-5 py-4 font-bold text-slate-700">Email</th>
                <th className="px-5 py-4 font-bold text-slate-700">Position</th>
                <th className="px-5 py-4 font-bold text-slate-700">Match</th>
                <th className="px-5 py-4 font-bold text-slate-700">Status</th>
                <th className="px-5 py-4 font-bold text-slate-700">Applied</th>
                <th className="px-5 py-4 font-bold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={String(app._id)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#203f99] text-xs font-bold text-white">
                        {app.userId?.name?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <span className="font-bold text-slate-800">{app.userId?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{app.userId?.email || '—'}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/admin/jobs/${app.jobId?._id ? String(app.jobId._id) : '#'}`}
                      className="font-semibold text-[#203f99] hover:underline"
                    >
                      {app.jobId?.title || 'Unknown Position'}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            app.matchPercentage >= 70 ? 'bg-emerald-500' :
                            app.matchPercentage >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${app.matchPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{app.matchPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/admin/users/${app.userId?._id ? String(app.userId._id) : '#'}`}
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
        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineClipboardList className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-600">No applications submitted yet</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function ApplicationsSkeleton() {
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
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
