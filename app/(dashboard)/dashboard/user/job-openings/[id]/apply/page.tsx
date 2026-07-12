import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HiOutlineBriefcase,HiOutlineChartBar, HiOutlineClipboardList, HiOutlineViewGrid } from 'react-icons/hi';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCandidateSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';
import Job from '@/database/Job.model';
import ApplicationForm from './Form';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/user' },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Resumes', icon: HiOutlineClipboardList, href: '/dashboard/user/resumes' },
  { label: 'Applications', icon: HiOutlineChartBar, href: '/dashboard/user/applications' },
];

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyContent params={params} />
    </Suspense>
  );
}

async function ApplyContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCandidateSession();
  await initializeDatabase();

  const user = await User.findById(session.userId ?? session.accountId)
    .select('name email phone')
    .lean<{
      name: string;
      email: string;
      phone?: string;
    }>();

  if (!user) {
    redirect('/login');
  }

  const job = await Job.findById(id).lean();
  if (!job) {
    redirect('/dashboard/user/job-openings');
  }

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
      footer={<DashboardFooter copyright="(c) 2026 HireSense . All rights reserved." />}
    >
      <DashboardHero title={`Apply: ${job?.title ?? 'Job'}`} description="Submit your application for this role." />
      <div className="max-w-3xl p-6">
        <ApplicationForm
          jobId={String(job?._id)}
          defaultName={user.name}
          defaultEmail={user.email}
          defaultPhone={user.phone || ''}
        />
      </div>
    </DashboardShell>
  );
}
