import type { ReactNode } from 'react';

interface DashboardShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function DashboardShell({
  sidebar,
  topbar,
  children,
  footer,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50/50 text-[#0f172a] antialiased">
      {/* 1. Global Horizontal Header Topbar */}
      <div className="z-30 w-full border-b border-slate-200 bg-white">
        {topbar}
      </div>

      {/* 2. Workspace Layout Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav Menu Container */}
        <div className="hidden md:block md:w-64 md:shrink-0 bg-white">
          {sidebar}
        </div>

        {/* Dynamic Canvas Area */}
        <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-10">
          <div className="mx-auto w-full max-w-5xl flex-1">
            {children}
          </div>
          
          {footer && (
            <div className="mt-12 border-t border-slate-200/60 pt-6">
              {footer}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}