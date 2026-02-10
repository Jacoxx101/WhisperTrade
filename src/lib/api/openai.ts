// src/lib/api/openai.ts
// OpenAI API integration for sentiment analysis

import OpenAI from 'openai';

// OpenAI API configuration
const API_KEY = process.env.OPENAI_API_KEY || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: API_KEY,
});

export interface SentimentAnalysisResult {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  summary: string;
  keyPoints: string[];
}

export interface AggregatedSentimentInput {
  ticker: string;
  youtubeContent?: Array<{
    title: string;
    description: string;
    comments: string[];
    engagement: number;
  }>;
  twitterContent?: Array<{
    text: string;
    engagement: number;
    authorFollowers: number;
  }>;
  redditContent?: Array<{
    title: string;
    content: string;
    comments: string[];
    engagement: number;
    subreddit: string;
  }>;
  stockPrice?: {
    price: number;
    changePercent: number;
  };
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 0;
}

/**
 * Analyze sentiment of text content
 */
export async function analyzeSentiment(
  text: string,
  context?: string
): Promise<SentimentAnalysisResult> {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
  }
  
  try {
    const prompt = `Analyze the following ${context || 'content'} and provide a sentiment analysis:

"""${text}"""

Respond in this exact JSON format:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "score": number between -1 and 1 (where -1 is very bearish, 1 is very bullish),
  "confidence": number between 0 and 1 (your confidence in the analysis),
  "summary": "brief summary of the sentiment (1-2 sentences)",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are a financial sentiment analysis expert. Analyze content and provide structured sentiment analysis for stock trading signals. Be objective and focus on financial implications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const result = JSON.parse(content);
    
    return {
      sentiment: result.sentiment,
      score: result.score,
      confidence: result.confidence,
      summary: result.summary,
      keyPoints: result.keyPoints || [],
    };
  } catch (error) {
    console.error('[OpenAI] Sentiment analysis error:', error);
    throw error;
  }
}

/**
 * Analyze aggregated content from multiple sources
 */
export async function analyzeAggregatedSentiment(
  input: AggregatedSentimentInput
): Promise<{
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number;
  overallConfidence: number;
  summary: string;
  factors: Array<{ type: 'positive' | 'negative' | 'neutral'; label: string; value: string }>;
  sourceBreakdown: {
    youtube: { sentiment: string; score: number; weight: number };
    twitter: { sentiment: string; score: number; weight: number };
    reddit: { sentiment: string; score: number; weight: number };
  };
}> {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    // Build content summary
    const contentParts: string[] = [];
    
    if (input.youtubeContent && input.youtubeContent.length > 0) {
      contentParts.push(`YouTube Videos (${input.youtubeContent.length}):
${input.youtubeContent.map(v => `- ${v.title}: ${v.description.substring(0, 200)}... [Engagement: ${v.engagement}]`).join('\n')}`);
    }
    
    if (input.twitterContent && input.twitterContent.length > 0) {
      contentParts.push(`Twitter Posts (${input.twitterContent.length}):
${input.twitterContent.map(t => `- ${t.text.substring(0, 200)}... [Engagement: ${t.engagement}, Followers: ${t.authorFollowers}]`).join('\n')}`);
    }
    
    if (input.redditContent && input.redditContent.length > 0) {
      contentParts.push(`Reddit Posts (${input.redditContent.length}):
${input.redditContent.map(r => `- r/${r.subreddit}: ${r.title} [Engagement: ${r.engagement}]`).join('\n')}`);
    }
    
    if (input.stockPrice) {
      contentParts.push(`Stock Price: $${input.stockPrice.price} (${input.stockPrice.changePercent > 0 ? '+' : ''}${input.stockPrice.changePercent}%)`);
    }
    
    const prompt = `Analyze the following social media sentiment data for ${input.ticker} and provide a trading signal recommendation.

${contentParts.join('\n\n')}

Based on this data, provide:
1. Overall sentiment (bullish, bearish, or neutral)
2. Overall sentiment score (-1 to 1)
3. Confidence level (0 to 1)
4. Brief summary (1-2 sentences)
5. Key factors as an array of objects with type (positive/negative/neutral), label, and value
6. Source breakdown with sentiment, score, and weight for each source

Respond in this exact JSON format:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "overallScore": number between -1 and 1,
  "overallConfidence": number between 0 and 1,
  "summary": "brief summary",
  "factors": [
    { "type": "positive", "label": "Factor Name", "value": "+12%" },
    { "type": "negative", "label": "Factor Name", "value": "-5%" }
  ],
  "sourceBreakdown": {
    "youtube": { "sentiment": "bullish", "score": 0.6, "weight": 0.3 },
    "twitter": { "sentiment": "neutral", "score": 0.1, "weight": 0.4 },
    "reddit": { "sentiment": "bullish", "score": 0.7, "weight": 0.3 }
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial analyst specializing in social sentiment analysis for stock trading. Provide objective, data-driven sentiment analysis based on social media content. Consider engagement levels and source credibility. Output must be valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const result = JSON.parse(content);
    
    return {
      overallSentiment: result.overallSentiment,
      overallScore: result.overallScore,
      overallConfidence: result.overallConfidence,
      summary: result.summary,
      factors: result.factors || [],
      sourceBreakdown: result.sourceBreakdown || {
        youtube: { sentiment: 'neutral', score: 0, weight: 0.33 },
        twitter: { sentiment: 'neutral', score: 0, weight: 0.33 },
        reddit: { sentiment: 'neutral', score: 0, weight: 0.34 },
      },
    };
  } catch (error) {
    console.error('[OpenAI] Aggregated sentiment error:', error);
    throw error;
  }
}

