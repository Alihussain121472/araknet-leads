export type CalculatorCategory = 'loans' | 'mortgage' | 'business-finance' | 'investment';

export type CalculatorDefinition = {
  slug: string;
  category: CalculatorCategory;
  title: string;
  shortTitle: string;
  description: string;
  fields: Array<{ key: string; label: string; value: number; min: number; max: number; step: number; suffix?: string }>;
  kind: 'loan' | 'compound' | 'rate';
};

const loanFields = [
  { key: 'amount', label: 'Loan amount', value: 25000, min: 1000, max: 1000000, step: 500, suffix: '$' },
  { key: 'rate', label: 'Annual interest rate', value: 7.5, min: 0, max: 30, step: 0.1, suffix: '%' },
  { key: 'years', label: 'Loan term', value: 5, min: 1, max: 40, step: 1, suffix: 'years' },
];

export const calculators: CalculatorDefinition[] = [
  { slug: 'personal-loan-emi-calculator', category: 'loans', title: 'Personal Loan EMI Calculator', shortTitle: 'Personal loan EMI', description: 'Estimate your monthly payment, total interest, and total repayment for a personal loan.', fields: loanFields, kind: 'loan' },
  { slug: 'auto-loan-payoff-calculator', category: 'loans', title: 'Auto Loan Payoff Calculator', shortTitle: 'Auto loan payoff', description: 'See how extra monthly payments can shorten your auto loan and reduce interest.', fields: loanFields, kind: 'loan' },
  { slug: 'debt-consolidation-calculator', category: 'loans', title: 'Debt Consolidation Calculator', shortTitle: 'Debt consolidation', description: 'Compare your current debt payments with a single consolidated loan.', fields: loanFields, kind: 'loan' },
  { slug: 'home-mortgage-calculator', category: 'mortgage', title: 'Home Mortgage Calculator', shortTitle: 'Home mortgage', description: 'Estimate principal, interest, taxes, and insurance for a home purchase.', fields: loanFields, kind: 'loan' },
  { slug: 'refinance-savings-calculator', category: 'mortgage', title: 'Refinance Savings Calculator', shortTitle: 'Refinance savings', description: 'Estimate your monthly savings and break-even point after refinancing.', fields: loanFields, kind: 'loan' },
  { slug: 'small-business-loan-calculator', category: 'business-finance', title: 'Small Business Loan Calculator', shortTitle: 'Business loan', description: 'Plan commercial loan payments and understand the cost of borrowing.', fields: loanFields, kind: 'loan' },
  { slug: 'freelance-rate-and-tax-calculator', category: 'business-finance', title: 'Freelance Rate and Tax Calculator', shortTitle: 'Freelance rates', description: 'Work backward from your income goal to a sustainable hourly rate.', fields: [{ key: 'amount', label: 'Annual income goal', value: 80000, min: 10000, max: 1000000, step: 1000, suffix: '$' }, { key: 'rate', label: 'Estimated tax rate', value: 25, min: 0, max: 60, step: 1, suffix: '%' }, { key: 'years', label: 'Billable hours per year', value: 1200, min: 100, max: 3000, step: 50, suffix: 'hours' }], kind: 'rate' },
  { slug: 'cpc-cpm-roas-calculator', category: 'business-finance', title: 'CPC, CPM and ROAS Calculator', shortTitle: 'CPC / CPM / ROAS', description: 'Check the efficiency of your advertising campaign with clear performance metrics.', fields: loanFields, kind: 'rate' },
  { slug: 'compound-interest-calculator', category: 'investment', title: 'Compound Interest Calculator', shortTitle: 'Compound interest', description: 'Project how an initial investment and recurring contributions may grow over time.', fields: [{ key: 'amount', label: 'Initial investment', value: 10000, min: 0, max: 1000000, step: 500, suffix: '$' }, { key: 'rate', label: 'Annual return', value: 7, min: 0, max: 30, step: 0.1, suffix: '%' }, { key: 'years', label: 'Investment period', value: 20, min: 1, max: 60, step: 1, suffix: 'years' }], kind: 'compound' },
];

export function getCalculator(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export const categoryLabels: Record<CalculatorCategory, string> = {
  loans: 'Loans',
  mortgage: 'Mortgage & real estate',
  'business-finance': 'Business finance',
  investment: 'Investment',
};
