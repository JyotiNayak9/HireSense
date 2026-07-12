"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete job listing');
      }

      toast.success('Job posting successfully removed');
      router.push('/dashboard/company/my-jobs');
      router.refresh();
    } catch (err) {
      toast.error('Could not delete the position. Please try again.');
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        className="flex items-center justify-center gap-2 w-full rounded-xl text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 py-3 transition-all duration-150"
      >
        <HiOutlineTrash className="h-4 w-4" />
        Delete Job
      </button>

      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Delete Job</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={() => setIsConfirming(false)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}