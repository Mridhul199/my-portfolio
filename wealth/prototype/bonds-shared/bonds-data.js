// Shared bond dataset + helpers used across all Bondly prototype screens.
// Rates/tenures/ratings modeled on real fixed-income marketplace patterns
// (gold-loan NBFC, microfinance NBFC, supply-chain NBFC, AAA housing finance, Govt T-Bill).
// Issuer names are fictional stand-ins, not real companies.

const BONDS = {
  'anand-gold': {
    id: 'anand-gold',
    name: 'Anand Gold Finance',
    type: 'Secured NCD · Gold Loan NBFC',
    initials: 'AG',
    grad: ['#7C3AED', '#4F7DF3'],
    rating: 'AA', agency: 'ICRA',
    riskTier: 'elevated',
    ytm: 10.00,
    tenureMonths: 12,
    unitPrice: 1000,
    minUnits: 10,
    soldPct: 68,
    issueSizeCr: 4.7,
    raisedCr: 3.2,
    securityCover: '1.0x',
    liquidityAfterMonths: 6,
    payoutFrequency: 'Monthly',
    nextPayout: '12 Aug 2026',
    maturity: 'Jul 2027',
    comforts: [
      'Loans are 100% secured against pledged gold ornaments',
      '3-year track record of on-time repayments',
      'Independent trustee-monitored escrow'
    ],
    risks: [
      'Concentrated in gold-loan NBFC lending',
      'Gold price volatility affects collateral value',
      'No sovereign or bank guarantee'
    ]
  },
  'vistaar-micro': {
    id: 'vistaar-micro',
    name: 'Vistaar Microfin',
    type: 'Secured NCD · Microfinance NBFC',
    initials: 'VM',
    grad: ['#FF8A5C', '#E8A33D'],
    rating: 'AA', agency: 'CRISIL',
    riskTier: 'elevated',
    ytm: 11.25,
    tenureMonths: 8,
    unitPrice: 1000,
    minUnits: 5,
    soldPct: 82,
    issueSizeCr: 3.1,
    raisedCr: 2.5,
    securityCover: '1.1x',
    liquidityAfterMonths: 6,
    payoutFrequency: 'Monthly',
    nextPayout: '10 Aug 2026',
    maturity: 'Mar 2027',
    comforts: [
      'Diversified across 40,000+ small-ticket borrowers',
      'Backed by 1.1x receivables cover',
      'Consistent portfolio quality — GNPA under 2%'
    ],
    risks: [
      'Microfinance sector sensitive to local economic shocks',
      'Higher operating risk than asset-backed NBFCs',
      'No sovereign or bank guarantee'
    ]
  },
  'progrowth-capital': {
    id: 'progrowth-capital',
    name: 'Progrowth Capital',
    type: 'Secured NCD · Supply Chain Financing NBFC',
    initials: 'PC',
    grad: ['#E8A33D', '#C2410C'],
    rating: 'A+', agency: 'CARE',
    riskTier: 'elevated',
    ytm: 12.00,
    tenureMonths: 5,
    unitPrice: 5000,
    minUnits: 5,
    soldPct: 54,
    issueSizeCr: 2.4,
    raisedCr: 1.3,
    securityCover: '1.0x',
    liquidityAfterMonths: null,
    payoutFrequency: 'At maturity',
    nextPayout: null,
    maturity: 'Dec 2026',
    comforts: [
      'Loans backed by invoices from established anchor corporates',
      'Short 5-month cycle reduces duration risk',
      'First-loss default guarantee from originator'
    ],
    risks: [
      'Concentrated in supply-chain financing sector',
      'Anchor corporate concentration risk',
      'No sovereign or bank guarantee'
    ]
  },
  'meridian-housing': {
    id: 'meridian-housing',
    name: 'Meridian Housing Finance',
    type: 'Secured NCD · Housing Finance',
    initials: 'MH',
    grad: ['#0FA968', '#4F7DF3'],
    rating: 'AAA', agency: 'CARE',
    riskTier: 'safe',
    ytm: 9.50,
    tenureMonths: 36,
    unitPrice: 1000,
    minUnits: 25,
    soldPct: 41,
    issueSizeCr: 8.5,
    raisedCr: 3.5,
    securityCover: '1.25x',
    liquidityAfterMonths: 6,
    payoutFrequency: 'Monthly',
    nextPayout: '18 Aug 2026',
    maturity: 'Jul 2029',
    comforts: [
      'Loans secured against registered mortgages',
      'Highest safety rating (AAA) from CARE',
      '1.25x asset cover — highest among comparable NBFC bonds'
    ],
    risks: [
      'Long 36-month lock-in reduces flexibility',
      'Real estate slowdown could affect underlying assets',
      'No sovereign or bank guarantee'
    ]
  },
  'govt-tbill': {
    id: 'govt-tbill',
    name: 'Government of India T-Bill',
    type: 'Sovereign · 91-Day Treasury Bill',
    initials: 'GS',
    grad: ['#4B4768', '#8D89A6'],
    rating: 'Sovereign', agency: 'RBI',
    riskTier: 'safe',
    ytm: 7.20,
    tenureMonths: 3,
    unitPrice: 10000,
    minUnits: 1,
    soldPct: 93,
    issueSizeCr: 50,
    raisedCr: 46.5,
    securityCover: 'Sovereign guarantee',
    liquidityAfterMonths: null,
    payoutFrequency: 'At maturity',
    nextPayout: null,
    maturity: '14 Oct 2026',
    comforts: [
      'Directly issued and guaranteed by the Government of India',
      'Zero credit risk — backed by sovereign guarantee',
      'Highly liquid secondary market'
    ],
    risks: [
      'Returns are lower than corporate bonds',
      'Interest-rate risk if sold before maturity',
      'Discount-instrument structure — no periodic payout'
    ]
  }
};

