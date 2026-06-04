import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollegeScout — Discover Your Perfect College",
  description:
    "Search, compare, and find the perfect college in India. Get placement data, reviews, exam cutoffs, and personalized recommendations.",
  keywords:
    "college discovery, IIT, NIT, IIM, college comparison, placement data, exam predictor",
};

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-white"
            >
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.205 47.205 0 00-1.346-.808c-.393-.237-.623-.456-.623-.713v-.471a6.003 6.003 0 013.445-5.063z" />
              <path d="M7.5 16.72c-.116-.137-.323-.208-.552-.184a48.255 48.255 0 00-4.666 1.14.75.75 0 01-.826-.594 48.084 48.084 0 01-.168-1.735.75.75 0 01.465-.724 50.118 50.118 0 014.978-1.686c.24-.042.455.044.586.215v3.568z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">CollegeScout</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Colleges
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Compare
          </Link>
          <Link
            href="/predict"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Predictor
          </Link>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/" className="text-xs text-slate-400 hover:text-white">Colleges</Link>
          <Link href="/compare" className="text-xs text-slate-400 hover:text-white">Compare</Link>
          <Link href="/predict" className="text-xs text-slate-400 hover:text-white">Predict</Link>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="flex min-h-full flex-col bg-slate-950 font-[family-name:var(--font-inter)] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 bg-slate-950 py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
            <p>
              CollegeScout — College Discovery Platform • Backend Engineer
              Assignment
            </p>
            <p className="mt-1">
              Built with Next.js, TypeScript, PostgreSQL, Prisma, TailwindCSS
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
