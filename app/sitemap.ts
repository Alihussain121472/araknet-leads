import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://araknet.tech';
  const pages = ['', '/tools', '/tools/website-cost-calculator', '/tools/marketing-budget-calculator', '/tools/local-seo-checklist', '/privacy', '/terms'];
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/tools' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}
