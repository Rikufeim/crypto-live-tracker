import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, Plus, Activity, Target, Clock, Timer, Play, Pause, RefreshCcw } from 'lucide-react';

const TradingClock: React.FC = () => {
    const [mode, setMode] = useState<'clock' | 'timer'>('clock');
    const [time, setTime] = useState(new Date());

    // Timer state
    const [timerRunning, setTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerRunning) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning]);

    const formatTimer = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B7280] flex items-center gap-2">
                    {mode === 'clock' ? 'Local Time' : 'Session Timer'}
                    <div className={`w-1 h-1 rounded-full ${mode === 'clock' || timerRunning ? 'bg-[#00E5A8] animate-pulse' : 'bg-[#EF4444]'}`} />
                </div>
                <div className="flex bg-[#1F2937]/50 border border-white/5 rounded-lg p-0.5">
                    <button onClick={() => setMode('clock')} className={`p-1.5 rounded-md transition-colors ${mode === 'clock' ? 'bg-[#374151] text-white shadow-sm' : 'text-[#6B7280] hover:text-white'}`} title="Clock"><Clock size={12} /></button>
                    <button onClick={() => setMode('timer')} className={`p-1.5 rounded-md transition-colors ${mode === 'timer' ? 'bg-[#374151] text-white shadow-sm' : 'text-[#6B7280] hover:text-white'}`} title="Timer"><Timer size={12} /></button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className={`font-black tracking-tighter tabular-nums transition-colors duration-300 leading-none ${mode === 'timer' && timerRunning ? 'text-[#00E5A8] drop-shadow-[0_0_15px_rgba(0,229,168,0.3)]' : 'text-white'}`} style={{ fontSize: '3.5rem' }}>
                    {mode === 'clock'
                        ? time.toLocaleTimeString('en-GB', { hour12: false })
                        : formatTimer(seconds)
                    }
                </div>
                {mode === 'clock' && (
                    <div className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mt-2">
                        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                )}
            </div>

            {mode === 'timer' ? (
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className={`py-2 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${timerRunning ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20' : 'bg-[#00E5A8]/10 border-[#00E5A8]/30 text-[#00E5A8] hover:bg-[#00E5A8]/20'}`}
                    >
                        {timerRunning ? <><Pause size={12} /> Stop</> : <><Play size={12} /> Start</>}
                    </button>
                    <button
                        onClick={() => { setTimerRunning(false); setSeconds(0); }}
                        className="py-2 rounded-xl border border-[#374151] bg-[#1F2937] text-[#9CA3AF] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider hover:text-white hover:border-[#6B7280] transition-all active:scale-95"
                    >
                        <RefreshCcw size={12} /> Reset
                    </button>
                </div>
            ) : (
                <div className="mt-auto pt-4 border-t border-white/5 w-full flex justify-between items-center text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">
                    <span>New York</span>
                    <span className="text-[#9CA3AF]">{new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
            )}
        </div>
    );
};

