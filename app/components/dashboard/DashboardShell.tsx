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
    <main className="min-h-screen bg-[#f7f8fd] text-[#03173f] md:grid md:grid-cols-[256px_1fr]">
      {sidebar}
      <section className="min-w-0">
        {topbar}
        <div className="mx-auto max-w-[1120px] px-5 py-8 md:px-7">
          {children}
        </div>
        {footer}
      </section>
    </main>
  );
}
