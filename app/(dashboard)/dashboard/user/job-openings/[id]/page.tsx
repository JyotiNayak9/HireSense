import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { HiOutlineBriefcase, HiOutlineCalendar, HiOutlineChartBar, HiOutlineClipboardList, HiOutlineAdjustments, HiOutlineViewGrid, HiOutlineCurrencyDollar, HiOutlineClock } from 'react-icons/hi';
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
import { HiOutlineMapPin } from 'react-icons/hi2';
import Link from 'next/link';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid,href: '/dashboard/user' },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Resumes', icon: HiOutlineClipboardList, href: '/dashboard/user/resumes' },
  { label: 'Applications', icon: HiOutlineChartBar, href: '/dashboard/user/applications' },
];

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<JobDetailsSkeleton />}>
      <JobDetailsContent params={params} />
    </Suspense>
  );
}

async function JobDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const job = await Job.findById(id)
    .populate('companyId', 'companyName location industry description')
    .lean();

  if (!job) {
    notFound();
  }

  const company = job.companyId as any;

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
      <DashboardHero
        title={job.title}
        description={
          <>
            <Link
              href={`/dashboard/user/companies/${company?._id || job.companyId}`}
              className="font-semibold text-[#203f99] hover:text-[#18317a] hover:underline"
            >
              {company?.companyName || 'Unknown Company'}
            </Link>
            &nbsp;&bull; {job.location}
          </>
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">About Company</h2>
            <p className="text-slate-700">{company?.description || 'No company description available.'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HiOutlineBriefcase className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Job Type</p>
                  <p className="text-sm text-slate-600">{job.jobType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                 <HiOutlineMapPin className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Location</p>
                  <p className="text-sm text-slate-600">{job.location}</p>
                </div>
              </div>
              {job.salaryRange && (
                <div className="flex items-start gap-3">
                  <HiOutlineCurrencyDollar className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Salary Range</p>
                    <p className="text-sm text-slate-600">{job.salaryRange}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <HiOutlineClock className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Application Deadline</p>
                  <p className="text-sm text-slate-600">
                    {new Date(job.deadline || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HiOutlineCalendar className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Posted On</p>
                  <p className="text-sm text-slate-600">
                    {new Date(job.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link href={`/dashboard/user/job-openings/${job._id?.toString()}/apply`} className="w-full block text-center rounded-xl bg-[#1f3f99] px-6 py-3 text-sm font-semibold text-white hover:bg-[#16307a] transition-colors">
            Apply Now
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

function JobDetailsSkeleton() {
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
        <div className="h-9 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-12 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
