import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://piar.example.gov.co';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/diligenciar',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
