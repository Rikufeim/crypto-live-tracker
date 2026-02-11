import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHoldings } from "@/hooks/useHoldings";
import { useMarketData, useTop50 } from "@/hooks/useMarketData";
import { supabase } from "@/integrations/supabase/client";
import { FREE_HOLDING_LIMIT, STRIPE_CONFIG } from "@/lib/constants";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  Activity, Layers, Briefcase, Settings, Plus, Search, X,
  Trash2, AlertTriangle, Zap, TrendingUp, TrendingDown,
  Globe, Shield, Info, ChevronRight, Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, isPremium, signOut, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { holdings, addHolding, updateAmount, deleteHolding } = useHoldings();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [liveTicks, setLiveTicks] = useState<Record<string, number>>({});
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});

  const coinIds = useMemo(() => holdings.map((h) => h.coin_id), [holdings]);
  const { marketData } = useMarketData(coinIds, currency);
  const top50 = useTop50(currency, isAddModalOpen);

  // Sync local amount input values with holdings
  useEffect(() => {
    const initial: Record<string, string> = {};
    holdings.forEach((h) => {
      initial[h.id] =
        h.amount !== undefined && h.amount !== null ? h.amount.toString() : "";
    });
    setAmountInputs(initial);
  }, [holdings]);

  // Live tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicks((prev) => {
        const next = { ...prev };
        holdings.forEach((h) => {
          next[h.coin_id] = (next[h.coin_id] || 1) * (1 + (Math.random() * 0.0004 - 0.0002));
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdings]);

  // Stats calculation
  const stats = useMemo(() => {
    let totalValue = 0,
      totalCost = 0,
      delta24h = 0;

    const assets = holdings.map((h) => {
      const m =
        marketData[h.coin_id] || {
          current_price: 0,
          price_change_percentage_24h: 0,
          symbol: "?",
          name: "Loading...",
          image: "",
          market_cap_rank: 0,
        };

      const livePrice = (m.current_price || 0) * (liveTicks[h.coin_id] || 1);

      // Use local input value for real-time calculations when available
      const rawAmount =
        amountInputs[h.id] ??
        (h.amount || h.amount === 0 ? h.amount.toString() : "");
      const parsedAmount = parseFloat(
        typeof rawAmount === "string" ? rawAmount.replace(",", ".") : String(rawAmount)
      );
      const effectiveAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

      const val = effectiveAmount * livePrice;
      const cost = effectiveAmount * (h.avg_buy_price || 0);
      totalValue += val;
      totalCost += cost;

      const prevPrice =
        (m.current_price || 0) /
        (1 + ((m.price_change_percentage_24h || 0) / 100));
      delta24h += val - effectiveAmount * prevPrice;

      return {
        ...m,
        ...h,
        amount: effectiveAmount,
        current_price: livePrice,
        currentValue: val,
        profit: val - cost,
        profitPct: cost > 0 ? ((val - cost) / cost) * 100 : 0,
      };
    });

    return {
      assets: assets.sort((a, b) => b.currentValue - a.currentValue),
      totalValue,
      totalProfit: totalValue - totalCost,
      totalProfitPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      delta24h,
      delta24hPct:
        totalValue > 0 ? (delta24h / (totalValue - delta24h)) * 100 : 0,
    };
  }, [holdings, marketData, liveTicks, amountInputs]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: val < 1 ? 4 : 2 }).format(val || 0);

  const handleAdd = async (coin: any) => {
    if (!isPremium && holdings.length >= FREE_HOLDING_LIMIT) {
      toast({
        title: "Premium required",
        description:
          "In the free plan you can track only one crypto. Upgrade to Premium to unlock unlimited tracking.",
        variant: "destructive",
      });
      setIsAddModalOpen(false);
      setActiveTab("settings");
      return;
    }
    if (!holdings.find((h) => h.coin_id === coin.id)) {
      await addHolding(coin.id, coin.current_price);
      setSelectedCoin(coin.id);
    }
    setIsAddModalOpen(false);
  };

  const handleCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col p-8 z-40">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center glow-primary">
            <Activity size={28} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">LIVE<span className="text-primary">TRACK</span></span>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: "dashboard", icon: Layers, label: "Dashboard" },
            { id: "assets", icon: Briefcase, label: "Portfolio" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? "bg-primary/10 text-primary border border-primary/20" : "text-sidebar-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <item.icon size={22} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-sidebar-border space-y-4">
          {isPremium && (
            <div className="flex items-center gap-2 text-primary">
              <Crown size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Network Secure</span>
          </div>
          <button
            onClick={signOut}
            className="text-xs font-black uppercase text-muted-foreground hover:text-destructive transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-72 flex-1 pb-20 lg:pb-10 min-h-screen">
        <header className="sticky top-0 z-30 glass px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-2xl border border-border">
            <Briefcase size={16} className="text-primary" />
            <span className="text-sm font-bold">Main Portfolio</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-muted rounded-xl p-1 border border-border">
              {["USD", "EUR"].map((f) => (
                <button key={f} onClick={() => setCurrency(f)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currency === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground px-8 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all active:scale-95 glow-primary"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                <div className="xl:col-span-2 glass rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={14} className="text-primary" />
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Net Capital</p>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter tabular-nums">{formatCurrency(stats.totalValue)}</h2>
                  </div>
                  <div className="flex flex-col gap-4 mt-8">
                    <div className={`flex items-center gap-2 font-black text-lg ${stats.delta24h >= 0 ? "text-positive" : "text-negative"}`}>
                      {stats.delta24h >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                      {formatCurrency(Math.abs(stats.delta24h))}
                      <span className="text-xs opacity-60 ml-1">({stats.delta24hPct.toFixed(2)}%)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">24H</span>
                      <span className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Live</span>
                    </div>
                  </div>
                </div>
                <div className="xl:col-span-3 rounded-3xl overflow-hidden border border-border bg-card">
                  <TradingViewWidget symbol={selectedCoin} />
                </div>
              </div>

              {/* Asset list */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight uppercase">Active Markets</h3>
                {stats.assets.length === 0 ? (
                  <div className="py-32 text-center border-2 border-dashed border-border rounded-[40px] bg-card/30">
                    <Briefcase size={64} className="mx-auto mb-6 text-muted-foreground/30" />
                    <h4 className="text-2xl font-black mb-2 uppercase">Empty Terminal</h4>
                    <p className="text-muted-foreground mb-10">Add your first crypto to get started.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-primary text-primary-foreground px-12 py-4 rounded-3xl font-black glow-primary"
                    >
                      Add crypto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                      <div className="col-span-4">Asset</div>
                      <div className="col-span-2">Price</div>
                      <div className="col-span-2 text-center">Amount</div>
                      <div className="col-span-2 text-right">Value</div>
                      <div className="col-span-2 text-right">24H</div>
                    </div>
                    {stats.assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedCoin(asset.coin_id)}
                        className={`relative grid grid-cols-12 items-center px-8 py-5 rounded-[30px] border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/60 shadow-[0_18px_45px_rgba(0,0,0,0.65)] transition-all cursor-pointer group ${
                          selectedCoin === asset.coin_id
                            ? "ring-2 ring-primary/40 border-primary/40 shadow-[0_22px_55px_rgba(0,255,200,0.35)]"
                            : "hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="col-span-4 flex items-center gap-5">
                          <img
                            src={asset.image}
                            alt=""
                            className="w-12 h-12 rounded-full ring-2 ring-border/70 group-hover:ring-primary/60 transition-all"
                          />
                          <div>
                            <div className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">
                              {asset.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.25em]">
                              {asset.symbol} • #{asset.market_cap_rank}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 font-mono text-base font-bold tabular-nums text-secondary-foreground">
                          {formatCurrency(asset.current_price)}
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <input
                            type="text"
                            value={
                              amountInputs[asset.id] ??
                              (asset.amount || asset.amount === 0
                                ? asset.amount.toString()
                                : "")
                            }
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const normalizedValue = e.target.value.replace(",", ".");
                              setAmountInputs((prev) => ({
                                ...prev,
                                [asset.id]: normalizedValue,
                              }));
                            }}
                            onBlur={(e) => {
                              const normalizedValue = e.target.value.replace(",", ".");
                              const parsed = parseFloat(normalizedValue);
                              const safeValue = Number.isFinite(parsed) ? parsed : 0;
                              updateAmount(asset.id, safeValue);
                              setAmountInputs((prev) => ({
                                ...prev,
                                [asset.id]: normalizedValue,
                              }));
                            }}
                            className="bg-background/80 border border-border/80 rounded-2xl px-4 py-2 w-full max-w-[140px] text-sm font-black text-center focus:border-primary outline-none transition-all focus:bg-background"
                          />
                        </div>
                        <div className="col-span-2 font-black text-xl tabular-nums tracking-tight text-right">
                          {formatCurrency(asset.currentValue)}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <span
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.2em] ${
                              (asset.price_change_percentage_24h ?? 0) >= 0
                                ? "bg-positive/10 text-positive border-positive/20"
                                : "bg-negative/10 text-negative border-negative/20"
                            }`}
                          >
                            {asset.price_change_percentage_24h?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "assets" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {stats.assets.map((asset) => (
                <div key={asset.id} className="glass rounded-3xl p-6 relative group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedCoin(asset.coin_id)}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <img src={asset.image} alt="" className="w-14 h-14 rounded-full ring-2 ring-border" />
                      <div>
                        <h4 className="font-black text-xl">{asset.name}</h4>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{asset.symbol}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: asset.id, name: asset.name }); }}
                      className="p-3 bg-destructive/10 text-destructive rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1 tracking-widest">Amount</p>
                      <p className="font-black text-lg tabular-nums">
                        {asset.amount}{" "}
                        <span className="text-[10px] opacity-40 uppercase">{asset.symbol}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1 tracking-widest">Value</p>
                      <p className="font-black text-lg tabular-nums text-primary">
                        {formatCurrency(asset.currentValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-5">
                    <span className={`text-sm font-black ${asset.profit >= 0 ? "text-positive" : "text-negative"}`}>
                      {asset.profit >= 0 ? "▲" : "▼"} {asset.profitPct.toFixed(2)}%
                    </span>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Live: {formatCurrency(asset.current_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-4xl space-y-10">
              <h3 className="text-4xl font-black tracking-tight">Settings</h3>

              {/* Premium upgrade / manage */}
              <div className={`glass rounded-3xl p-8 ${isPremium ? "border-primary/30" : "border-primary/10"}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                    <Crown size={28} />
                  </div>
                  <div>
                    <p className="font-black text-lg">
                      {isPremium ? "Premium subscription active" : "Upgrade to Premium"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPremium
                        ? "Unlimited crypto tracking enabled."
                        : `Track unlimited cryptos for only ${STRIPE_CONFIG.premium.price}€/${STRIPE_CONFIG.premium.interval}.`}
                    </p>
                  </div>
                </div>
                {isPremium ? (
                  <button
                    onClick={handleManageSubscription}
                    className="px-8 py-3 rounded-2xl border border-border font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    Manage subscription
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black transition-all hover:opacity-90 active:scale-[0.98] glow-primary flex items-center gap-2"
                  >
                    Upgrade to Premium <ChevronRight size={18} />
                  </button>
                )}
              </div>

              {/* Currency */}
              <div className="glass rounded-3xl p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-primary">
                      <Globe size={28} />
                    </div>
                    <div>
                      <p className="font-black text-lg">Currency</p>
                      <p className="text-sm text-muted-foreground">Change portfolio currency</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["USD", "EUR", "GBP"].map((curr) => (
                      <button key={curr} onClick={() => setCurrency(curr)} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${currency === curr ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-primary">
                      <Shield size={28} />
                    </div>
                    <div>
                      <p className="font-black text-lg">Cloud encryption</p>
                      <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest bg-positive/10 text-positive border-positive/20">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setDeleteTarget(null)} />
          <div className="glass w-full max-w-md relative z-10 rounded-3xl p-8 border-destructive/40">
            <div className="flex items-center justify-center w-24 h-24 bg-destructive/10 text-destructive rounded-full mx-auto mb-8 border border-destructive/20">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-3xl font-black text-center mb-3">Confirm deletion</h3>
            <p className="text-muted-foreground text-center text-lg mb-10">
              Delete <span className="text-foreground font-black">{deleteTarget.name}</span>?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-8 py-5 bg-muted rounded-3xl font-black hover:bg-secondary transition-all border border-border"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteHolding(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-8 py-5 bg-destructive rounded-3xl font-black hover:opacity-90 transition-all text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-lg" onClick={() => setIsAddModalOpen(false)} />
          <div className="glass w-full max-w-2xl relative z-10 rounded-3xl p-10 border-primary/20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black tracking-tight uppercase">Search crypto</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2"><X size={32} /></button>
            </div>
            {!isPremium && holdings.length >= FREE_HOLDING_LIMIT && (
              <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <p className="font-bold">In the free plan you can track only one crypto.</p>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setActiveTab("settings");
                  }}
                  className="text-primary font-black underline mt-1"
                >
                  Upgrade to Premium →
                </button>
              </div>
            )}
            <div className="relative mb-10">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
              <input
                type="text"
                placeholder="BTC, ETH, XRP, SOL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border-2 border-border rounded-3xl py-6 pl-16 pr-8 text-xl font-bold focus:ring-4 focus:ring-primary/20 outline-none focus:border-primary transition-all placeholder:text-muted-foreground/40"
                autoFocus
              />
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
              {top50.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleAdd(coin)}
                  className="w-full flex items-center justify-between p-6 rounded-3xl bg-card/50 border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-5">
                    <img src={coin.image} alt="" className="w-12 h-12 rounded-full ring-2 ring-border" />
                    <div>
                      <div className="font-black text-lg">{coin.name}</div>
                      <div className="text-xs text-muted-foreground uppercase font-black tracking-widest">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono">{formatCurrency(coin.current_price)}</div>
                    <div className="text-[10px] text-primary font-black uppercase opacity-0 group-hover:opacity-100 mt-1 tracking-widest">
                      + Add
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass px-10 py-5 flex items-center justify-around z-40">
        <button onClick={() => setActiveTab("dashboard")} className={`flex flex-col items-center gap-2 ${activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"}`}>
          <Layers size={26} /><span className="text-[10px] font-black uppercase tracking-tighter">Terminal</span>
        </button>
        <button onClick={() => setIsAddModalOpen(true)} className="w-16 h-16 bg-primary text-primary-foreground rounded-[24px] flex items-center justify-center -mt-12 glow-primary active:scale-90 transition-all ring-8 ring-background">
          <Plus size={36} />
        </button>
        <button onClick={() => setActiveTab("assets")} className={`flex flex-col items-center gap-2 ${activeTab === "assets" ? "text-primary" : "text-muted-foreground"}`}>
          <Briefcase size={26} /><span className="text-[10px] font-black uppercase tracking-tighter">Assets</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
