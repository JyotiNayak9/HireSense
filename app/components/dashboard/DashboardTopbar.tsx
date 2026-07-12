import { HiOutlineBell, HiOutlineSearch, HiOutlineUser } from 'react-icons/hi';
import Image from 'next/image';
import logo from "../../../public/hiresense-logo.png";
import LogoutButton from './LogoutButton';
import type { DashboardProfile } from './types';

interface DashboardTopbarProps {
  profile?: DashboardProfile & { logo?: string };
}

export default function DashboardTopbar({ profile }: DashboardTopbarProps) {
  return (
    <header className="h-16 w-full border-b border-slate-200 bg-white  ">
      {/* Centered container to constrain contents and align perfectly with your dashboard canvas */}
      <div className="mx-auto flex h-full w-full items-center justify-between px-10 md:max-w-8xl">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#203f99]/10 p-2">
            <Image src={logo} alt="HireSense Logo" width={50} height={50} className="object-contain" />  
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1d3a91]">HireSense</span>
        </div>

        {/* Right: Dynamic Profile Actions */}
        {profile && (
          <div className="flex items-center gap-3.5">
            {/* Avatar Badge */}
            <div className="relative h-9 w-9 shrink-0">
              {profile.logo ? (
                <Image
                  src={profile.logo}
                  alt={profile.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#203f99] text-sm font-bold text-white shadow-sm shadow-blue-900/20">
                  {profile.initials}
                </div>
              )}
            </div>
            
            {/* Unified Typography Profile Text */}
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-bold text-slate-800">
                {profile.name}
              </p>
              <p className="truncate text-xs font-semibold text-slate-500 mt-0.5">
                {profile.subtitle}
              </p>
            </div>

            {/* Logout Action Button */}
            <div className="ml-1 shrink-0">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}