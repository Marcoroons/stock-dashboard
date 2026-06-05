// ─── Subscription tiers, pricing, and feature access ─────────────────────────

import type { FeatureAccess, SubscriptionTier } from '@/types/database'

export type { SubscriptionTier, FeatureAccess }

// ─── Plan definitions ─────────────────────────────────────────────────────────

export interface Plan {
  id: SubscriptionTier
  name: string
  tagline: string
  price: number           // monthly, USD
  originalPrice: number   // before early-bird discount
  earlyBird: boolean
  priceId: string         // Stripe Price ID — set via env vars in edge function
  color: string
  badge?: string
  features: PlanFeature[]
  cta: string
  popular?: boolean
}

export interface PlanFeature {
  label: string
  included: boolean
  note?: string
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Start your investing journey',
    price: 0,
    originalPrice: 0,
    earlyBird: false,
    priceId: '',
    color: '#64748b',
    cta: 'Get started free',
    features: [
      { label: 'Investor DNA assessment', included: true },
      { label: 'Basic portfolio tracking', included: true },
      { label: 'Stock analysis (5/day)', included: true },
      { label: 'Dashboard & watchlist', included: true },
      { label: 'Portfolio Doctor', included: false },
      { label: 'Discovery Engine', included: false },
      { label: 'Goal Planner', included: false },
      { label: 'News Intelligence', included: false },
      { label: 'Smart Alerts', included: false },
      { label: 'Stress Testing', included: false },
      { label: 'AI Coach', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'For the serious self-directed investor',
    price: 5,
    originalPrice: 12,
    earlyBird: true,
    priceId: 'PLUS_PRICE_ID',   // replaced by edge function env var
    color: '#06b6d4',
    badge: 'Early Bird',
    cta: 'Upgrade to Plus',
    popular: true,
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Portfolio Doctor', included: true, note: 'Full health analysis' },
      { label: 'Discovery Engine', included: true, note: 'AI-driven opportunities' },
      { label: 'Goal Planner', included: true, note: 'Life goals & projections' },
      { label: 'News Intelligence', included: true, note: 'Curated market intel' },
      { label: 'Fund Analysis', included: true },
      { label: 'Smart Alerts', included: false },
      { label: 'Stress Testing', included: false },
      { label: 'AI Coach', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Institutional-grade tools for serious wealth',
    price: 15,
    originalPrice: 29,
    earlyBird: true,
    priceId: 'PRO_PRICE_ID',    // replaced by edge function env var
    color: '#f59e0b',
    badge: 'Early Bird',
    cta: 'Upgrade to Pro',
    features: [
      { label: 'Everything in Plus', included: true },
      { label: 'Smart Alerts', included: true, note: 'Real-time price & news' },
      { label: 'Stress Testing', included: true, note: '9 institutional scenarios' },
      { label: 'Advanced Insights', included: true },
      { label: 'Insider Activity', included: true },
      { label: 'AI Coach', included: true, note: 'Personalised guidance' },
      { label: 'Priority support', included: true },
    ],
  },
]

// ─── Feature → required tier ──────────────────────────────────────────────────

export const FEATURE_TIERS: Record<keyof FeatureAccess, 'plus' | 'pro'> = {
  portfolioDoctor:     'plus',
  opportunityScanner:  'plus',
  newsIntelligence:    'plus',
  stressTesting:       'pro',
  insiderActivity:     'pro',
  advancedAnalytics:   'pro',
  aiCoach:             'pro',
}

export const FEATURE_LABELS: Record<keyof FeatureAccess, string> = {
  portfolioDoctor:     'Portfolio Doctor',
  opportunityScanner:  'Discovery Engine',
  newsIntelligence:    'News Intelligence',
  stressTesting:       'Stress Testing',
  insiderActivity:     'Insider Activity',
  advancedAnalytics:   'Advanced Insights',
  aiCoach:             'AI Coach',
}

export function getTierAccess(tier: SubscriptionTier): FeatureAccess {
  return {
    portfolioDoctor:    tier === 'plus' || tier === 'pro',
    opportunityScanner: tier === 'plus' || tier === 'pro',
    newsIntelligence:   tier === 'plus' || tier === 'pro',
    stressTesting:      tier === 'pro',
    insiderActivity:    tier === 'pro',
    advancedAnalytics:  tier === 'pro',
    aiCoach:            tier === 'pro',
  }
}

export function getPlanById(id: SubscriptionTier): Plan {
  return PLANS.find(p => p.id === id) ?? PLANS[0]
}

export function getRequiredPlan(feature: keyof FeatureAccess): Plan {
  const tier = FEATURE_TIERS[feature]
  return getPlanById(tier)
}

export const FEATURE_DESCRIPTIONS: Record<keyof FeatureAccess, string> = {
  portfolioDoctor:     'Get a full health score, dimension-by-dimension analysis, and actionable prescriptions for your portfolio.',
  opportunityScanner:  'Discover AI-ranked investment opportunities matched to your Investor DNA.',
  newsIntelligence:    'Curated news feed with sentiment analysis tied directly to your holdings.',
  stressTesting:       'Run 9 institutional-grade scenarios against your portfolio — 2008 crisis, AI bubble burst, rate shocks, and more.',
  insiderActivity:     'Track institutional buying, insider transactions, and smart money flows.',
  advancedAnalytics:   'Deep-dive analytics: factor exposure, correlation matrices, attribution analysis.',
  aiCoach:             'Personalised AI coaching sessions based on your DNA, portfolio, and goals.',
}
