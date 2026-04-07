import type { MetadataRoute } from 'next';
import {
  APP_THEME_COLORS,
  SITE_DESCRIPTION,
  SITE_SHORT_NAME,
} from '@piar-digital-app/features/piar/content/site-branding';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PIAR Digital - Plan Individual de Ajustes Razonables',
    short_name: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: APP_THEME_COLORS.primary,
    background_color: APP_THEME_COLORS.surface,
    lang: 'es-CO',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
