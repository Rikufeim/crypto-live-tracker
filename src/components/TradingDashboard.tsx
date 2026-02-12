import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Eye, ListFilter, LayoutList, MoreHorizontal } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { DashboardStats } from './DashboardStats';
import { Trackbot } from './Trackbot';

interface TradingDashboardProps {
    stats: {
        totalValue: number;
        delta24h: number;
        delta24hPct: number;
        totalProfit: number;
        assets: Array<{
            id: string;
            coin_id: string;
            symbol: string;
            name: string;
            image: string;
            current_price: number;
            currentValue: number;
            amount: number;
            price_change_percentage_24h: number | null;
            market_cap_rank?: number;
        }>;
    };
    selectedCoin: string;
    setSelectedCoin: (coin: string) => void;
    setIsAddModalOpen: (open: boolean) => void;
    formatCurrency: (value: number) => string;
    currency: string;
    amountInputs: Record<string, string>;
    setAmountInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    updateAmount: (id: string, amount: number) => void;
}

export const TradingDashboard: React.FC<TradingDashboardProps> = ({
    stats,
    selectedCoin,
    setSelectedCoin,
    setIsAddModalOpen,
    formatCurrency,
    currency,
    amountInputs,
    setAmountInputs,
    updateAmount,
}) => {
    const [watchlistTab, setWatchlistTab] = useState<'all' | 'favorites'>('all');

    return (
        <div className="flex flex-col h-screen text-[#E8EAED] font-sans selection:bg-[#00E5A8]/30 overflow-y-auto relative bg-transparent" style={{ scrollbarWidth: 'none' }}>


            {/* ═══════════════ FULL-WIDTH CHART ═══════════════ */}
            <div className="relative w-full shrink-0 px-6 pt-6 pb-2" style={{ height: '52vh' }}>
                <div className="relative h-full w-full rounded-[24px] overflow-hidden group">
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-60 group-hover:opacity-100">
                        <TradingViewWidget symbol={selectedCoin} className="h-full w-full" />
                    </div>

                    {/* Floating Glass Toolbar Indicator (Visual only) */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="w-2 h-2 rounded-full bg-[#00E5A8] animate-pulse shadow-[0_0_10px_#00E5A8]" />
                        <span className="text-[10px] font-bold tracking-widest text-[#00E5A8] uppercase">Live Data</span>
                    </div>

                    {/* deep gradient overlay at bottom — fades to black */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, #000000 0%, transparent 100%)',
                        }}
                    />
                </div>
            </div>

            {/* ══════ NEON GREEN GLOW DIVIDER — between chart and content ══════ */}
            <div className="relative w-full h-px mx-auto">
                <div className="absolute inset-x-[10%] -top-[1px] h-[2px] bg-gradient-to-r from-transparent via-[#00E5A8]/60 to-transparent" />
                <div className="absolute inset-x-[20%] -top-[6px] h-[12px] bg-gradient-to-r from-transparent via-[#00E5A8]/15 to-transparent blur-md" />
            </div>

            {/* ═══════════════ BOTTOM SECTION (scrollable) ═══════════════ */}
            <div className="px-6 pb-8">

                {/* ── MY PORTFOLIO + ACTIVE MARKETS — side by side ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">

                    {/* ── MY PORTFOLIO (left, wider) ── */}
                    <div className="lg:col-span-5 p-4 relative group">

                        {/* title */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8EAED] text-shadow-sm">Portfolio</h2>
                                </div>
                                <div className="flex items-center gap-2 text-[#6B7280]">
                                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-b from-[#374151] to-[#111827] border border-[#4B5563] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] text-[10px] font-bold text-[#E5E7EB] hover:brightness-110 transition-all group/btn">
                                        <Eye size={12} className="group-hover/btn:text-[#00E5A8] transition-colors" />
                                        <span>View All</span>
                                    </button>
                                </div>
                            </div>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-[#6B7280] hover:text-white transition-all">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        {/* stats */}
                        <div className="flex items-end gap-y-6 gap-x-10 flex-wrap relative z-10">
                            {/* portfolio value */}
                            <div className="relative group/val">
                                <div className="text-[10px] text-[#9CA3AF] mb-2 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                                    Total Balance
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] shadow-[0_0_8px_#00E5A8] animate-pulse" />
                                </div>
                                <div className="text-[42px] font-black tracking-tight leading-none tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/val:drop-shadow-[0_0_25px_rgba(0,229,168,0.2)] transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                    {formatCurrency(stats.totalValue)}
                                </div>
                            </div>

                            {/* divider with soft gradient */}
                            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

                            {/* 24h change */}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[24px] font-bold tabular-nums tracking-tight ${stats.delta24h >= 0 ? 'text-[#00E5A8] drop-shadow-[0_0_8px_rgba(0,229,168,0.3)]' : 'text-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}>
                                        {stats.delta24h >= 0 ? '+' : ''}{formatCurrency(stats.delta24h)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${stats.delta24hPct >= 0
                                        ? 'text-[#00E5A8] bg-[#00E5A8]/5 border-[#00E5A8]/20 shadow-[0_0_10px_-4px_#00E5A8]'
                                        : 'text-[#EF4444] bg-[#EF4444]/5 border-[#EF4444]/20 shadow-[0_0_10px_-4px_#EF4444]'
                                        }`}>
                                        {stats.delta24hPct >= 0 ? '▲' : '▼'} {Math.abs(stats.delta24hPct).toFixed(2)}%
                                    </span>
                                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-medium">24h Change</span>
                                </div>
                            </div>

                            {/* divider */}
                            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden xl:block" />

                            {/* total profit */}
                            <div className="hidden xl:block">
                                <div className="text-[10px] text-[#9CA3AF] mb-1.5 uppercase tracking-[0.2em] font-bold">Unrealized PNL</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold tabular-nums text-white/90">{formatCurrency(stats.totalProfit)}</span>
                                    <span className={`text-[10px] font-bold ${stats.totalProfit >= 0 ? 'text-[#00E5A8]' : 'text-[#EF4444]'}`}>
                                        {stats.totalProfit >= 0 ? '+' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ACTIVE MARKETS watchlist (right) ── */}
                    <div className="lg:col-span-7 p-4 relative">

                        {/* header */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8EAED] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                Active Markets
                            </h3>
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
                                <button
                                    onClick={() => setWatchlistTab('all')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${watchlistTab === 'all'
                                        ? 'bg-gradient-to-b from-[#4B5563] to-[#1F2937] border-t border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white'
                                        : 'text-[#9CA3AF] hover:text-white'
                                        }`}
                                >All Assets</button>
                                <button
                                    onClick={() => setWatchlistTab('favorites')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${watchlistTab === 'favorites'
                                        ? 'bg-gradient-to-b from-[#4B5563] to-[#1F2937] border-t border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white'
                                        : 'text-[#9CA3AF] hover:text-white'
                                        }`}
                                >Favorites</button>
                            </div>
                        </div>

                        {/* column headers */}
                        <div className="grid grid-cols-12 items-center text-[9px] font-bold text-[#6B7280]/60 uppercase tracking-[0.2em] px-4 py-3 border-b border-white/5 mb-2">
                            <div className="col-span-4">Asset Pair</div>
                            <div className="col-span-2">Price</div>
                            <div className="col-span-2 text-center">Size</div>
                            <div className="col-span-2 text-right">Value</div>
                            <div className="col-span-2 text-right">24h %</div>
                        </div>

                        {/* asset rows */}
                        <div className="space-y-2 mt-1 max-h-[500px] overflow-y-auto pr-2 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                            {stats.assets.map((asset, idx) => (
                                <div
                                    key={asset.id}
                                    onClick={() => setSelectedCoin(asset.coin_id)}
                                    className={`relative grid grid-cols-12 items-center px-4 py-3.5 rounded-[18px] cursor-pointer transition-all duration-300 group border border-transparent ${selectedCoin === asset.coin_id
                                        ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
                                        : 'hover:bg-white/5 hover:border-white/5 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {/* asset */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <span className="text-[10px] text-[#4B5563] w-4 text-right font-medium opacity-50">{idx + 1}</span>
                                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                                            <img src={asset.image} className="w-10 h-10 rounded-full shadow-lg ring-2 ring-[#1E2130] group-hover:ring-[#00E5A8]/50 transition-all" alt="" />
                                            {selectedCoin === asset.coin_id && (
                                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#00E5A8] rounded-full border-[3px] border-[#161923] shadow-[0_0_10px_#00E5A8]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-[#00E5A8] transition-colors tracking-tight">{asset.name}</div>
                                            <div className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold mt-0.5 flex items-center gap-1">
                                                {asset.symbol} <span className="w-0.5 h-2 bg-white/10" /> rank #{asset.market_cap_rank || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* price */}
                                    <div className="col-span-2 text-xs text-[#E8EAED]/80 tabular-nums font-bold group-hover:text-white transition-colors">
                                        {formatCurrency(asset.current_price)}
                                    </div>

                                    {/* amount input pill */}
                                    <div className="col-span-2 flex justify-center">
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                value={
                                                    amountInputs[asset.id] ??
                                                    (asset.amount || asset.amount === 0 ? asset.amount.toString() : '')
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(',', '.');
                                                    setAmountInputs((prev) => ({ ...prev, [asset.id]: v }));
                                                }}
                                                onBlur={(e) => {
                                                    const v = e.target.value.replace(',', '.');
                                                    const parsed = parseFloat(v);
                                                    const safe = Number.isFinite(parsed) ? parsed : 0;
                                                    updateAmount(asset.id, safe);
                                                    setAmountInputs((prev) => ({ ...prev, [asset.id]: v }));
                                                }}
                                                className="w-[90px] bg-[#0B0F1A]/50 border border-white/5 rounded-full px-3 py-1.5 text-xs font-bold text-center text-white focus:border-[#00E5A8]/50 focus:bg-[#00E5A8]/5 focus:ring-2 focus:ring-[#00E5A8]/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] outline-none transition-all placeholder:text-white/20"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* value */}
                                    <div className="col-span-2 text-right text-xs font-bold tabular-nums text-white group-hover:text-[#00E5A8] transition-colors">
                                        {formatCurrency(asset.currentValue)}
                                    </div>

                                    {/* 24h badge */}
                                    <div className="col-span-2 flex justify-end">
                                        <span className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-sm transition-all shadow-sm ${(asset.price_change_percentage_24h ?? 0) >= 0
                                            ? 'text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20 group-hover:bg-[#00E5A8]/20 group-hover:shadow-[0_0_15px_-5px_rgba(0,229,168,0.4)]'
                                            : 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20 group-hover:bg-[#EF4444]/20'
                                            }`}>
                                            {(asset.price_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'}
                                            <span className="ml-1">{(asset.price_change_percentage_24h ?? 0).toFixed(2)}%</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* add asset button */}
                        <div className="flex justify-center mt-6 relative z-10">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="group flex items-center gap-2 px-8 py-3 rounded-xl border border-[#374151] bg-gradient-to-b from-[#2a2e3e] to-[#0f1219] text-[#E8EAED] text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-200 active:scale-95"
                            >
                                <div className="p-1 rounded-full bg-white/10 group-hover:bg-[#00E5A8] group-hover:text-black transition-colors">
                                    <Plus size={12} />
                                </div>
                                Add New Market
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════ NEON GREEN GLOW DIVIDER — between markets and stats ══════ */}
                <div className="relative w-full h-px my-8 mx-auto">
                    <div className="absolute inset-x-[10%] -top-[1px] h-[2px] bg-gradient-to-r from-transparent via-[#00E5A8]/60 to-transparent" />
                    <div className="absolute inset-x-[20%] -top-[6px] h-[12px] bg-gradient-to-r from-transparent via-[#00E5A8]/15 to-transparent blur-md" />
                </div>

                <DashboardStats stats={stats} selectedCoin={selectedCoin} formatCurrency={formatCurrency} currency={currency} />

                {/* NEON GREEN GLOW DIVIDER -- between stats and Trackbot */}
                <div className="relative w-full h-px my-8 mx-auto">
                    <div className="absolute inset-x-[10%] -top-[1px] h-[2px] bg-gradient-to-r from-transparent via-[#00E5A8]/60 to-transparent" />
                    <div className="absolute inset-x-[20%] -top-[6px] h-[12px] bg-gradient-to-r from-transparent via-[#00E5A8]/15 to-transparent blur-md" />
                </div>

                <Trackbot stats={stats} selectedCoin={selectedCoin} formatCurrency={formatCurrency} currency={currency} />
            </div>
        </div>
    );
};
