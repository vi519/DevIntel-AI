import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compareo',
  description: 'AI-Powered Engineering Candidate Intelligence',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
          Built by Vineet — engineering candidate intelligence for hiring teams. <a href="/credits" className="font-semibold text-brand-700 hover:text-brand-800">Developer credit</a>
        </footer>
      </body>
    </html>
  );
}
