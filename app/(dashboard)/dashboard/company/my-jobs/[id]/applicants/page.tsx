import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import DashboardHero from '@/app/components/dashboard/DashboardHero';
import { HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineDatabase } from 'react-icons/hi';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { requireCompanySession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import Company from '@/database/Company.model';
import Job from '@/database/Job.model';
import Application from '@/database/Application.model';

const sidebarItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/company' },
  { label: 'Post Job', icon: HiOutlineClipboardList, href: '/dashboard/company/post-job' },
  { label: 'My Jobs', icon: HiOutlineDatabase, href: '/dashboard/company/my-jobs' },
];

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading applicants...</div>}>
      <ApplicantsContent id={id} />
    </Suspense>
  );
}

async function ApplicantsContent({ id }: { id: string }) {
  const session = await requireCompanySession();
  await initializeDatabase();

  const companyId = session.companyId || session.accountId;
  if (!companyId) redirect('/dashboard/company');

  const company = await Company.findById(companyId).select('companyName').lean();
  if (!company) redirect('/dashboard/company');

  const job = await Job.findById(id).lean();
  if (!job) redirect('/dashboard/company/my-jobs');

  if (String(job.companyId) !== String(companyId)) {
    redirect('/dashboard/company/my-jobs');
  }

  const applications = await Application.find({ jobId : id as any }).sort({ createdAt: -1 }).lean();

  return (
    <DashboardShell
      sidebar={<DashboardSidebar title={company.companyName} items={sidebarItems} profile={{ name: company.companyName, subtitle: 'Company Account', initials: company.companyName.slice(0,2).toUpperCase() }} />}
      topbar={<DashboardTopbar />}
      footer={<DashboardFooter copyright="(c) 2026 HireSense . All rights reserved." />}
    >
      <DashboardHero title={`Applicants for ${job.title}`} description="Review candidate applications for this job." />

      <div className="max-w-4xl p-6">
        {applications.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No applicants yet for this job.</div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div key={String(app._id)} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{app.name}</div>
                    <div className="text-sm text-slate-600">{app.email} • {app.phone}</div>
                    <div className="mt-2 text-sm text-slate-700">{app.experience}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(app.skills || []).map((s: string) => (
                        <span key={s} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* {app.resumeId && (
                      <a href={`/api/resume/serve/${app.resumeId}`} target="_blank" rel="noreferrer" className="text-navy underline">View Resume</a>
                    )} */}
                    <div className="text-xs text-slate-500 mt-2">Applied {new Date(app.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
