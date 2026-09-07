export interface RawBusiness {
  name: string; address?: string; phone?: string; website?: string; rating?: number;
  user_ratings_total?: number; maps_url?: string; industry?: string; place_id?: string;
}
export async function searchGooglePlaces(params: { city: string; country: string; industry: string; apiKey: string; limit?: number }): Promise<RawBusiness[]> {
  const { city, country, industry, apiKey, limit = 10 } = params;
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryTypeDisplayName' },
    body: JSON.stringify({ textQuery: `${industry === 'All' ? 'local businesses' : industry} in ${city}, ${country}`, pageSize: Math.min(limit,20) })
  });
  if (!response.ok) throw new Error(`Google Places request failed (${response.status}); check API access and billing.`);
  const data = await response.json();
  return (data.places || []).map((p: any) => ({ name: p.displayName?.text || 'Unnamed business', address: p.formattedAddress, phone: p.internationalPhoneNumber, website: p.websiteUri, rating: p.rating, user_ratings_total: p.userRatingCount, maps_url: p.googleMapsUri, industry: industry === 'All' ? p.primaryTypeDisplayName?.text || 'Other' : industry, place_id: p.id }));
}