/**
 * Analyze a batch of texts and return sentiment scores
 */
export async function analyzeSentimentBatch(
  texts: string[],
  context?: string
): Promise<SentimentAnalysisResult[]> {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key not configured');
  }
  
  // Process in parallel with rate limiting
  const results: SentimentAnalysisResult[] = [];
  const batchSize = 5; // Process 5 at a time to avoid rate limits
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => analyzeSentiment(text, context));
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Return neutral sentiment for failed analyses
        results.push({
          sentiment: 'neutral',
          score: 0,
          confidence: 0,
          summary: 'Analysis failed',
          keyPoints: [],
        });
      }
    }
    
    // Small delay between batches
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Generate a trading signal from sentiment data
 */
export async function generateTradingSignal(
  ticker: string,
  sentimentScore: number,
  confidence: number,
  priceData?: { price: number; changePercent: number }
): Promise<{
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
}> {
  if (!isOpenAIConfigured()) {
    // Simple rule-based fallback
    if (sentimentScore > 0.3 && confidence > 0.5) {
      return { signal: 'buy', confidence: confidence * 100, reasoning: 'Strong positive sentiment' };
    } else if (sentimentScore < -0.3 && confidence > 0.5) {
      return { signal: 'sell', confidence: confidence * 100, reasoning: 'Strong negative sentiment' };
    }
    return { signal: 'hold', confidence: confidence * 100, reasoning: 'Mixed or uncertain sentiment' };
  }
  
  try {
    const priceInfo = priceData
      ? `Current Price: $${priceData.price} (${priceData.changePercent > 0 ? '+' : ''}${priceData.changePercent}%)`
      : '';
    
    const prompt = `Given the following data for ${ticker}, generate a trading signal:

Sentiment Score: ${sentimentScore} (-1 bearish to +1 bullish)
Confidence: ${confidence} (0 to 1)
${priceInfo}

Based on this, determine:
1. Trading signal: buy, sell, or hold
2. Confidence level (0-100)
3. Brief reasoning (1 sentence)

Respond in JSON format:
{
  "signal": "buy" | "sell" | "hold",
  "confidence": number 0-100,
  "reasoning": "brief reasoning"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a quantitative trading analyst. Generate clear trading signals based on sentiment data. Be conservative - only recommend buy/sell with high confidence.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response');
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('[OpenAI] Signal generation error:', error);
    
    // Fallback to rule-based
    if (sentimentScore > 0.3 && confidence > 0.5) {
      return { signal: 'buy', confidence: confidence * 100, reasoning: 'Strong positive sentiment detected' };
    } else if (sentimentScore < -0.3 && confidence > 0.5) {
      return { signal: 'sell', confidence: confidence * 100, reasoning: 'Strong negative sentiment detected' };
    }
    return { signal: 'hold', confidence: confidence * 100, reasoning: 'Mixed market sentiment' };
  }
}

export { openai };
