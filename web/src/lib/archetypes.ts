// ─── Archetype Type System ───────────────────────────────────────────────────

export type InvestmentArchetypeId =
  | 'wealth_builder'
  | 'growth_hunter'
  | 'income_generator'
  | 'capital_preserver'
  | 'opportunistic_investor'

export type BehavioralArchetypeId =
  | 'the_follower'
  | 'the_accumulator'
  | 'the_independent'
  | 'the_guardian'

export type OperationalArchetypeId =
  | 'impact_investor'
  | 'passive_investor'
  | 'active_speculator'

export type ArchetypeId = InvestmentArchetypeId | BehavioralArchetypeId | OperationalArchetypeId

export interface Archetype {
  id: ArchetypeId
  label: string
  tagline: string
  description: string
  icon: string
  color: string
  category: 'investment' | 'behavioral' | 'operational'
  strengths: string[]
  blindSpots: string[]
  traits: string[]
  compatibleWith: string[]   // stock/ETF characteristics that score well
  incompatibleWith: string[] // characteristics that score poorly
  famousExample?: string
}

// ─── Investment Archetypes ────────────────────────────────────────────────────

export const INVESTMENT_ARCHETYPES: Record<InvestmentArchetypeId, Archetype> = {
  wealth_builder: {
    id: 'wealth_builder',
    label: 'Wealth Builder',
    tagline: 'Compounding capital over decades',
    description: 'Disciplined long-term investor focused on compounding returns. Thinks in decades, not quarters. Prioritizes high-quality businesses with durable competitive advantages.',
    icon: '🏗️',
    color: '#3b82f6',
    category: 'investment',
    strengths: [
      'Exceptional patience — unshaken by short-term noise',
      'Understands the power of compounding at a visceral level',
      'Low trading costs and tax efficiency',
      'Can hold through painful drawdowns without panic',
    ],
    blindSpots: [
      'May miss tactical opportunities by being too rigid',
      'Can hold losers too long under "long-term" justification',
      'Risk of over-concentration in beloved positions',
      'Slow to adapt when a business model becomes obsolete',
    ],
    traits: ['Patient', 'Disciplined', 'Process-oriented', 'Low-turnover'],
    compatibleWith: ['wide_moat', 'low_beta', 'consistent_earnings', 'dividend_growth', 'high_roic'],
    incompatibleWith: ['high_leverage', 'speculative', 'no_earnings', 'high_beta'],
  },

  growth_hunter: {
    id: 'growth_hunter',
    label: 'Growth Hunter',
    tagline: 'Finding tomorrow\'s winners today',
    description: 'Seeks high-growth companies at the frontier of disruption. Willing to pay premium valuations for exceptional revenue expansion. Thrives on identifying secular tailwinds early.',
    icon: '🚀',
    color: '#10b981',
    category: 'investment',
    strengths: [
      'Early identification of transformative companies',
      'High conviction when the thesis is right',
      'Comfortable with volatility as a price of high returns',
      'Strong forward-looking analysis skills',
    ],
    blindSpots: [
      'Valuation discipline can slip — "it\'s different this time" thinking',
      'Holds through deteriorating fundamentals hoping for recovery',
      'Concentration risk — a few big bets can define outcomes',
      'Recency bias toward recent winners',
    ],
    traits: ['Visionary', 'Bold', 'High-conviction', 'Trend-aware'],
    compatibleWith: ['high_revenue_growth', 'large_tam', 'disruptive', 'tech_sector', 'ai_exposure'],
    incompatibleWith: ['mature_industry', 'low_growth', 'declining_revenue', 'heavy_regulation'],
  },

  income_generator: {
    id: 'income_generator',
    label: 'Income Generator',
    tagline: 'Building a stream of reliable cash flows',
    description: 'Prioritizes consistent income through dividends, distributions, and coupons. Values predictability above all. Treats their portfolio as a money machine generating regular cash.',
    icon: '💵',
    color: '#06b6d4',
    category: 'investment',
    strengths: [
      'Clear, measurable goal: grow the income stream',
      'Psychological benefit of cash flows during market downturns',
      'Natural rebalancing through dividend reinvestment',
      'Lower portfolio volatility through income focus',
    ],
    blindSpots: [
      'May over-value yield, ignoring total return opportunity',
      'Dividend traps — high yield can signal distress',
      'Tax inefficiency in high-yield strategies',
      'Missing growth opportunities to chase yield',
    ],
    traits: ['Steady', 'Cash-flow-minded', 'Methodical', 'Income-first'],
    compatibleWith: ['high_dividend_yield', 'low_payout_risk', 'stable_cash_flows', 'utilities', 'reits'],
    incompatibleWith: ['no_dividend', 'negative_free_cash_flow', 'high_growth_reinvestment'],
  },

  capital_preserver: {
    id: 'capital_preserver',
    label: 'Capital Preserver',
    tagline: 'Protecting wealth through uncertainty',
    description: 'Loss aversion drives every decision. Prioritizes not losing money above all else. Gravitates toward quality businesses with strong balance sheets and defensive characteristics.',
    icon: '🛡️',
    color: '#f59e0b',
    category: 'investment',
    strengths: [
      'Excellent downside protection and capital preservation',
      'Avoids catastrophic blowups through quality filter',
      'Strong risk-adjusted returns over full cycles',
      'Can sleep soundly during market turmoil',
    ],
    blindSpots: [
      'May under-participate in strong bull markets',
      'Opportunity cost of excessive caution',
      'Can confuse low volatility with low risk',
      'Too conservative can erode purchasing power vs. inflation',
    ],
    traits: ['Defensive', 'Risk-averse', 'Quality-obsessed', 'Conservative'],
    compatibleWith: ['low_beta', 'strong_balance_sheet', 'defensive_sector', 'aa_credit_rating', 'wide_moat'],
    incompatibleWith: ['leveraged', 'early_stage', 'speculative', 'high_volatility', 'cyclical'],
  },

  opportunistic_investor: {
    id: 'opportunistic_investor',
    label: 'Opportunistic Investor',
    tagline: 'Striking when others are fearful',
    description: 'Thrives on market dislocations, special situations, and contrarian ideas. Happiest when buying in panic and selling in euphoria. Patient between opportunities, aggressive when conditions align.',
    icon: '⚡',
    color: '#ef4444',
    category: 'investment',
    strengths: [
      'Buys fear and sells greed systematically',
      'Excellent at identifying mispriced situations',
      'Flexible — not constrained by a single strategy',
      'High potential returns through disciplined opportunism',
    ],
    blindSpots: [
      'Can be early — "catching falling knives"',
      'Opportunity recognition can become noise in calm markets',
      'Risk of overtrading between major opportunities',
      'May miss long-term compounders by being too tactical',
    ],
    traits: ['Contrarian', 'Flexible', 'Decisive', 'Tactical'],
    compatibleWith: ['undervalued', 'turnaround', 'cyclical_bottom', 'wide_margin_of_safety'],
    incompatibleWith: ['momentum', 'high_multiple', 'consensus_favourite'],
  },
}

