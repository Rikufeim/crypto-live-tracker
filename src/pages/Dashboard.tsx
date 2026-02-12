import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHoldings } from "@/hooks/useHoldings";
import { useMarketData, useTop50 } from "@/hooks/useMarketData";
import { supabase } from "@/integrations/supabase/client";
import { FREE_HOLDING_LIMIT, STRIPE_CONFIG } from "@/lib/constants";
import TradingViewWidget from "@/components/TradingViewWidget";
import { Calendar } from "@/components/Calendar";
import { MiniChart } from "@/components/MiniChart";
import { TradingDashboard } from "@/components/TradingDashboard";
import { MultiTracker } from "@/components/MultiTracker";
import {
  Activity, Layers, Briefcase, Settings, Plus, Search, X,
  Trash2, AlertTriangle, Zap, TrendingUp, TrendingDown, ChevronLeft,
  Globe, Shield, Info, ChevronRight, Crown, ImageIcon, LayoutGrid, Menu, LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

type TradeEntry = {
  id: string;
  asset: string;
  date: string;
  amount: string;
  price: string;
  note: string;
};

const Dashboard = () => {
  const { user, isPremium, signOut, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { holdings, addHolding, updateAmount, deleteHolding } = useHoldings();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState("xrp");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [liveTicks, setLiveTicks] = useState<Record<string, number>>({});
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const [portfolioName, setPortfolioName] = useState("Main Portfolio");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chartSearch, setChartSearch] = useState("xrp");
  const [buys, setBuys] = useState<TradeEntry[]>([
    { id: "buy-1", asset: "", date: "", amount: "", price: "", note: "" },
  ]);
  const [sells, setSells] = useState<TradeEntry[]>([
    { id: "sell-1", asset: "", date: "", amount: "", price: "", note: "" },
  ]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisQuestion, setAnalysisQuestion] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{ summary: string; impactOnCrypto: string } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Persist portfolio name and trade tables per user in browser storage
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(`livetrack:dashboard:${user.id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        portfolioName?: string;
        buys?: TradeEntry[];
        sells?: TradeEntry[];
      };
      if (parsed.portfolioName) setPortfolioName(parsed.portfolioName);
      if (parsed.buys && parsed.buys.length) setBuys(parsed.buys);
      if (parsed.sells && parsed.sells.length) setSells(parsed.sells);
    } catch (e) {
      console.error("Failed to load dashboard state", e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const payload = {
        portfolioName,
        buys,
        sells,
      };
      localStorage.setItem(
        `livetrack:dashboard:${user.id}`,
        JSON.stringify(payload)
      );
    } catch (e) {
      console.error("Failed to save dashboard state", e);
    }
  }, [user, portfolioName, buys, sells]);

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

  const demoMonthlyData = [
    { label: "Sept.", value: 8200 },
    { label: "Oct.", value: 5400 },
    { label: "Nov.", value: 6800 },
    { label: "Dec.", value: 3600 },
    { label: "Jan.", value: 4100 },
    { label: "Feb.", value: 7600 },
    { label: "Mar.", value: 2900 },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: val < 1 ? 4 : 2 }).format(val || 0);

  const updateTradeEntry = (
    type: "buys" | "sells",
    id: string,
    field: keyof TradeEntry,
    value: string
  ) => {
    const setter = type === "buys" ? setBuys : setSells;
    setter((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addTradeEntry = (type: "buys" | "sells") => {
    const setter = type === "buys" ? setBuys : setSells;
    setter((prev) => [
      ...prev,
      {
        id: `${type}-${Date.now()}-${prev.length + 1}`,
        asset: "",
        date: "",
        amount: "",
        price: "",
        note: "",
      },
    ]);
  };

  const removeTradeEntry = (type: "buys" | "sells", id: string) => {
    const setter = type === "buys" ? setBuys : setSells;
    setter((prev) => prev.filter((entry) => entry.id !== id));
  };

  const compressImageForAnalysis = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = document.createElement("img");
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const maxW = 800;
          const maxH = 800;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > maxW || h > maxH) {
            const r = Math.min(maxW / w, maxH / h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
            resolve(base64);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load image"));
        };
        img.src = url;
      }),
    []
  );

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      try {
        const base64 = await compressImageForAnalysis(file);
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        setImagePreview(dataUrl);
        setImageBase64(base64);
        setAnalysisResult(null);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setImagePreview(dataUrl);
          const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
          setImageBase64(base64);
          setAnalysisResult(null);
        };
        reader.readAsDataURL(file);
      }
    },
    [compressImageForAnalysis]
  );

  const defaultAnalysisQuestion = `How does this affect ${selectedCoin.toUpperCase()} price?`;
  const analysisQuestionToSend = analysisQuestion.trim() || defaultAnalysisQuestion;

  const runImageAnalysis = useCallback(async () => {
    if (!imageBase64 || !selectedCoin) return;
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: {
          imageBase64,
          crypto: selectedCoin,
          question: analysisQuestionToSend,
        },
      });
      if (error) throw new Error(error.message || "Edge function request failed.");
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : data.error?.message ?? "Analysis failed.");
      setAnalysisResult({
        summary: data?.summary ?? "",
        impactOnCrypto: data?.impactOnCrypto ?? "",
      });
    } catch (err: any) {
      toast({
        title: "Analysis failed",
        description: err?.message ?? "Could not analyze image. Deploy the 'analyze-image' function and set OPENAI_API_KEY in Supabase.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  }, [imageBase64, selectedCoin, analysisQuestionToSend, toast]);

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
    <div className="min-h-screen bg-black text-foreground font-sans overflow-x-hidden flex flex-col selection:bg-[#00E5A8]/20 relative">

      {/* ═══ TOP NAVIGATION BAR ═══ */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-6">
            <Logo className="text-3xl md:text-4xl flex-shrink-0" />

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: "dashboard", icon: Layers, label: "Dashboard" },
                { id: "multitracker", icon: LayoutGrid, label: "Multi Tracker" },
                { id: "assets", icon: Briefcase, label: "Portfolio" },
                { id: "buys", icon: TrendingUp, label: "Buys" },
                { id: "sells", icon: TrendingDown, label: "Sells" },
                { id: "settings", icon: Settings, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === item.id
                    ? 'text-[#00E5A8] bg-[#00E5A8]/10'
                    : 'text-[#6B7280] hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon size={14} />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {!isPremium && (
              <button
                onClick={handleCheckout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#374151] bg-gradient-to-b from-[#2a2e3e] to-[#0f1219] text-[#E5E7EB] hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all"
              >
                <Crown size={12} className="text-[#00E5A8]" />
                Upgrade
              </button>
            )}

            {/* User avatar */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1E2130] flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={signOut}
                className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#9CA3AF]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE MENU OVERLAY ═══ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col pt-16 px-6 md:hidden">
          <nav className="space-y-2 flex-1">
            {[
              { id: "dashboard", icon: Layers, label: "Dashboard" },
              { id: "multitracker", icon: LayoutGrid, label: "Multi Tracker" },
              { id: "assets", icon: Briefcase, label: "Portfolio" },
              { id: "buys", icon: TrendingUp, label: "Buys" },
              { id: "sells", icon: TrendingDown, label: "Sells" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                  ? 'text-[#00E5A8] bg-[#00E5A8]/10'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile bottom section */}
          <div className="border-t border-white/5 py-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1E2130] flex items-center justify-center text-sm font-bold text-[#6B7280]">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-[10px] text-[#6B7280] truncate">{user?.email || ''}</div>
              </div>
            </div>
            {!isPremium && (
              <button
                onClick={() => { handleCheckout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#374151] bg-gradient-to-b from-[#2a2e3e] to-[#0f1219] text-xs font-bold uppercase tracking-wider text-[#E5E7EB] hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all"
              >
                <Crown size={14} className="text-[#00E5A8]" />
                Upgrade Pro
              </button>
            )}
            <button
              onClick={() => { signOut(); setMobileMenuOpen(false); }}
              className="w-full text-left text-[11px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#EF4444] transition-colors px-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main
        className={`flex-1 flex flex-col ${(activeTab === 'dashboard' || activeTab === 'multitracker') ? 'h-[calc(100vh-56px)] overflow-hidden' : 'pb-20 lg:pb-10 min-h-[calc(100vh-56px)] bg-transparent'}`}
      >
        <header className={`sticky top-0 z-[60] px-8 py-6 flex items-center justify-end bg-background/0 pointer-events-none ${(activeTab === "multitracker") ? "hidden" : ""}`}>
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="flex bg-[#09090b]/80 backdrop-blur-xl rounded-xl p-1 border border-white/10">
              {["USD", "EUR"].map((f) => (
                <button
                  key={f}
                  onClick={() => setCurrency(f)}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-wider transition-all duration-300 ${currency === f ? "bg-[#00E5A8]/20 text-[#00E5A8]" : "text-white/40 hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#00E5A8]/20 text-[#00E5A8] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:bg-[#00E5A8]/30 active:scale-95 border border-[#00E5A8]/20 hover:border-[#00E5A8]/40"
            >
              <Plus size={16} strokeWidth={3} /> Add
            </button>
          </div>
        </header>

        <div className={(activeTab === "dashboard" || activeTab === "multitracker") ? "flex-1 flex flex-col overflow-hidden relative z-0" : "p-4 md:p-8 w-full space-y-10 relative z-0"}>
          {activeTab === "dashboard" && (
            <TradingDashboard
              stats={stats}
              selectedCoin={selectedCoin}
              setSelectedCoin={setSelectedCoin}
              setIsAddModalOpen={setIsAddModalOpen}
              formatCurrency={formatCurrency}
              currency={currency}
              amountInputs={amountInputs}
              setAmountInputs={setAmountInputs}
              updateAmount={updateAmount}
            />
          )}

          {activeTab === "multitracker" && (
            <MultiTracker />
          )}

          {activeTab === "assets" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
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

          {activeTab === "image-analysis" && (
            <div className="max-w-4xl space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <h3 className="text-4xl md:text-5xl font-black tracking-tight">AI Image Analysis</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Upload charts, news screenshots, tweets, or market analysis. Our AI will analyze the content and provide comprehensive insights on how it affects your selected cryptocurrency.
                </p>
              </div>

              {/* Crypto Selector - Prominent */}
              <div className="glass rounded-3xl p-6 border-primary/20">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-3">
                  Select cryptocurrency to analyze
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="crypto-suggestions"
                    value={chartSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setChartSearch(value);
                      setSelectedCoin(value.toLowerCase());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = chartSearch.trim();
                        if (value) {
                          setSelectedCoin(value.toLowerCase());
                        }
                      }
                    }}
                    placeholder="Type: BTC, ETH, XRP, SOL, ADA..."
                    className="w-full bg-background border-2 border-primary/30 rounded-2xl px-6 py-4 text-xl font-black uppercase tracking-wide text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <datalist id="crypto-suggestions">
                    {stats.assets.map((asset) => (
                      <option key={asset.coin_id} value={asset.symbol.toUpperCase()} />
                    ))}
                  </datalist>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Currently selected:</span>
                    <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-black uppercase tracking-wider text-primary">
                      {selectedCoin.toUpperCase()}
                    </span>
                  </div>
                  {stats.assets.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs font-bold text-muted-foreground mb-3">Quick select from your portfolio:</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.assets.slice(0, 8).map((asset) => (
                          <button
                            key={asset.coin_id}
                            onClick={() => {
                              setSelectedCoin(asset.coin_id);
                              setChartSearch(asset.symbol.toUpperCase());
                            }}
                            className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${selectedCoin === asset.coin_id
                              ? "bg-primary/10 border-primary/40 text-primary"
                              : "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80"
                              }`}
                          >
                            <img src={asset.image} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-sm font-black uppercase">{asset.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Question */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">
                  Your specific question (optional)
                </label>
                <input
                  type="text"
                  value={analysisQuestion}
                  onChange={(e) => setAnalysisQuestion(e.target.value)}
                  placeholder={`e.g., "Will this news push ${selectedCoin.toUpperCase()} higher?" or "What's the likely price direction?"`}
                  className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-base font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for a general market impact analysis including chart predictions and sentiment analysis.
                </p>
              </div>

              {/* Image Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary/50", "bg-card/80", "scale-[1.01]"); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary/50", "bg-card/80", "scale-[1.01]"); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary/50", "bg-card/80", "scale-[1.01]");
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageFile(file);
                }}
                className="border-2 border-dashed border-border rounded-3xl p-10 md:p-16 text-center transition-all bg-card/30 hover:border-primary/30"
              >
                {imagePreview ? (
                  <div className="space-y-6">
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Uploaded content" className="max-h-64 mx-auto rounded-2xl object-contain border-2 border-border shadow-xl" />
                      <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2">
                        <ImageIcon size={20} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        type="button"
                        onClick={runImageAnalysis}
                        disabled={analysisLoading}
                        className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-base disabled:opacity-50 hover:opacity-90 transition-all active:scale-95 shadow-lg"
                      >
                        {analysisLoading ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⏳</span>
                            Analyzing...
                          </>
                        ) : (
                          "🔍 Analyze Image"
                        )}
                      </button>
                      <label className="px-8 py-4 rounded-2xl border-2 border-border font-bold text-base cursor-pointer hover:bg-card/50 hover:border-primary/40 transition-all active:scale-95">
                        📷 Change Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }} />
                      </label>
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImageBase64(null); setAnalysisResult(null); }}
                        className="px-8 py-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-base font-bold transition-all active:scale-95"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
                      <ImageIcon size={40} />
                    </div>
                    <p className="font-black text-xl text-foreground mb-2">Drop an image here or click to upload</p>
                    <p className="text-base text-muted-foreground mb-6">
                      📊 Chart patterns • 📰 News articles • 🐦 Tweets • 📈 Technical analysis
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl text-sm font-bold text-primary">
                      <span>Supported formats: JPG, PNG, WebP</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }} />
                  </label>
                )}
              </div>

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-6 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card/60 to-card/40 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-widest text-primary">AI Analysis Results</h4>
                  </div>

                  <div className="space-y-4 p-6 bg-background/50 rounded-2xl border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📋</span>
                      <h5 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Summary</h5>
                    </div>
                    <p className="text-base leading-relaxed text-foreground">{analysisResult.summary}</p>
                  </div>

                  <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📊</span>
                      <h5 className="text-sm font-black uppercase tracking-widest text-primary">
                        Impact on {selectedCoin.toUpperCase()}
                      </h5>
                    </div>
                    <p className="text-base leading-relaxed text-foreground font-medium">{analysisResult.impactOnCrypto}</p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      ⚠️ This analysis is AI-generated and should not be considered financial advice. Always do your own research.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "buys" && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tracking-tight">Buys</h3>
                <button
                  onClick={() => addTradeEntry("buys")}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-black flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus size={16} /> New row
                </button>
              </div>
              <div className="w-full overflow-x-auto thin-scroll rounded-3xl border border-border bg-card/40">
                <table className="min-w-[780px] w-full border-collapse">
                  <thead>
                    <tr className="bg-card/70 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-4 py-3 text-left border-b border-r border-border">Asset</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Date</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Amount</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Price</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Notes</th>
                      <th className="px-3 py-3 text-right border-b border-border w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {buys.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/70"
                      >
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.asset}
                            onChange={(e) =>
                              updateTradeEntry("buys", row.id, "asset", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.date}
                            onChange={(e) =>
                              updateTradeEntry("buys", row.id, "date", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.amount}
                            onChange={(e) =>
                              updateTradeEntry("buys", row.id, "amount", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.price}
                            onChange={(e) =>
                              updateTradeEntry("buys", row.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.note}
                            onChange={(e) =>
                              updateTradeEntry("buys", row.id, "note", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5 align-middle text-right">
                          <button
                            type="button"
                            onClick={() => removeTradeEntry("buys", row.id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sells" && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tracking-tight">Sells</h3>
                <button
                  onClick={() => addTradeEntry("sells")}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-black flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus size={16} /> New row
                </button>
              </div>
              <div className="w-full overflow-x-auto thin-scroll rounded-3xl border border-border bg-card/40">
                <table className="min-w-[780px] w-full border-collapse">
                  <thead>
                    <tr className="bg-card/70 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-4 py-3 text-left border-b border-r border-border">Asset</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Date</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Amount</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Price</th>
                      <th className="px-4 py-3 text-left border-b border-r border-border">Notes</th>
                      <th className="px-3 py-3 text-right border-b border-border w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sells.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/70"
                      >
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.asset}
                            onChange={(e) =>
                              updateTradeEntry("sells", row.id, "asset", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.date}
                            onChange={(e) =>
                              updateTradeEntry("sells", row.id, "date", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.amount}
                            onChange={(e) =>
                              updateTradeEntry("sells", row.id, "amount", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.price}
                            onChange={(e) =>
                              updateTradeEntry("sells", row.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-2.5 align-middle border-r border-border/70">
                          <input
                            className="w-full bg-transparent text-sm focus:outline-none focus:bg-background focus:border-primary border-b border-transparent pb-0.5"
                            placeholder=""
                            value={row.note}
                            onChange={(e) =>
                              updateTradeEntry("sells", row.id, "note", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5 align-middle text-right">
                          <button
                            type="button"
                            onClick={() => removeTradeEntry("sells", row.id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="w-full space-y-10">
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
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-2"
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
      {
        deleteTarget && (
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
        )
      }

      {/* Add modal */}
      {/* Add modal */}
      {
        isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
            <div className="w-full max-w-[420px] bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

              {/* Header & Input */}
              <div className="p-4 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Add Asset</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"><X size={14} /></button>
                </div>

                {!isPremium && holdings.length >= FREE_HOLDING_LIMIT && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    <span className="text-[10px] font-bold">Free plan limit reached (1 asset).</span>
                    <button
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setActiveTab("settings");
                      }}
                      className="text-[10px] font-black underline hover:text-red-300"
                    >
                      Upgrade
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="Search visible assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {top50.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => handleAdd(coin)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group text-left border border-transparent hover:border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt="" className="w-8 h-8 rounded-full ring-1 ring-white/10" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{coin.name}</div>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">{formatCurrency(coin.current_price)}</div>
                      <div className="text-[9px] text-primary font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-wider">
                        Select
                      </div>
                    </div>
                  </button>
                ))}
                {top50.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">No assets found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass px-4 py-3 flex items-center justify-around z-40 safe-area-bottom">
        <button onClick={() => setActiveTab("dashboard")} className={`flex flex-col items-center gap-1 ${activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"}`}>
          <Layers size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Terminal</span>
        </button>
        <button onClick={() => setActiveTab("assets")} className={`flex flex-col items-center gap-1 ${activeTab === "assets" ? "text-primary" : "text-muted-foreground"}`}>
          <Briefcase size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Assets</span>
        </button>
        <button onClick={() => setIsAddModalOpen(true)} className="w-14 h-14 bg-primary text-primary-foreground rounded-[20px] flex items-center justify-center -mt-8 active:scale-90 transition-all ring-4 ring-background shadow-lg">
          <Plus size={28} />
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center gap-1 ${activeTab === "settings" ? "text-primary" : "text-muted-foreground"}`}>
          <Settings size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Settings</span>
        </button>
        <button onClick={() => setActiveTab("multitracker")} className={`flex flex-col items-center gap-1 ${activeTab === "multitracker" ? "text-primary" : "text-muted-foreground"}`}>
          <LayoutGrid size={22} /><span className="text-[9px] font-black uppercase tracking-tighter">Tracker</span>
        </button>
      </nav>
    </div >
  );
};

export default Dashboard;
