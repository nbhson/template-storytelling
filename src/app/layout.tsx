import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Root layout — dark, minimal, premium.
 *
 * The entire experience is client-driven; this server component only sets the
 * document shell, metadata and the initial background so there is never a
 * flash of wrong theme.
 */
export const metadata: Metadata = {
  title: 'MORPHIN — Thinking in Three Dimensions',
  description:
    'MORPHIN distills your data into a living core — a cinematic, scroll-driven intelligence that sees, learns and adapts.',
  keywords: ['morphin', 'ai', 'intelligence core', 'scroll experience'],
  openGraph: {
    title: 'MORPHIN — Thinking in Three Dimensions',
    description:
      'A single, continuous intelligence that sees, learns and adapts with every scroll.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MORPHIN — Thinking in Three Dimensions',
    description:
      'A single, continuous intelligence that sees, learns and adapts with every scroll.',
  },
};

export const viewport: Viewport = {
  themeColor: '#05060a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05060a] text-white antialiased overscroll-none">
        {children}
      </body>
    </html>
  );
}