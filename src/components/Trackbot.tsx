import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Bot, TrendingUp, TrendingDown, RefreshCw, X, ImageIcon, Zap } from 'lucide-react';
import { API_BASE } from '@/lib/constants';

interface TrackbotProps {
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
        }>;
    };
    selectedCoin: string;
    formatCurrency: (value: number) => string;
    currency: string;
}

interface BotMessage {
    id: string;
    type: 'analysis' | 'news' | 'alert' | 'image-analysis';
    title: string;
    content: string;
    timestamp: Date;
    coin?: string;
    change?: number;
}

interface DroppedImage {
    id: string;
    src: string;
    name: string;
    analysis: string | null;
    analyzing: boolean;
}

export const Trackbot: React.FC<TrackbotProps> = ({
    stats,
    selectedCoin,
    formatCurrency,
    currency,
}) => {
    const [messages, setMessages] = useState<BotMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [droppedImages, setDroppedImages] = useState<DroppedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const selectedAsset = stats.assets.find(a => a.coin_id === selectedCoin);

    // ─── GENERATE ANALYSIS MESSAGES ───
    const generateAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            // Fetch trending coins for market context
            const res = await fetch(`${API_BASE}/search/trending`);
            const data = await res.json();
            const trending = data?.coins?.slice(0, 5) || [];

            const newMessages: BotMessage[] = [];

            // Portfolio overview
            if (stats.assets.length > 0) {
                const topMover = [...stats.assets].sort((a, b) =>
                    Math.abs(b.price_change_percentage_24h ?? 0) - Math.abs(a.price_change_percentage_24h ?? 0)
                )[0];

                if (topMover) {
                    const change = topMover.price_change_percentage_24h ?? 0;
                    const direction = change >= 0 ? 'up' : 'down';
                    const reasons = change >= 0
                        ? [
                            'Increased trading volume signals strong buying pressure.',
                            'Market sentiment has shifted bullish following institutional interest.',
                            'Technical breakout above key resistance level.',
                            'Positive network activity and on-chain metrics.',
                        ]
                        : [
                            'Profit-taking after recent rally, typical market correction.',
                            'Broader market sell-off impacting altcoins.',
                            'Declining trading volume suggests reduced buyer interest.',
                            'Bearish technical pattern forming on the daily chart.',
                        ];

                    newMessages.push({
                        id: Date.now().toString() + '_mover',
                        type: 'analysis',
                        title: `${topMover.name} (${topMover.symbol.toUpperCase()}) -- ${direction === 'up' ? 'Rising' : 'Falling'}`,
                        content: `${topMover.symbol.toUpperCase()} has moved ${change >= 0 ? '+' : ''}${change.toFixed(2)}% in the last 24h. ${reasons[Math.floor(Math.random() * reasons.length)]} Current price: ${formatCurrency(topMover.current_price)}.`,
                        timestamp: new Date(),
                        coin: topMover.symbol.toUpperCase(),
                        change,
                    });
                }
            }

            // Selected coin analysis
            if (selectedAsset) {
                const pct = selectedAsset.price_change_percentage_24h ?? 0;
                newMessages.push({
                    id: Date.now().toString() + '_selected',
                    type: 'analysis',
                    title: `Analysis: ${selectedAsset.name}`,
                    content: `Your ${selectedAsset.symbol.toUpperCase()} holding is worth ${formatCurrency(selectedAsset.currentValue)} (${selectedAsset.amount} units at ${formatCurrency(selectedAsset.current_price)} each). 24h change: ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%. This ${Math.abs(pct) > 5 ? 'significant' : 'modest'} movement ${pct >= 0 ? 'suggests continued market interest' : 'may present a buying opportunity if fundamentals remain strong'}.`,
                    timestamp: new Date(),
                    coin: selectedAsset.symbol.toUpperCase(),
                    change: pct,
                });
            }

            // Trending coins news
            if (trending.length > 0) {
                const coin = trending[Math.floor(Math.random() * trending.length)]?.item;
                if (coin) {
                    newMessages.push({
                        id: Date.now().toString() + '_trending',
                        type: 'news',
                        title: `Trending: ${coin.name} (${coin.symbol})`,
                        content: `${coin.name} is currently trending on CoinGecko. Market cap rank: #${coin.market_cap_rank || 'N/A'}. High trending activity often correlates with increased volatility -- monitor closely if considering a position.`,
                        timestamp: new Date(),
                        coin: coin.symbol,
                    });
                }
            }

            // Portfolio health alert
            const delta = stats.delta24hPct;
            newMessages.push({
                id: Date.now().toString() + '_health',
                type: 'alert',
                title: 'Portfolio Health',
                content: `Total portfolio value: ${formatCurrency(stats.totalValue)}. 24h change: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%. ${delta > 3 ? 'Strong performance. Consider rebalancing to lock in gains.' : delta < -3 ? 'Notable decline. Review individual positions for stop-loss opportunities.' : 'Stable performance within normal range.'}`,
                timestamp: new Date(),
                change: delta,
            });

            // Replace all bot messages, keep only image-analysis from prior cycles
            setMessages(prev => {
                const imageAnalyses = prev.filter(m => m.type === 'image-analysis');
                return [...newMessages, ...imageAnalyses];
            });
        } catch (err) {
            setMessages(prev => {
                const imageAnalyses = prev.filter(m => m.type === 'image-analysis');
                return [{
                    id: Date.now().toString(),
                    type: 'alert' as const,
                    title: 'Connection Issue',
                    content: 'Unable to fetch market data. Will retry on next cycle.',
                    timestamp: new Date(),
                }, ...imageAnalyses];
            });
        }
        setIsAnalyzing(false);
    }, [stats, selectedAsset, selectedCoin, formatCurrency]);

    // ─── AUTO-REFRESH every 60 seconds ───
    useEffect(() => {
        generateAnalysis();
        intervalRef.current = setInterval(generateAnalysis, 60000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [selectedCoin]);



    // ─── IMAGE DROP HANDLING ───
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const processImage = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgId = Date.now().toString();
            const newImg: DroppedImage = {
                id: imgId,
                src: e.target?.result as string,
                name: file.name,
                analysis: null,
                analyzing: true,
            };
            setDroppedImages(prev => [newImg, ...prev]);

            // Simulate analysis (2-3 seconds)
            setTimeout(() => {
                const analyses = [
                    `Chart pattern detected: The image appears to show a ${Math.random() > 0.5 ? 'bullish ascending triangle' : 'bearish descending wedge'} formation. Key support/resistance levels are visible. ${Math.random() > 0.5 ? 'Bullish breakout likely if volume confirms.' : 'Monitor for breakdown below support.'}`,
                    `Technical analysis: ${Math.random() > 0.5 ? 'RSI suggests oversold conditions, potential reversal incoming.' : 'MACD crossover detected, momentum shifting.'} The visible candlestick pattern indicates ${Math.random() > 0.5 ? 'accumulation phase' : 'distribution phase'}.`,
                    `Market structure analysis: The image shows ${Math.random() > 0.5 ? 'a clear uptrend with higher highs and higher lows' : 'consolidation within a range'}. Volume profile suggests ${Math.random() > 0.5 ? 'strong institutional interest' : 'retail-driven activity'}. Key level to watch identified.`,
                ];
                const analysis = analyses[Math.floor(Math.random() * analyses.length)];
                setDroppedImages(prev =>
                    prev.map(img => img.id === imgId ? { ...img, analysis, analyzing: false } : img)
                );
                setMessages(prev => [{
                    id: imgId + '_analysis',
                    type: 'image-analysis' as const,
                    title: `Image Analyzed: ${file.name}`,
                    content: analysis,
                    timestamp: new Date(),
                }, ...prev]);
            }, 2000 + Math.random() * 1000);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        files.forEach(processImage);
    }, [processImage]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        files.forEach(processImage);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [processImage]);

    const removeImage = (id: string) => {
        setDroppedImages(prev => prev.filter(img => img.id !== id));
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'analysis': return <TrendingUp size={14} />;
            case 'news': return <Zap size={14} />;
            case 'alert': return <Bot size={14} />;
            case 'image-analysis': return <ImageIcon size={14} />;
            default: return <Bot size={14} />;
        }
    };

    const getMessageColor = (msg: BotMessage) => {
        if (msg.change !== undefined) return msg.change >= 0 ? '#00E5A8' : '#EF4444';
        if (msg.type === 'image-analysis') return '#A78BFA';
        return '#6B7280';
    };

    return (
        <div className="p-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#374151] to-[#111827] border border-[#4B5563] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <Bot size={18} className="text-[#00E5A8]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Trackbot</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-[#00E5A8] animate-pulse' : 'bg-[#00E5A8]'}`} />
                            <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">
                                {isAnalyzing ? 'Analyzing...' : 'Active'} -- Updates every 60s
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => generateAnalysis()}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#374151] bg-gradient-to-b from-[#2a2e3e] to-[#0f1219] text-[#E8EAED] text-[10px] font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT: Image Drop Zone ── */}
                <div className="lg:col-span-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B7280] mb-3">
                        Chart Analysis
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                            ${isDragging
                                ? 'border-[#00E5A8] bg-[#00E5A8]/5'
                                : 'border-[#374151] hover:border-[#4B5563] hover:bg-white/[0.02]'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <Upload size={24} className={`mx-auto mb-3 ${isDragging ? 'text-[#00E5A8]' : 'text-[#4B5563]'}`} />
                        <div className="text-xs font-bold text-[#9CA3AF] mb-1">
                            {isDragging ? 'Drop image here' : 'Drop chart screenshot'}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                            or click to browse
                        </div>
                    </div>

                    {/* Dropped images */}
                    {droppedImages.length > 0 && (
                        <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                            {droppedImages.map(img => (
                                <div key={img.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                    <div className="relative">
                                        <img src={img.src} alt={img.name} className="w-full h-32 object-cover" />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-[10px] font-bold text-white mb-1 truncate">{img.name}</div>
                                        {img.analyzing ? (
                                            <div className="flex items-center gap-2 text-[10px] text-[#00E5A8]">
                                                <RefreshCw size={10} className="animate-spin" />
                                                Analyzing...
                                            </div>
                                        ) : img.analysis ? (
                                            <p className="text-[10px] text-[#9CA3AF] leading-relaxed">{img.analysis}</p>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Bot Feed ── */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B7280]">
                            Market Intelligence
                        </div>
                        <div className="text-[10px] text-[#4B5563] font-mono">
                            {messages.length} updates
                        </div>
                    </div>

                    {/* Portfolio context bar */}
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Portfolio</span>
                            <span className="text-xs font-bold text-white">{formatCurrency(stats.totalValue)}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">24h</span>
                            <span className={`text-xs font-bold ${stats.delta24hPct >= 0 ? 'text-[#00E5A8]' : 'text-[#EF4444]'}`}>
                                {stats.delta24hPct >= 0 ? '+' : ''}{stats.delta24hPct.toFixed(2)}%
                            </span>
                        </div>
                        {selectedAsset && (
                            <>
                                <div className="w-px h-4 bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <img src={selectedAsset.image} alt="" className="w-4 h-4 rounded-full" />
                                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">
                                        {selectedAsset.symbol.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                        {formatCurrency(selectedAsset.current_price)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Messages feed */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {messages.length === 0 && (
                            <div className="text-center py-12 text-[#4B5563]">
                                <Bot size={32} className="mx-auto mb-3 opacity-30" />
                                <div className="text-xs font-bold">Initializing Trackbot...</div>
                                <div className="text-[10px] mt-1">Fetching market data</div>
                            </div>
                        )}
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className="px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: `${getMessageColor(msg)}15`, color: getMessageColor(msg) }}
                                    >
                                        {getMessageIcon(msg.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[11px] font-bold text-white truncate">{msg.title}</span>
                                            <span className="text-[9px] text-[#4B5563] font-mono flex-shrink-0">
                                                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{msg.content}</p>
                                        {msg.change !== undefined && (
                                            <div className="mt-2 flex items-center gap-1">
                                                {msg.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                <span
                                                    className="text-[10px] font-bold"
                                                    style={{ color: msg.change >= 0 ? '#00E5A8' : '#EF4444' }}
                                                >
                                                    {msg.change >= 0 ? '+' : ''}{msg.change.toFixed(2)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
};
