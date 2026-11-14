import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'TypeMaster — Free Bilingual English & Khmer Typing Platform',
  description:
    'Improve typing speed and accuracy in English and Khmer with real-time feedback, guided practice, analytics, and multiplayer typing races.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] flex flex-col">{children}</main>
          <footer className="border-t border-border bg-surface/40 py-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
              <div>&copy; 2026 TypeMaster. Free &amp; Open Bilingual Typing Platform.</div>
              <div className="flex items-center gap-6">
                <span>English &amp; ភាសាខ្មែរ</span>
                <span>Accessibility Ready</span>
                <span>Server-Authoritative</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
