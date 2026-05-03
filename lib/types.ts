export interface QuoteData {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  category: string;
}

export interface FundamentalsData {
  symbol: string;
  dividendRate: number | null;
  dividendYield: number | null;
  exDividendDate: string | null;
  payoutRatio: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  currentRatio: number | null;       // assets / liabilities
  debtToEquity: number | null;
  epsTrailing: number | null;
  revenueGrowth: number | null;
  profitMargins: number | null;
  totalCash: number | null;
  totalDebt: number | null;
  freeCashflow: number | null;
  returnOnEquity: number | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  relatedSymbols: string[];
  thumbnail?: string;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate?: string;
  category: string;
}

export interface HoldingWithValue extends PortfolioHolding {
  currentPrice: number | null;
  currentValue: number | null;
  costBasis: number;
  pnl: number | null;
  pnlPercent: number | null;
  changePercent: number | null;
}
