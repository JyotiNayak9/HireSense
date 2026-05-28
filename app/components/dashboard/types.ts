import type { IconType } from 'react-icons';

export interface DashboardNavItem {
  label: string;
  icon: IconType;
  href?: string;
  active?: boolean;
}

export interface DashboardProfile {
  name: string;
  subtitle: string;
  initials: string;
}

export interface DashboardAction {
  label: string;
  icon?: IconType;
  href?: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
  icon: IconType;
  tone?: string;
}

export interface DashboardJobItem {
  title: string;
  meta: string;
  posted: string;
  match: string;
  icon: IconType;
  tone?: string;
  dot?: string;
  id?: string;
  href?: string;
}

export interface DashboardActivity {
  title: string;
  time: string;
  dot?: string;
}
