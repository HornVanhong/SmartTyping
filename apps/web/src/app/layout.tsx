import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TypeMaster — Free Bilingual English & Khmer Typing Practice',
  description: 'Improve your typing speed and accuracy in English and Khmer with real-time feedback, guided practice, and multiplayer typing races.',
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
        <header className="border-b border-border bg-surface/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-background text-lg shadow-sm">
                T
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-foreground">TypeMaster</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-elevated text-muted border border-border">
                  Bilingual EN/KM
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-4 text-sm font-medium">
              <a href="#test" className="text-foreground hover:text-primary transition-colors">
                Play
              </a>
              <span className="text-muted/40">|</span>
              <span className="text-muted text-xs bg-elevated px-2.5 py-1 rounded-md border border-border">
                Guest Mode
              </span>
            </nav>
          </div>
        </header>

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
      </body>
    </html>
  );
}
