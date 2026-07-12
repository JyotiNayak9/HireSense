import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineDatabase,
  HiOutlineCog,
  HiOutlinePencilAlt,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineUser,
} from 'react-icons/hi';
import Image from 'next/image';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
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

export default function CompanyProfilePage() {
  return (
    <Suspense fallback={<CompanyProfileSkeleton />}>
      <CompanyProfileContent />
    </Suspense>
  );
}

async function CompanyProfileContent() {
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

  const infoCards = [
    { label: 'Company Name', value: company.companyName, icon: HiOutlineBriefcase },
    { label: 'Email Address', value: company.email, icon: HiOutlineMail },
    { label: 'Location', value: company.location, icon: HiOutlineLocationMarker },
    { label: 'Industry', value: company.industry, icon: HiOutlineViewGrid },
  ];

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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Manage your company information and public profile
          </p>
        </div>
        <Link
          href="/dashboard/company/profile/edit"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#203f99] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition-all duration-200 hover:bg-[#18317a] active:scale-[0.98]"
        >
          <HiOutlinePencilAlt className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-6 pb-8 border-b border-slate-100">
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
          <h2 className="text-xl font-extrabold text-slate-900">{company.companyName}</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">{company.industry}</p>
          <p className="text-sm font-medium text-slate-500">{company.location}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] items-start">
        <div className="space-y-6">
          {infoCards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
              <HiOutlineDocumentText className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">About</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
            {company.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}

function CompanyProfileSkeleton() {
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
            <div className="h-9 w-56 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-slate-200" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-3xl bg-slate-200" />
            ))}
          </div>
          <div className="h-48 rounded-3xl bg-slate-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