// ─── Behavioral Archetypes ────────────────────────────────────────────────────

export const BEHAVIORAL_ARCHETYPES: Record<BehavioralArchetypeId, Archetype> = {
  the_follower: {
    id: 'the_follower',
    label: 'The Follower',
    tagline: 'Moved by markets, media, and momentum',
    description: 'Trades on hype, trends, and social media FOMO. Makes decisions based on what others are doing rather than independent analysis. Buys at peaks and sells at troughs.',
    icon: '📱',
    color: '#ec4899',
    category: 'behavioral',
    strengths: [
      'Can ride momentum trends profitably when right',
      'Quick to enter emerging themes early via social signals',
      'Not emotionally attached to individual positions',
    ],
    blindSpots: [
      'Buys into tops — fear of missing out drives poor timing',
      'Sells during bottoms when panic spreads in the crowd',
      'No independent framework for evaluating fundamentals',
      'Highly susceptible to pump-and-dump schemes',
    ],
    traits: ['Social', 'Trend-following', 'Reactive', 'Herd-prone'],
    compatibleWith: ['trending', 'high_social_sentiment', 'momentum'],
    incompatibleWith: ['contrarian', 'out_of_favour', 'boring_compounders'],
  },

  the_accumulator: {
    id: 'the_accumulator',
    label: 'The Accumulator',
    tagline: 'Hoarding assets with relentless discipline',
    description: 'Focuses intensely on growing and hoarding assets. Finds psychological safety in accumulation itself. Highly consistent saver and investor who reinvests every dividend.',
    icon: '🪙',
    color: '#10b981',
    category: 'behavioral',
    strengths: [
      'Exceptional savings rate and capital deployment discipline',
      'Consistent dollar-cost averaging through all conditions',
      'No lifestyle inflation — reinvests nearly everything',
      'Builds significant wealth over time through discipline',
    ],
    blindSpots: [
      'May over-prioritize accumulation over strategic allocation',
      'Risk of ignoring quality for quantity of holdings',
      'Hoarding mentality can resist portfolio pruning',
      'May struggle to "harvest" and enjoy the wealth built',
    ],
    traits: ['Disciplined', 'Frugal', 'Consistent', 'Systems-driven'],
    compatibleWith: ['drip_eligible', 'dividend_reinvestment', 'low_cost', 'index_funds'],
    incompatibleWith: ['speculative', 'trading_heavy', 'high_fee'],
  },

  the_independent: {
    id: 'the_independent',
    label: 'The Independent',
    tagline: 'Contrarian research, solitary conviction',
    description: 'Makes contrarian bets based on solitary research. Distrusts consensus and seeks asymmetric opportunities where everyone else is wrong. Comfortable being lonely and early.',
    icon: '🔭',
    color: '#8b5cf6',
    category: 'behavioral',
    strengths: [
      'Unaffected by herd psychology and consensus noise',
      'Identifies overlooked, unloved opportunities',
      'Deep fundamental research drives decisions',
      'Comfortable holding unpopular positions with conviction',
    ],
    blindSpots: [
      'Can be contrarian for contrarianism\'s sake',
      'Confirmation bias in research — looks for evidence that confirms thesis',
      'Underestimates network effects and consensus momentum',
      'May hold losers too long due to emotional ownership',
    ],
    traits: ['Independent', 'Contrarian', 'Research-intensive', 'Conviction-driven'],
    compatibleWith: ['neglected_sector', 'deep_value', 'insider_buying', 'low_analyst_coverage'],
    incompatibleWith: ['popular', 'high_analyst_coverage', 'consensus_buy'],
  },

  the_guardian: {
    id: 'the_guardian',
    label: 'The Guardian',
    tagline: 'Safety above all — cash is king',
    description: 'Avoids volatility through extreme cash-heavy caution. Sees risk everywhere and finds safety in liquidity. Psychological need for security overrides rational return-seeking.',
    icon: '🏦',
    color: '#64748b',
    category: 'behavioral',
    strengths: [
      'Never caught over-leveraged in a downturn',
      'High liquidity means ability to deploy during crises',
      'Extreme preservation protects irreplaceable capital',
      'No forced selling during market stress',
    ],
    blindSpots: [
      'Cash drag destroys purchasing power over time',
      'Perpetual waiting for the "perfect" entry misses compounding',
      'Fear masquerades as analysis ("market is overvalued")',
      'May never deploy cash — waiting for a crash that\'s already priced in',
    ],
    traits: ['Cautious', 'Cash-heavy', 'Security-seeking', 'Anxiety-driven'],
    compatibleWith: ['capital_preservation', 'short_duration', 'money_market', 'treasury_bonds'],
    incompatibleWith: ['high_volatility', 'illiquid', 'long_lock_up', 'high_beta'],
  },
}

