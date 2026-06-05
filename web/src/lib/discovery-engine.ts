// ─── Investment Discovery & Portfolio Construction Engine ─────────────────────
import type { DnaInput } from './dna-engine'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PortfolioRole = 'core' | 'growth' | 'income' | 'diversifier' | 'defensive' | 'satellite' | 'speculative'
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'
export type InvestmentType = 'stock' | 'etf'
export type MarketCap = 'mega' | 'large' | 'mid' | 'small'
export type DiscoverTemplate = 'hidden_gem' | 'quality_compounder' | 'dividend_champion' | 'high_growth' | 'undervalued' | 'contrarian'

export interface Investment {
  ticker: string; name: string; type: InvestmentType; sector: string; themes: string[]
  marketCap: MarketCap; dividendYield: number; beta: number; price: number
  quality: number; growth: number; valuation: number; momentum: number; safety: number; sentiment: number
  description: string; roles: PortfolioRole[]; riskLevel: RiskLevel
  timeHorizon: 'short' | 'medium' | 'long' | 'all'
  roleLabel: string; keyRisks: string[]; alternatives: string[]
}

export interface ScoredInvestment extends Investment {
  totalScore: number; dnaCompatibility: number; compositeScore: number
  whyItFitsYou: string; suggestedRole: PortfolioRole; suggestedAllocation: string
  confidenceScore: number; allocationRationale: string
}

export interface EtfSlotOption {
  ticker: string; provider: string; expenseRatio: number; aum: number; pros: string; recommended: boolean
}

export interface EtfSlot {
  id: string; label: string; description: string; options: EtfSlotOption[]; recommended: string
}

export interface PortfolioPosition {
  ticker: string; name: string; type: InvestmentType; allocation: number
  role: PortfolioRole; roleLabel: string; reason: string; color: string
}

export interface PortfolioBlueprint {
  title: string; description: string; core: PortfolioPosition[]; satellite: PortfolioPosition[]
  etfSlots: EtfSlot[]; expectedReturnLabel: string; riskLabel: string; explanation: string
}

export interface ThemeGroup {
  id: string; label: string; description: string; icon: string; color: string; investments: string[]
}

// ─── Investment Universe ──────────────────────────────────────────────────────

