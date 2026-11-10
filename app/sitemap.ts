import type { MetadataRoute } from 'next';
import { calculators } from '@/lib/calculators';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://araknet.tech';
  const pages = ['', '/loans', '/mortgage', '/business-finance', '/investment', '/about', '/contact', '/disclaimer', '/privacy', '/terms', ...calculators.map(({ slug }) => `/calculators/${slug}`)];
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/tools' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}
