import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import {
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineDatabase,
  HiOutlineCog,
} from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import EditCompanyProfileForm from '@/app/components/dashboard/EditCompanyProfileForm';
import CompanyLogoUploader from '@/app/components/dashboard/CompanyLogoUploader';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
  { label: 'Company Profile', icon: HiOutlineCog, href: '/dashboard/company/profile' },
];

export default function EditCompanyProfilePage() {
  return (
    <Suspense fallback={<EditProfileSkeleton />}>
      <EditProfileContent />
    </Suspense>
  );
}

async function EditProfileContent() {
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) {
    redirect('/login');
  }

  const company = await Company.findById(companyId)
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
    redirect('/login');
  }

  const companyProfile = {
    name: company.companyName,
    subtitle: 'Company Account',
    initials: company.companyName.slice(0, 2).toUpperCase(),
    logo: company.logo,
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profile</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Update your company information
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CompanyLogoUploader
            currentLogo={company.logo}
            companyName={company.companyName}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <EditCompanyProfileForm
            initialData={{
              companyName: company.companyName,
              location: company.location,
              industry: company.industry as 'Technology' | 'Finance' | 'Healthcare' | 'Retail' | 'Manufacturing' | 'Education' | 'Real Estate' | 'Entertainment' | 'Energy' | 'Telecommunications' | 'Other',
              description: company.description || '',
            }}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function EditProfileSkeleton() {
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
          <div className="mt-3 h-4 w-64 rounded bg-slate-200" />
        </div>
        <div className="mt-8 max-w-3xl">
          <div className="h-[400px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
