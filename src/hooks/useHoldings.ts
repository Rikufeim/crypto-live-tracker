import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Holding {
  id: string;
  coin_id: string;
  amount: number;
  avg_buy_price: number;
}

export const useHoldings = () => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setHoldings([]); setLoading(false); return; }

    const fetchHoldings = async () => {
      const { data } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id);
      setHoldings((data as Holding[]) || []);
      setLoading(false);
    };

    fetchHoldings();

    const channel = supabase
      .channel("holdings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "holdings", filter: `user_id=eq.${user.id}` }, () => {
        fetchHoldings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addHolding = useCallback(async (coinId: string, currentPrice: number) => {
    if (!user) return;
    await supabase.from("holdings").insert({
      user_id: user.id,
      coin_id: coinId,
      amount: 0,
      avg_buy_price: currentPrice,
    });
  }, [user]);

  const updateAmount = useCallback(async (id: string, amount: number) => {
    await supabase.from("holdings").update({ amount }).eq("id", id);
  }, []);

  const deleteHolding = useCallback(async (id: string) => {
    await supabase.from("holdings").delete().eq("id", id);
  }, []);

  return { holdings, loading, addHolding, updateAmount, deleteHolding };
};
