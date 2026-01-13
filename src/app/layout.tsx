import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ServiceWorker from '@/components/ServiceWorker';

export const metadata: Metadata = {
  title: 'Worth It',
  description: 'Track personal net worth across accounts, offline-first.',
  manifest: '/manifest.json',
  applicationName: 'Worth It',
  appleWebApp: {
    capable: true,
    title: 'Worth It',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f1217',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-white">
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
