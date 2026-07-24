import { Suspense } from 'react';
import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import Link from 'next/link';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardStatGrid from '@/app/components/dashboard/DashboardStatGrid';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import ActivityLogPanel from '@/app/components/dashboard/ActivityLogPanel';
import type {
  DashboardActivity,
  DashboardNavItem,
  DashboardStat,
} from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { ApprovalActions } from '@/app/components/dashboard/ApproveRejectButtons';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import User from '@/database/User.model';
import Company from '@/database/Company.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default async function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  const session = await requireAdminSession();
  await initializeDatabase();

  const [totalUsers, totalCompanies, totalJobs, totalApplications, pendingCompanies, recentApplications, recentJobs] =
    await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Company.find({ $or: [{ status: 'pending' }, { status: { $exists: false } }, { status: null }] })
        .select('companyName email industry location createdAt')
        .sort({ createdAt: -1 })
        .lean<{ _id: unknown; companyName: string; email: string; industry: string; location: string; createdAt: Date }[]>(),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .populate('jobId', 'title')
        .lean<{ _id: unknown; name: string; email: string; jobId: { title: string }; userId: { name: string; email: string }; status: string; createdAt: Date }[]>(),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('companyId', 'companyName')
        .lean<{ _id: unknown; title: string; companyId: { companyName: string }; location: string; jobType: string; createdAt: Date }[]>(),
    ]);

  const stats: DashboardStat[] = [
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      detail: 'Registered candidates',
      icon: HiOutlineUsers,
      tone: 'text-[#203f99]',
    },
    {
      label: 'Total Companies',
      value: totalCompanies.toString(),
      detail: 'Registered employers',
      icon: HiOutlineOfficeBuilding,
      tone: 'text-[#203f99]',
    },
    {
      label: 'Pending Approvals',
      value: pendingCompanies.length.toString(),
      detail: 'Awaiting review',
      icon: HiOutlineClipboardList,
      tone: pendingCompanies.length > 0 ? 'text-amber-600' : 'text-[#203f99]',
    },
    {
      label: 'Total Jobs',
      value: totalJobs.toString(),
      detail: 'Across all companies',
      icon: HiOutlineBriefcase,
      tone: 'text-[#203f99]',
    },
    {
      label: 'Total Applications',
      value: totalApplications.toString(),
      detail: 'Submitted by candidates',
      icon: HiOutlineClipboardList,
      tone: 'text-[#203f99]',
    },
  ];

  const activities: DashboardActivity[] = recentApplications.map((app) => ({
    title: `${app.userId?.name || 'Unknown'} applied for ${app.jobId?.title || 'Unknown Position'}`,
    time: new Date(app.createdAt).toLocaleDateString(),
    dot: app.status === 'pending' ? 'bg-amber-500' : app.status === 'shortlisted' ? 'bg-emerald-500' : 'bg-slate-400',
  }));

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
      <div className="space-y-8">
        <DashboardHero
          title="Admin Dashboard"
          description="Platform overview and management at a glance."
        />

        <DashboardStatGrid stats={stats} />

        {pendingCompanies.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-800 tracking-tight mb-4">
              Pending Company Approvals ({pendingCompanies.length})
            </h2>
            <div className="divide-y divide-amber-200">
              {pendingCompanies.map((company) => (
                <div key={String(company._id)} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/admin/companies/${String(company._id)}`} className="text-sm font-bold text-slate-800 hover:text-[#203f99] transition-colors">
                      {company.companyName}
                    </Link>
                    <p className="text-xs font-semibold text-slate-500">{company.email} • {company.industry} • {company.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ApprovalActions companyId={String(company._id)} />
                    <span className="text-xs text-slate-400">{new Date(company.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Recent Job Postings</h2>
            {recentJobs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <div key={String(job._id)} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{job.title}</p>
                      <p className="text-xs font-semibold text-slate-500">{job.companyId?.companyName || 'Unknown'} • {job.location}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No jobs posted yet.</p>
            )}
          </div>
          <ActivityLogPanel title="Recent Applications" activities={activities} actionLabel="View All Applications" />
        </div>
      </div>
    </DashboardShell>
  );
}

function AdminDashboardSkeleton() {
  const mockProfile = {
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
          profile={mockProfile}
        />
      }
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-8 w-64 rounded-xl bg-slate-200" />
            <div className="mt-3 h-4 w-80 rounded-xl bg-slate-200" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-5 h-7 w-14 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
