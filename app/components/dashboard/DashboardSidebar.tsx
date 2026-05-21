import Link from 'next/link';
import type { DashboardNavItem, DashboardProfile } from './types';

interface DashboardSidebarProps {
  title: string;
  items: DashboardNavItem[];
  profile?: DashboardProfile;
}

export default function DashboardSidebar({
  title,
  items,
  profile,
}: DashboardSidebarProps) {
  return (
    <aside className="border-r border-slate-200 bg-[#eef3fb] px-5 py-7 md:min-h-screen">
      <div className="text-[22px] font-bold text-[#061b55]">{title}</div>

      <nav className="mt-10 space-y-3">
        {items.map(({ label, icon: Icon, active, href }) => {
          const className = `flex h-12 w-full items-center gap-4 rounded-lg px-4 text-left text-[13px] font-medium transition-colors ${
            active
              ? 'bg-[#203f99] text-white shadow-sm'
              : 'text-[#22355f] hover:bg-white'
          }`;

          const content = (
            <>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </>
          );

          return href ? (
            <Link key={label} href={href} className={className}>
              {content}
            </Link>
          ) : (
            <button key={label} className={className} type="button">
              {content}
            </button>
          );
        })}
      </nav>

      {profile && (
        <div className="mt-14 hidden border-t border-slate-300 pt-5 md:mt-[48vh] md:flex md:items-center md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[#203f99] shadow-sm">
            {profile.initials}
          </div>
          <div>
            <p className="text-[12px] font-bold leading-tight text-[#03173f]">
              {profile.name}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {profile.subtitle}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
