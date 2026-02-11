import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/constants";

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  sparkline_in_7d?: { price: number[] };
}

export const useMarketData = (coinIds: string[], currency: string) => {
  const [marketData, setMarketData] = useState<Record<string, CoinMarketData>>({});

  const fetchData = useCallback(async () => {
    if (coinIds.length === 0) return;
    try {
      const ids = Array.from(new Set(coinIds)).join(",");
      const res = await fetch(`${API_BASE}/coins/markets?vs_currency=${currency.toLowerCase()}&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`);
      if (res.ok) {
        const data: CoinMarketData[] = await res.json();
        setMarketData(data.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}));
      }
    } catch (err) {
      console.error("Market fetch error");
    }
  }, [coinIds.join(","), currency]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { marketData, refetch: fetchData };
};

export const useTop50 = (currency: string, enabled: boolean) => {
  const [coins, setCoins] = useState<CoinMarketData[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const fetchTop = async () => {
      try {
        const res = await fetch(`${API_BASE}/coins/markets?vs_currency=${currency.toLowerCase()}&order=market_cap_desc&per_page=50&page=1&sparkline=false`);
        if (res.ok) setCoins(await res.json());
      } catch {}
    };
    fetchTop();
  }, [currency, enabled]);

  return coins;
};
