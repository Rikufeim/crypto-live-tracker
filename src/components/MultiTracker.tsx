import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, Maximize2, Minimize2, GripVertical, Search, ZoomIn, ZoomOut, RotateCcw, Grid } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

/* ────────────────────────── TYPES ────────────────────────── */

interface ChartPanel {
    id: string;
    coin: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
}

/* ────────────────────────── COIN LIST ────────────────────────── */

const COINS = [
    { id: 'bitcoin', label: 'BTC / USDT' },
    { id: 'ethereum', label: 'ETH / USDT' },
    { id: 'ripple', label: 'XRP / USDT' },
    { id: 'solana', label: 'SOL / USDT' },
    { id: 'cardano', label: 'ADA / USDT' },
    { id: 'dogecoin', label: 'DOGE / USDT' },
    { id: 'polkadot', label: 'DOT / USDT' },
    { id: 'avalanche-2', label: 'AVAX / USDT' },
    { id: 'chainlink', label: 'LINK / USDT' },
    { id: 'matic-network', label: 'MATIC / USDT' },
    { id: 'litecoin', label: 'LTC / USDT' },
    { id: 'uniswap', label: 'UNI / USDT' },
];

/* ────────────────────────── DEFAULT LAYOUT ────────────────────────── */

const makeDefaults = (): ChartPanel[] => {
    const gap = 20;
    const pw = 620;
    const ph = 420;
    return [
        { id: 'bitcoin', label: 'BTC / USDT' },
        { id: 'ethereum', label: 'ETH / USDT' },
        { id: 'ripple', label: 'XRP / USDT' },
        { id: 'solana', label: 'SOL / USDT' },
    ].map((c, i) => ({
        id: `p-${i}`,
        coin: c.id,
        label: c.label,
        x: (i % 2) * (pw + gap) + gap,
        y: Math.floor(i / 2) * (ph + gap) + gap,
        w: pw,
        h: ph,
        zIndex: i + 1,
    }));
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export const MultiTracker: React.FC = () => {
    const [panels, setPanels] = useState<ChartPanel[]>(makeDefaults);
    const [zCounter, setZCounter] = useState(100);

    // canvas state
    const [cam, setCam] = useState({ x: 0, y: 0, zoom: 1 });
    const [showGrid, setShowGrid] = useState(true);

    // interaction flags
    const [isDraggingAnything, setIsDraggingAnything] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [coinSearch, setCoinSearch] = useState('');
    const [maximizedId, setMaximizedId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);

    // persistent drag / pan refs
    const drag = useRef<{
        type: 'pan' | 'move' | 'resize';
        panelId?: string;
        sx: number; sy: number;
        ox: number; oy: number; // start offset or panel x/y
        ow: number; oh: number; // start panel w/h (resize only)
    } | null>(null);

    /* ─────────── bring to front ─────────── */
    const bringFront = useCallback((id: string) => {
        setZCounter(z => {
            setPanels(p => p.map(pp => pp.id === id ? { ...pp, zIndex: z + 1 } : pp));
            return z + 1;
        });
    }, []);

    /* ─────────── PANEL MOVE start ─────────── */
    const onMoveStart = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        const panel = panels.find(p => p.id === id);
        if (!panel) return;
        bringFront(id);
        setIsDraggingAnything(true);
        drag.current = { type: 'move', panelId: id, sx: e.clientX, sy: e.clientY, ox: panel.x, oy: panel.y, ow: 0, oh: 0 };
    }, [panels, bringFront]);

    /* ─────────── PANEL RESIZE start ─────────── */
    const onResizeStart = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        const panel = panels.find(p => p.id === id);
        if (!panel) return;
        bringFront(id);
        setIsDraggingAnything(true);
        drag.current = { type: 'resize', panelId: id, sx: e.clientX, sy: e.clientY, ox: panel.x, oy: panel.y, ow: panel.w, oh: panel.h };
    }, [panels, bringFront]);

    /* ─────────── CANVAS PAN start ─────────── */
    const onCanvasDown = useCallback((e: React.MouseEvent) => {
        // only on direct background
        const t = e.target as HTMLElement;
        if (t !== canvasRef.current && !t.hasAttribute('data-grid')) return;
        e.preventDefault();
        setIsDraggingAnything(true);
        drag.current = { type: 'pan', sx: e.clientX, sy: e.clientY, ox: cam.x, oy: cam.y, ow: 0, oh: 0 };
    }, [cam]);

    /* ─────────── GLOBAL MOUSE MOVE / UP ─────────── */
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const d = drag.current;
            if (!d) return;

            const dx = e.clientX - d.sx;
            const dy = e.clientY - d.sy;

            if (d.type === 'pan') {
                setCam(c => ({ ...c, x: d.ox + dx, y: d.oy + dy }));
            } else if (d.type === 'move') {
                const scale = cam.zoom;
                setPanels(p => p.map(pp => pp.id === d.panelId ? { ...pp, x: d.ox + dx / scale, y: d.oy + dy / scale } : pp));
            } else if (d.type === 'resize') {
                const scale = cam.zoom;
                setPanels(p => p.map(pp => pp.id === d.panelId ? {
                    ...pp,
                    w: Math.max(320, d.ow + dx / scale),
                    h: Math.max(220, d.oh + dy / scale),
                } : pp));
            }
        };

        const onUp = () => {
            drag.current = null;
            setIsDraggingAnything(false);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [cam.zoom]);

    /* ─────────── ZOOM (wheel) ─────────── */
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                // Ctrl + Scroll = ZOOM
                const rect = el.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                setCam(c => {
                    const delta = e.deltaY > 0 ? 0.92 : 1.08;
                    const nz = Math.min(3, Math.max(0.15, c.zoom * delta));
                    // zoom toward cursor
                    const nx = mx - (mx - c.x) * (nz / c.zoom);
                    const ny = my - (my - c.y) * (nz / c.zoom);
                    return { x: nx, y: ny, zoom: nz };
                });
            } else {
                // Scroll = PAN
                setCam(c => ({ ...c, x: c.x - e.deltaX, y: c.y - e.deltaY }));
            }
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    /* ─────────── PANEL CRUD ─────────── */
    const removePanel = (id: string) => setPanels(p => p.filter(pp => pp.id !== id));

    const addPanel = (coinId: string, label: string) => {
        const cx = (-cam.x / cam.zoom) + 300 + Math.random() * 80;
        const cy = (-cam.y / cam.zoom) + 150 + Math.random() * 80;
        setPanels(p => [...p, { id: `p-${Date.now()}`, coin: coinId, label, x: cx, y: cy, w: 620, h: 420, zIndex: zCounter + 1 }]);
        setZCounter(z => z + 1);
        setShowAdd(false);
        setCoinSearch('');
    };

    const changeCoin = (id: string, coinId: string, label: string) =>
        setPanels(p => p.map(pp => pp.id === id ? { ...pp, coin: coinId, label } : pp));

    const resetLayout = () => { setPanels(makeDefaults()); setZCounter(100); setCam({ x: 0, y: 0, zoom: 1 }); };

    const fitAll = () => {
        if (!panels.length || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const pad = 40;
        const minX = Math.min(...panels.map(p => p.x));
        const minY = Math.min(...panels.map(p => p.y));
        const maxX = Math.max(...panels.map(p => p.x + p.w));
        const maxY = Math.max(...panels.map(p => p.y + p.h));
        const cw = maxX - minX + pad * 2;
        const ch = maxY - minY + pad * 2;
        const z = Math.min(r.width / cw, r.height / ch, 1.5);
        setCam({ zoom: z, x: (r.width - cw * z) / 2 - (minX - pad) * z, y: (r.height - ch * z) / 2 - (minY - pad) * z });
    };

    const filtered = COINS.filter(c => c.label.toLowerCase().includes(coinSearch.toLowerCase()) || c.id.includes(coinSearch.toLowerCase()));

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */

    // maximized panel — full overlay
    if (maximizedId) {
        const panel = panels.find(p => p.id === maximizedId);
        if (!panel) { setMaximizedId(null); return null; }
        return (
            <div className="flex flex-col h-full bg-black text-[#E8EAED]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/80 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">{panel.label}</span>
                        <select
                            value={panel.coin}
                            onChange={e => { const c = COINS.find(cc => cc.id === e.target.value); if (c) changeCoin(panel.id, c.id, c.label); }}
                            className="text-[10px] bg-transparent border border-white/10 rounded-md px-2 py-1 text-[#9CA3AF] outline-none"
                        >
                            {COINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <button onClick={() => setMaximizedId(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[#6B7280] hover:text-white text-[10px] font-bold transition-colors">
                        <Minimize2 size={12} /> Exit Fullscreen
                    </button>
                </div>
                <div className="flex-1"><TradingViewWidget symbol={panel.coin} className="h-full w-full" /></div>
            </div>
        );
    }

    return (
        <div className="relative h-full bg-black text-[#E8EAED] font-sans overflow-hidden select-none">

            {/* ── FLOAT DISPLAY: Title (Top Left) ── */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="pointer-events-auto bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-opacity hover:bg-black/40">
                    <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Multi Tracker</h1>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[9px] text-[#666] font-mono">{panels.length} charts</span>
                </div>
            </div>

            {/* ── FLOAT CONTROLS: Bottom Banner ── */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">

                {/* Main Dock */}
                <div className="flex items-center gap-1.5 px-2 py-2 bg-[#09090b]/80 backdrop-blur-2xl border border-[#1f2937] rounded-2xl shadow-2xl transition-transform hover:scale-[1.01] hover:border-white/10">

                    {/* Zoom Controls */}
                    <div className="flex items-center h-9 rounded-full bg-white/[0.03] border border-white/[0.04] px-1">
                        <button onClick={() => setCam(c => ({ ...c, zoom: Math.max(0.15, c.zoom * 0.85) }))} className="w-8 h-full flex items-center justify-center rounded-l-full text-[#888] hover:text-white hover:bg-white/5 transition-colors"><ZoomOut size={14} /></button>
                        <span className="text-[10px] font-mono text-[#666] min-w-[36px] text-center tabular-nums border-x border-white/[0.04] px-1">{Math.round(cam.zoom * 100)}%</span>
                        <button onClick={() => setCam(c => ({ ...c, zoom: Math.min(3, c.zoom * 1.15) }))} className="w-8 h-full flex items-center justify-center rounded-r-full text-[#888] hover:text-white hover:bg-white/5 transition-colors"><ZoomIn size={14} /></button>
                    </div>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Actions */}
                    <button onClick={fitAll} className="h-9 px-4 rounded-full bg-white/[0.03] border border-white/[0.04] text-[11px] font-bold text-[#888] hover:text-white hover:bg-white/5 hover:border-white/10 transition-all" title="Fit all">Fit</button>
                    <button onClick={resetLayout} className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-[#888] hover:text-white hover:bg-white/5 hover:border-white/10 transition-all" title="Reset"><RotateCcw size={14} /></button>
                    <button onClick={() => setShowGrid(!showGrid)} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${showGrid ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(0,229,168,0.15)]' : 'bg-white/[0.03] border-white/[0.04] text-[#888]'}`} title="Toggle Grid"><Grid size={14} /></button>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Add Button */}
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 h-9 pl-3 pr-4 rounded-full border border-white/10 bg-gradient-to-b from-[#222] to-[#111] text-[11px] font-bold uppercase tracking-wider text-white hover:brightness-125 shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 group"
                    >
                        <Plus size={14} className="text-[#00E5A8] group-hover:rotate-90 transition-transform duration-300" />
                        Add Chart
                    </button>
                </div>

                <span className="text-[9px] text-white/20 font-medium tracking-wide">Press Ctrl + Scroll to Zoom</span>
            </div>

            {/* ── INFINITE CANVAS ── */}
            <div
                ref={canvasRef}
                className={`w-full h-full ${drag.current?.type === 'pan' ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={onCanvasDown}
                style={{
                    background: '#000000',
                    backgroundImage: showGrid ? 'radial-gradient(#222 1px, transparent 1px)' : 'none',
                    backgroundSize: `${40 * cam.zoom}px ${40 * cam.zoom}px`,
                    backgroundPosition: `${cam.x}px ${cam.y}px`,
                    minHeight: '100vh',
                }}
            >
                {/* Dot grid removed from separate div, integrated into parent to save layer */}

                {/* Transform layer */}
                <div
                    className="absolute top-0 left-0 origin-top-left pointer-events-none"
                    style={{
                        transform: `translate(${cam.x}px, ${cam.y}px)`, // Scale removed to fix visibility
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {panels.map(panel => (
                        <div
                            key={panel.id}
                            className="absolute rounded-xl overflow-hidden flex flex-col group/p transition-shadow duration-300 pointer-events-auto"
                            style={{
                                left: panel.x * cam.zoom,
                                top: panel.y * cam.zoom,
                                width: panel.w * cam.zoom,
                                height: panel.h * cam.zoom,
                                zIndex: panel.zIndex,
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)',
                                background: '#13131a', // Restore nice dark bg
                            }}
                            onMouseDown={e => { e.stopPropagation(); bringFront(panel.id); }}
                        >
                            {/* Title bar — drag handle */}
                            <div
                                className="flex items-center justify-between px-3 h-9 border-b border-white/[0.06] bg-[#0e0e16] cursor-move flex-shrink-0"
                                onMouseDown={e => onMoveStart(e, panel.id)}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <GripVertical size={10} className="text-[#333] flex-shrink-0" />
                                    <span className="text-[10px] font-bold text-[#ccc] uppercase tracking-wider truncate">{panel.label}</span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/p:opacity-100 transition-opacity duration-150">
                                    <select
                                        value={panel.coin}
                                        onChange={e => { const c = COINS.find(cc => cc.id === e.target.value); if (c) changeCoin(panel.id, c.id, c.label); }}
                                        onClick={e => e.stopPropagation()}
                                        onMouseDown={e => e.stopPropagation()}
                                        className="text-[9px] bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-[#888] outline-none cursor-pointer"
                                    >
                                        {COINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                    <button onClick={e => { e.stopPropagation(); setMaximizedId(panel.id); }} onMouseDown={e => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 text-[#555] hover:text-white transition-colors"><Maximize2 size={10} /></button>
                                    <button onClick={e => { e.stopPropagation(); removePanel(panel.id); }} onMouseDown={e => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-colors"><X size={10} /></button>
                                </div>
                            </div>

                            {/* Chart area — explicit height so TradingView iframe gets real dimensions */}
                            <div className="relative" style={{ height: 'calc(100% - 36px)' }}>
                                <TradingViewWidget symbol={panel.coin} className="h-full w-full" />
                                {/* Drag shield — blocks iframe from stealing mouseevents while dragging */}
                                {isDraggingAnything && (
                                    <div className="absolute inset-0 z-50" />
                                )}
                            </div>

                            {/* Resize handle */}
                            <div
                                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 opacity-0 group-hover/p:opacity-100 transition-opacity"
                                onMouseDown={e => onResizeStart(e, panel.id)}
                            >
                                <svg viewBox="0 0 16 16" className="w-full h-full"><path d="M14 14L6 14L14 6Z" fill="rgba(255,255,255,0.1)" /><path d="M14 14L10 14L14 10Z" fill="rgba(255,255,255,0.15)" /></svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {panels.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#333]">
                        <Plus size={40} className="mb-3 opacity-30" />
                        <div className="text-xs font-bold">Click "Add Chart" to begin</div>
                    </div>
                )}
            </div>

            {/* ── ADD CHART MODAL ── */}
            {
                showAdd && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
                        <div className="w-[360px] rounded-2xl border border-white/[0.08] bg-[#111118] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Chart</h3>
                                <button onClick={() => setShowAdd(false)} className="text-[#555] hover:text-white transition-colors"><X size={14} /></button>
                            </div>
                            <div className="p-4">
                                <div className="relative mb-3">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
                                    <input
                                        value={coinSearch}
                                        onChange={e => setCoinSearch(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-[#444] outline-none focus:border-[#00E5A8]/30"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-0.5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                                    {filtered.map(c => (
                                        <button key={c.id} onClick={() => addPanel(c.id, c.label)} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left hover:bg-white/[0.04] transition-colors group">
                                            <span className="text-[11px] font-bold text-[#aaa] group-hover:text-white">{c.label}</span>
                                            <Plus size={13} className="text-[#444] group-hover:text-[#00E5A8] transition-colors" />
                                        </button>
                                    ))}
                                    {!filtered.length && <div className="text-center py-8 text-[10px] text-[#444]">No results</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
