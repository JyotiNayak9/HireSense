import Link from 'next/link';
import { Suspense } from 'react';
import { HiOutlineBriefcase, HiOutlineCalendar, HiOutlineChartBar, HiOutlineViewGrid } from 'react-icons/hi';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCandidateSession } from '@/lib/auth';
import ApplicationsInner from './ApplicationsInner';
import User from '@/database/User.model';
import { redirect } from 'next/navigation';

import { initializeDatabase } from '@/lib/initializeDatabase';


const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/user' },
  { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
  { label: 'Resumes', icon: HiOutlineCalendar, href: '/dashboard/user/resumes' },
  { label: 'Applications', icon: HiOutlineChartBar, href: '/dashboard/user/applications' },
];

export default function ApplicationHistoryPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl p-6">Loading application history...</div>}>
      <ApplicationHistoryContent />
    </Suspense>
  );
}

async function ApplicationHistoryContent() {
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
      <DashboardHero
        title="Application History"
        description="Track your submitted applications, status, and job details in one place."
      />

      <Suspense fallback={<div className="max-w-5xl p-6">Loading applications...</div>}>
        <ApplicationsInner userId={session.userId ?? session.accountId} />
      </Suspense>
    </DashboardShell>
  );
}
