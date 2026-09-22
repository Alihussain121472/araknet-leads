import { RawBusiness } from './google-places';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const OSM_HEADERS = {
  'User-Agent': 'AraknetLeads/1.0 (https://araknet.tech; info@araknet.tech)',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

export async function searchOpenStreetMap(params: {
  city: string;
  country: string;
  industry: string;
  limit?: number;
}): Promise<RawBusiness[]> {
  const { city, country, industry, limit = 8 } = params;

  // 1. Structured geocoding to retrieve bounding box
  let boundingBox: [number, number, number, number] | null = null;
  try {
    const query = new URLSearchParams({
      city,
      country,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });
    const geocode = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
      headers: { 'User-Agent': OSM_HEADERS['User-Agent'], Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (geocode.ok) {
      const locations = await geocode.json();
      if (locations[0]?.boundingbox) {
        const [s, n, w, e] = locations[0].boundingbox.map(Number);
        if ([s, n, w, e].every(Number.isFinite)) {
          boundingBox = [s, n, w, e];
        }
      }
    }
  } catch (err) {
    console.warn('[OSM Geocoding warning]:', err);
  }

  // 2. Try Overpass API endpoints if bounding box was found
  if (boundingBox) {
    const [s, n, w, e] = boundingBox;
    const selectors: Record<string, string[]> = {
      Restaurant: ['[amenity~"restaurant|cafe|fast_food"]'],
      'Clinic & Healthcare': ['[amenity~"clinic|doctors|hospital|dentist"]'],
      'Dental Clinic': ['[amenity=dentist]'],
      'Salon & Wellness': ['[shop~"hairdresser|beauty|massage"]'],
      'Retail & Boutique': ['[shop]'],
      Automotive: ['[shop~"car_repair|car|tyres"]'],
      'Home Services': ['[craft]'],
      'Legal & Financial': ['[office~"lawyer|accountant|financial"]'],
      'Fitness & Gym': ['[leisure=fitness_centre]'],
    };

    const filters = selectors[industry] || ['[amenity~"restaurant|cafe|clinic|dentist|pharmacy"]', '[shop]', '[craft]'];
    const q = `[out:json][timeout:15];(${filters.map((f) => `nwr${f}[name](${s},${w},${n},${e});`).join('')});out center 60;`;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: OSM_HEADERS,
          body: new URLSearchParams({ data: q }),
          cache: 'no-store',
          signal: AbortSignal.timeout(18000),
        });

        if (response.ok) {
          const data = await response.json();
          const elements = (data.elements || []).filter((el: any) => el.tags?.name);
          if (elements.length > 0) {
            return elements.slice(0, limit).map((el: any) => {
              const t = el.tags;
              return {
                name: t.name,
                address: [t['addr:housenumber'], t['addr:street'], t['addr:city'] || city, country].filter(Boolean).join(' '),
                phone: t.phone || t['contact:phone'],
                website: t.website || t['contact:website'],
                industry: industry === 'All' ? t.amenity || t.shop || t.craft || 'Other' : industry,
                maps_url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
                place_id: `osm-${el.type}-${el.id}`,
              };
            });
          }
        }
      } catch (endpointErr) {
        console.warn(`[Overpass mirror ${endpoint} failed]:`, endpointErr);
      }
    }
  }

  // 3. Fallback to direct Nominatim POI search (does not rely on Overpass)
  try {
    const searchParam = industry === 'All' ? 'businesses' : industry;
    const nominatimSearchUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: `${searchParam} in ${city}, ${country}`,
      format: 'json',
      addressdetails: '1',
      extratags: '1',
      limit: String(Math.max(limit * 2, 15)),
    })}`;

    const nomRes = await fetch(nominatimSearchUrl, {
      headers: {
        'User-Agent': OSM_HEADERS['User-Agent'],
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (nomRes.ok) {
      const places = await nomRes.json();
      const validPlaces = (places || []).filter((p: any) => p.name || p.display_name);
      if (validPlaces.length > 0) {
        return validPlaces.slice(0, limit).map((p: any, idx: number) => {
          const rawName = p.name || (p.display_name ? p.display_name.split(',')[0] : `Local Business ${idx + 1}`);
          const tags = p.extratags || {};
          return {
            name: rawName.trim(),
            address: p.display_name || `${city}, ${country}`,
            phone: tags.phone || tags['contact:phone'] || undefined,
            website: tags.website || tags['contact:website'] || undefined,
            industry: industry === 'All' ? p.type || p.category || 'Local Business' : industry,
            maps_url: p.osm_type && p.osm_id ? `https://www.openstreetmap.org/${p.osm_type}/${p.osm_id}` : undefined,
            place_id: `osm-nom-${p.osm_id || idx + 1}`,
          };
        });
      }
    }
  } catch (nomErr) {
    console.warn('[Nominatim POI search fallback failed]:', nomErr);
  }

  // If all attempts fail or return nothing, return an empty array
  // We no longer generate synthetic businesses.
  return [];
}
