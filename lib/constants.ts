export const COUNTRIES_AND_CITIES: Record<string, string[]> = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
  'United States': [
    'Austin', 'Miami', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Dallas', 'Atlanta', 'Denver', 'Seattle', 'Orlando', 'Tampa', 'San Diego'
  ],
  'United Kingdom': [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Liverpool'
  ],
  'Canada': [
    'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'
  ],
  'Australia': [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'
  ],
  'United Arab Emirates': [
    'Dubai', 'Abu Dhabi', 'Sharjah'
  ],
  'Germany': [
    'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'
  ],
  'France': [
    'Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux'
  ],
};

export const INDUSTRIES = [
  'All',
  'Clinic & Healthcare',
  'Dental Clinic',
  'Restaurant',
  'Salon & Wellness',
  'Home Services',
  'Automotive',
  'Retail & Boutique',
  'Legal & Financial',
  'Fitness & Gym',
];

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'New Lead' },
  contacted: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Contacted' },
  proposal_sent: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Proposal Sent' },
  won: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Deal Won' },
  lost: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Lost' },
};

export const WEBSITE_STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  no_website: { bg: 'bg-rose-500/15', text: 'text-rose-400', label: 'Not listed' },
  outdated: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Review needed' },
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Listed' },
  unreachable: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Unreachable' },
};
