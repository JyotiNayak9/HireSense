import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineArrowLeft,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineAcademicCap,
  HiOutlineStar,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Application from '@/database/Application.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<UserDetailSkeleton />}>
      <AdminUserDetailContent params={params} />
    </Suspense>
  );
}

async function AdminUserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminSession();
  await initializeDatabase();

  const user = await User.findById(id)
    .select('name email phone skills education experience isVerified createdAt')
    .lean<{ _id: unknown; name: string; email: string; phone: string; skills: string[]; education: string; experience: string; isVerified: boolean; createdAt: Date }>();

  if (!user) {
    notFound();
  }

  const applications = await Application.find({ userId: id })
    .populate('jobId', 'title')
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; jobId: { title: string }; status: string; matchPercentage: number; createdAt: Date }[]>();

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
      <div className="space-y-8">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#203f99] transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#203f99] text-xl font-bold text-white">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-800">{user.name}</h1>
                {user.isVerified ? (
                  <HiOutlineCheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                  <HiOutlineXCircle className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <HiOutlineMail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <HiOutlinePhone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {user.education && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <HiOutlineAcademicCap className="h-4 w-4" />
                  Education
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">{user.education}</p>
              </div>
            )}
            {user.experience && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <HiOutlineStar className="h-4 w-4" />
                  Experience
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">{user.experience}</p>
              </div>
            )}
          </div>

          {user.skills && user.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-[#203f99]/10 px-3 py-1 text-xs font-bold text-[#203f99]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs font-semibold text-slate-400">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Applications ({applications.length})</h2>
          {applications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={String(app._id)} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{app.jobId?.title || 'Unknown Position'}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{app.matchPercentage}% match</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No applications submitted yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function UserDetailSkeleton() {
  const mockProfile = { name: 'Admin', subtitle: 'Administrator', initials: 'AD' };

  return (
    <DashboardShell
      sidebar={<DashboardSidebar title="Admin Panel" items={sidebarItems} profile={mockProfile} />}
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-48 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-48 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
