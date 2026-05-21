import type { DashboardAction } from './types';

interface DashboardHeroProps {
  title: string;
  description: string;
  action?: DashboardAction;
}

export default function DashboardHero({
  title,
  description,
  action,
}: DashboardHeroProps) {
  const ActionIcon = action?.icon;

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#00143f]">
          {title}
        </h1>
        <p className="mt-1 text-[14px] text-[#25385f]">{description}</p>
      </div>
      {action && (
        <button
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#082d78] px-5 text-[12px] font-bold uppercase text-white shadow-sm transition hover:bg-[#061f55] md:w-auto"
          type="button"
        >
          {ActionIcon && <ActionIcon className="h-5 w-5" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
