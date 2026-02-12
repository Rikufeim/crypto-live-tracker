# Image Analysis Feature - User Guide

## 📸 Overview

The **AI Image Analysis** feature allows you to upload screenshots of crypto charts, news articles, tweets, or market analysis, and get comprehensive AI-powered insights on how they might affect your selected cryptocurrency.

## 🚀 How to Use

### 1. Navigate to Image Analysis
- Click on **"Image analysis"** in the sidebar (icon: 🖼️)

### 2. Select Your Cryptocurrency
- Use the cryptocurrency selector at the top
- Type the symbol (e.g., BTC, ETH, XRP, SOL) or select from your portfolio
- The currently selected crypto will be displayed below the input field

### 3. (Optional) Add a Specific Question
- Enter a custom question like:
  - "Will this news push XRP higher?"
  - "What's the likely price direction based on this chart?"
  - "How will this regulation affect Bitcoin?"
- If left blank, you'll get a comprehensive general analysis

### 4. Upload an Image
You can upload images in two ways:
- **Drag & Drop**: Simply drag an image file onto the upload area
- **Click to Upload**: Click the upload area to select a file from your device

**Supported formats:** JPG, PNG, WebP

### 5. Analyze
- Click the **"🔍 Analyze Image"** button
- Wait for the AI to process the image (usually takes 5-15 seconds)

## 📊 What Can You Analyze?

### Chart Patterns
Upload crypto price charts and get analysis on:
- **Trend direction** (bullish, bearish, sideways)
- **Chart patterns** (triangles, head & shoulders, flags, channels, etc.)
- **Support and resistance levels**
- **Technical indicators** (RSI, MACD, volume, moving averages)
- **Price predictions** with reasoning

### News Articles
Get insights from news screenshots:
- Key headline extraction
- Source credibility assessment
- Market sentiment analysis
- Potential price impact
- Short-term vs long-term implications

### Tweets & Social Media
Analyze crypto-related tweets:
- Quote extraction
- Influencer/source identification
- Sentiment classification
- Market impact assessment
- Correlation to your selected crypto

## 🎯 Understanding the Results

The AI analysis provides two main sections:

### 📋 Summary
A detailed description of what the AI observes in the image:
- For charts: Pattern descriptions, trend analysis, key levels
- For news/tweets: Quoted text, source identification, context

### 📊 Impact on [Your Crypto]
Comprehensive analysis including:
- **Direct impact** if your crypto is mentioned
- **Indirect/correlated impact** based on market relationships
- **Likely price direction** (bullish/bearish/neutral) with confidence level
- **Timeframe** (short-term vs long-term)
- **Risk factors** and important caveats

## ⚠️ Important Disclaimers

1. **Not Financial Advice**: The AI analysis is for informational purposes only and should not be considered financial advice
2. **Do Your Own Research**: Always verify information and conduct additional research before making investment decisions
3. **AI Limitations**: The analysis is based solely on what's visible in the image and general market knowledge
4. **Market Volatility**: Crypto markets are highly volatile and unpredictable

## 💡 Tips for Best Results

1. **High-Quality Images**: Upload clear, legible screenshots
2. **Complete Charts**: Include timeframes, indicators, and relevant chart elements
3. **Context Matters**: For news/tweets, include the full context and source
4. **Specific Questions**: The more specific your question, the more targeted the analysis
5. **Compare Cryptos**: Try analyzing the same image for different cryptocurrencies to understand correlations

## 🔧 Technical Requirements

- **Backend**: Requires OpenAI API key configured in Supabase Edge Functions
- **Authentication**: Must be logged in to use this feature
- **Image Size**: Images are automatically compressed to 800x800px to optimize processing

## 🐛 Troubleshooting

### "Image analysis is not configured"
- The OpenAI API key hasn't been set up in Supabase
- Contact the administrator to configure the backend

### Analysis takes too long
- Large images may take longer to process
- Try uploading a smaller or compressed version
- Check your internet connection

### "Analysis failed" error
- Try uploading a clearer image
- Ensure the image contains readable content
- Try again in a few moments

## 📈 Example Use Cases

1. **Chart Analysis**: Upload a 4-hour BTC chart showing a rising wedge pattern → Get analysis on whether it's likely to break up or down

2. **News Impact**: Screenshot a headline about XRP-SEC settlement → Understand how this news might affect XRP price

3. **Tweet Sentiment**: Upload a tweet from a major crypto influencer → Get sentiment analysis and potential market impact

4. **Technical Setup**: Share a chart with RSI divergence → Receive comprehensive technical analysis

---

**Happy analyzing! 🚀📊**
