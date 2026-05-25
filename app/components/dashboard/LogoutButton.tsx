"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out');
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
      className="text-[12px] font-semibold text-red-600 hover:underline"
    >
      Logout
    </button>
  );
}
