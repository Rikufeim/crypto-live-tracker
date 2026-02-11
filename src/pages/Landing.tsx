import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, ChevronRight, Zap, Shield, Globe, TrendingUp,
  Check, X as XIcon
} from "lucide-react";
import { STRIPE_CONFIG } from "@/lib/constants";

const features = [
  { icon: Zap, title: "Sekunnin päivitykset", desc: "Reaaliaikainen hintatrackaus 1s tarkkuudella." },
  { icon: TrendingUp, title: "TradingView-kaaviot", desc: "Ammattilaistason kaaviot suoraan sovelluksessa." },
  { icon: Shield, title: "Pilvisynkronointi", desc: "Salkkusi on aina turvassa ja synkronoitu." },
  { icon: Globe, title: "50+ kryptoa", desc: "Seuraa suosikkejasi yhdessä dashboardissa." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* BG effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[180px] -z-10 animate-float" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[150px] -z-10" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              LIVE<span className="text-primary">TRACK</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Kirjaudu
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-95"
            >
              Aloita ilmaiseksi
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
            <Zap size={12} /> Live Tracking
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            Seuraa kryptoja
            <br />
            <span className="text-gradient-brand">reaaliajassa</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ammattilaistason kryptosalkku sekunnin päivityksillä, TradingView-integraatiolla ja pilvisynkronoinnilla.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl text-lg font-black transition-all hover:opacity-90 active:scale-95 flex items-center gap-3 justify-center glow-primary"
            >
              Aloita ilmaiseksi <ChevronRight size={20} />
            </button>
            <a
              href="#pricing"
              className="bg-secondary text-secondary-foreground px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:bg-muted flex items-center gap-2 justify-center"
            >
              Katso hinnat
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-8 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-black mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Yksinkertainen hinnoittelu
          </h2>
          <p className="text-muted-foreground text-lg">
            Aloita ilmaiseksi, päivitä kun tarvitset enemmän.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="glass rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-black mb-1">Ilmainen</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">0€</span>
              <span className="text-muted-foreground text-sm">/ikuisesti</span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                { ok: true, text: "1 krypton seuranta" },
                { ok: true, text: "Reaaliaikaiset hinnat" },
                { ok: true, text: "TradingView-kaaviot" },
                { ok: true, text: "Pilvisynkronointi" },
                { ok: false, text: "Rajaton seuranta" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {item.ok ? (
                    <Check size={16} className="text-primary" />
                  ) : (
                    <XIcon size={16} className="text-muted-foreground/40" />
                  )}
                  <span className={item.ok ? "text-foreground" : "text-muted-foreground/50"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3.5 rounded-2xl border border-border font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              Aloita ilmaiseksi
            </button>
          </div>

          {/* Premium */}
          <div className="glass rounded-3xl p-8 flex flex-col border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-bl-2xl">
              Suosituin
            </div>
            <h3 className="text-xl font-black mb-1">Premium</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">
                {STRIPE_CONFIG.premium.price}€
              </span>
              <span className="text-muted-foreground text-sm">/{STRIPE_CONFIG.premium.interval}</span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                "Rajaton kryptojen seuranta",
                "Reaaliaikaiset hinnat",
                "TradingView-kaaviot",
                "Pilvisynkronointi",
                "Prioriteettituki",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-primary" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black transition-all hover:opacity-90 active:scale-[0.98] glow-primary"
            >
              Aloita Premium
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <span className="font-bold">LiveTrack</span>
          </div>
          <span>© {new Date().getFullYear()} LiveTrack. Kaikki oikeudet pidätetään.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
