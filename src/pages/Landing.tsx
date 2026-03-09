import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, ChevronRight, Zap, Shield, Globe, TrendingUp,
  Check, X as XIcon, BarChart3, Wallet, Clock, Lock
} from "lucide-react";
import { STRIPE_CONFIG } from "@/lib/constants";
import { AuthStarsBackground } from "@/components/ui/auth-stars-background";
import { Logo } from "@/components/Logo";

const features = [
  { icon: Zap, title: "1-Second Updates", desc: "Real-time price tracking with 1-second refresh intervals." },
  { icon: TrendingUp, title: "TradingView Charts", desc: "Professional-grade charts built right into the app." },
  { icon: Shield, title: "Cloud Sync", desc: "Your portfolio is always safe and synced across devices." },
  { icon: Globe, title: "Portfolio Tracker", desc: "Track all your favorites from a single dashboard." },
];

const supportedCryptos = [
  "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "XRP", "Cardano (ADA)",
  "Dogecoin (DOGE)", "Polkadot (DOT)", "Avalanche (AVAX)", "Chainlink (LINK)",
  "Litecoin (LTC)", "Uniswap (UNI)", "Polygon (MATIC)"
];

const faqs = [
  {
    q: "What is Multiply?",
    a: "Multiply is a crypto portfolio tracker that lets you monitor the value of your cryptocurrencies in real time. The app supports Bitcoin, Ethereum, Solana, and all popular cryptos."
  },
  {
    q: "Is Multiply free?",
    a: "Yes! Multiply is free to track one crypto. The Premium plan (€19/mo) unlocks unlimited tracking, a full portfolio tracker, and priority support."
  },
  {
    q: "Which cryptocurrencies can I track?",
    a: "You can track all popular cryptocurrencies: Bitcoin, Ethereum, Solana, XRP, Cardano, Dogecoin, Polkadot, Avalanche, Chainlink, Litecoin, and Uniswap."
  },
  {
    q: "How does real-time tracking work?",
    a: "Multiply updates crypto prices every second using reliable market data APIs and TradingView charts."
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use cloud sync and secure authentication, so your portfolio is always protected and accessible."
  }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      <AuthStarsBackground />

      <div className="relative z-10">
        {/* Hero */}
        <header className="min-h-screen flex flex-col pt-4 md:pt-6 pb-12 md:pb-20 px-4 md:px-6 text-center">
          <nav className="w-full flex items-center justify-between flex-shrink-0 px-2 md:px-8 lg:px-10" aria-label="Main navigation">
            <div className="flex items-center gap-3">
              <Logo className="h-14 md:h-28" />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Log in"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-3 md:px-5 py-2 md:py-2.5 bg-primary text-white text-outline-soft rounded-xl text-xs md:text-sm font-black transition-all hover:opacity-90 active:scale-95"
                aria-label="Get started free"
              >
                Get Started
              </button>
            </div>
          </nav>

          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-6 md:space-y-8 px-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans text-center font-medium tracking-wide leading-[1.15]">
              Crypto portfolio tracker
              <br />
              <span className="text-gradient-brand">that works in real time</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track Bitcoin, Ethereum, and other cryptocurrencies in real time. Professional TradingView charts and secure cloud sync in one app.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4">
              <button
                onClick={() => navigate("/auth")}
                className="text-white text-outline-soft px-8 md:px-10 py-3.5 md:py-4 rounded-2xl text-base md:text-lg font-black transition-all hover:opacity-90 active:scale-95 flex items-center gap-3 justify-center bg-primary"
                aria-label="Get started free"
              >
                Get Started Free <ChevronRight size={20} />
              </button>
              <a
                href="#pricing"
                className="bg-secondary text-secondary-foreground px-8 md:px-10 py-3.5 md:py-4 rounded-2xl text-base md:text-lg font-bold transition-all hover:bg-muted flex items-center gap-2 justify-center"
              >
                View Pricing
              </a>
            </div>
          </div>
        </header>

        {/* Social proof / stats */}
        <section className="py-8 md:py-12 px-4 md:px-6" aria-label="Statistics">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
            {[
              { value: "12+", label: "Supported Cryptos" },
              { value: "1s", label: "Refresh Rate" },
              { value: "24/7", label: "Real-Time" },
              { value: "€0", label: "Starting Price" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-black text-primary">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-20 px-4 md:px-6" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="features-heading" className="text-2xl md:text-4xl font-black tracking-tight text-center mb-4">
              Everything you need for crypto tracking
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Multiply combines real-time price data, professional charts, and secure cloud sync into one easy-to-use app.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <article
                  key={i}
                  className="glass rounded-3xl p-8 hover:border-primary/30 transition-all group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                    <f.icon size={28} />
                  </div>
                  <h3 className="text-xl font-black mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Supported cryptos */}
        <section className="py-10 md:py-16 px-4 md:px-6" aria-labelledby="supported-cryptos">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="supported-cryptos" className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Supported Cryptocurrencies
            </h2>
            <p className="text-muted-foreground mb-10">
              Track the most popular cryptocurrencies in one place
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {supportedCryptos.map((crypto, i) => (
                <span
                  key={i}
                  className="glass px-5 py-2.5 rounded-2xl text-sm font-bold text-foreground"
                >
                  {crypto}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 md:py-20 px-4 md:px-6" aria-labelledby="how-it-works">
          <div className="max-w-4xl mx-auto">
            <h2 id="how-it-works" className="text-2xl md:text-4xl font-black tracking-tight text-center mb-8 md:mb-12">
              How to Get Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Wallet, step: "1", title: "Create Account", desc: "Sign up for free in just a few seconds." },
                { icon: BarChart3, step: "2", title: "Add Cryptos", desc: "Choose which cryptocurrencies to track in your portfolio." },
                { icon: Clock, step: "3", title: "Track in Real Time", desc: "See prices, charts, and portfolio value in real time." },
              ].map((item, i) => (
                <article key={i} className="glass rounded-3xl p-8 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 text-xl font-black">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-black mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12 md:py-20 px-4 md:px-6" aria-labelledby="pricing-heading">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
            <h2 id="pricing-heading" className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start for free, upgrade when you need more.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="glass rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-black mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">€0</span>
                <span className="text-muted-foreground text-sm">/forever</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  { ok: true, text: "Track 1 crypto" },
                  { ok: true, text: "Real-time prices" },
                  { ok: true, text: "TradingView charts" },
                  { ok: true, text: "Cloud sync" },
                  { ok: false, text: "Unlimited tracking" },
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
                Get Started Free
              </button>
            </div>

            {/* Premium */}
            <div className="glass rounded-3xl p-8 flex flex-col border-primary/30 relative overflow-hidden">
              <h3 className="text-xl font-black mb-1">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">
                  €{STRIPE_CONFIG.premium.price}
                </span>
                <span className="text-muted-foreground text-sm">/{STRIPE_CONFIG.premium.interval}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Portfolio tracker",
                  "Unlimited crypto tracking",
                  "Real-time prices",
                  "TradingView charts",
                  "Cloud sync",
                  "Priority support",
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-outline-soft font-black transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Start Premium
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="glass rounded-2xl group">
                  <summary className="p-6 cursor-pointer font-bold text-foreground flex items-center justify-between list-none">
                    {faq.q}
                    <ChevronRight size={18} className="text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center" aria-label="Call to action">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Start tracking your crypto today
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Multiply users and keep your crypto portfolio under control in real time.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-white text-outline-soft px-10 py-4 rounded-2xl text-lg font-black transition-all hover:opacity-90 active:scale-95 bg-primary"
            >
              Create Free Account
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Logo className="h-14 md:h-20" />
            </div>
            <nav aria-label="Footer links" className="flex gap-6">
              <a href="#features-heading" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq-heading" className="hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <span>© {new Date().getFullYear()} Multiply. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
