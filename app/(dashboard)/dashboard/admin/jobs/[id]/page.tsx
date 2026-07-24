import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineClock,
} from 'react-icons/hi';
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

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <AdminJobDetailContent params={params} />
    </Suspense>
  );
}

async function AdminJobDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminSession();
  await initializeDatabase();

  const job = await Job.findById(id)
    .populate('companyId', 'companyName email location')
    .lean<{ _id: unknown; title: string; description: string; requiredSkills: string[]; salaryRange: string; jobType: string; deadline: Date; location: string; companyId: { _id: unknown; companyName: string; email: string; location: string }; createdAt: Date }>();

  if (!job) {
    notFound();
  }

  const applications = await Application.find({ jobId: id })
    .populate('userId', 'name email')
    .sort({ matchPercentage: -1 })
    .lean<{ _id: unknown; userId: { _id: unknown; name: string; email: string }; status: string; matchPercentage: number; createdAt: Date }[]>();

  const statusCounts = {
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewed: applications.filter((a) => a.status === 'reviewed').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

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
          href="/dashboard/admin/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#203f99] transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold text-slate-800">{job.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                <span>{job.companyId?.companyName || 'Unknown Company'}</span>
                <span className="flex items-center gap-1">
                  <HiOutlineLocationMarker className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {job.jobType}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1">
                    <HiOutlineCurrencyDollar className="h-4 w-4" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-[#203f99]/10 px-3 py-1 text-xs font-bold text-[#203f99]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-6 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendar className="h-4 w-4" />
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineClock className="h-4 w-4" />
              Deadline {new Date(job.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-4">
          {[
            { label: 'Pending', value: statusCounts.pending, color: 'bg-amber-100 text-amber-700' },
            { label: 'Reviewed', value: statusCounts.reviewed, color: 'bg-blue-100 text-blue-700' },
            { label: 'Shortlisted', value: statusCounts.shortlisted, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Rejected', value: statusCounts.rejected, color: 'bg-red-100 text-red-700' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
              <p className={`mt-2 text-2xl font-extrabold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">
            Applicants ({applications.length})
          </h2>
          {applications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={String(app._id)} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/dashboard/admin/users/${app.userId?._id ? String(app.userId._id) : '#'}`}
                      className="text-sm font-bold text-slate-800 hover:text-[#203f99] transition-colors"
                    >
                      {app.userId?.name || 'Unknown'}
                    </Link>
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
            <p className="text-sm text-slate-500">No applications received yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function JobDetailSkeleton() {
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
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" />
          ))}
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
