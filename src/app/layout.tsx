/**
 * Root layout for the entire static export. Wraps every route with the
 * Tailwind body classes, the JSON-LD script for SEO, and the global
 * font configuration. Marks the document language as Spanish.
 */
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import {
  SITE_DESCRIPTION,
  SITE_SHORT_NAME,
  SITE_TITLE,
} from '@piar-digital-app/features/piar/content/site-branding';
import './globals.css';

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.test');

const headlineFont = localFont({
  src: './fonts/NotoSans-Regular.ttf',
  variable: '--font-headline',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const bodyFont = localFont({
  src: './fonts/NotoSans-Regular.ttf',
  variable: '--font-body',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_SHORT_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: SITE_SHORT_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        alt: `${SITE_SHORT_NAME} - Plan Individual de Ajustes Razonables`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

/** Applies the shared HTML shell for every page in the export. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO">
      <body className={`${headlineFont.variable} ${bodyFont.variable} typ-body min-h-screen bg-surface text-on-surface font-body`}>
        {children}
        {process.env.NODE_ENV === 'production' ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`,
            }}
          />
        ) : (
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}`,
            }}
          />
        )}
      </body>
    </html>
  );
}
