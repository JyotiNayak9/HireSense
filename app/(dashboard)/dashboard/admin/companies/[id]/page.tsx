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
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import { ApprovalActions } from '@/app/components/dashboard/ApproveRejectButtons';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CompanyDetailSkeleton />}>
      <AdminCompanyDetailContent params={params} />
    </Suspense>
  );
}

async function AdminCompanyDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminSession();
  await initializeDatabase();

  const company = await Company.findById(id)
    .select('companyName email location industry description isVerified status createdAt')
    .lean<{ _id: unknown; companyName: string; email: string; location: string; industry: string; description: string; isVerified: boolean; status: string; createdAt: Date }>();

  if (!company) {
    notFound();
  }

  const jobs = await Job.find({ companyId: id as any })
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; title: string; jobType: string; location: string; salaryRange: string; createdAt: Date }[]>();

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
      <div className="space-y-8">
        <Link
          href="/dashboard/admin/companies"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#203f99] transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#203f99] text-xl font-bold text-white">
              {company.companyName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-800">{company.companyName}</h1>
                {company.status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <HiOutlineCheckCircle className="h-4 w-4" />
                    Approved
                  </span>
                ) : company.status === 'rejected' ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    <HiOutlineXCircle className="h-4 w-4" />
                    Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <HiOutlineClock className="h-4 w-4" />
                    Pending
                  </span>
                )}
              </div>
              {company.status === 'pending' && (
                <div className="mt-4 flex items-center gap-3">
                  <ApprovalActions companyId={String(company._id)} />
                </div>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <HiOutlineMail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{company.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineLocationMarker className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{company.location}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="rounded-md bg-[#203f99]/10 px-2 py-0.5 text-xs font-bold text-[#203f99]">
                  {company.industry}
                </span>
              </div>
            </div>
          </div>

          {company.description && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{company.description}</p>
            </div>
          )}

          <p className="mt-6 text-xs font-semibold text-slate-400">
            Joined {new Date(company.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">
            Job Postings ({jobs.length})
          </h2>
          {jobs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={String(job._id)} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/admin/jobs/${String(job._id)}`}
                      className="text-sm font-bold text-slate-800 hover:text-[#203f99] transition-colors"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-0.5 text-xs font-semibold text-slate-500">
                      <span>{job.jobType}</span>
                      <span>{job.location}</span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1">
                          <HiOutlineCurrencyDollar className="h-3.5 w-3.5" />
                          {job.salaryRange}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs font-bold text-[#203f99]">
                      {appCountMap.get(String(job._id)) ?? 0} applicants
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No jobs posted yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function CompanyDetailSkeleton() {
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
