import { runDiscoveryAgent } from './lib/agent/discovery';

(async () => {
  try {
    const result = await runDiscoveryAgent({
      country: 'Pakistan',
      city: 'Rawalpindi',
      industry: 'Salon & Wellness',
      maxResults: 5
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