export const UNIVERSE: Investment[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', type: 'stock', sector: 'Technology', themes: ['consumer_brands', 'artificial_intelligence'], marketCap: 'mega', dividendYield: 0.005, beta: 1.28, price: 194.50, quality: 88, growth: 72, valuation: 52, momentum: 78, safety: 65, sentiment: 82, description: 'The world\'s largest company by market cap with a powerful hardware-software ecosystem generating enormous free cash flow.', roles: ['core', 'growth'], roleLabel: 'Quality Core Holding', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['China revenue concentration (18%)', 'Premium phone market saturation', 'High P/E vs growth rate'], alternatives: ['MSFT', 'GOOGL'] },
  { ticker: 'MSFT', name: 'Microsoft Corp.', type: 'stock', sector: 'Technology', themes: ['artificial_intelligence', 'cloud_saas'], marketCap: 'mega', dividendYield: 0.007, beta: 0.89, price: 412.80, quality: 92, growth: 85, valuation: 55, momentum: 82, safety: 72, sentiment: 88, description: 'The dominant cloud and enterprise software platform, supercharged by its OpenAI partnership and AI-native Copilot suite.', roles: ['core', 'growth'], roleLabel: 'Quality Core Holding', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['Antitrust scrutiny of AI partnerships', 'Copilot monetization slower than projected'], alternatives: ['GOOGL', 'AMZN'] },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', sector: 'Technology', themes: ['artificial_intelligence', 'semiconductors'], marketCap: 'mega', dividendYield: 0.001, beta: 1.72, price: 875.40, quality: 89, growth: 96, valuation: 38, momentum: 92, safety: 38, sentiment: 94, description: 'The dominant AI chip architect whose GPUs power virtually all large-scale AI model training worldwide.', roles: ['growth', 'satellite'], roleLabel: 'High-Growth Satellite', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Extreme valuation (60x+ earnings)', 'China export restrictions', 'Competition from custom silicon'], alternatives: ['AMD', 'AVGO'] },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', sector: 'Technology', themes: ['artificial_intelligence', 'cloud_saas'], marketCap: 'mega', dividendYield: 0.005, beta: 1.06, price: 178.40, quality: 88, growth: 78, valuation: 62, momentum: 72, safety: 68, sentiment: 74, description: 'Search monopoly, #3 cloud provider, and early AI leader trading at a modest discount to peers.', roles: ['core', 'growth'], roleLabel: 'Value-Quality Hold', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['Search disruption from AI', 'Antitrust rulings on ad monopoly'], alternatives: ['META', 'MSFT'] },
  { ticker: 'META', name: 'Meta Platforms', type: 'stock', sector: 'Technology', themes: ['artificial_intelligence', 'cloud_saas'], marketCap: 'mega', dividendYield: 0.004, beta: 1.24, price: 492.80, quality: 86, growth: 82, valuation: 58, momentum: 84, safety: 50, sentiment: 75, description: 'Social media dominance with an AI-accelerated ad platform and ambitious long-horizon bets.', roles: ['growth', 'satellite'], roleLabel: 'Growth Compounder', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['Regulatory pressure in EU/US', 'Reality Labs burning $15B+/year'], alternatives: ['GOOGL', 'SNAP'] },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', sector: 'Consumer Discretionary', themes: ['cloud_saas', 'consumer_brands'], marketCap: 'mega', dividendYield: 0.0, beta: 1.18, price: 185.20, quality: 85, growth: 80, valuation: 52, momentum: 78, safety: 58, sentiment: 78, description: 'The e-commerce juggernaut whose AWS cloud division generates the majority of profits.', roles: ['core', 'growth'], roleLabel: 'Long-Term Compounder', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['AWS competition from Azure/GCP', 'Thin retail margins', 'Regulatory antitrust scrutiny'], alternatives: ['MSFT', 'GOOGL'] },
  { ticker: 'KO', name: 'Coca-Cola Co.', type: 'stock', sector: 'Consumer Staples', themes: ['consumer_brands', 'dividend_income'], marketCap: 'mega', dividendYield: 0.030, beta: 0.62, price: 60.50, quality: 84, growth: 48, valuation: 62, momentum: 56, safety: 88, sentiment: 70, description: '60+ years of consecutive dividend growth and a brand distributed in virtually every country.', roles: ['defensive', 'income'], roleLabel: 'Defensive Income Holding', riskLevel: 'low', timeHorizon: 'all', keyRisks: ['Health-conscious consumer shift', 'Currency headwinds'], alternatives: ['PG', 'PEP'] },
  { ticker: 'PG', name: 'Procter & Gamble', type: 'stock', sector: 'Consumer Staples', themes: ['consumer_brands', 'dividend_income'], marketCap: 'mega', dividendYield: 0.025, beta: 0.58, price: 168.30, quality: 86, growth: 52, valuation: 58, momentum: 60, safety: 90, sentiment: 72, description: 'P&G owns category-defining brands (Tide, Pampers, Gillette) — a near-recession-proof business.', roles: ['defensive', 'income'], roleLabel: 'Defensive Income Holding', riskLevel: 'low', timeHorizon: 'all', keyRisks: ['Private label competition', 'Input cost inflation'], alternatives: ['KO', 'JNJ'] },
  { ticker: 'COST', name: 'Costco Wholesale', type: 'stock', sector: 'Consumer Staples', themes: ['consumer_brands'], marketCap: 'mega', dividendYield: 0.006, beta: 0.72, price: 842.10, quality: 90, growth: 68, valuation: 42, momentum: 72, safety: 78, sentiment: 82, description: 'Membership-based warehouse retailer with cult-like customer loyalty and among the highest ROIC in retail.', roles: ['core', 'defensive'], roleLabel: 'Premium Quality Core', riskLevel: 'low', timeHorizon: 'long', keyRisks: ['Very high valuation (48x P/E)', 'E-commerce disruption'], alternatives: ['WMT', 'TGT'] },
  { ticker: 'JPM', name: 'JPMorgan Chase', type: 'stock', sector: 'Financial', themes: ['digital_payments'], marketCap: 'mega', dividendYield: 0.023, beta: 1.12, price: 198.20, quality: 86, growth: 68, valuation: 65, momentum: 72, safety: 72, sentiment: 76, description: 'America\'s largest bank with diversified revenue across consumer banking, investment banking, and trading.', roles: ['core', 'income'], roleLabel: 'Financial Core Holding', riskLevel: 'medium', timeHorizon: 'medium', keyRisks: ['Net interest margin compression', 'Credit loss cycle risk', 'Regulatory capital requirements'], alternatives: ['BRK.B', 'BAC'] },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway B', type: 'stock', sector: 'Financial', themes: ['consumer_brands', 'dividend_income'], marketCap: 'mega', dividendYield: 0.0, beta: 0.90, price: 358.70, quality: 90, growth: 62, valuation: 68, momentum: 64, safety: 82, sentiment: 72, description: 'Warren Buffett\'s conglomerate holds $189B cash and is effectively a diversified all-weather fund.', roles: ['core', 'defensive'], roleLabel: 'All-Weather Defensive', riskLevel: 'low', timeHorizon: 'long', keyRisks: ['Succession risk post-Buffett', 'No dividend', 'Underperforms in strong bull markets'], alternatives: ['VTI', 'SPY'] },
  { ticker: 'V', name: 'Visa Inc.', type: 'stock', sector: 'Financial', themes: ['digital_payments'], marketCap: 'mega', dividendYield: 0.008, beta: 0.95, price: 272.40, quality: 92, growth: 78, valuation: 58, momentum: 74, safety: 72, sentiment: 84, description: 'Visa operates the world\'s largest payment network — a toll booth on global commerce.', roles: ['core', 'growth'], roleLabel: 'Quality Compounder', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['BNPL and crypto alternatives', 'Regulatory fee caps', 'Competition from domestic payment rails'], alternatives: ['MA', 'PYPL'] },
  { ticker: 'MA', name: 'Mastercard Inc.', type: 'stock', sector: 'Financial', themes: ['digital_payments'], marketCap: 'mega', dividendYield: 0.006, beta: 0.98, price: 458.90, quality: 91, growth: 78, valuation: 55, momentum: 74, safety: 70, sentiment: 82, description: 'Mastercard\'s global payments network with 100+ billion transactions annually and best-in-class margins.', roles: ['core', 'growth'], roleLabel: 'Quality Compounder', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['Same regulatory risks as Visa', 'High multiple requires continued execution'], alternatives: ['V', 'PYPL'] },
  { ticker: 'JNJ', name: 'Johnson & Johnson', type: 'stock', sector: 'Healthcare', themes: ['healthcare', 'dividend_income'], marketCap: 'mega', dividendYield: 0.032, beta: 0.62, price: 158.90, quality: 84, growth: 55, valuation: 72, momentum: 55, safety: 85, sentiment: 70, description: 'Diversified healthcare giant with 60+ years of dividend growth.', roles: ['defensive', 'income'], roleLabel: 'Defensive Income Holding', riskLevel: 'low', timeHorizon: 'all', keyRisks: ['Stelara biosimilar revenue cliff', 'Pipeline execution risk'], alternatives: ['PG', 'ABBV'] },
  { ticker: 'UNH', name: 'UnitedHealth Group', type: 'stock', sector: 'Healthcare', themes: ['healthcare'], marketCap: 'mega', dividendYield: 0.015, beta: 0.72, price: 520.40, quality: 88, growth: 78, valuation: 55, momentum: 68, safety: 72, sentiment: 65, description: 'America\'s largest health insurer with Optum — an increasingly dominant data and care platform.', roles: ['core', 'defensive'], roleLabel: 'Quality Defensive Hold', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['Medicare Advantage rate pressures', 'CMS policy changes', 'Elevated medical cost ratio'], alternatives: ['CVS', 'CI'] },
  { ticker: 'ABBV', name: 'AbbVie Inc.', type: 'stock', sector: 'Healthcare', themes: ['healthcare', 'dividend_income'], marketCap: 'large', dividendYield: 0.038, beta: 0.68, price: 182.60, quality: 86, growth: 68, valuation: 68, momentum: 64, safety: 72, sentiment: 72, description: 'Pharmaceutical company with strong Skyrizi + Rinvoq growth and exceptional cash flow.', roles: ['income', 'defensive'], roleLabel: 'High-Yield Income Hold', riskLevel: 'low', timeHorizon: 'medium', keyRisks: ['Drug pricing legislation', 'Skyrizi/Rinvoq clinical setbacks'], alternatives: ['JNJ', 'MRK'] },
  { ticker: 'AVGO', name: 'Broadcom Inc.', type: 'stock', sector: 'Technology', themes: ['semiconductors', 'artificial_intelligence'], marketCap: 'mega', dividendYield: 0.012, beta: 1.22, price: 1428.50, quality: 88, growth: 82, valuation: 52, momentum: 84, safety: 58, sentiment: 82, description: 'Broadcom designs custom AI chips for Google and Meta alongside networking semiconductors.', roles: ['growth', 'satellite'], roleLabel: 'High-Quality Growth', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['VMware integration complexity', 'Customer concentration (Apple ~20% rev)'], alternatives: ['NVDA', 'AMD'] },
  { ticker: 'AMD', name: 'Advanced Micro Devices', type: 'stock', sector: 'Technology', themes: ['semiconductors', 'artificial_intelligence'], marketCap: 'large', dividendYield: 0.0, beta: 1.58, price: 164.30, quality: 78, growth: 88, valuation: 48, momentum: 82, safety: 48, sentiment: 78, description: 'The primary challenger to NVIDIA in AI GPUs (MI300X) and Intel in CPUs (EPYC).', roles: ['growth', 'satellite'], roleLabel: 'High-Growth Challenger', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['NVIDIA\'s entrenched CUDA ecosystem', 'Fabless model dependent on TSMC'], alternatives: ['NVDA', 'AVGO'] },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', type: 'stock', sector: 'Technology', themes: ['cybersecurity'], marketCap: 'large', dividendYield: 0.0, beta: 1.48, price: 362.80, quality: 82, growth: 88, valuation: 38, momentum: 78, safety: 45, sentiment: 80, description: 'The leading cloud-native cybersecurity platform using AI to protect endpoints and cloud workloads.', roles: ['growth', 'satellite'], roleLabel: 'High-Growth Satellite', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Expensive valuation (18x revenue)', 'July 2024 outage-related churn'], alternatives: ['NET', 'PANW'] },
  { ticker: 'NET', name: 'Cloudflare Inc.', type: 'stock', sector: 'Technology', themes: ['cybersecurity', 'cloud_saas'], marketCap: 'large', dividendYield: 0.0, beta: 1.52, price: 98.40, quality: 75, growth: 82, valuation: 32, momentum: 72, safety: 42, sentiment: 72, description: 'A global network-as-a-service platform expanding into Zero Trust security and AI gateways.', roles: ['growth', 'speculative'], roleLabel: 'Speculative Growth', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Not yet GAAP profitable', 'Very high valuation multiple'], alternatives: ['CRWD', 'ZS'] },
  { ticker: 'PLTR', name: 'Palantir Technologies', type: 'stock', sector: 'Technology', themes: ['artificial_intelligence', 'defense'], marketCap: 'large', dividendYield: 0.0, beta: 1.82, price: 28.40, quality: 68, growth: 78, valuation: 28, momentum: 74, safety: 38, sentiment: 65, description: 'AI operating system for large governments and enterprises gaining commercial traction.', roles: ['speculative', 'satellite'], roleLabel: 'Speculative Satellite', riskLevel: 'very_high', timeHorizon: 'long', keyRisks: ['Extreme valuation for current revenue scale', 'Government contract dependency'], alternatives: ['CRWD', 'AI'] },
  { ticker: 'CRM', name: 'Salesforce Inc.', type: 'stock', sector: 'Technology', themes: ['cloud_saas', 'artificial_intelligence'], marketCap: 'large', dividendYield: 0.006, beta: 1.28, price: 272.80, quality: 82, growth: 75, valuation: 42, momentum: 70, safety: 52, sentiment: 72, description: 'The world\'s #1 CRM platform with a growing AI layer (Agentforce) and strong customer lock-in.', roles: ['growth', 'satellite'], roleLabel: 'SaaS Growth Holding', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['AI commoditization of CRM layer', 'Slowing enterprise growth'], alternatives: ['MSFT', 'ADBE'] },
  { ticker: 'NEE', name: 'NextEra Energy', type: 'stock', sector: 'Utilities', themes: ['clean_energy', 'dividend_income'], marketCap: 'mega', dividendYield: 0.028, beta: 0.52, price: 74.60, quality: 78, growth: 58, valuation: 60, momentum: 56, safety: 76, sentiment: 66, description: 'The world\'s largest wind and solar producer combined with a regulated Florida utility.', roles: ['income', 'defensive'], roleLabel: 'Clean Energy Income', riskLevel: 'low', timeHorizon: 'long', keyRisks: ['Interest rate sensitivity', 'Project development execution risk'], alternatives: ['BEP', 'ICLN'] },
  { ticker: 'ENPH', name: 'Enphase Energy', type: 'stock', sector: 'Energy', themes: ['clean_energy'], marketCap: 'mid', dividendYield: 0.0, beta: 1.62, price: 88.40, quality: 72, growth: 65, valuation: 45, momentum: 50, safety: 42, sentiment: 58, description: 'Leading solar microinverter manufacturer with an expanding energy storage product line.', roles: ['satellite', 'growth'], roleLabel: 'Thematic Growth Satellite', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Interest rate impact on rooftop solar demand', 'Competition from Chinese rivals'], alternatives: ['NEE', 'ICLN'] },
  { ticker: 'O', name: 'Realty Income Corp.', type: 'stock', sector: 'Real Estate', themes: ['dividend_income'], marketCap: 'large', dividendYield: 0.057, beta: 0.72, price: 54.80, quality: 80, growth: 52, valuation: 62, momentum: 54, safety: 78, sentiment: 68, description: '"The Monthly Dividend Company" — a net lease REIT paying dividends monthly for 650+ consecutive months.', roles: ['income', 'defensive'], roleLabel: 'Monthly Income Holding', riskLevel: 'low', timeHorizon: 'medium', keyRisks: ['Interest rate sensitivity', 'Retail tenant credit risk'], alternatives: ['SPG', 'BND'] },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', sector: 'Diversified', themes: ['international'], marketCap: 'mega', dividendYield: 0.013, beta: 1.0, price: 498.20, quality: 88, growth: 76, valuation: 60, momentum: 78, safety: 75, sentiment: 82, description: 'The lowest-cost S&P 500 index fund at 0.03% expense ratio. The gold standard for passive core investing.', roles: ['core'], roleLabel: 'Core Market Exposure', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['100% US market risk', 'Top-heavy in Magnificent Seven'], alternatives: ['SPY', 'IVV'] },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', sector: 'Technology', themes: ['artificial_intelligence', 'cloud_saas', 'semiconductors'], marketCap: 'mega', dividendYield: 0.005, beta: 1.22, price: 487.20, quality: 85, growth: 88, valuation: 52, momentum: 85, safety: 58, sentiment: 84, description: 'Tracks the Nasdaq-100 — 100 largest non-financial Nasdaq companies, 50%+ in Technology.', roles: ['growth', 'satellite'], roleLabel: 'Tech-Growth ETF', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['~50% Technology concentration', 'Higher expense ratio (0.20%)'], alternatives: ['VGT', 'SOXX'] },
  { ticker: 'SCHD', name: 'Schwab US Dividend ETF', type: 'etf', sector: 'Diversified', themes: ['dividend_income', 'consumer_brands'], marketCap: 'large', dividendYield: 0.038, beta: 0.82, price: 27.80, quality: 84, growth: 65, valuation: 68, momentum: 65, safety: 78, sentiment: 75, description: 'The best dividend ETF for total return — quality-screened, not just highest yield.', roles: ['income', 'core'], roleLabel: 'Dividend Income Core', riskLevel: 'low', timeHorizon: 'all', keyRisks: ['Underperforms in tech bull markets', 'Interest rate sensitivity'], alternatives: ['VYM', 'DGRO'] },
  { ticker: 'SOXX', name: 'iShares Semiconductor ETF', type: 'etf', sector: 'Technology', themes: ['semiconductors', 'artificial_intelligence'], marketCap: 'large', dividendYield: 0.007, beta: 1.52, price: 224.80, quality: 82, growth: 85, valuation: 48, momentum: 82, safety: 52, sentiment: 78, description: 'Concentrated exposure to 30 semiconductor companies. Pure play on the AI chip supercycle.', roles: ['satellite', 'growth'], roleLabel: 'Thematic Satellite', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Extremely cyclical industry', 'China/Taiwan geopolitical risk'], alternatives: ['SMH', 'NVDA'] },
  { ticker: 'CIBR', name: 'First Trust Cybersecurity ETF', type: 'etf', sector: 'Technology', themes: ['cybersecurity'], marketCap: 'large', dividendYield: 0.003, beta: 1.22, price: 60.40, quality: 80, growth: 82, valuation: 52, momentum: 76, safety: 58, sentiment: 76, description: 'Diversified exposure to cybersecurity companies — a structural growth theme.', roles: ['satellite', 'growth'], roleLabel: 'Thematic Satellite', riskLevel: 'medium', timeHorizon: 'long', keyRisks: ['High concentration in CrowdStrike and Palo Alto', 'Expensive valuations'], alternatives: ['CRWD', 'PANW'] },
  { ticker: 'ICLN', name: 'iShares Global Clean Energy ETF', type: 'etf', sector: 'Energy', themes: ['clean_energy'], marketCap: 'mid', dividendYield: 0.022, beta: 1.18, price: 12.40, quality: 68, growth: 65, valuation: 55, momentum: 52, safety: 55, sentiment: 60, description: 'Global exposure to clean energy producers. Beneficiary of the energy transition.', roles: ['satellite', 'diversifier'], roleLabel: 'Thematic Diversifier', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Interest rate sensitivity', 'Policy reversal risk'], alternatives: ['NEE', 'ENPH'] },
  { ticker: 'BOTZ', name: 'Global Robotics & AI ETF', type: 'etf', sector: 'Technology', themes: ['artificial_intelligence', 'robotics'], marketCap: 'mid', dividendYield: 0.005, beta: 1.38, price: 26.80, quality: 78, growth: 78, valuation: 48, momentum: 72, safety: 52, sentiment: 70, description: 'Exposure to robotics, AI hardware, and automation companies globally.', roles: ['satellite', 'growth'], roleLabel: 'Thematic Satellite', riskLevel: 'high', timeHorizon: 'long', keyRisks: ['Very concentrated in a few names', 'Japanese industrial stocks (currency risk)'], alternatives: ['QQQ', 'ROBO'] },
]

export const UNIVERSE_MAP: Record<string, Investment> = Object.fromEntries(UNIVERSE.map(inv => [inv.ticker, inv]))

// ─── Theme Definitions ────────────────────────────────────────────────────────

export const THEMES: ThemeGroup[] = [
  { id: 'artificial_intelligence', label: 'Artificial Intelligence', description: 'Companies building and benefiting from the AI revolution — from chip makers to software platforms.', icon: '🤖', color: '#3b82f6', investments: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AVGO', 'AMD', 'PLTR', 'CRM', 'QQQ', 'BOTZ'] },
  { id: 'semiconductors', label: 'Semiconductors', description: 'The foundational chip manufacturers powering AI, PCs, phones, and data centers.', icon: '⚡', color: '#f59e0b', investments: ['NVDA', 'AMD', 'AVGO', 'SOXX'] },
  { id: 'cybersecurity', label: 'Cybersecurity', description: 'Companies protecting digital infrastructure as cyber threats grow in scale and sophistication.', icon: '🛡️', color: '#10b981', investments: ['CRWD', 'NET', 'CIBR'] },
  { id: 'cloud_saas', label: 'Cloud & SaaS', description: 'Cloud computing and software-as-a-service companies with recurring, sticky revenue streams.', icon: '☁️', color: '#06b6d4', investments: ['MSFT', 'GOOGL', 'AMZN', 'CRM', 'NET'] },
  { id: 'digital_payments', label: 'Digital Payments', description: 'The infrastructure enabling cashless commerce — payment networks and financial technology.', icon: '💳', color: '#8b5cf6', investments: ['V', 'MA', 'JPM'] },
  { id: 'consumer_brands', label: 'Consumer Brands', description: 'Iconic brands with durable pricing power and decades of consistent profitability.', icon: '🛒', color: '#f97316', investments: ['AAPL', 'KO', 'PG', 'COST', 'AMZN', 'SCHD'] },
  { id: 'healthcare', label: 'Healthcare Innovation', description: 'Pharmaceutical, insurance, and medical technology companies with strong fundamentals.', icon: '🏥', color: '#ef4444', investments: ['JNJ', 'UNH', 'ABBV'] },
  { id: 'clean_energy', label: 'Clean Energy', description: 'The energy transition — solar, wind, and grid infrastructure for a decarbonized future.', icon: '🌱', color: '#84cc16', investments: ['NEE', 'ENPH', 'ICLN'] },
  { id: 'dividend_income', label: 'Dividend Income', description: 'Stocks and funds generating reliable cash distributions for income-oriented investors.', icon: '💰', color: '#f59e0b', investments: ['KO', 'PG', 'JNJ', 'ABBV', 'NEE', 'O', 'SCHD'] },
  { id: 'defense', label: 'Defense & Security', description: 'Defense contractors and government technology firms benefiting from elevated defense spending.', icon: '🎖️', color: '#64748b', investments: ['PLTR'] },
]

// ─── ETF Slot Comparisons ─────────────────────────────────────────────────────

export const ETF_SLOTS: EtfSlot[] = [
  { id: 'us_broad', label: 'US Broad Market', description: 'Your foundation — broad exposure to the US economy.', recommended: 'VOO', options: [
    { ticker: 'VOO', provider: 'Vanguard', expenseRatio: 0.0003, aum: 450, pros: 'Lowest cost, massive AUM, no frills. Best for long-term buy-and-hold.', recommended: true },
    { ticker: 'SPY', provider: 'State Street', expenseRatio: 0.00945, aum: 580, pros: 'Most liquid ETF on earth. Slightly higher cost — best for active traders.', recommended: false },
    { ticker: 'IVV', provider: 'iShares', expenseRatio: 0.0003, aum: 520, pros: 'Tied for lowest cost with VOO. More institutional usage.', recommended: false },
    { ticker: 'FXAIX', provider: 'Fidelity', expenseRatio: 0.00015, aum: 380, pros: 'Fractionally cheapest option. Mutual fund (not ETF) — requires Fidelity account.', recommended: false },
  ]},
  { id: 'international', label: 'International Diversification', description: 'Reduces home-country bias and captures global growth.', recommended: 'VXUS', options: [
    { ticker: 'VXUS', provider: 'Vanguard', expenseRatio: 0.0007, aum: 70, pros: 'Broadest global exposure (8,400 stocks). Developed + emerging in one fund.', recommended: true },
    { ticker: 'VEA', provider: 'Vanguard', expenseRatio: 0.0005, aum: 112, pros: 'Developed markets only (less volatility). Better for conservative investors.', recommended: false },
    { ticker: 'IXUS', provider: 'iShares', expenseRatio: 0.0009, aum: 34, pros: 'Similar to VXUS at slightly higher cost but wider availability.', recommended: false },
  ]},
  { id: 'bonds', label: 'Bond Stability', description: 'Reduces portfolio volatility and provides income.', recommended: 'BND', options: [
    { ticker: 'BND', provider: 'Vanguard', expenseRatio: 0.0003, aum: 120, pros: 'Total US bond market. Best one-fund bond exposure at ultra-low cost.', recommended: true },
    { ticker: 'AGG', provider: 'iShares', expenseRatio: 0.0003, aum: 100, pros: 'Identical exposure to BND. Slightly more institutional usage.', recommended: false },
    { ticker: 'VGIT', provider: 'Vanguard', expenseRatio: 0.0004, aum: 14, pros: 'Intermediate Treasury only — lower credit risk, less duration risk than BND.', recommended: false },
  ]},
  { id: 'dividend', label: 'Dividend Growth', description: 'Companies with growing dividends — quality + income.', recommended: 'SCHD', options: [
    { ticker: 'SCHD', provider: 'Schwab', expenseRatio: 0.0006, aum: 58, pros: 'Best total return dividend ETF. Quality-screened, not just highest yield.', recommended: true },
    { ticker: 'VYM', provider: 'Vanguard', expenseRatio: 0.0006, aum: 58, pros: 'Higher current yield but lower quality screen than SCHD.', recommended: false },
    { ticker: 'DGRO', provider: 'iShares', expenseRatio: 0.0008, aum: 25, pros: 'Dividend growth focus. Slightly lower yield but higher growth tilt.', recommended: false },
  ]},
]

// ─── DNA Compatibility Engine ─────────────────────────────────────────────────

function interestMatchScore(investment: Investment, sectorInterests: string[]): number {
  if (!sectorInterests?.length) return 0
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ')
  const themeWords = investment.themes.flatMap(t => normalize(t).split(' '))
  const sectorWords = investment.sector.toLowerCase().split(' ')
  const allWords = [...themeWords, ...sectorWords]
  const matches = sectorInterests.some(interest => {
    const iWords = normalize(interest).split(' ')
    return iWords.some(iw => allWords.some(aw => aw.includes(iw) || iw.includes(aw)))
  })
  return matches ? 18 : 0
}

export function computeDnaCompatibility(investment: Investment, dna: DnaInput): number {
  let score = 55
  const vtol = (dna.volatility_tolerance ?? 'moderate').toLowerCase()
  const b = investment.beta
  if (vtol.includes('conserv') || vtol === 'low') {
    if (b > 1.6) score -= 28; else if (b > 1.3) score -= 14; else if (b > 1.1) score -= 6; else if (b < 0.7) score += 12
  } else if (vtol.includes('aggress') || vtol === 'high') {
    if (b < 0.6) score -= 10; else if (b > 1.2) score += 8; if (b > 1.5) score += 4
  } else {
    if (b < 0.5) score -= 6; else if (b > 1.6) score -= 12; else if (b >= 0.8 && b <= 1.3) score += 6
  }
  const userRisk = dna.risk_score ?? 50
  const invRisk = 100 - investment.safety
  score -= Math.round(Math.abs(userRisk - invRisk) * 0.22)
  const horizon = (dna.time_horizon ?? 'long').toLowerCase()
  if (horizon === 'short') {
    if (investment.riskLevel === 'very_high') score -= 20; if (investment.riskLevel === 'high') score -= 10; if (investment.riskLevel === 'low') score += 8
  } else if (horizon === 'long') {
    if (investment.growth >= 75) score += 8; if (investment.riskLevel === 'low' && investment.growth < 50) score -= 4
  }
  score += interestMatchScore(investment, dna.sector_interests ?? [])
  const ws = (dna.wealth_style ?? 'accumulator').toLowerCase()
  if (ws.includes('protect') || ws.includes('conserv')) { if (investment.safety < 55) score -= 12; if (investment.safety >= 75) score += 8 }
  if (ws.includes('accum') || ws.includes('growth')) { if (investment.growth >= 80) score += 8; if (investment.dividendYield > 0.04 && investment.growth < 50) score -= 4 }
  if (ws.includes('experiment') || ws.includes('specul')) { if (investment.riskLevel === 'very_high') score += 8; if (investment.riskLevel === 'low') score -= 4 }
  if (ws.includes('optim') || ws.includes('balanc')) { if (investment.quality >= 80) score += 6 }
  const kl = (dna.knowledge_level ?? 'intermediate').toLowerCase()
  if (kl === 'beginner') { if (investment.type === 'etf') score += 10; if (investment.riskLevel === 'very_high') score -= 15; if (investment.type === 'stock' && investment.beta > 1.4) score -= 8 }
  else if (kl === 'advanced') { if (investment.type === 'stock') score += 4 }
  const drawdownTol = dna.drawdown_tolerance ?? 20
  if (drawdownTol <= 10 && investment.safety < 60) score -= 10
  if (drawdownTol >= 35 && investment.riskLevel !== 'low') score += 4
  return Math.max(5, Math.min(100, Math.round(score)))
}

function totalFactorScore(inv: Investment): number {
  return Math.round((inv.quality + inv.growth + inv.valuation + inv.momentum + inv.safety + inv.sentiment) / 6)
}

function generateWhyItFitsYou(inv: Investment, dna: DnaInput, compat: number): string {
  const parts: string[] = []
  const vtol = (dna.volatility_tolerance ?? 'moderate').toLowerCase()
  const horizon = (dna.time_horizon ?? 'long').toLowerCase()
  const ws = (dna.wealth_style ?? 'accumulator').toLowerCase()
  if (interestMatchScore(inv, dna.sector_interests ?? []) > 0) {
    const matchedTheme = THEMES.find(t => inv.themes.includes(t.id) && (dna.sector_interests ?? []).some(si => t.label.toLowerCase().includes(si.toLowerCase().slice(0, 4)) || si.toLowerCase().includes(t.id.replace(/_/g, ' '))))
    if (matchedTheme) parts.push(`aligns with your stated interest in ${matchedTheme.label}`)
  }
  if (vtol.includes('conserv') && inv.safety >= 75) parts.push('matches your preference for low-volatility investments')
  if (vtol.includes('aggress') && inv.growth >= 85) parts.push('suits your appetite for high-growth, high-upside plays')
  if (horizon === 'long' && inv.growth >= 75) parts.push('is well-suited to your long-term time horizon')
  if (horizon === 'short' && inv.riskLevel === 'low') parts.push('offers near-term stability matching your time horizon')
  if (ws.includes('accum') && inv.growth >= 78) parts.push('supports your wealth-building, growth-oriented strategy')
  if ((ws.includes('protect') || ws.includes('conserv')) && inv.safety >= 75) parts.push('fits your wealth-preservation mindset')
  if (ws.includes('optim') && inv.quality >= 85) parts.push('meets your quality standards for optimized returns')
  if (inv.dividendYield >= 0.03 && (dna.drawdown_tolerance ?? 20) <= 15) parts.push('provides income that reduces your reliance on price appreciation')
  if (parts.length === 0) {
    if (compat >= 75) parts.push('complements your overall investment profile')
    else if (inv.quality >= 85) parts.push('offers exceptional quality fundamentals regardless of profile')
    else parts.push('provides exposure to an important market segment')
  }
  return `This investment ${parts[0]}${parts.length > 1 ? ` and ${parts[1]}` : ''}.`
}

function suggestAllocation(inv: Investment, dna: DnaInput, compat: number): string {
  const kl = (dna.knowledge_level ?? 'intermediate').toLowerCase()
  if (inv.type === 'etf' && inv.roles.includes('core')) return kl === 'beginner' ? '20-40%' : '10-25%'
  if (inv.riskLevel === 'very_high') return '1-3%'
  if (inv.riskLevel === 'high') return '2-5%'
  if (compat >= 80 && inv.roles.includes('core')) return '5-10%'
  if (compat >= 65) return '3-7%'
  return '1-4%'
}

export function scoreInvestments(dna: DnaInput): ScoredInvestment[] {
  return UNIVERSE.map(inv => {
    const compat = computeDnaCompatibility(inv, dna)
    const ts = totalFactorScore(inv)
    const composite = Math.round(ts * 0.45 + compat * 0.55)
    return {
      ...inv, totalScore: ts, dnaCompatibility: compat, compositeScore: composite,
      whyItFitsYou: generateWhyItFitsYou(inv, dna, compat),
      suggestedRole: inv.roles[0],
      suggestedAllocation: suggestAllocation(inv, dna, compat),
      confidenceScore: Math.min(95, Math.round(60 + compat * 0.3 + ts * 0.1)),
      allocationRationale: `Based on your risk profile and ${inv.type === 'etf' ? 'need for diversification' : 'compatibility score'}.`,
    }
  }).sort((a, b) => b.compositeScore - a.compositeScore)
}

// ─── Portfolio Builder ────────────────────────────────────────────────────────

const ROLE_COLORS: Record<PortfolioRole, string> = {
  core: '#3b82f6', growth: '#10b981', income: '#f59e0b', diversifier: '#06b6d4',
  defensive: '#64748b', satellite: '#8b5cf6', speculative: '#ef4444',
}

type BuilderLevel = 'starter' | 'growth' | 'advanced'

export function buildPortfolio(dna: DnaInput, level: BuilderLevel = 'starter'): PortfolioBlueprint {
  const vtol = (dna.volatility_tolerance ?? 'moderate').toLowerCase()
  const horizon = (dna.time_horizon ?? 'long').toLowerCase()
  const ws = (dna.wealth_style ?? 'accumulator').toLowerCase()
  const kl = (dna.knowledge_level ?? 'beginner').toLowerCase()
  const interests = dna.sector_interests ?? []
  const isConservative = vtol.includes('conserv') || vtol === 'low' || dna.risk_score < 35
  const isAggressive = vtol.includes('aggress') || vtol === 'high' || dna.risk_score > 70
  const wantsIncome = ws.includes('protect') || ws.includes('optim') || (dna as any)?.drawdown_tolerance <= 12
  const bondWeight = isConservative ? 0.20 : isAggressive ? 0.0 : horizon === 'short' ? 0.15 : 0.08
  const intlWeight = 0.15, dividendWeight = wantsIncome ? 0.12 : 0.08
  const usBroadWeight = Math.max(0.25, 0.55 - bondWeight)

  const core: PortfolioPosition[] = [
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', allocation: usBroadWeight, role: 'core', roleLabel: 'US Market Core', reason: `Your portfolio foundation — ${Math.round(usBroadWeight * 100)}% in broad US equities captures long-term market growth with instant diversification across 500 companies.`, color: ROLE_COLORS.core },
    { ticker: 'VXUS', name: 'Vanguard Total International ETF', type: 'etf', allocation: intlWeight, role: 'diversifier', roleLabel: 'Global Diversifier', reason: `${Math.round(intlWeight * 100)}% international exposure reduces your US home-country bias and captures growth in Europe, Asia, and emerging markets.`, color: ROLE_COLORS.diversifier },
  ]
  if (dividendWeight > 0) core.push({ ticker: 'SCHD', name: 'Schwab US Dividend ETF', type: 'etf', allocation: dividendWeight, role: 'income', roleLabel: 'Income Generator', reason: `${Math.round(dividendWeight * 100)}% in quality dividend stocks generates ${wantsIncome ? 'regular income aligned with your conservative profile' : 'compounding reinvestment power'}.`, color: ROLE_COLORS.income })
  if (bondWeight > 0) core.push({ ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'etf', allocation: bondWeight, role: 'defensive', roleLabel: 'Stability Anchor', reason: `${Math.round(bondWeight * 100)}% bonds stabilize your portfolio during equity selloffs. ${isConservative ? 'Critical given your conservative risk profile.' : 'A cushion for market volatility.'}`, color: ROLE_COLORS.defensive })

  const coreTotal = core.reduce((s, p) => s + p.allocation, 0)
  const satelliteTotal = Math.max(0, 1 - coreTotal)
  const satellite: PortfolioPosition[] = []

  if (level !== 'starter' && satelliteTotal > 0.05) {
    const interestThemes = THEMES.filter(t => interests.some(si => t.label.toLowerCase().includes(si.toLowerCase().slice(0, 4)) || t.id.includes(si.toLowerCase().replace(/ /g, '_'))))
    const picks: Array<{ ticker: string; reason: string }> = []
    if (interestThemes.some(t => t.id === 'artificial_intelligence') || isAggressive) picks.push({ ticker: 'QQQ', reason: 'Broad AI/tech exposure via Nasdaq-100' })
    if (interestThemes.some(t => t.id === 'cybersecurity')) picks.push({ ticker: 'CIBR', reason: 'Diversified cybersecurity theme ETF' })
    if (interestThemes.some(t => t.id === 'clean_energy')) picks.push({ ticker: 'ICLN', reason: 'Clean energy transition theme' })
    if (interestThemes.some(t => t.id === 'semiconductors')) picks.push({ ticker: 'SOXX', reason: 'Pure-play semiconductor ETF for AI chip cycle' })
    if (level === 'advanced') {
      if (!isConservative) picks.push({ ticker: 'MSFT', reason: 'Highest-quality AI platform play' })
      if (isAggressive) picks.push({ ticker: 'NVDA', reason: 'AI chip dominance — high conviction growth' })
      if (wantsIncome) picks.push({ ticker: 'O', reason: 'Monthly dividend income from net-lease REIT' })
    }
    const perPick = Math.min(0.08, satelliteTotal / Math.max(1, picks.length))
    picks.slice(0, 4).forEach(pick => {
      const inv = UNIVERSE_MAP[pick.ticker]
      if (inv) satellite.push({ ticker: pick.ticker, name: inv.name, type: inv.type, allocation: perPick, role: 'satellite', roleLabel: 'Satellite Holding', reason: pick.reason, color: ROLE_COLORS.satellite })
    })
  }

  const riskLabel = isConservative ? 'Conservative' : isAggressive ? 'Growth-Oriented' : 'Balanced'
  const expectedReturn = isConservative ? '6-8% p.a.' : isAggressive ? '10-14% p.a.' : '8-11% p.a.'
  const levelTitle = level === 'starter' ? 'Foundation Portfolio' : level === 'growth' ? 'Growth Portfolio' : 'Advanced Portfolio'
  const beginner = kl === 'beginner'

  return {
    title: levelTitle,
    description: beginner ? 'Your recommended starting portfolio — simple, low-cost, and built to grow over time.' : `A ${riskLabel.toLowerCase()} portfolio constructed around your DNA profile with ${satellite.length} satellite positions.`,
    core, satellite, etfSlots: ETF_SLOTS, riskLabel, expectedReturnLabel: expectedReturn,
    explanation: beginner
      ? 'We started with broad market ETFs because they give you instant diversification across hundreds of companies for a tiny fee. No stock-picking required.'
      : `Your core holds ${Math.round(coreTotal * 100)}% of the portfolio in low-cost ETFs. ${satellite.length > 0 ? `The remaining ${Math.round(satelliteTotal * 100)}% in satellites targets your specific interests.` : 'Add satellite positions as your confidence grows.'}`,
  }
}

// ─── Theme & Discovery ────────────────────────────────────────────────────────

export function getThemeInvestments(themeId: string, dna: DnaInput): ScoredInvestment[] {
  const theme = THEMES.find(t => t.id === themeId)
  if (!theme) return []
  return scoreInvestments(dna).filter(inv => theme.investments.includes(inv.ticker)).sort((a, b) => b.compositeScore - a.compositeScore)
}

export function discover(template: DiscoverTemplate, dna: DnaInput, riskFilter?: RiskLevel): ScoredInvestment[] {
  const scored = scoreInvestments(dna)
  const filters: Record<DiscoverTemplate, (inv: ScoredInvestment) => boolean> = {
    hidden_gem: inv => inv.type === 'stock' && inv.quality >= 75 && inv.valuation >= 58 && inv.dnaCompatibility >= 55 && inv.beta < 1.4,
    quality_compounder: inv => inv.quality >= 82 && inv.growth >= 65 && inv.safety >= 60,
    dividend_champion: inv => inv.dividendYield >= 0.025 && inv.quality >= 75 && inv.safety >= 65,
    high_growth: inv => inv.growth >= 80 && inv.momentum >= 75 && inv.type === 'stock',
    undervalued: inv => inv.valuation >= 62 && inv.quality >= 72 && inv.totalScore >= 68,
    contrarian: inv => inv.sentiment <= 65 && inv.quality >= 78 && inv.valuation >= 55,
  }
  const riskMap: Record<RiskLevel, number> = { low: 75, medium: 55, high: 35, very_high: 0 }
  const minSafety = riskFilter ? riskMap[riskFilter] : 0
  return scored.filter(inv => filters[template](inv) && inv.safety >= minSafety).slice(0, 4)
}

export const TEMPLATE_META: Record<DiscoverTemplate, { label: string; description: string; icon: string; color: string }> = {
  hidden_gem: { label: 'Hidden Gem', description: 'Undervalued quality companies with strong DNA fit', icon: '💎', color: '#10b981' },
  quality_compounder: { label: 'Quality Compounder', description: 'High-quality businesses that compound wealth steadily', icon: '📈', color: '#3b82f6' },
  dividend_champion: { label: 'Dividend Champion', description: 'Reliable income payers with strong fundamentals', icon: '💰', color: '#f59e0b' },
  high_growth: { label: 'High Growth', description: 'Fast-growing companies with strong momentum', icon: '🚀', color: '#8b5cf6' },
  undervalued: { label: 'Undervalued', description: 'Trading below intrinsic value with quality backing', icon: '🔍', color: '#06b6d4' },
  contrarian: { label: 'Contrarian Pick', description: 'Out-of-favour quality stocks sentiment may be recovering', icon: '🔄', color: '#f97316' },
}
