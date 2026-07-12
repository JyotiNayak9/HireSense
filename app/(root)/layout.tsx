import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ToastProvider from "../components/layout/ToastProvider";
import { AuthModalProvider } from "../context/AuthModalContext";
import AuthModals from "../components/auth/AuthModals";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireSense | Precision AI Recruiting Platform",
  description:
    "HireSense uses advanced AI semantic analysis to rank candidate profiles with true precision, saving hundreds of screening hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-slate-950 min-h-screen flex flex-col">
        <AuthModalProvider>
          <Navbar />
          <ToastProvider />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <AuthModals />
        </AuthModalProvider>
      </body>
    </html>
  );
}