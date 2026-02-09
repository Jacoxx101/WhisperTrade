// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhisperTrade - Social Sentiment Stock Analysis",
  description: "AI-powered stock buy/sell signals from YouTube, Twitter, and Reddit analysis",
  keywords: ["stocks", "sentiment analysis", "trading", "AI", "social media"],
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
