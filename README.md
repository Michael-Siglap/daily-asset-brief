# Daily Asset Brief ⚡

A free, open-source mobile-first financial dashboard for your morning briefing. Track stocks, crypto, commodities, and your personal portfolio — all in one clean dark-mode web app you can install on your iPhone or Android home screen.

**Deploy your own instance in one click — see [Deploy Your Own](#deploy-your-own) below.**

---

## Features

- **Morning Brief** — Daily snapshot of indices, stocks, crypto, and commodities with live prices and % change
- **Portfolio Tracker** — Add your holdings with purchase price and quantity; see real-time P&L, cost basis, and total value
- **Fundamentals Panel** — Tap any asset to see dividend yield, ex-dividend date, payout ratio, assets/liabilities ratio, P/E, debt/equity, free cash flow, profit margins, and more
- **News Feed** — Toggle between portfolio-specific news and broad market news
- **Top Movers** — Live gainers and losers across stocks, crypto, and commodities
- **No API Key Required** — Powered entirely by Yahoo Finance (free, no signup)
- **PWA Ready** — Install to your iPhone or Android home screen like a native app

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | [yahoo-finance2 v3](https://github.com/gadicc/yahoo-finance2) |
| State | React Context + localStorage |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Michael-Siglap/daily-asset-brief.git
cd daily-asset-brief
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No `.env` file needed — there are no API keys.

### Build for Production

```bash
npm run build
npm start
```

---

## Deploy Your Own

The fastest way is Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Michael-Siglap/daily-asset-brief)

1. Click the button above
2. Vercel auto-detects Next.js — no config needed
3. (Optional) Add a custom domain in **Settings → Domains**

No environment variables required.

---

## Install as a Mobile App (PWA)

**iPhone / iPad:**

1. Open `your-deployed-url.com` in Safari
2. Tap the Share button → **Add to Home Screen**
3. Tap **Add** — it launches fullscreen with a black status bar

**Android:**

1. Open in Chrome
2. Tap the menu → **Add to Home Screen**

---

## Project Structure

```text
daily-asset-brief/
├── app/
│   ├── page.tsx              # Morning Brief dashboard
│   ├── market/page.tsx       # Market overview + movers
│   ├── portfolio/page.tsx    # Portfolio tracker
│   ├── news/page.tsx         # News feed
│   └── api/
│       ├── quotes/           # Live prices
│       ├── fundamentals/     # P/E, dividends, ratios
│       ├── news/             # Yahoo Finance news
│       └── movers/           # Top gainers & losers
├── components/               # Reusable UI components
├── context/                  # Portfolio state (localStorage)
├── hooks/                    # Data fetching hooks
└── lib/                      # Types, utils, default watchlist
```

---

## Default Watchlist

Out of the box the app tracks:

| Category | Symbols |
| --- | --- |
| Indices | S&P 500, NASDAQ, Dow Jones |
| Stocks | AAPL, MSFT, NVDA, TSLA, AMZN |
| Crypto | BTC, ETH, SOL |
| Commodities | Gold, Crude Oil, Silver, Natural Gas |

Users can add any Yahoo Finance-supported ticker to their personal portfolio.

---

## Contributing

Contributions, bug reports, and feature ideas are very welcome. This project is intentionally kept simple so anyone can jump in and improve it — whether you're an experienced developer or vibe coding your way through with AI tools like Claude, Cursor, or Copilot.

### Ideas for improvement

- Price charts (sparklines or candlestick)
- Dividend calendar view
- Price alerts and push notifications
- Forex and bond support
- Dark/light mode toggle
- Currency conversion for non-USD users
- Watchlist customisation (add/remove from default list)
- Better accessibility (screen reader support)

### How to submit changes

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Make your changes and commit
4. Push and open a Pull Request

No strict style guide — keep it readable and mobile-friendly. If you're unsure about a change, open an issue first to discuss.

---

## License

MIT — free to use, fork, remix, and build on for everyone's benefit.

---

Built with ❤️ by [Michael Siglap](https://github.com/Michael-Siglap) · Powered by Yahoo Finance · Hosted on Vercel
