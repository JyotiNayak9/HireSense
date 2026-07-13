import Link from 'next/link';
import type { DashboardNavItem } from './types';

interface DashboardSidebarProps {
  title: string;
  items: DashboardNavItem[];
  profile?: {
    name: string;
    subtitle?: string;
    initials?: string;
  };
}

export default function DashboardSidebar({
  title,
  items,
}: DashboardSidebarProps) {
  return (
    <aside className="w-full flex-col border-b border-slate-200 bg-white px-4 py-6 md:h-full md:w-64 md:border-b-0 md:border-r">
      
      {/* Category Header */}
      <div className="px-3 mb-5">
        <p className="text-lg font-bold uppercase tracking-wider text-slate-800">
          {title || "Recruitment"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5">
        {items.map(({ label, icon: Icon, active, href }) => {
          const className = `flex h-11 w-full items-center gap-3.5 rounded-xl px-4 text-left text-[15px] font-semibold transition-all duration-200 ease-out ${
            active
              ? 'bg-[#203f99] text-white shadow-md shadow-blue-950/10 translate-x-1'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900 hover:translate-x-1'
          }`;

          const content = (
            <>
              <Icon 
                className={`h-5 w-5 shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-700 group-hover:text-[#203f99] text-[15px]'
                }`} 
              />
              <span>{label}</span>
            </>
          );

          return href ? (
            <Link 
              key={label} 
              href={href} 
              className={`group ${className}`}
              aria-current={active ? 'page' : undefined}
            >
              {content}
            </Link>
          ) : (
            <button 
              key={label} 
              className={`group ${className}`} 
              type="button"
              aria-pressed={active}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}