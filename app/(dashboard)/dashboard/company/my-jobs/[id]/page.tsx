import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { 
  HiOutlineBriefcase, 
  HiOutlineCalendar, 
  HiOutlineClipboardList, 
  HiOutlineCog,
  HiOutlineViewGrid, 
  HiOutlineCurrencyDollar, 
  HiOutlineClock, 
  HiOutlineUsers, 
  HiOutlineDatabase,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { HiOutlineMapPin } from 'react-icons/hi2';
import Link from 'next/link';

import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';

import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';
import DeleteJobButton from '../../../../../components/dashboard/deletebutton';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

export default function CompanyJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CompanyJobDetailsSkeleton />}>
      <CompanyJobDetailsContent params={params} />
    </Suspense>
  );
}

async function CompanyJobDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;

  if (!companyId) {
    console.error('[COMPANY_JOB_DETAILS_ERROR] No companyId found in session:', session);
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

  const applicationCount = await Application.countDocuments({ jobId: id });

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
      {/* Restructured Header Zone: Combines Title Meta & Action Elements for horizontal balance */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {company.companyName} &bull; {job.location}
          </p>
        </div>
        {/* Buttons made larger (h-12) with enhanced hover visual transitions */}
        <div className="flex items-center gap-3 sm:w-auto w-full shrink-0">
          <Link
            href={`/dashboard/company/my-jobs/${job._id?.toString()}/edit`}
            className="group flex flex-1 md:flex-initial items-center justify-center gap-2 h-12 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 bg-white px-5 transition-all duration-200 shadow-sm hover:bg-[#203f99] hover:text-white hover:border-[#203f99] active:scale-[0.98]"
          >
            <HiOutlinePencilAlt className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            Edit Job
          </Link>
          <div className="flex-1 md:flex-initial h-12 w-30">
            <DeleteJobButton jobId={job._id?.toString() || ''} />
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Layout Split Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        
        {/* Left Column: Primary Content Information */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-5 pb-3 border-b border-slate-50">Job Description</h2>
            <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-5 pb-3 border-b border-slate-50">Required Skills Framework</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-xl bg-blue-50/70 px-3.5 py-1.5 text-xs font-bold text-[#203f99] tracking-wide border border-blue-100/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Parameter Meta Metadata Stack */}
        <div className="space-y-6">
          
          {/* Module 1: Core Job Detail Attributes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-5 tracking-tight">Job Details</h3>
            <div className="space-y-4">
              
              <div className="flex items-center gap-3.5 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#203f99] transition-colors">
                  <HiOutlineBriefcase className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Type</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{job.jobType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#203f99] transition-colors">
                  <HiOutlineMapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{job.location}</p>
                </div>
              </div>

              {job.salaryRange && (
                <div className="flex items-center gap-3.5 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#203f99] transition-colors">
                    <HiOutlineCurrencyDollar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary </p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{job.salaryRange}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3.5 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#203f99] transition-colors">
                  <HiOutlineClock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Application Deadline</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {new Date(job.deadline || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#203f99] transition-colors">
                  <HiOutlineCalendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Published</p>
                  <p className="text-sm font-bold text-slate-600 mt-0.5">
                    {new Date(job.createdAt || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Module 2: Dynamic Application Counter & Action Pipeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Applications</h3>
            <div className="flex items-center gap-4 mb-5 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#203f99]/10 text-[#203f99]">
                <HiOutlineUsers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 leading-none">{applicationCount}</p>
              </div>
            </div>
            
            <Link 
              href={`/dashboard/company/my-jobs/${job._id?.toString()}/applicants`} 
              className="w-full flex items-center justify-center h-11 rounded-xl bg-[#203f99] text-xs font-bold text-white hover:bg-[#18317a] transition-all shadow-sm active:scale-[0.99]"
            >
              View Applicants
            </Link>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}

function CompanyJobDetailsSkeleton() {
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
        <div className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div>
            <div className="h-9 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-xl bg-slate-200" />
            <div className="h-10 w-24 rounded-xl bg-slate-200" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="h-32 rounded-3xl bg-slate-200" />
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="h-32 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}