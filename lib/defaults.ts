export const DEFAULT_WATCHLIST = [
  // Indices
  { symbol: "^GSPC", name: "S&P 500", category: "index" },
  { symbol: "^IXIC", name: "NASDAQ", category: "index" },
  { symbol: "^DJI", name: "Dow Jones", category: "index" },
  // Stocks
  { symbol: "AAPL", name: "Apple", category: "stock" },
  { symbol: "MSFT", name: "Microsoft", category: "stock" },
  { symbol: "NVDA", name: "NVIDIA", category: "stock" },
  { symbol: "TSLA", name: "Tesla", category: "stock" },
  { symbol: "AMZN", name: "Amazon", category: "stock" },
  // Crypto
  { symbol: "BTC-USD", name: "Bitcoin", category: "crypto" },
  { symbol: "ETH-USD", name: "Ethereum", category: "crypto" },
  { symbol: "SOL-USD", name: "Solana", category: "crypto" },
  // Commodities
  { symbol: "GC=F", name: "Gold", category: "commodity" },
  { symbol: "CL=F", name: "Crude Oil (WTI)", category: "commodity" },
  { symbol: "SI=F", name: "Silver", category: "commodity" },
  { symbol: "NG=F", name: "Natural Gas", category: "commodity" },
];

export const CATEGORY_ORDER = ["index", "stock", "crypto", "commodity"];
