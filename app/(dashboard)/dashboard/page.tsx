import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  redirect(
    session.accountType === 'company' ? '/dashboard/company' : '/dashboard/user'
  );
}
