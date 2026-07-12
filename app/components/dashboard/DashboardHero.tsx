import Link from 'next/link';
import type { ReactNode } from 'react';
import type { DashboardAction } from './types';

interface DashboardHeroProps {
  title: string;
  description: string | ReactNode;
  action?: DashboardAction;
}

export default function DashboardHero({
  title,
  description,
  action,
}: DashboardHeroProps) {
  const ActionIcon = action?.icon;

  const buttonContent = (
    <span className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#203f99] px-4 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition-all duration-200 hover:scale-[1.02] hover:bg-[#18317a] active:scale-[0.98] md:w-auto">
      {ActionIcon && <ActionIcon className="h-4 w-4" />}
      {action?.label}
    </span>
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-700 md:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-600">
          {description}
        </p>
      </div>
      {action && (
        <div className="shrink-0">
          {action.href ? (
            <Link href={action.href} className="block no-underline">
              {buttonContent}
            </Link>
          ) : (
            <button type="button" className="w-full md:w-auto block focus:outline-none">
              {buttonContent}
            </button>
          )}
        </div>
      )}
    </div>
  );
}