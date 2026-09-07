import { RawBusiness } from './google-places';

export async function searchSerpApi(params: {
  city: string;
  country: string;
  industry: string;
  apiKey: string;
  limit?: number;
}): Promise<RawBusiness[]> {
  const { city, country, industry, apiKey, limit = 10 } = params;
  const q = encodeURIComponent(`${industry !== 'All' ? industry : 'local businesses'} in ${city}, ${country}`);
  
  const url = `https://serpapi.com/search.json?engine=google_maps&q=${q}&api_key=${apiKey}&hl=en`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SerpAPI error status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const places = data.local_results || [];

  return places.slice(0, limit).map((p: any) => ({
    name: p.title,
    address: p.address,
    phone: p.phone,
    website: p.website,
    rating: p.rating,
    user_ratings_total: p.reviews,
    maps_url: p.link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.title + ' ' + (p.address || ''))}`,
    industry: p.type || industry,
    place_id: p.place_id,
  }));
}
