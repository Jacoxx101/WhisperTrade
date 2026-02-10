# WhisperTrade API Integration

AI-powered social sentiment stock analysis platform with real-time data from YouTube, Twitter, Reddit, and stock price APIs.

## Features

- **Real-time Stock Prices**: Powered by Alpha Vantage API
- **YouTube Sentiment**: Analyze video content and comments for stock mentions
- **Twitter/X Sentiment**: Track cashtag mentions and analyze tweet sentiment
- **Reddit Sentiment**: Monitor discussions in r/wallstreetbets, r/stocks, and more
- **AI-Powered Analysis**: OpenAI GPT-4o-mini for sentiment scoring
- **Signal Aggregation**: Weighted sentiment scoring across all sources
- **Auto-Refresh**: Automatic data updates every 2 minutes
- **Rate Limiting Protection**: Smart caching to avoid API limits

## API Integrations

### 1. Alpha Vantage (Stock Prices)
- **Endpoint**: `/api/stock/[ticker]/price`
- **Features**:
  - Real-time stock quotes
  - Rate limit handling (5 calls/minute free tier)
  - 5-minute caching
- **Setup**: Free API key included (500 calls/day)

### 2. YouTube Data API
- **Endpoint**: `/api/sentiment/youtube?ticker=AAPL`
- **Features**:
  - Search videos by ticker mention
  - Extract video metadata and comments
  - 10-minute caching
- **Setup**: API key included (quota limits apply)

### 3. Twitter/X API (Optional)
- **Endpoint**: `/api/sentiment/twitter?ticker=AAPL`
- **Features**:
  - Search by cashtag ($AAPL)
  - Weight by follower count
  - 5-minute caching
- **Setup**: Requires Twitter Basic tier API key

### 4. Reddit API
- **Endpoint**: `/api/sentiment/reddit?ticker=AAPL`
- **Features**:
  - Search r/wallstreetbets, r/stocks, r/investing
  - Works with or without OAuth
  - 5-minute caching
- **Setup**: Optional OAuth for higher rate limits

### 5. Signal Aggregation
- **Endpoint**: `/api/signal?ticker=AAPL` or `/api/signal?tickers=AAPL,NVDA,TSLA`
- **Features**:
  - Combines all sentiment sources
  - AI-powered analysis (OpenAI)
  - Fallback rule-based analysis
  - Weighted scoring algorithm

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd WhisperTrade-PUSH
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required
ALPHA_VANTAGE_API_KEY=0LPF2FXTGBMALMFN
YOUTUBE_API_KEY=AIzaSyARZsPRNG0CZOYHmE7qSoh1hrlVjQcFX3Y

# Optional (for enhanced sentiment analysis)
OPENAI_API_KEY=your_openai_api_key_here
TWITTER_BEARER_TOKEN=your_twitter_token_here
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## API Rate Limits

| Service | Free Tier | Cache Duration |
|---------|-----------|----------------|
| Alpha Vantage | 5 calls/min, 500/day | 5 minutes |
| YouTube | 10,000 units/day | 10 minutes |
| Twitter | Requires Basic tier | 5 minutes |
| Reddit | 60 requests/min | 5 minutes |

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── stock/[ticker]/price/     # Stock price endpoint
│   │   ├── sentiment/
│   │   │   ├── youtube/              # YouTube sentiment
│   │   │   ├── twitter/              # Twitter sentiment
│   │   │   └── reddit/               # Reddit sentiment
│   │   └── signal/                   # Aggregated signals
│   └── dashboard/                    # Frontend pages
├── lib/
│   ├── api/                          # API service modules
│   │   ├── alphavantage.ts           # Alpha Vantage integration
│   │   ├── youtube.ts                # YouTube API integration
│   │   ├── twitter.ts                # Twitter API integration
│   │   ├── reddit.ts                 # Reddit API integration
│   │   └── openai.ts                 # OpenAI sentiment analysis
│   ├── services/
│   │   └── signal-aggregator.ts      # Signal aggregation engine
│   └── api-client.ts                 # Frontend API utilities
└── types/                            # TypeScript types
```

## Usage Examples

### Fetch Stock Price
```typescript
const response = await fetch('/api/stock/AAPL/price');
const { data } = await response.json();
// data: { ticker, price, change, changePercent, ... }
```

### Fetch Sentiment
```typescript
// Single source
const youtube = await fetch('/api/sentiment/youtube?ticker=AAPL');
const twitter = await fetch('/api/sentiment/twitter?ticker=AAPL');
const reddit = await fetch('/api/sentiment/reddit?ticker=AAPL');

// Aggregated signal
const signal = await fetch('/api/signal?ticker=AAPL');
const batch = await fetch('/api/signal?tickers=AAPL,NVDA,TSLA');
```

### Analyze Custom Ticker
```typescript
const response = await fetch('/api/signal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticker: 'AAPL',
    config: {
      useYouTube: true,
      useTwitter: true,
      useReddit: true,
      maxYouTubeVideos: 5,
      maxTweets: 20,
      maxRedditPosts: 10,
    }
  })
});
```

## Getting API Keys

### Alpha Vantage
1. Visit https://www.alphavantage.co/support/#api-key
2. Sign up for free API key
3. 500 requests per day, 5 per minute

### YouTube Data API
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)

### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create an API key
3. Recommended: Set usage limits to control costs

### Twitter/X API
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Apply for Basic tier ($100/month)
3. Create an app and get Bearer Token

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" → "script"
3. Note the Client ID and Client Secret

## Troubleshooting

### "API rate limit exceeded"
- Wait for the cache to refresh (see cache durations above)
- Check your API quota usage in respective dashboards

### "Twitter API not configured"
- Twitter requires a paid API tier for search
- Set `TWITTER_BEARER_TOKEN` in `.env.local`

### "No data available"
- Check your API keys are correctly set
- Verify network connectivity
- Check browser console for error details

### Build errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (v18+ required)
- Clear cache: `rm -rf .next node_modules && npm install`

## License

MIT License - See LICENSE file for details.

## Disclaimer

This platform provides AI-generated sentiment analysis for informational purposes only. It does not constitute financial advice. Always do your own research and consult a financial advisor before making investment decisions.
