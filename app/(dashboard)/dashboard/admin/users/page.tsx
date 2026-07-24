import Link from 'next/link';
import { Suspense } from 'react';
import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineChevronRight,
  HiOutlineMail,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default async function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}

async function AdminUsersContent() {
  const session = await requireAdminSession();
  await initializeDatabase();

  const users = await User.find()
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; name: string; email: string; createdAt: Date }[]>();

  const profileData = {
    name: 'Admin',
    subtitle: 'Administrator',
    initials: 'AD',
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Admin Panel"
          items={sidebarItems}
          profile={profileData}
        />
      }
      topbar={<DashboardTopbar profile={profileData} />}
    >
      <DashboardHero
        title="User Management"
        description="View and manage all registered candidate accounts."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 font-bold text-slate-700">Name</th>
                <th className="px-5 py-4 font-bold text-slate-700">Email</th>
                <th className="px-5 py-4 font-bold text-slate-700">Joined</th>
                <th className="px-5 py-4 font-bold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={String(user._id)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#203f99] text-xs font-bold text-white">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineMail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/admin/users/${String(user._id)}`}
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
        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineUsers className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-600">No users registered yet</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function UsersSkeleton() {
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
