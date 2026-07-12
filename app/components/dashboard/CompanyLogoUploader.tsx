"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HiOutlineUser, HiOutlineCamera, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';

type CompanyLogoUploaderProps = {
  currentLogo?: string | null;
  companyName: string;
};

export default function CompanyLogoUploader({ currentLogo, companyName }: CompanyLogoUploaderProps) {
  const [logo, setLogo] = useState<string | null>(currentLogo || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || 'Failed to upload logo');
        return;
      }

      setLogo(data.data.logo);
      toast.success('Logo uploaded successfully');
      router.refresh();
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const res = await fetch('/api/company/logo', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || 'Failed to remove logo');
        return;
      }

      setLogo(null);
      toast.success('Logo removed');
      router.refresh();
    } catch {
      toast.error('Failed to remove logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative h-24 w-24 shrink-0">
        {logo ? (
          <Image
            src={logo}
            alt={`${companyName} logo`}
            fill
            className="rounded-full object-cover border-2 border-slate-200"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-200">
            <HiOutlineUser className="h-10 w-10 text-slate-400" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <p className="text-sm font-bold text-slate-800">Company Logo</p>
        <p className="text-xs font-medium text-slate-500">JPEG, PNG, WebP, or GIF. Max 5MB.</p>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-xl bg-[#203f99] px-4 py-2 text-xs font-bold text-white hover:bg-[#18317a] transition-colors disabled:opacity-50"
          >
            <HiOutlineCamera className="h-3.5 w-3.5" />
            {logo ? 'Change Photo' : 'Upload Photo'}
          </button>
          {logo && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <HiOutlineTrash className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