// ─── Operational & Value Archetypes ──────────────────────────────────────────

export const OPERATIONAL_ARCHETYPES: Record<OperationalArchetypeId, Archetype> = {
  impact_investor: {
    id: 'impact_investor',
    label: 'Impact Investor',
    tagline: 'Returns with purpose — profit meets principle',
    description: 'Aligns portfolios with ethical and environmental values. Screens out harmful industries and seeks companies creating positive societal and environmental outcomes.',
    icon: '🌱',
    color: '#10b981',
    category: 'operational',
    strengths: [
      'Portfolio reflects personal values — psychological alignment',
      'ESG-focused companies may have lower regulatory risk',
      'Growing investor base in ESG creates long-term tailwinds',
      'Systematic screening creates a principled process',
    ],
    blindSpots: [
      'ESG ratings are inconsistent across providers',
      'May exclude sectors with strong risk/reward profiles',
      'Greenwashing — companies can game ESG scores',
      'Potential return drag vs. unconstrained universe',
    ],
    traits: ['Values-driven', 'ESG-focused', 'Purpose-led', 'Ethical-screener'],
    compatibleWith: ['high_esg_score', 'clean_energy', 'social_impact', 'governance_leaders'],
    incompatibleWith: ['tobacco', 'weapons', 'fossil_fuels', 'poor_governance'],
  },

  passive_investor: {
    id: 'passive_investor',
    label: 'Passive Investor',
    tagline: 'Let the market work — automate everything',
    description: 'Automates everything using index funds or robo-advisors. Accepts market returns and focuses on minimizing fees, taxes, and behavioral errors rather than stock selection.',
    icon: '🤖',
    color: '#06b6d4',
    category: 'operational',
    strengths: [
      'Lowest cost approach — fees compound over decades',
      'Eliminates most behavioral errors through automation',
      'Guaranteed market returns without manager risk',
      'Highly tax-efficient with buy-and-hold ETF strategy',
    ],
    blindSpots: [
      'Owns the bad with the good — market-cap weighting has flaws',
      'No ability to avoid overvalued segments',
      'Misses opportunities in quality, factor, or smart beta',
      'Some index concentrations (tech-heavy S&P) create hidden risk',
    ],
    traits: ['Systematic', 'Low-maintenance', 'Cost-conscious', 'Hands-off'],
    compatibleWith: ['low_expense_ratio', 'broad_index', 'etf_structure', 'high_liquidity'],
    incompatibleWith: ['active_management', 'high_fees', 'individual_stock_picking'],
  },

  active_speculator: {
    id: 'active_speculator',
    label: 'Active Speculator',
    tagline: 'Maximum firepower — leverage, options, momentum',
    description: 'Trades frequently using leverage, options, and technical analysis. Seeks outsized short-term returns through tactical trading. High risk, high reward mentality.',
    icon: '🎯',
    color: '#ef4444',
    category: 'operational',
    strengths: [
      'Can profit in all market conditions — up, down, sideways',
      'Leveraged positions amplify returns when right',
      'Options allow precise risk/reward construction',
      'Technical skills can identify short-term price dislocations',
    ],
    blindSpots: [
      'Transaction costs and slippage erode returns significantly',
      'Leverage is a double-edged sword — amplifies losses too',
      'Emotional decision-making under fast-moving markets',
      'Most active traders underperform passive strategies long-term',
    ],
    traits: ['Tactical', 'High-frequency', 'Leverage-comfortable', 'Technical'],
    compatibleWith: ['high_liquidity', 'options_available', 'high_volatility', 'trending'],
    incompatibleWith: ['illiquid', 'low_volume', 'no_options_market'],
  },
}

// ─── All archetypes merged ────────────────────────────────────────────────────

export const ALL_ARCHETYPES: Record<ArchetypeId, Archetype> = {
  ...INVESTMENT_ARCHETYPES,
  ...BEHAVIORAL_ARCHETYPES,
  ...OPERATIONAL_ARCHETYPES,
}

export const ARCHETYPE_CATEGORIES = {
  investment: Object.values(INVESTMENT_ARCHETYPES),
  behavioral: Object.values(BEHAVIORAL_ARCHETYPES),
  operational: Object.values(OPERATIONAL_ARCHETYPES),
} as const
