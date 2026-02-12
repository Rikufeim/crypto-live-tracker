# Deploying the Enhanced Image Analysis Function

## Prerequisites

1. **Supabase CLI** installed and authenticated
2. **OpenAI API Key** (required for GPT-4o Vision)

## Step 1: Set up OpenAI API Key

In your Supabase project dashboard:

1. Go to **Project Settings** → **Edge Functions**
2. Click **"Add new secret"**
3. Set:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)

## Step 2: Login to Supabase CLI

```bash
# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 3: Deploy the Function

```bash
# Deploy the enhanced analyze-image function
supabase functions deploy analyze-image

# Verify deployment
supabase functions list
```

## Step 4: Test the Function

You can test the function using the Supabase dashboard or with curl:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-image' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "BASE64_ENCODED_IMAGE_HERE",
    "crypto": "btc",
    "question": "What does this chart show?"
  }'
```

## What's New in This Version?

### Enhanced AI Analysis
- **Chart Analysis**: Identifies trends, patterns, support/resistance, technical indicators
- **News Analysis**: Extracts quotes, assesses sentiment, predicts impact
- **Comprehensive Responses**: Includes directional predictions, timeframes, risk factors
- **Increased Token Limit**: 1200 tokens (from 800) for more detailed analysis

### Better Prompts
- Structured analysis framework for charts vs news/tweets
- Specific instructions for pattern recognition
- Requirements for directional predictions on charts
- Sentiment classification for news content

## Troubleshooting

### "OPENAI_API_KEY not set"
- Make sure you've added the secret in Supabase dashboard
- Redeploy the function after adding the secret

### "Model not found" error
- Verify your OpenAI API key has access to GPT-4o
- Check if you have sufficient OpenAI credits
- Try using "gpt-4-vision-preview" instead of "gpt-4o" (edit index.ts)

### Function timeout
- Large images may take longer
- Consider reducing image size on the client side
- The current compression to 800x800px should be sufficient

### "Failed to parse JSON response"
- This is handled gracefully in the code
- The fallback mechanisms ensure a response is always returned

## Monitoring

Check function logs in Supabase dashboard:
1. Go to **Edge Functions** → **analyze-image**
2. Click on **Logs** tab
3. Monitor for errors or performance issues

## Cost Considerations

- **GPT-4o Vision API**: ~$0.01-0.03 per image analysis
- **Supabase Edge Functions**: Generous free tier, then pay-per-invocation
- Consider implementing rate limiting for production use

## Next Steps

After deployment:
1. Test with various image types (charts, news, tweets)
2. Monitor API usage and costs
3. Consider caching common analyses
4. Implement rate limiting if needed
5. Add usage analytics

---

**Note**: The frontend changes are already live via hot-reload. Only the backend Edge Function needs deployment.
