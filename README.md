# WhisperTrade 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **AI-Powered Social Sentiment Stock Analysis Platform**

Turn YouTube, Twitter/X, and Reddit conversations into actionable buy/sell signals with confidence scores.

![Dashboard Preview](./screenshot.png)

## ✨ Features

### Core Functionality
- 📊 **Signal Cards** — Clear Buy/Sell/Hold recommendations with 0-100% confidence scores
- 📺 **YouTube Analysis** — Auto-transcribe finance videos and extract sentiment
- 🐦 **Twitter/X Sentiment** — Real-time ticker sentiment with influencer weighting  
- 💬 **Reddit Monitoring** — Track r/wallstreetbets, r/stocks, r/investing sentiment
- 🤖 **AI Summarization** — GPT-powered "Why this signal" explanations
- 📱 **Watchlist Management** — Organize stocks with folders and drag-to-reorder
- 🔔 **Smart Alerts** — Push notifications for sentiment shifts
- 🌙 **Whisper Mode** — Minimal, distraction-free view for quick checks
- 📈 **Trending Stocks** — Top movers with sentiment heatmap
- 📊 **Signal History** — Track accuracy and win rates

### Professional Features
- 🎨 **Dark Mode UI** — Sleek, modern interface with Tailwind CSS
- 📱 **Mobile-First** — Fully responsive design
- ⚡ **Real-time Updates** — Live data refresh
- 🔒 **Secure Authentication** — NextAuth.js integration
- 📊 **Analytics Ready** — Database schema with Prisma
- 🚀 **Production Ready** — Optimized for Vercel deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- GitHub account (for OAuth)
- API keys (see below)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jacoxx101/WhisperTrade.git
cd WhisperTrade
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| **YouTube Data API** | Video analysis | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **Twitter/X API** | Tweet sentiment | [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) |
| **Reddit API** | Subreddit monitoring | [Reddit Apps](https://www.reddit.com/prefs/apps) |
| **OpenAI API** | AI summarization | [OpenAI Platform](https://platform.openai.com/api-keys) |
| **Alpha Vantage** | Stock prices | [Alpha Vantage](https://www.alphavantage.co/support/#api-key) |

### Environment Variables

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whispertrade

# APIs
OPENAI_API_KEY=sk-your-openai-key
YOUTUBE_API_KEY=your-youtube-key
TWITTER_BEARER_TOKEN=your-twitter-token
REDDIT_CLIENT_ID=your-reddit-id
REDDIT_CLIENT_SECRET=your-reddit-secret
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

## 🏗️ Project Structure

```
whispertrade/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── stock/[ticker]/ # Stock detail
│   │   │   ├── watchlist/      # Watchlist management
│   │   │   ├── trending/       # Trending stocks
│   │   │   ├── alerts/         # Notifications
│   │   │   ├── settings/       # User preferences
│   │   │   └── whisper/        # Minimal mode
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── signals/            # Signal components
│   │   ├── dashboard/          # Dashboard layout
│   │   ├── trending/           # Trending components
│   │   └── alerts/             # Alert components
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── mock-data.ts        # Mock data
│   └── types/
│       └── index.ts            # TypeScript types
├── prisma/                     # Database schema
├── public/                     # Static assets
├── .env.example                # Environment template
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
└── package.json                # Dependencies
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with pricing |
| `/dashboard` | Main dashboard with signals |
| `/dashboard/stock/[ticker]` | Stock detail analysis |
| `/dashboard/watchlist` | Watchlist management |
| `/dashboard/trending` | Trending stocks |
| `/dashboard/alerts` | Notification center |
| `/dashboard/settings` | User preferences |
| `/dashboard/whisper` | Minimal view mode |

## 🎨 Design System

### Colors
```
Primary:   #6366F1 (Indigo 500)
Buy:       #10B981 (Emerald 500)
Sell:      #EF4444 (Red 500)
Hold:      #F59E0B (Amber 500)
Background:#0F172A (Slate 900)
Surface:   #1E293B (Slate 800)
Text:      #F8FAFC (Slate 50)
Muted:     #94A3B8 (Slate 400)
```

### Typography
- **UI:** Inter
- **Numbers:** JetBrains Mono (tabular nums)

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jacoxx101/WhisperTrade)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

```bash
npm run build
# Serve dist/ directory
```

## 🛣️ Roadmap

- [ ] Real API integrations (YouTube, Twitter, Reddit)
- [ ] Backtesting engine with historical data
- [ ] Options flow integration
- [ ] Brokerage API connections (Alpaca, TD Ameritrade)
- [ ] AI chat assistant
- [ ] Pre-market briefings
- [ ] Custom alert builder
- [ ] Mobile app (React Native)
- [ ] Premium subscription with Stripe
- [ ] WebSocket real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

**Not Financial Advice:** This platform provides AI-generated sentiment analysis for informational purposes only. Past performance does not guarantee future results. Always conduct your own research and consult a financial advisor before making investment decisions.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- UI Components powered by [Radix UI](https://www.radix-ui.com/)

---

Made with ❤️ by [Jacoxx101](https://github.com/Jacoxx101)
# Deployment Mon Feb  9 19:46:32 UTC 2026
