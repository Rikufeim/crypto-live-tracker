import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type TokenBoostEntry = {
  chainId: string;
  tokenAddress: string;
  amount?: number;
  totalAmount?: number;
};

type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  priceNative?: string;
  priceUsd?: string;
  txns?: Record<string, { buys: number; sells: number }>;
  volume?: Record<string, number>;
  priceChange?: Record<string, number>;
  liquidity?: { usd?: number; base?: number; quote?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
  boosts?: { active?: number };
};

type NormalizedToken = {
  id: string;
  chainId: string;
  dexId: string;
  url: string;
  baseSymbol: string;
  baseName: string;
  priceUsd: number | null;
  priceChange24h: number | null;
  volume24hUsd: number | null;
  liquidityUsd: number | null;
  fdv: number | null;
  marketCap: number | null;
  pairCreatedAt: number | null;
  imageUrl?: string | null;
  labels?: string[];
  boostsActive?: number | null;
};

const CACHE_TTL_MS = 30_000;
let cache:
  | {
      data: { items: NormalizedToken[]; asOf: string; source: string };
      expiresAt: number;
    }
  | null = null;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
type RateState = { count: number; windowStart: number };
const rateLimitStore = new Map<string, RateState>();

function getClientIp(req: Request): string {
  const header =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for") ??
    req.headers.get("cf-connecting-ip") ??
    "";
  if (!header) return "unknown";
  return header.split(",")[0].trim();
}

function isRateLimited(ip: string): boolean {
  if (!ip) return false;
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }
  existing.count += 1;
  rateLimitStore.set(ip, existing);
  return false;
}

async function fetchAndNormalize(): Promise<NormalizedToken[]> {
  const boostsRes = await fetch(
    "https://api.dexscreener.com/token-boosts/latest/v1"
  );

  if (!boostsRes.ok) {
    throw new Error(
      `DexScreener token-boosts request failed with status ${boostsRes.status}`
    );
  }

  const rawBoosts = await boostsRes.json();

  let boostEntries: TokenBoostEntry[] = [];

  if (Array.isArray(rawBoosts)) {
    boostEntries = rawBoosts as TokenBoostEntry[];
  } else if (rawBoosts && Array.isArray(rawBoosts.items)) {
    boostEntries = rawBoosts.items as TokenBoostEntry[];
  } else if (rawBoosts && typeof rawBoosts === "object") {
    boostEntries = [rawBoosts as TokenBoostEntry];
  }

  if (!boostEntries.length) return [];

  // Group token addresses by chain
  const chainMap = new Map<string, string[]>();
  for (const entry of boostEntries) {
    if (!entry.chainId || !entry.tokenAddress) continue;
    const arr = chainMap.get(entry.chainId) ?? [];
    if (!arr.includes(entry.tokenAddress)) {
      arr.push(entry.tokenAddress);
    }
    chainMap.set(entry.chainId, arr);
  }

  const MAX_TOKENS = 80;
  const results: NormalizedToken[] = [];

  for (const [chainId, addresses] of chainMap) {
    if (results.length >= MAX_TOKENS) break;

    for (let i = 0; i < addresses.length && results.length < MAX_TOKENS; i += 30) {
      const chunk = addresses.slice(i, i + 30);
      if (!chunk.length) continue;

      const pairsRes = await fetch(
        `https://api.dexscreener.com/token-pairs/v1/${chainId}/${chunk.join(
          ","
        )}`
      );

      if (!pairsRes.ok) continue;

      const pairs = (await pairsRes.json()) as DexPair[];

      for (const p of pairs) {
        results.push({
          id: p.pairAddress,
          chainId: p.chainId,
          dexId: p.dexId,
          url: p.url,
          baseSymbol: p.baseToken?.symbol ?? "",
          baseName: p.baseToken?.name ?? "",
          priceUsd: p.priceUsd ? Number(p.priceUsd) : null,
          priceChange24h: p.priceChange?.h24 ?? null,
          volume24hUsd: p.volume?.h24 ?? null,
          liquidityUsd: p.liquidity?.usd ?? null,
          fdv: typeof p.fdv === "number" ? p.fdv : null,
          marketCap: typeof p.marketCap === "number" ? p.marketCap : null,
          pairCreatedAt:
            typeof p.pairCreatedAt === "number" ? p.pairCreatedAt : null,
          imageUrl: p.info?.imageUrl ?? null,
          labels: p.labels ?? [],
          boostsActive: p.boosts?.active ?? null,
        });

        if (results.length >= MAX_TOKENS) break;
      }
    }
  }

  // Newest first
  results.sort(
    (a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0)
  );

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please try again in a moment.",
      }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 100)
      : 50;

    if (cache && cache.expiresAt > Date.now()) {
      return new Response(
        JSON.stringify({
          ...cache.data,
          cache: "hit",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const items = await fetchAndNormalize();

    const payload = {
      items: items.slice(0, limit),
      asOf: new Date().toISOString(),
      source: "dexscreener",
    };

    cache = {
      data: payload,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("dexscreener-meme error", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

