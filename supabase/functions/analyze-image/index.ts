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
      `Summarize what this image shows (news, tweet, or article) and explain how it could affect ${crypto.toUpperCase()} price and sentiment.`;

    const systemPrompt = `You are a crypto analyst. You must analyze the image accurately and in detail.

RULES:
1. SUMMARY: Describe exactly what you see in the image. Include: all visible text (quotes, headlines, tweets, names, handles, numbers), the source (e.g. Twitter/X, news site), who is speaking or featured, and any charts or data shown. Be precise—do not invent or generalize.
2. IMPACT ON CRYPTO: Answer the user's question about "${crypto.toUpperCase()}" using only what is actually in the image. Tie your answer to specific content from the image (e.g. "The tweet from X says ... which could ..."). If the image does not mention ${crypto.toUpperCase()}, say so and explain how the visible content might still relate to it. Be factual and neutral.

Respond with valid JSON only, no markdown or code fences. Use exactly these two keys: "summary" (string) and "impactOnCrypto" (string).`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 800,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `User question: ${userQuestion}\n\nFirst look at the image carefully and extract all text and details. Then write summary (what the image actually shows) and impactOnCrypto (answer to the question based only on the image). Respond with JSON only: {"summary": "...", "impactOnCrypto": "..."}` },
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