const DEFAULT_BOND = 'anand-gold';

function getBondFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('bond');
  return BONDS[id] || BONDS[DEFAULT_BOND];
}

function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Simple (non-compounding) interest projection — matches how YTM is quoted on the cards.
function computeReturns(bond, units) {
  const invest = units * bond.unitPrice;
  const years = bond.tenureMonths / 12;
  const totalValue = invest * (1 + (bond.ytm / 100) * years);
  const monthlyTotal = bond.payoutFrequency === 'Monthly'
    ? invest * (bond.ytm / 100) / 12
    : 0;
  return { invest, totalValue, monthlyTotal };
}

// Shared filter-tag vocabulary — used by both Home's FOR YOU quick-picks (which deep-link
// into the listing pre-filtered) and the Listing page's own filter chips/category grid.
const RATING_RANK = { 'A+': 1, 'AA': 2, 'AAA': 3, 'Sovereign': 4 };
const TAG_TESTS = {
  'high-yield': b => b.ytm >= 11.25,
  'short-tenure': b => b.tenureMonths <= 8,
  'aa-above': b => RATING_RANK[b.rating] >= 2,
  'aaa-above': b => RATING_RANK[b.rating] >= 3,
  'govt': b => b.securityCover === 'Sovereign guarantee',
  'under10k': b => b.unitPrice * b.minUnits <= 10000,
  'low-min': b => b.unitPrice * b.minUnits <= 5000,
  'sell6mo': b => b.liquidityAfterMonths === 6,
  'monthly-payout': b => b.payoutFrequency === 'Monthly'
};
const TAG_LABELS = {
  'high-yield': 'High returns',
  'short-tenure': 'Short tenure',
  'aa-above': 'AA & above',
  'aaa-above': 'AAA & above',
  'govt': 'Govt bonds',
  'under10k': 'Under ₹10k min',
  'low-min': 'Invest with ₹5k',
  'sell6mo': 'Early exit (6mo+)',
  'monthly-payout': 'Monthly interest'
};
