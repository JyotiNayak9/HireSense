import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import {
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineViewGrid,
  HiOutlineDatabase,
} from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import EditCompanyJobForm from '@/app/components/dashboard/EditCompanyJobForm';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<EditJobSkeleton />}>
      <EditJobContent params={params} />
    </Suspense>
  );
}

async function EditJobContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) {
    redirect('/login');
  }

  const company = await Company.findById(companyId)
    .select('companyName email location description')
    .lean<{
      companyName: string;
      email: string;
      location: string;
      description: string;
    }>();

  if (!company) {
    redirect('/login');
  }

  const job = await Job.findById(id).lean();
  if (!job) {
    notFound();
  }

  if (job.companyId?.toString() !== companyId.toString()) {
    redirect('/dashboard/company/my-jobs');
  }

  const deadlineStr = job.deadline
    ? new Date(job.deadline).toISOString().split('T')[0]
    : '';

  const companyProfile = {
    name: company.companyName,
    subtitle: 'Company Account',
    initials: company.companyName.slice(0, 2).toUpperCase(),
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title={company.companyName}
          items={sidebarItems}
          profile={companyProfile}
        />
      }
      topbar={<DashboardTopbar profile={companyProfile} />}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Job</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Update the details for {job.title}
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <EditCompanyJobForm
            jobId={id}
            initialData={{
              title: job.title,
              jobType: job.jobType as "Full-time" | "Part-time" | "Remote" | "Internship",
              location: job.location,
              salaryRange: job.salaryRange || '',
              deadline: deadlineStr,
              description: job.description,
              requiredSkills: job.requiredSkills || [],
            }}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function EditJobSkeleton() {
  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Loading"
          items={sidebarItems}
          profile={{
            name: 'Loading',
            subtitle: 'Company Account',
            initials: 'LD',
          }}
        />
      }
      topbar={<DashboardTopbar />}
    >
      <div className="animate-pulse">
        <div className="pb-6 border-b border-slate-200">
          <div className="h-9 w-48 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
        </div>
        <div className="mt-8 max-w-3xl">
          <div className="h-[600px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
