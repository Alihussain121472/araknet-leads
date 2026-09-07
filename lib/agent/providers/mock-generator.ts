import { RawBusiness } from './google-places';

const INDUSTRY_PRESETS: Record<string, string[]> = {
  'Clinic & Healthcare': ['Family Health Clinic', 'Downtown Dental Care', 'Holistic Physical Therapy', 'Metro Pediatrics', 'Apex Chiropractic'],
  'Restaurant': ['Trattoria Bella', 'Artisan Woodfire Grill', 'Golden Dragon Bistro', 'El Ranchero Taqueria', 'Harbor Seafood House'],
  'Salon & Wellness': ['Luxe Hair & Esthetics', 'Radiance Skin Bar', 'Zenith Massage Therapy', 'Velvet Lash & Brow Lounge', 'Urban Barber Co.'],
  'Automotive': ['Precision Auto Care & Collision', 'Midtown Transmission & Brake', 'Apex German Motors', 'Pro Lube & Tire Service', 'Speedy Collision Experts'],
  'Home Services': ['Heritage Plumbing & Drain', 'Superior Air & Heating', 'Evergreen Electrical Contractors', 'Peak Roofing & Gutters', 'Pioneer Handyman'],
  'Retail & Boutique': ['Main Street Florist & Gifts', 'Vintage Velvet Apparel', 'Urban Homestead Goods', 'Curated Bookshop & Coffee', 'Artisan Leather Co.'],
};

export function generateRealisticCandidates(params: {
  city: string;
  country: string;
  industry: string;
  limit?: number;
}): RawBusiness[] {
  const { city, country, industry, limit = 5 } = params;

  const targetIndustry = industry !== 'All' ? industry : 'Clinic & Healthcare';
  const names = INDUSTRY_PRESETS[targetIndustry] || ['Elite Professional Services', 'Metro Solution Experts', 'Downtown Specialist Center', 'Summit Group'];

  const results: RawBusiness[] = [];

  for (let i = 0; i < Math.min(limit, names.length); i++) {
    const name = `${names[i]} of ${city}`;
    const hasWebsite = Math.random() > 0.65; // ~35% have websites, ~65% do not or are outdated
    const isOutdated = hasWebsite && Math.random() > 0.5;

    let website: string | undefined = undefined;
    if (hasWebsite) {
      website = isOutdated 
        ? `http://${names[i].toLowerCase().replace(/[^a-z]/g, '')}-${city.toLowerCase()}.wixsite.com/site`
        : `https://${names[i].toLowerCase().replace(/[^a-z]/g, '')}${city.toLowerCase()}.com`;
    }

    results.push({
      name,
      address: `${100 + i * 42} Main St, ${city}, ${country}`,
      phone: `+1 (${Math.floor(200 + Math.random() * 700)}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      website,
      rating: +(4.3 + Math.random() * 0.6).toFixed(1),
      user_ratings_total: Math.floor(35 + Math.random() * 180),
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + city)}`,
      industry: targetIndustry,
    });
  }

  return results;
}
