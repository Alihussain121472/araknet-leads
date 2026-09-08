import { WebsiteStatus } from '../types';

export interface AuditResult {
  website_status: WebsiteStatus;
  has_app: boolean | null;
  ai_automation_potential: number;
  opportunity_score: number;
  opportunity_reason: string;
  suggested_services: string[];
}

// Vertical AI automation potential ratings (0-100)
const INDUSTRY_AUTOMATION_POTENTIAL: Record<string, { potential: number; services: string[] }> = {
  'Clinic & Healthcare': {
    potential: 95,
    services: ['24/7 AI Patient Booking Bot', 'Automated SMS Intake & Reminders', 'HIPAA-Compliant Patient Portal', 'Modern Responsive Website'],
  },
  'Dental Clinic': {
    potential: 95,
    services: ['Online Appointment Scheduler', 'No-Show Reduction SMS Sequences', 'Digital Smile Gallery Web App', 'AI Front-Desk Receptionist'],
  },
  'Restaurant': {
    potential: 90,
    services: ['Direct Zero-Commission Online Ordering', 'Interactive Mobile Digital Menu', 'Table Reservation Bot', 'SMS Loyalty Rewards System'],
  },
  'Salon & Wellness': {
    potential: 88,
    services: ['Real-Time Stylist Booking Engine', 'Deposit & Cancellation Automation', 'Instagram DM Booking Bot', 'Custom Mobile Web App'],
  },
  'Home Services': {
    potential: 92,
    services: ['Instant Emergency Quote Calculator', 'Dispatch Notification SMS Bot', 'High-Converting Local SEO Landing Page', 'Customer Review Generator'],
  },
  'Automotive': {
    potential: 84,
    services: ['Live Vehicle Repair Status Tracker', 'Online Service Estimator', 'Automated Scheduled Maintenance Reminders', 'Responsive Website'],
  },
  'Retail & Boutique': {
    potential: 78,
    services: ['Local E-Commerce Web Store', 'Click & Collect Portal', 'WhatsApp Customer Support Bot', 'Inventory Synchronization'],
  },
  'Legal & Financial': {
    potential: 86,
    services: ['Client Intake & Document Upload Portal', 'Automated Consultation Scheduler', 'AI Case Triage Assistant', 'Premium Corporate Website'],
  },
  'Fitness & Gym': {
    potential: 82,
    services: ['Class Scheduling & Waitlist System', 'Member Subscription Portal', 'Mobile Workout App', 'Automated Trial Pass Sequence'],
  },
  'Other': {
    potential: 70,
    services: ['Modern Fast-Loading Website', 'Lead Capture Funnel', 'AI Chatbot Assistant', 'Google Reviews Booster'],
  }
};

export function evaluateIndustry(industryName: string) {
  const normalized = industryName.toLowerCase().trim();
  const aliases: [RegExp, string][] = [
    [/dent/, 'Dental Clinic'], [/clinic|doctor|hospital|health|pharmacy/, 'Clinic & Healthcare'],
    [/restaurant|cafe|coffee|bakery|food/, 'Restaurant'], [/salon|hair|beauty|spa|wellness/, 'Salon & Wellness'],
    [/plumb|electric|roof|clean|carpenter|hvac|home service/, 'Home Services'], [/car|auto|tyre|mechanic/, 'Automotive'],
    [/law|legal|account|financ/, 'Legal & Financial'], [/fitness|gym|yoga/, 'Fitness & Gym'], [/shop|retail|boutique|store/, 'Retail & Boutique'],
  ];
  for (const [pattern, category] of aliases) if (pattern.test(normalized)) return INDUSTRY_AUTOMATION_POTENTIAL[category];
  if (!normalized) return INDUSTRY_AUTOMATION_POTENTIAL.Other;
  for (const [key, val] of Object.entries(INDUSTRY_AUTOMATION_POTENTIAL)) {
    if (industryName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industryName.toLowerCase())) {
      return val;
    }
  }
  return INDUSTRY_AUTOMATION_POTENTIAL['Other'];
}

export function auditAndScore(business: {
  business_name: string;
  industry: string;
  website_url?: string | null;
  google_rating?: number;
  google_reviews_count?: number;
}): AuditResult {
  const industryMeta = evaluateIndustry(business.industry);
  const aiPotential = industryMeta.potential;

  let website_status: WebsiteStatus = 'no_website';
  let websiteScore = 45; // Default: No website

  if (business.website_url && business.website_url.trim().length > 0) {
    const url = business.website_url.toLowerCase();
    
    // Heuristic analysis for outdated/free site builders
    const isOutdatedHost = 
      url.includes('tripod.') || 
      url.includes('wixsite.com') || 
      url.includes('weebly.com') || 
      url.includes('wordpress.com') || 
      url.includes('blogspot.com') ||
      url.includes('angelfire.');

    const isHttpOnly = url.startsWith('http://');

    if (isOutdatedHost || isHttpOnly) {
      website_status = 'outdated';
      websiteScore = 25;
    } else {
      website_status = 'active';
      websiteScore = 0; // Has a working modern domain
    }
  }

  // App heuristic (most local businesses don't have dedicated apps)
  const has_app = null;
  const appScore = 0; // No evidence of app presence: do not award points.

  // Industry weight (up to 25 points)
  const industryScore = Math.round((aiPotential / 100) * 25);

  // Reputation & Viability points (up to 15 points)
  // Businesses with established reviews have money to spend
  const reviews = business.google_reviews_count || 0;
  let reputationScore = 5;
  if (reviews >= 100) reputationScore = 15;
  else if (reviews >= 30) reputationScore = 10;

  // Composite Opportunity Score
  const opportunity_score = Math.min(100, websiteScore + appScore + industryScore + reputationScore);

  // Generate personalized sales pitch reason
  let reason = '';
  if (website_status === 'no_website') {
    reason = `${business.industry} listing with ${reviews > 0 ? `${reviews} customer reviews` : 'active local presence'} but no website listed by this directory (verify manually). Prime candidate for a modern web presence & booking system.`;
  } else if (website_status === 'outdated') {
    reason = `Website address suggests a possible modernization opportunity; manual audit required (${business.website_url}). Check usability and loading performance before suggesting changes.`;
  } else {
    reason = `Website is listed. Automation potential is an industry estimate; website quality, app presence and existing automation have not been verified.`;
  }

  // Select top 3 relevant services
  let services = [...industryMeta.services];
  if (website_status === 'no_website') {
    services = ['Modern Next.js Website', ...services.slice(0, 2)];
  }

  return {
    website_status,
    has_app,
    ai_automation_potential: aiPotential,
    opportunity_score,
    opportunity_reason: reason,
    suggested_services: services.slice(0, 3),
  };
}
