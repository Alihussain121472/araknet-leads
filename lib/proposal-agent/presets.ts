import { ProposalInput } from './types';

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  input: ProposalInput;
}

export const PRESETS: Record<string, PresetScenario> = {
  '1': {
    id: '1',
    title: 'Full-Stack AI SaaS Developer (Upwork)',
    description: 'High-value Upwork project integrating AI agent workflows into Next.js & Supabase.',
    input: {
      platform: 'Upwork',
      job_description:
        'We need a senior full-stack developer to integrate an AI agent workflow into our existing Next.js 14 and Supabase web app. ' +
        'Our customers want to upload PDF contracts and have the agent automatically summarize clauses, extract risk scores, and highlight anomalies. ' +
        'The current bottleneck is that large documents cause timeouts on Vercel serverless functions, and chunking sometimes loses cross-page context. ' +
        'Must be experienced with streaming responses, vector embeddings (pgvector), and background task queues. ' +
        'Looking to start immediately. Budget is $4,000 - $6,000 for the full milestone.',
      freelancer_profile:
        'Senior Full-Stack & AI Systems Engineer with 7 years of production TypeScript/Python experience. ' +
        'Specialized in Next.js, FastAPI, pgvector, LangChain/LlamaIndex, and asynchronous streaming architectures.',
      relevant_experience:
        'Recently built an enterprise document parsing pipeline for a legal-tech SaaS that handled 150-page PDFs with zero serverless timeouts using Redis queues and chunk-level metadata indexing.',
      proposed_approach:
        'Decouple document ingestion from synchronous HTTP requests using an asynchronous background worker (Trigger.dev or Inngest) with pgvector chunking, ' +
        'then stream chunked analysis results back to the client via Server-Sent Events to completely eliminate Vercel timeout errors.',
      budget_range: '$4,500 - $5,500',
      tone: 'Direct',
      achievements:
        'Eliminated 100% of Vercel serverless 504 timeouts and slashed document analysis latency by 68% for a legal-tech platform processing 25k pages monthly.',
    },
  },
  '2': {
    id: '2',
    title: 'UI/UX & CRO Specialist (Direct Outreach Email)',
    description: 'Direct outreach to an e-commerce founder whose Shopify store has mobile checkout friction.',
    input: {
      platform: 'Direct Email',
      job_description:
        'Our Shopify store (luxury leather goods) receives 80,000 monthly visitors, but our mobile checkout conversion dropped from 2.8% to 1.4% after our recent theme redesign. ' +
        'We suspect checkout friction, confusing shipping calculation displays, and mobile layout shifts are driving shoppers away.',
      freelancer_profile:
        'Senior E-Commerce CRO Strategist and UI/UX Designer with 8 years optimizing direct-to-consumer Shopify Plus storefronts.',
      relevant_experience:
        'Redesigned the mobile checkout flow for a D2C footwear brand doing $10M ARR, resolving layout shifts and multi-step friction.',
      proposed_approach:
        'Conduct a heat-map and session recording audit of the mobile checkout funnel, eliminate cumulative layout shifts, and implement an express single-tap checkout with dynamic shipping previews.',
      budget_range: '$3,500 fixed discovery & design sprint',
      tone: 'Consultative',
      achievements:
        'Lifted mobile conversion rate by 1.1% points (from 1.6% to 2.7%) generating an estimated $340k in additional annual revenue for a luxury leather goods brand.',
    },
  },
  '3': {
    id: '3',
    title: 'Python Automation Engineer (Red Flag Spec Work Test)',
    description: 'Upwork post with client soliciting free spec work / unpaid trial tasks to test red-flag detection.',
    input: {
      platform: 'Upwork',
      job_description:
        'Need a python developer to build web scrapers for 10 competitor e-commerce websites. ' +
        "Must show us what you'd do first and submit a free sample scraper script for Site #1 before we hire anyone. " +
        'We are testing multiple freelancers to see who does the best job. Fixed budget $50.',
      freelancer_profile: 'Python Automation & Scraping Engineer specializing in Playwright, Scrapy, and anti-bot bypass.',
      relevant_experience:
        'Engineered scalable data extraction pipelines scraping over 2M product SKUs daily with automated proxy rotation.',
      proposed_approach:
        'Deploy headless Playwright scrapers with stealth plugins, rotating residential proxies, and structured JSON output to PostgreSQL.',
      budget_range: '$800 - $1,200',
      tone: 'Professional',
      achievements:
        'Built resilient scrapers maintaining 99.4% uptime against Cloudflare and Akamai bot protection across 15 enterprise targets.',
    },
  },
  '4': {
    id: '4',
    title: 'B2B SaaS Growth Copywriter (Agency RFP)',
    description: 'Agency RFP response for positioning and product landing page redesign for a FinTech SaaS.',
    input: {
      platform: 'Agency RFP',
      job_description:
        'Agency RFP: Client is an Series-A FinTech providing embedded payroll infrastructure for vertical SaaS platforms. ' +
        'Current landing page is overly technical, jargon-heavy, and failing to convert VP-level product leaders. ' +
        'Deliverables: Customer research interviews, messaging hierarchy matrix, high-converting homepage wireframe and copy, and interactive product demo narrative.',
      freelancer_profile:
        'B2B SaaS Conversion Copywriter & Positioning Consultant who has repositioned 20+ venture-backed developer-tool and FinTech products.',
      relevant_experience:
        'Led core messaging overhaul for an embedded payments API startup that closed $14M Series A shortly after repositioning.',
      proposed_approach:
        'Perform customer win/loss interviews with 6 vertical SaaS product executives to identify exact buying triggers, ' +
        'then rebuild the messaging architecture from API-centric features into clear revenue-expansion outcomes.',
      budget_range: '$6,000 - $8,000',
      tone: 'Consultative',
      achievements:
        'Increased homepage demo request conversion from 1.2% to 3.4% and shortened the enterprise sales cycle by 3 weeks for an embedded billing platform.',
    },
  },
};

