"use client"
import { redirect } from 'next/navigation';

import { useEffect, useState } from 'react';
import DashboardShell from '@/app/components/dashboard/DashboardShell';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar';
import DashboardFooter from '@/app/components/dashboard/DashboardFooter';
import type { DashboardNavItem } from '@/app/components/dashboard/types';
import { HiOutlineBriefcase, HiOutlineTrash, HiOutlineClipboardList, HiOutlineViewGrid } from 'react-icons/hi';
import { requireCandidateSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/initializeDatabase';
import User from '@/database/User.model';

type ResumeItem = {
  _id: string;
  fileUrl: string;
  createdAt: string;
  originalName?: string | null;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchResumes() {
    try {
      const res = await fetch('/api/resume');
      const json = await res.json();
      if (res.ok) setResumes(json.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  async function handleUpload() {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/resume', { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json();
          console.error('Upload failed', err);
        }
      }
      await fetchResumes();
    } finally {
      setLoading(false);
      setFiles(null);
    }
  }

  async function deleteResume(id: string) {
    if (!confirm('Delete this resume?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
      } else {
        const err = await res.json();
        console.error('Delete failed', err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const sidebarItems: DashboardNavItem[] = [
    { label: 'Dashboard', icon: HiOutlineViewGrid, href: '/dashboard/user' },
    { label: 'Job Openings', icon: HiOutlineBriefcase, href: '/dashboard/user/job-openings' },
    { label: 'Resumes', icon: HiOutlineClipboardList, href: '/dashboard/user/resumes' },
  ];
    // const session = await requireCandidateSession();
    // await initializeDatabase();
  
    // const user = await User.findById(session.userId ?? session.accountId)
    //   .select('name email location')
    //   .lean<{
    //     name: string;
    //     email: string;
    //     location: string;
    //   }>();
  
    // if (!user) {
    //   redirect('/login');
    // }
  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Resumes"
          items={sidebarItems}
          profile={{
            name: 'Candidate',
            subtitle: 'User Account',
            initials: 'CA',
          }}
        />
      }
      topbar={<DashboardTopbar />}
      footer={<DashboardFooter copyright="(c) 2026 HireSense . All rights reserved." />}
    >
      <div className="p-4">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold mb-3">Your Resumes</h2>
          <p className="text-sm text-slate-600 mb-4">Upload PDF or DOCX resumes. You can upload multiple files.</p>

          <div className="mb-4">
            <input type="file" accept=".pdf,.docx" multiple onChange={(e) => setFiles(e.target.files)} />
            <button onClick={handleUpload} disabled={loading} className="ml-3 rounded bg-navy text-white px-3 py-2">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          <div className="space-y-3">
            {resumes.length === 0 && <p className="text-sm text-slate-500">No resumes uploaded yet.</p>}
            {resumes.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded border p-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <a href={`/api/resume/serve/${r._id}`} target="_blank" rel="noreferrer" className="text-navy underline">View Resume</a>
                    <span className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-700 mt-1">{r.originalName ?? 'Untitled'}</div>
                </div>
                <div>
                  {/* <button onClick={() => deleteResume(r._id)} disabled={loading} className="text-red-600 hover:underline flex items-center gap-2">
                    <HiOutlineTrash />
                    <span>Delete</span>
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
