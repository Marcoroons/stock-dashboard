export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      dna_assessments: {
        Row: DnaAssessment
        Insert: Partial<DnaAssessment>
        Update: Partial<DnaAssessment>
      }
      portfolios: {
        Row: Portfolio
        Insert: Partial<Portfolio>
        Update: Partial<Portfolio>
      }
      holdings: {
        Row: Holding
        Insert: Partial<Holding>
        Update: Partial<Holding>
      }
      watchlists: {
        Row: Watchlist
        Insert: Partial<Watchlist>
        Update: Partial<Watchlist>
      }
      watchlist_items: {
        Row: WatchlistItem
        Insert: Partial<WatchlistItem>
        Update: Partial<WatchlistItem>
      }
      financial_goals: {
        Row: FinancialGoalRow
        Insert: Partial<FinancialGoalRow>
        Update: Partial<FinancialGoalRow>
      }
      analytics_events: {
        Row: AnalyticsEvent
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>
        Update: Partial<AnalyticsEvent>
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: Partial<SubscriptionRow>
        Update: Partial<SubscriptionRow>
      }
      access_codes: {
        Row: AccessCode
        Insert: Omit<AccessCode, 'id' | 'times_used' | 'created_at'>
        Update: Partial<AccessCode>
      }
    }
  }
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'plus' | 'pro'
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  access_code_used: string | null
  investor_score: number
  portfolio_health_score: number
  risk_management_score: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type EmotionalProfile = 'panic_seller' | 'cautious' | 'rational' | 'conviction'
export type WealthStyle = 'income' | 'growth' | 'balanced' | 'preservation'
export type TimeHorizon = 'short' | 'medium' | 'long'
export type KnowledgeLevel = 'beginner' | 'starter' | 'intermediate' | 'expert'
export type TimeCommitment = 'passive' | 'monthly' | 'weekly' | 'active'
export type RiskTolerance = 'very_conservative' | 'conservative' | 'moderate' | 'growth' | 'aggressive'

export interface DnaAssessment {
  id: string
  user_id: string
  answers: Record<string, string | number>
  emotional_profile: EmotionalProfile | null
  wealth_style: WealthStyle | null
  time_horizon: TimeHorizon | null
  knowledge_level: KnowledgeLevel | null
  time_commitment: TimeCommitment | null
  volatility_tolerance: RiskTolerance | null
  drawdown_tolerance: number
  liquidity_requirement: string | null
  sector_interests: string[]
  risk_score: number
  completed_at: string
  created_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  currency: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  user_id: string
  ticker: string
  name: string | null
  asset_type: 'stock' | 'etf' | 'fund' | 'crypto' | 'other'
  shares: number
  cost_basis: number
  purchase_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Watchlist {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface WatchlistItem {
  id: string
  watchlist_id: string
  user_id: string
  ticker: string
  name: string | null
  note: string | null
  added_at: string
}

export interface FinancialGoalRow {
  id: string
  user_id: string
  type: 'retirement' | 'house' | 'education' | 'fire' | 'business' | 'custom'
  label: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_name: string
  properties: Record<string, unknown>
  session_id: string | null
  created_at: string
}

export interface SubscriptionRow {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string
  tier: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface AccessCode {
  id: string
  code: string
  tier: string
  max_uses: number | null
  times_used: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export type ExperienceMode = 'beginner' | 'explorer' | 'builder' | 'analyst'

export type SubscriptionTier = 'free' | 'plus' | 'pro'

export interface FeatureAccess {
  portfolioDoctor: boolean
  opportunityScanner: boolean
  newsIntelligence: boolean
  stressTesting: boolean
  insiderActivity: boolean
  advancedAnalytics: boolean
  aiCoach: boolean
}

export function getTierAccess(tier: SubscriptionTier): FeatureAccess {
  return {
    portfolioDoctor: tier !== 'free',
    opportunityScanner: tier !== 'free',
    newsIntelligence: tier !== 'free',
    stressTesting: tier === 'pro',
    insiderActivity: tier === 'pro',
    advancedAnalytics: tier === 'pro',
    aiCoach: tier === 'pro',
  }
}