interface DashboardStatsProps {
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

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    stats,
    selectedCoin,
    formatCurrency,
    currency,
}) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    // ─── PROFIT GOAL (persisted in localStorage) ───
    const [profitGoal, setProfitGoal] = useState<number>(() => {
        const saved = localStorage.getItem('livetrack_profit_goal');
        return saved ? parseFloat(saved) : 1000;
    });
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState(profitGoal.toString());

    useEffect(() => {
        localStorage.setItem('livetrack_profit_goal', profitGoal.toString());
    }, [profitGoal]);

    // ─── SELECTED COIN DATA ───
    const selectedAsset = stats.assets.find(a => a.coin_id === selectedCoin);

    // ─── WEEKLY VOLUME: per-asset 24h value changes ───
    const volumeData = useMemo(() => {
        return stats.assets.map(a => ({
            name: a.symbol.toUpperCase(),
            value: Math.abs((a.price_change_percentage_24h ?? 0) / 100 * a.currentValue),
            isSelected: a.coin_id === selectedCoin,
        }));
    }, [stats.assets, selectedCoin]);

    const totalVolume = stats.delta24h;

    // ─── PROFIT GOAL PROGRESS ───
    const currentProfit = stats.totalProfit;
    const progressPct = profitGoal > 0 ? Math.min(Math.max((currentProfit / profitGoal) * 100, 0), 100) : 0;
    const remaining = Math.max(profitGoal - currentProfit, 0);

    // ─── CALENDAR LOGIC ───
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const calendarDays: (number | null)[] = (
        Array.from({ length: firstDayOfMonth }).fill(null) as (number | null)[]
    ).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );

    const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    // ─── GOAL BAR DATA (daily progress simulation based on actual profit) ───
    const goalBarData = useMemo(() => {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const todayIdx = (today.getDay() + 6) % 7; // Mon=0
        return days.map((d, i) => ({
            name: d,
            value: i <= todayIdx ? Math.max(currentProfit / 7 * (i + 1) + Math.random() * 20, 5) : 0,
            isToday: i === todayIdx,
        }));
    }, [currentProfit]);

    // ─── HANDLE SET GOAL ───
    const handleSetGoal = () => {
        if (isEditingGoal) {
            const parsed = parseFloat(goalInput.replace(',', '.'));
            if (Number.isFinite(parsed) && parsed > 0) {
                setProfitGoal(parsed);
            }
            setIsEditingGoal(false);
        } else {
            setGoalInput(profitGoal.toString());
            setIsEditingGoal(true);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-1">

            {/* ── CARD 1: Trading Clock & Timer ── */}
            <div className="p-6 relative flex flex-col justify-between group">
                <TradingClock />
            </div>

            {/* ── CARD 2: Calendar ── */}
            <div className="p-6 relative flex flex-col group">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-[#6B7280] hover:text-white transition-all active:scale-95">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="text-sm font-bold text-[#E8EAED] uppercase tracking-[0.15em]">
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </div>
                    <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-[#6B7280] hover:text-white transition-all active:scale-95">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-[10px] font-bold text-[#6B7280]/60 uppercase tracking-wider py-1">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
                    {calendarDays.map((day, idx) => {
                        const isToday = isCurrentMonth && day === today.getDate();

                        if (!day) return <div key={idx} />;

                        return (
                            <div
                                key={idx}
                                className={`
                                    aspect-square flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer relative
                                    ${isToday
                                        ? 'bg-[#00E5A8] text-black shadow-[0_0_12px_rgba(0,229,168,0.4)] font-black'
                                        : 'text-[#6B7280] hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom: today's date */}
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
                        Today: {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* ── CARD 3: Profit Goal ── */}
            <div className="p-6 relative flex flex-col group overflow-hidden">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6B7280] mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Target size={12} />
                        Profit Goal
                    </span>
                    <span className="text-white/40 font-mono text-[9px]">
                        {progressPct.toFixed(0)}% reached
                    </span>
                </div>

                <div className="flex justify-center mb-8 relative">
                    <div className="w-40 h-40 rounded-full border-[6px] border-[#1E2330] bg-black relative flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
                        {/* Progress arc */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(from -90deg, ${currentProfit >= 0 ? '#00E5A8' : '#EF4444'} 0%, ${currentProfit >= 0 ? '#00C896' : '#DC2626'} ${progressPct}%, transparent ${progressPct}%)`,
                                maskImage: 'radial-gradient(transparent 62%, black 63%)',
                                WebkitMaskImage: 'radial-gradient(transparent 62%, black 63%)',
                                borderRadius: '50%',
                            }}
                        />

                        {/* Inner content */}
                        <div className="flex flex-col items-center justify-center z-10">
                            {isEditingGoal ? (
                                <input
                                    type="text"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value.replace(',', '.'))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSetGoal()}
                                    autoFocus
                                    className="w-20 text-center text-2xl font-black text-white bg-transparent border-b border-[#00E5A8] outline-none tabular-nums"
                                />
                            ) : (
                                <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                                    {formatCurrency(remaining)}
                                </div>
                            )}
                            <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest mt-1">
                                {isEditingGoal ? 'Enter Goal' : 'Remaining'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goal details */}
                <div className="flex items-center justify-between text-[10px] mb-4 px-2">
                    <div>
                        <span className="text-[#6B7280]">Current: </span>
                        <span className={`font-bold ${currentProfit >= 0 ? 'text-[#00E5A8]' : 'text-[#EF4444]'}`}>
                            {formatCurrency(currentProfit)}
                        </span>
                    </div>
                    <div>
                        <span className="text-[#6B7280]">Goal: </span>
                        <span className="font-bold text-white">{formatCurrency(profitGoal)}</span>
                    </div>
                </div>

                <div className="h-[60px] w-full opacity-60 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={goalBarData} barGap={2}>
                            <Bar dataKey="value" radius={[2, 2, 2, 2]}>
                                {goalBarData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isToday ? '#00E5A8' : entry.value > 0 ? '#1E2330' : '#0D1117'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <button
                    onClick={handleSetGoal}
                    className="w-full mt-4 py-3.5 rounded-xl border border-[#374151] bg-gradient-to-b from-[#2a2e3e] to-[#0f1219] text-[#E8EAED] text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95"
                >
                    {isEditingGoal ? 'Confirm Goal' : 'Set New Goal'}
                </button>
            </div>

        </div>
    );
};
