import React from 'react';
import { Plus } from 'lucide-react';
import { Calendar } from './Calendar';
import { MiniChart } from './MiniChart';

interface MinimalistDashboardProps {
    stats: {
        totalValue: number;
        delta24h: number;
        delta24hPct: number;
        totalProfit: number;
        assets: Array<{
            id: string;
            coin_id: string;
            symbol: string;
            image: string;
            current_price: number;
            currentValue: number;
            price_change_percentage_24h: number | null;
        }>;
    };
    selectedCoin: string;
    setSelectedCoin: (coin: string) => void;
    setIsAddModalOpen: (open: boolean) => void;
    formatCurrency: (value: number) => string;
}

export const MinimalistDashboard: React.FC<MinimalistDashboardProps> = ({
    stats,
    selectedCoin,
    setSelectedCoin,
    setIsAddModalOpen,
    formatCurrency,
}) => {
    return (
        <div className="space-y-8">
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Live Price Card */}
                <div className="bg-card/40 border border-border/50 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Live {selectedCoin.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-black ${stats.delta24hPct >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                            }`}>
                            {stats.delta24hPct >= 0 ? '▲' : '▼'} {Math.abs(stats.delta24hPct).toFixed(2)}%
                        </div>
                    </div>

                    <div className="text-3xl font-black tabular-nums">
                        {formatCurrency(stats.totalValue)}
                    </div>

                    <div className="h-16 -mx-2">
                        <MiniChart
                            data={[
                                stats.totalValue * 0.94,
                                stats.totalValue * 0.92,
                                stats.totalValue * 0.95,
                                stats.totalValue * 0.93,
                                stats.totalValue * 0.97,
                                stats.totalValue * 0.96,
                                stats.totalValue * 0.99,
                                stats.totalValue
                            ]}
                            type="line"
                            color={stats.delta24hPct >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                        />
                    </div>

                    <div className="pt-4 border-t border-border/30">
                        <div className="text-xs text-muted-foreground mb-2">Your Assets</div>
                        <div className="space-y-2">
                            {stats.assets.slice(0, 2).map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => setSelectedCoin(asset.coin_id)}
                                    className="flex items-center gap-3 w-full hover:bg-muted/30 rounded-lg p-2 transition-colors"
                                >
                                    <img src={asset.image} className="w-6 h-6 rounded-full" alt="" />
                                    <span className="text-sm font-bold flex-1 text-left">{asset.symbol.toUpperCase()}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {formatCurrency(asset.currentValue)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Balance Chart Card */}
                <div className="bg-card/40 border border-border/50 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Balance
                        </div>
                    </div>

                    <div className="text-3xl font-black tabular-nums">
                        {stats.assets.length}
                        <span className="text-sm font-normal text-muted-foreground ml-2">assets</span>
                    </div>

                    <div className="h-32">
                        <MiniChart
                            data={[65, 45, 78, 52, 88, 72, 95, 68, 82, 58, 91, 75]}
                            type="bar"
                            color="rgb(var(--primary))"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                            <div className={`text-lg font-black ${stats.delta24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                                {formatCurrency(Math.abs(stats.delta24h))}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Profit</div>
                            <div className={`text-lg font-black ${stats.totalProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                                {formatCurrency(Math.abs(stats.totalProfit))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar + Market Cap (stacked) */}
                <div className="space-y-6">
                    {/* Calendar */}
                    <Calendar />

                    {/* Market Cap / Portfolio Value */}
                    <div className="bg-card/40 border border-border/50 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Market Cap
                            </div>
                        </div>

                        <div className="text-3xl font-black tabular-nums">
                            {Math.round(stats.totalValue / 100)}
                            <span className="text-sm font-normal text-muted-foreground ml-2">units</span>
                        </div>

                        <div className="h-20">
                            <MiniChart
                                data={[320, 340, 335, 350, 360, 345, 370, 365, 380, 375, 390, 385]}
                                type="bar"
                                color="rgb(var(--primary))"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Crypto Selection */}
            <div className="bg-card/40 border border-border/50 rounded-3xl p-6">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Select Cryptocurrency
                </div>
                <div className="flex gap-3 flex-wrap">
                    {stats.assets.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => setSelectedCoin(asset.coin_id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${selectedCoin === asset.coin_id
                                    ? 'bg-primary/10 border-primary/40 text-primary'
                                    : 'bg-card border-border/50 hover:border-primary/30'
                                }`}
                        >
                            <img src={asset.image} className="w-8 h-8 rounded-full" alt="" />
                            <div className="text-left">
                                <div className="text-sm font-black">{asset.symbol.toUpperCase()}</div>
                                <div className="text-xs text-muted-foreground tabular-nums">
                                    {formatCurrency(asset.current_price)}
                                </div>
                            </div>
                            <div className={`text-xs font-bold ml-2 ${(asset.price_change_percentage_24h ?? 0) >= 0 ? 'text-positive' : 'text-negative'
                                }`}>
                                {(asset.price_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'}
                                {Math.abs(asset.price_change_percentage_24h ?? 0).toFixed(2)}%
                            </div>
                        </button>
                    ))}

                    {stats.assets.length === 0 && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                        >
                            <Plus size={20} className="text-muted-foreground" />
                            <span className="text-sm font-bold text-muted-foreground">Add your first crypto</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
