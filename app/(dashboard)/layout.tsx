import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import ToastProvider from '../components/layout/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HireSense Dashboard',
  description: 'Company dashboard for HireSense hiring workflows.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