export const academicPresets: Record<string, { id: string; title: string; description: string; input: import('./types').AcademicProposalInput }> = {
  '1': {
    id: '1',
    title: "Bachelor's — Education Proposal",
    description: 'Applied study on gamified mobile microlearning in high school STEM classrooms.',
    input: {
      academic_level: "Bachelor's",
      proposal_type: 'Education Proposal',
      topic: 'Gamified Mobile Microlearning in High School Physics Education',
      purpose: 'Evaluate whether bite-sized interactive mobile problem sets increase student conceptual recall and homework completion rates compared to standard textbook problem sheets.',
      target_audience: 'Secondary Education Department Curriculum Committee',
      specific_requirements: 'APA 7th edition formatting, 4-month classroom pilot scope, and accessible for students with diverse smartphone access.'
    }
  },
  '2': {
    id: '2',
    title: "Master's — Business Proposal",
    description: 'Strategic operational framework for an SME cross-border supply chain FinTech platform.',
    input: {
      academic_level: "Master's",
      proposal_type: 'Business Proposal',
      topic: 'Cross-Border B2B Supply Chain FinTech Platform for SME Importers',
      purpose: 'Formulate an empirical operational and economic feasibility plan for automated invoice discounting, mitigating currency volatility and working capital friction for mid-market suppliers.',
      target_audience: 'Corporate Venture Capital Investment Board & Credit Risk Committee',
      specific_requirements: 'Detailed risk matrix, quantitative DCF financial modeling, Basel III regulatory compliance, and 18-month pilot milestones.'
    }
  },
  '3': {
    id: '3',
    title: 'PhD — Social Media Proposal',
    description: 'Doctoral research into algorithmic mediations and epistemic polarization in short-form video networks.',
    input: {
      academic_level: 'PhD',
      proposal_type: 'Social Media Proposal',
      topic: 'Algorithmic Mediations and Affective Contagion in Short-Form Video Networks',
      purpose: 'Investigate the causal pathways through which collaborative-filtering recommendation algorithms govern epistemic polarization, affective contagion, and user cognitive retention across high-velocity social video platforms.',
      target_audience: 'Doctoral Dissertation Review Board & Social Computing Ethics Advisory Panel',
      specific_requirements: 'Longitudinal mixed-methods empirical design (NLP + structural equation modeling), computational graph analysis across 1M+ platform nodes, and IRB human subjects ethics protocols.'
    }
  }
};

