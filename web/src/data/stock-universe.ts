export type Market = 'US' | 'JP' | 'SG'
export type RiskTier = 1 | 2 | 3 | 4
export type Currency = 'USD' | 'JPY' | 'SGD'

export interface UniverseStock {
  ticker: string
  name: string
  market: Market
  currency: Currency
  sector: string
  riskTier: RiskTier
  narrative: string
  approxPrice: number  // in native currency — for display estimates only
}

// Exchange rates (approximate, for display conversion to USD)
export const FX: Record<Currency, number> = {
  USD: 1,
  JPY: 1 / 150,   // 1 JPY ≈ 0.0067 USD
  SGD: 1 / 1.35,  // 1 SGD ≈ 0.74 USD
}

export function toUSD(amount: number, currency: Currency): number {
  return amount * FX[currency]
}

export const STOCK_UNIVERSE: UniverseStock[] = [

  // ── US — Tier 1: Capital Preservation Core ──────────────────────────────────
  {
    ticker: 'BRK-B',
    name: 'Berkshire Hathaway B',
    market: 'US', currency: 'USD', sector: 'Financials', riskTier: 1,
    approxPrice: 470,
    narrative: "Buffett's diversified holding company with $160B+ in cash, 60+ operating businesses, and 58 years of compounding. The ultimate capital-preservation machine.",
  },
  {
    ticker: 'V',
    name: 'Visa',
    market: 'US', currency: 'USD', sector: 'Financials', riskTier: 1,
    approxPrice: 335,
    narrative: 'Network monopoly processing $14T+ in payments annually at 80%+ gross margins. Recession-resistant — people spend in good times and bad.',
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly',
    market: 'US', currency: 'USD', sector: 'Healthcare', riskTier: 1,
    approxPrice: 750,
    narrative: 'First-mover in the GLP-1 obesity drug revolution. Their Mounjaro and Zepbound pipelines could reshape global healthcare for a generation.',
  },
  {
    ticker: 'COST',
    name: 'Costco Wholesale',
    market: 'US', currency: 'USD', sector: 'Consumer Staples', riskTier: 1,
    approxPrice: 950,
    narrative: 'Membership-driven retail moat with 93% renewal rates. Thrives in recessions and booms alike — loyal premium shoppers are the most defensible in retail.',
  },
  {
    ticker: 'JPM',
    name: 'JP Morgan Chase',
    market: 'US', currency: 'USD', sector: 'Financials', riskTier: 1,
    approxPrice: 260,
    narrative: "America's dominant bank firing on all cylinders — investment banking, consumer, and wealth management each leading their industries.",
  },

  // ── US — Tier 2: Quality Growth ──────────────────────────────────────────────
  {
    ticker: 'ASML',
    name: 'ASML Holding',
    market: 'US', currency: 'USD', sector: 'Semiconductors', riskTier: 2,
    approxPrice: 750,
    narrative: 'Sole maker of extreme ultraviolet lithography machines. Every advanced chip from TSMC, Samsung, and Intel is impossible without ASML. True monopoly.',
  },
  {
    ticker: 'TTD',
    name: 'The Trade Desk',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 2,
    approxPrice: 80,
    narrative: 'Programmatic ad buying platform winning as TV moves to streaming. Advertisers have no viable alternative at scale — 95%+ client retention.',
  },
  {
    ticker: 'AXON',
    name: 'Axon Enterprise',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 2,
    approxPrice: 540,
    narrative: "Taser + body cameras = near-monopoly on law enforcement gear. Now expanding into evidence management software — locking departments in for life.",
  },
  {
    ticker: 'MELI',
    name: 'MercadoLibre',
    market: 'US', currency: 'USD', sector: 'Consumer Discretionary', riskTier: 2,
    approxPrice: 2100,
    narrative: 'Amazon + PayPal for Latin America — 700M underbanked consumers entering the digital economy. E-commerce and fintech flywheel is just getting started.',
  },
  {
    ticker: 'DDOG',
    name: 'Datadog',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 2,
    approxPrice: 120,
    narrative: 'Cloud infrastructure monitoring that enterprise teams depend on daily. 130%+ net revenue retention — once deployed, it only grows.',
  },
  {
    ticker: 'CELH',
    name: 'Celsius Holdings',
    market: 'US', currency: 'USD', sector: 'Consumer Staples', riskTier: 2,
    approxPrice: 28,
    narrative: "Fastest-growing energy drink brand globally, taking shelf space from Monster and Red Bull in Walmart, 7-Eleven, and gyms worldwide. Pepsi's distribution gives it wings.",
  },
  {
    ticker: 'MA',
    name: 'Mastercard',
    market: 'US', currency: 'USD', sector: 'Financials', riskTier: 2,
    approxPrice: 520,
    narrative: 'Second half of the payments duopoly with Visa. Benefits from every cash-to-digital shift globally — emerging markets are the next decades of growth.',
  },

  // ── US — Tier 3: High-Upside Growth ──────────────────────────────────────────
  {
    ticker: 'NET',
    name: 'Cloudflare',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 3,
    approxPrice: 115,
    narrative: 'Zero-trust security and global network infrastructure — governments and enterprises trust Cloudflare with mission-critical traffic. Growing into AI inference.',
  },
  {
    ticker: 'KTOS',
    name: 'Kratos Defense',
    market: 'US', currency: 'USD', sector: 'Industrials', riskTier: 3,
    approxPrice: 35,
    narrative: 'Pioneer in low-cost autonomous drones and unmanned systems for the Pentagon. Defense budgets are shifting to autonomous — Kratos is 10 years ahead.',
  },
  {
    ticker: 'RKLB',
    name: 'Rocket Lab USA',
    market: 'US', currency: 'USD', sector: 'Industrials', riskTier: 3,
    approxPrice: 20,
    narrative: 'Most reliable small satellite launch service in the world, now vertically integrating into spacecraft manufacturing. Space is becoming infrastructure.',
  },
  {
    ticker: 'DUOL',
    name: 'Duolingo',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 3,
    approxPrice: 310,
    narrative: 'Near-monopoly in language learning with 100M+ daily users. AI features are compounding engagement — subscription revenue growing 40%+ annually.',
  },
  {
    ticker: 'HIMS',
    name: 'Hims & Hers Health',
    market: 'US', currency: 'USD', sector: 'Healthcare', riskTier: 3,
    approxPrice: 30,
    narrative: 'Direct-to-consumer telehealth disrupting pharmacy distribution. Compounded GLP-1 medications are a near-term catalyst with massive addressable market.',
  },
  {
    ticker: 'SMCI',
    name: 'Super Micro Computer',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 3,
    approxPrice: 35,
    narrative: "NVIDIA's preferred AI server rack integrator. Unique liquid cooling tech and rapid iteration gives SMCI a structural advantage in the GPU cluster buildout.",
  },
  {
    ticker: 'CRWD',
    name: 'CrowdStrike Holdings',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 3,
    approxPrice: 380,
    narrative: 'AI-native cybersecurity platform protecting governments and enterprises. 98%+ retention rate and expanding beyond endpoint to identity and cloud security.',
  },

  // ── US — Tier 4: Speculative / Emerging ───────────────────────────────────────
  {
    ticker: 'MP',
    name: 'MP Materials',
    market: 'US', currency: 'USD', sector: 'Materials', riskTier: 4,
    approxPrice: 18,
    narrative: "America's only rare earth mining company — critical for EV motors and defense. US government contracts provide floor while China tension creates strategic premium.",
  },
  {
    ticker: 'IONQ',
    name: 'IonQ',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 4,
    approxPrice: 35,
    narrative: "Pure-play quantum computing hardware with US government and Microsoft Azure partnerships. If quantum advantage arrives, early movers capture everything.",
  },
  {
    ticker: 'RXRX',
    name: 'Recursion Pharmaceuticals',
    market: 'US', currency: 'USD', sector: 'Healthcare', riskTier: 4,
    approxPrice: 6,
    narrative: 'AI-native drug discovery partnered directly with NVIDIA. Using deep learning to compress drug development from 15 years to 3 — a $60T market disruption.',
  },
  {
    ticker: 'ACHR',
    name: 'Archer Aviation',
    market: 'US', currency: 'USD', sector: 'Industrials', riskTier: 4,
    approxPrice: 10,
    narrative: 'eVTOL air taxi backed by United Airlines and Stellantis. FAA certification is the binary catalyst — urban air mobility is a trillion-dollar market.',
  },
  {
    ticker: 'ASTS',
    name: 'AST SpaceMobile',
    market: 'US', currency: 'USD', sector: 'Technology', riskTier: 4,
    approxPrice: 28,
    narrative: 'Building satellite broadband that connects directly to standard smartphones — targeting the 4B people without reliable internet access.',
  },

  // ── Japan / Nikkei ────────────────────────────────────────────────────────────
  {
    ticker: '7203.T',
    name: 'Toyota Motor',
    market: 'JP', currency: 'JPY', sector: 'Consumer Discretionary', riskTier: 1,
    approxPrice: 3300,
    narrative: "World's most profitable automaker and the undisputed hybrid vehicle leader. Betting on multiple propulsion futures — not just EVs — gives Toyota unmatched flexibility.",
  },
  {
    ticker: '9983.T',
    name: 'Fast Retailing (Uniqlo)',
    market: 'JP', currency: 'JPY', sector: 'Consumer Discretionary', riskTier: 1,
    approxPrice: 55000,
    narrative: 'Uniqlo is winning globally with affordable quality basics. Aggressive expansion in Southeast Asia, Middle East, and North America is just the beginning.',
  },
  {
    ticker: '6861.T',
    name: 'Keyence',
    market: 'JP', currency: 'JPY', sector: 'Industrials', riskTier: 2,
    approxPrice: 65000,
    narrative: "Japan's most margin-rich company — sells factory automation sensors at software-like margins. Every manufacturer globally needs their products to compete.",
  },
  {
    ticker: '7974.T',
    name: 'Nintendo',
    market: 'JP', currency: 'JPY', sector: 'Technology', riskTier: 2,
    approxPrice: 9000,
    narrative: 'Irreplaceable IP portfolio — Mario, Zelda, Pokemon. Switch 2 launch creates a major hardware upgrade cycle on top of a growing digital and mobile business.',
  },
  {
    ticker: '6920.T',
    name: 'Lasertec',
    market: 'JP', currency: 'JPY', sector: 'Semiconductors', riskTier: 3,
    approxPrice: 17000,
    narrative: 'Sole global supplier of EUV photomask inspection tools — every advanced chip fab must use their machines. Harder monopoly than ASML in its niche.',
  },
  {
    ticker: '6146.T',
    name: 'Disco Corp',
    market: 'JP', currency: 'JPY', sector: 'Semiconductors', riskTier: 3,
    approxPrice: 38000,
    narrative: 'Monopoly in precision dicing saws for semiconductor wafers — 80%+ global market share. AI chip packaging creates a new demand wave for ultra-precision cutting.',
  },
  {
    ticker: '6857.T',
    name: 'Advantest',
    market: 'JP', currency: 'JPY', sector: 'Semiconductors', riskTier: 3,
    approxPrice: 8000,
    narrative: 'Leading semiconductor test equipment manufacturer. As AI chips grow more complex, they require far more testing hours — Advantest is the primary beneficiary.',
  },
  {
    ticker: '9984.T',
    name: 'SoftBank Group',
    market: 'JP', currency: 'JPY', sector: 'Technology', riskTier: 4,
    approxPrice: 10000,
    narrative: "Trading at a ~40% discount to NAV on its ARM Holdings stake and AI portfolio. A bet on Masayoshi Son's AI vision at a deep discount.",
  },

  // ── Singapore / SGX ───────────────────────────────────────────────────────────
  {
    ticker: 'D05.SI',
    name: 'DBS Group',
    market: 'SG', currency: 'SGD', sector: 'Financials', riskTier: 1,
    approxPrice: 40,
    narrative: "Consistently Asia's best bank. 5-6% dividend yield, dominant Singapore wealth management, and growing digital banking franchise across Southeast Asia.",
  },
  {
    ticker: 'O39.SI',
    name: 'OCBC Bank',
    market: 'SG', currency: 'SGD', sector: 'Financials', riskTier: 1,
    approxPrice: 15,
    narrative: "Rock-solid Singapore bank with consistent dividend payouts and growing exposure to Malaysia and Indonesia — the region's two largest emerging markets.",
  },
  {
    ticker: 'U96.SI',
    name: 'Sembcorp Industries',
    market: 'SG', currency: 'SGD', sector: 'Energy', riskTier: 2,
    approxPrice: 5,
    narrative: "Singapore's energy transition champion — rapidly converting coal assets to solar and wind across Asia. Underappreciated green energy play with government backing.",
  },
  {
    ticker: 'C38U.SI',
    name: 'CapitaLand Integrated REIT',
    market: 'SG', currency: 'SGD', sector: 'Real Estate', riskTier: 2,
    approxPrice: 2,
    narrative: 'Singapore largest REIT — owns Raffles City, ION Orchard, and CapitaSpring. Trophy assets in the most premium Singapore retail and office locations.',
  },
  {
    ticker: 'BN4.SI',
    name: 'Keppel Corporation',
    market: 'SG', currency: 'SGD', sector: 'Industrials', riskTier: 2,
    approxPrice: 6,
    narrative: 'Singapore conglomerate pivoting to asset management and infrastructure. Data center and sustainability play with strong government alignment.',
  },
  {
    ticker: 'BS6.SI',
    name: 'Yangzijiang Shipbuilding',
    market: 'SG', currency: 'SGD', sector: 'Industrials', riskTier: 3,
    approxPrice: 2.8,
    narrative: "World's leading private shipbuilder with a multi-year order backlog. LNG and container ship supercycle — global shipping capacity constraints benefit order books.",
  },
  {
    ticker: 'SE',
    name: 'Sea Limited',
    market: 'SG', currency: 'USD', sector: 'Technology', riskTier: 3,
    approxPrice: 100,
    narrative: 'Garena + Shopee + SeaMoney — dominant pan-SEA super platform. After a painful investment phase, margins are improving and the flywheel is re-accelerating.',
  },
  {
    ticker: 'MZH.SI',
    name: 'Nanofilm Technologies',
    market: 'SG', currency: 'SGD', sector: 'Technology', riskTier: 4,
    approxPrice: 1.0,
    narrative: 'Ultra-thin coating tech for premium electronics and medtech devices — monopoly-like IP protecting Samsung, Apple supply chain customers. Expanding into photovoltaics.',
  },
]
