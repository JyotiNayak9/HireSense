import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineMap,
} from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCandidateSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/user' },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Resumes', icon: HiOutlineClipboardList, href: '/dashboard/user/resumes' },
  { label: 'Applications', icon: HiOutlineChartBar, href: '/dashboard/user/applications' },
];

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CompanyDetailSkeleton />}>
      <CompanyDetailContent params={params} />
    </Suspense>
  );
}

async function CompanyDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await requireCandidateSession();
  await initializeDatabase();

  const user = await User.findById(session.userId ?? session.accountId)
    .select('name email location')
    .lean<{ name: string; email: string; location: string }>();

  if (!user) {
    redirect('/login');
  }

  const company = await Company.findById(id)
    .select('companyName email location industry description logo')
    .lean<{
      companyName: string;
      email: string;
      location: string;
      industry: string;
      description: string;
      logo?: string;      
    }>();

  if (!company) {
    notFound();
  }

  const jobs = await Job.find({ companyId: id as any})
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
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/dashboard/user/job-openings"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            &larr; Back to Job Openings
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 pb-8 border-b border-slate-100">
        <div className="relative h-20 w-20 shrink-0">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={`${company.companyName} logo`}
              fill
              className="rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-200">
              <HiOutlineUser className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Posted by
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">{company.companyName}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
            <span>{company.industry}</span>
            <span className="text-slate-300">&middot;</span>
            <span className="flex items-center gap-1">
              <HiOutlineMap className="h-4 w-4" />
              {company.location}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
            <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">
              {company.description || 'No description provided.'}
            </p>
          </div>

          {jobs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Open Positions ({jobs.length})
              </h2>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link
                    key={job._id?.toString()}
                    href={`/dashboard/user/job-openings/${job._id?.toString()}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-slate-900 truncate">{job.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {job.jobType}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {job.location}
                          </span>
                          {job.salaryRange && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              {job.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-slate-500">
                        <div>Deadline</div>
                        <div className="font-semibold text-slate-700">
                          {new Date(job.deadline || '').toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <p className="text-sm text-slate-500">No open positions at this time.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Company Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HiOutlineBriefcase className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Industry</p>
                  <p className="text-sm font-semibold text-slate-700">{company.industry}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HiOutlineLocationMarker className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-700">{company.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HiOutlineCalendar className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Jobs Posted</p>
                  <p className="text-sm font-semibold text-slate-700">{jobs.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function CompanyDetailSkeleton() {
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
    >
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-6 flex items-center gap-6 pb-8 border-b border-slate-100">
          <div className="h-20 w-20 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
