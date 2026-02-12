import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type AnalyzeBody = { imageBase64: string; crypto: string; question?: string };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Image analysis is not configured. Set OPENAI_API_KEY in Supabase.",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as AnalyzeBody;
    const { imageBase64, crypto, question } = body;
    if (!imageBase64 || !crypto) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 or crypto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const userQuestion =
      question?.trim() ||
      `Analyze this image comprehensively. If it's a chart, identify trends, patterns, support/resistance levels, and predict likely price direction. If it's news or a tweet, explain the market sentiment and how it could affect ${crypto.toUpperCase()} price.`;

    const systemPrompt = `You are an expert crypto analyst with deep knowledge of technical analysis, market sentiment, and cryptocurrency markets. Analyze the provided image in comprehensive detail.

ANALYSIS FRAMEWORK:

**If the image contains a CHART:**
1. Identify the timeframe and price action (trend: bullish/bearish/sideways)
2. Recognize chart patterns (triangles, head & shoulders, flags, channels, etc.)
3. Identify key support and resistance levels visible in the chart
4. Note any technical indicators shown (RSI, MACD, volume, moving averages, etc.)
5. Predict the likely next price direction based on the technical setup
6. Assess the strength of the current trend and potential reversal points

**If the image contains NEWS, TWEETS, or TEXT:**
1. Extract and quote the key headlines, claims, or statements verbatim
2. Identify the source (Twitter/X user, news outlet, influencer, official announcement, etc.)
3. Determine the sentiment (extremely bullish, bullish, neutral, bearish, extremely bearish)
4. Assess credibility and potential market impact of the source
5. Identify specific catalysts or triggers mentioned (regulations, partnerships, technology updates, market events)

**RESPONSE STRUCTURE:**
- **summary**: A detailed description of what you observe in the image. For charts: describe the pattern, trend, and key levels. For news/tweets: quote the important text and identify the source.
- **impactOnCrypto**: Your analysis of how this specifically affects ${crypto.toUpperCase()}. Include:
  • Direct impact if ${crypto.toUpperCase()} is mentioned
  • Indirect/correlated impact if it's about related assets or market trends
  • Likely price direction (up/down/neutral) with confidence level
  • Timeframe consideration (short-term vs long-term impact)
  • Risk factors or caveats

IMPORTANT RULES:
- Base your analysis ONLY on what is actually visible in the image
- If ${crypto.toUpperCase()} is not directly mentioned, explain the potential correlation
- For charts: Always provide a directional prediction (bullish/bearish/neutral) with reasoning
- For news/tweets: Always quote key text from the image
- Be specific, factual, and avoid vague generalizations
- Use technical analysis terminology accurately

Respond with valid JSON only, no markdown or code fences. Use exactly these two keys: "summary" (string) and "impactOnCrypto" (string).`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1200,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `User's specific question: "${userQuestion}"\n\nAnalyze the image carefully. Look for all text, chart patterns, trends, levels, and indicators. Provide a comprehensive analysis in JSON format: {"summary": "detailed description of what you see", "impactOnCrypto": "comprehensive analysis of impact on ${crypto.toUpperCase()} with directional prediction"}` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error", res.status, err);
      return new Response(
        JSON.stringify({ error: "Analysis failed", details: err }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    let summary = "";
    let impactOnCrypto = "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = String(parsed.summary ?? "").trim();
        impactOnCrypto = String(parsed.impactOnCrypto ?? "").trim();
      } catch {
        summary = content.slice(0, 300);
        impactOnCrypto = content;
      }
    } else {
      summary = content.slice(0, 200);
      impactOnCrypto = content;
    }

    return new Response(
      JSON.stringify({ summary, impactOnCrypto }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-image", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
