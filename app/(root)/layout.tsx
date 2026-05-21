import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ToastProvider from "../components/layout/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireSense",
  description:
    "The future of precision hiring. HireSense uses advanced AI to rank candidates with frightening accuracy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Navbar/>
        <ToastProvider/>
        {children}
        <Footer/>
        </body>
        
    </html>
  );
}