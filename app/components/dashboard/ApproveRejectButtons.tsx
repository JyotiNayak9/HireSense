'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export function ApprovalActions({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = useCallback(async (action: 'approve' | 'reject') => {
    if (loading) return;
    setLoading(action);

    try {
      const res = await fetch('/api/admin/approve-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || `Failed to ${action}`);
        setLoading(null);
        return;
      }

      toast.success(data.message || `Company ${action}d`);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setLoading(null);
    }
  }, [companyId, loading]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'approve' ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        ) : (
          <HiOutlineCheckCircle className="h-4 w-4" />
        )}
        {loading === 'approve' ? 'Approving...' : 'Approve'}
      </button>
      <button
        type="button"
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'reject' ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
        ) : (
          <HiOutlineXCircle className="h-4 w-4" />
        )}
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  );
}
