// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  TrendingUp, 
  Youtube, 
  Twitter, 
  MessageSquare,
  ArrowRight,
  Check
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-text">
            Whisper<span className="text-primary">Trade</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted hover:text-text transition-colors hidden sm:block">
            Log In
          </Link>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Stock Signals
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text mb-6 leading-tight">
            Turn Social Media Noise Into{' '}
            <span className="text-gradient">Trading Signals</span>
          </h1>
          <p className="text-lg md:text-xl text-muted mb-8 max-w-2xl mx-auto">
            WhisperTrade analyzes YouTube, Twitter, and Reddit to generate AI-powered 
            buy/sell signals with confidence scores. Make smarter trades in under 3 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">How It Works</h2>
            <p className="text-muted">We analyze millions of social signals so you don&apos;t have to</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="w-12 h-12 rounded-lg bg-sell/10 flex items-center justify-center mb-4">
                <Youtube className="w-6 h-6 text-sell" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">YouTube Analysis</h3>
              <p className="text-muted">
                Auto-transcribe finance videos and extract sentiment from top creators like 
                Meet Kevin and Graham Stephan.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Twitter className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Twitter/X Sentiment</h3>
              <p className="text-muted">
                Real-time analysis of tweets, threads, and influencer opinions weighted 
                by follower count and accuracy.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Reddit Monitoring</h3>
              <p className="text-muted">
                Track r/wallstreetbets, r/stocks, and r/investing for crowd sentiment 
                and meme stock momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Card Preview */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text mb-4">
                Clear Buy/Sell Signals in Seconds
              </h2>
              <p className="text-muted mb-6">
                No more overwhelming dashboards. Get a clear signal with confidence score, 
                AI summary, and source transparency.
              </p>
              <ul className="space-y-3">
                {[
                  "Buy/Sell/Hold recommendations",
                  "Confidence scores (0-100%)",
                  "AI-generated summaries",
                  "Source transparency",
                  "Real-time alerts"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-text">
                    <Check className="w-5 h-5 text-buy" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Mock Signal Card */}
            <div className="bg-surface rounded-2xl p-6 border border-border border-l-4 border-l-buy shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center">
                    <span className="font-mono font-bold text-lg text-text">NV</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text">NVDA</h3>
                    <p className="text-sm text-muted">NVIDIA Corporation</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 font-semibold rounded-lg border bg-buy/10 border-buy/30 text-buy px-3 py-1 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  BUY
                </span>
              </div>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-mono font-bold text-text">$892.34</span>
                <span className="font-mono font-medium text-buy">+5.39%</span>
              </div>
              
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Confidence</span>
                  <span className="font-medium text-text">92% — Very High</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-2">
                  <div className="bg-buy h-2 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
              
              <p className="text-sm text-muted mb-4">
                Earnings beat expectations with strong AI demand commentary
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Youtube className="w-4 h-4" /> 6
                  </span>
                  <span className="flex items-center gap-1">
                    <Twitter className="w-4 h-4" /> 12
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> 5
                  </span>
                </div>
                <span>5m ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-16 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">Simple Pricing</h2>
            <p className="text-muted">Start free, upgrade when you&apos;re ready</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-semibold text-text mb-2">Free</h3>
              <p className="text-3xl font-bold text-text mb-4">$0</p>
              <p className="text-muted text-sm mb-6">Perfect for trying out</p>
              <ul className="space-y-2 mb-6">
                {[
                  "5 stocks in watchlist",
                  "Daily data refresh",
                  "Basic sentiment scores",
                  "Email alerts"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-buy" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">Get Started</Button>
            </div>
            
            {/* Pro Plan */}
            <div className="p-6 rounded-xl bg-surface border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Pro</h3>
              <p className="text-3xl font-bold text-text mb-4">$19<span className="text-lg text-muted">/mo</span></p>
              <p className="text-muted text-sm mb-6">For active traders</p>
              <ul className="space-y-2 mb-6">
                {[
                  "Unlimited watchlist",
                  "Real-time data",
                  "AI summaries",
                  "Push notifications",
                  "Source transparency",
                  "Whisper mode"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-buy" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Start Free Trial</Button>
            </div>
            
            {/* Premium Plan */}
            <div className="p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-semibold text-text mb-2">Premium</h3>
              <p className="text-3xl font-bold text-text mb-4">$39<span className="text-lg text-muted">/mo</span></p>
              <p className="text-muted text-sm mb-6">For power users</p>
              <ul className="space-y-2 mb-6">
                {[
                  "Everything in Pro",
                  "Backtesting engine",
                  "API access",
                  "Custom alerts",
                  "Priority support",
                  "White-label exports"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-buy" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text mb-4">
            Ready to Trade Smarter?
          </h2>
          <p className="text-muted mb-8">
            Join thousands of traders using WhisperTrade to make better decisions.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-text">
                Whisper<span className="text-primary">Trade</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link href="#" className="hover:text-text">Privacy</Link>
              <Link href="#" className="hover:text-text">Terms</Link>
              <Link href="#" className="hover:text-text">Contact</Link>
            </div>
            <p className="text-sm text-muted">
              © 2024 WhisperTrade. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
