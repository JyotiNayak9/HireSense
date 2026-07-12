"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { HiOutlineLogout } from 'react-icons/hi';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data?.message || 'Failed to logout');
      }
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-50"
      title="Log out"
      aria-label="Log out"
    >
      <HiOutlineLogout className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}