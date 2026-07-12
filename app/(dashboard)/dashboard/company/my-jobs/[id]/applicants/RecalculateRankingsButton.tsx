"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineRefresh } from 'react-icons/hi';

type RecalculateResponse = {
  success?: boolean;
  message?: string;
  data?: {
    total?: number;
    ranked?: number;
    failed?: number;
  };
};

export default function RecalculateRankingsButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function recalculateRankings() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/ranking/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const json = (await response.json().catch(() => ({}))) as RecalculateResponse;

      if (!response.ok) {
        setMessage(json.message || 'Unable to recalculate rankings.');
        return;
      }

      const total = json.data?.total ?? 0;
      const ranked = json.data?.ranked ?? 0;
      const failed = json.data?.failed ?? 0;
      setMessage(`Ranked ${ranked}/${total} applications${failed ? `, ${failed} failed` : ''}.`);
      router.refresh();
    } catch {
      setMessage('Unable to reach the ranking endpoint.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5 self-center">
      <button
        type="button"
        onClick={recalculateRankings}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#203f99] px-4 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#18317a] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
      >
        <HiOutlineRefresh className={`h-4 w-4 transition-transform ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Recalculating...' : 'Recalculate rankings'}
      </button>
      
      {message && (
        <div className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 shadow-sm whitespace-nowrap animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
}