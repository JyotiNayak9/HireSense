'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'rejected'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  reviewed: 'bg-blue-50 border-blue-200 text-blue-700',
  shortlisted: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  rejected: 'bg-rose-50 border-rose-200 text-rose-700',
};

interface UpdateApplicationStatusProps {
  applicationId: string;
  currentStatus: string;
}

export default function UpdateApplicationStatus({
  applicationId,
  currentStatus,
}: UpdateApplicationStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/application/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Application Status</h4>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={loading}
          className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#203f99]/30 disabled:opacity-60 ${
            STATUS_STYLES[status] || 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {loading && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#203f99] border-t-transparent" />
        )}
      </div>
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
