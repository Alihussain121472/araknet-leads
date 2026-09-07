import { RawBusiness } from './google-places';
export async function searchOpenStreetMap(params: { city: string; country: string; industry: string; limit?: number }): Promise<RawBusiness[]> {
  const { city, country, industry, limit = 8 } = params;
  // Structured geocoding disambiguates cities with identical names across countries.
  const query = new URLSearchParams({ city, country, format: 'json', limit: '1' });
  const geocode = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, { headers: { 'User-Agent': 'AraknetLeads/1.0 (https://araknet.tech)' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!geocode.ok) throw new Error(`Location lookup failed (${geocode.status})`);
  const locations = await geocode.json();
  if (!locations[0]?.boundingbox) throw new Error('City could not be located in the selected country.');
  const [s,n,w,e] = locations[0].boundingbox.map(Number);
  if (![s,n,w,e].every(Number.isFinite)) throw new Error('Invalid location coordinates');
  const selectors: Record<string,string[]> = {
    'Restaurant': ['[amenity~"restaurant|cafe|fast_food"]'],
    'Clinic & Healthcare': ['[amenity~"clinic|doctors|hospital|dentist"]'],
    'Dental Clinic': ['[amenity=dentist]'],
    'Salon & Wellness': ['[shop~"hairdresser|beauty|massage"]'],
    'Retail & Boutique': ['[shop]'], 'Automotive': ['[shop~"car_repair|car|tyres"]'],
    'Home Services': ['[craft]'], 'Legal & Financial': ['[office~"lawyer|accountant|financial"]'],
    'Fitness & Gym': ['[leisure=fitness_centre]']
  };
  const filters = selectors[industry] || ['[amenity~"restaurant|cafe|clinic|dentist|pharmacy"]','[shop]','[craft]'];
  const q = `[out:json][timeout:20];(${filters.map(f=>`nwr${f}[name](${s},${w},${n},${e});`).join('')});out center 100;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: new URLSearchParams({ data: q }), cache: 'no-store', signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`OpenStreetMap search unavailable (${response.status}). Retry later or configure Google Places.`);
  const data = await response.json();
  if (data.remark) throw new Error('OpenStreetMap query timed out; try a smaller city or a specific industry.');
  return (data.elements || []).filter((el: any) => el.tags?.name).slice(0,limit).map((el: any) => {
    const t = el.tags;
    return { name: t.name, address: [t['addr:housenumber'],t['addr:street'],t['addr:city'] || city,country].filter(Boolean).join(' '), phone: t.phone || t['contact:phone'], website: t.website || t['contact:website'], industry: industry === 'All' ? t.amenity || t.shop || t.craft || 'Other' : industry, maps_url: `https://www.openstreetmap.org/${el.type}/${el.id}`, place_id: `osm-${el.type}-${el.id}` };
  });
}
