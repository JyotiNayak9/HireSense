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
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireAdminSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import { ApprovalActions } from '@/app/components/dashboard/ApproveRejectButtons';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/admin' },
  { label: 'Users', icon: HiOutlineUsers, href: '/dashboard/admin/users' },
  { label: 'Companies', icon: HiOutlineOfficeBuilding, href: '/dashboard/admin/companies' },
  { label: 'Approvals', icon: HiOutlineClock, href: '/dashboard/admin/companies' },
  { label: 'Jobs', icon: HiOutlineBriefcase, href: '/dashboard/admin/jobs' },
  { label: 'Applications', icon: HiOutlineClipboardList, href: '/dashboard/admin/applications' },
];

export default async function AdminCompaniesPage() {
  return (
    <Suspense fallback={<CompaniesSkeleton />}>
      <AdminCompaniesContent />
    </Suspense>
  );
}

async function AdminCompaniesContent() {
  const session = await requireAdminSession();
  await initializeDatabase();

  const companies = await Company.find()
    .select('companyName email location industry isVerified status createdAt')
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; companyName: string; email: string; location: string; industry: string; isVerified: boolean; status: string; createdAt: Date }[]>();

  const companyIds = companies.map((c) => String(c._id));
  const jobCounts = await Job.aggregate<{ _id: string; count: number }>([
    { $match: { companyId: { $in: companyIds.map((id) => id as any) } } },
    { $group: { _id: '$companyId', count: { $sum: 1 } } },
  ]);
  const jobCountMap = new Map(jobCounts.map((j) => [String(j._id), j.count]));

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
        title="Company Management"
        description="View and manage all registered company accounts."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 font-bold text-slate-700">Company</th>
                <th className="px-5 py-4 font-bold text-slate-700">Email</th>
                <th className="px-5 py-4 font-bold text-slate-700">Industry</th>
                <th className="px-5 py-4 font-bold text-slate-700">Location</th>
                <th className="px-5 py-4 font-bold text-slate-700">Jobs</th>
                <th className="px-5 py-4 font-bold text-slate-700">Status</th>
                <th className="px-5 py-4 font-bold text-slate-700">Joined</th>
                <th className="px-5 py-4 font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={String(company._id)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#203f99] text-xs font-bold text-white">
                        {company.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineMail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{company.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {company.industry}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineLocationMarker className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{company.location}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#203f99]">{jobCountMap.get(String(company._id)) ?? 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    {company.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                        Approved
                      </span>
                    ) : company.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        <HiOutlineXCircle className="h-3.5 w-3.5" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        <HiOutlineClock className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {(!company.status || company.status === 'pending') && (
                        <>
                          <ApprovalActions companyId={String(company._id)} />
                        </>
                      )}
                      <Link
                        href={`/dashboard/admin/companies/${String(company._id)}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#203f99] transition-colors"
                      >
                        <HiOutlineChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {companies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineOfficeBuilding className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-600">No companies registered yet</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function CompaniesSkeleton() {
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
