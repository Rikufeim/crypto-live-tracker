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
  { icon: Zap, title: "Sekunnin päivitykset", desc: "Reaaliaikainen hintaseuranta 1 sekunnin päivitysvälillä." },
  { icon: TrendingUp, title: "TradingView-kaaviot", desc: "Ammattitason kaaviot suoraan sovelluksessa." },
  { icon: Shield, title: "Pilvisynkronointi", desc: "Portfoliosi on aina turvassa ja synkronoituna." },
  { icon: Globe, title: "Portfolio tracker", desc: "Seuraa suosikkejasi yhdellä hallintapaneelilla." },
];

const supportedCryptos = [
  "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "XRP", "Cardano (ADA)",
  "Dogecoin (DOGE)", "Polkadot (DOT)", "Avalanche (AVAX)", "Chainlink (LINK)",
  "Litecoin (LTC)", "Uniswap (UNI)", "Polygon (MATIC)"
];

const faqs = [
  {
    q: "Mikä on Multiply?",
    a: "Multiply on krypto portfolio tracker, jolla seuraat kryptovaluuttojesi arvoa reaaliajassa. Sovellus tukee Bitcoinia, Ethereumia, Solanaa ja kaikkia suosittuja kryptoja."
  },
  {
    q: "Onko Multiply ilmainen?",
    a: "Kyllä! Multiply on ilmainen yhden krypton seurantaan. Premium-tilaus (19€/kk) avaa rajattoman seurannan, portfolio trackerin ja prioriteettituen."
  },
  {
    q: "Mitä kryptovaluuttoja voin seurata?",
    a: "Voit seurata kaikkia suosittuja kryptoja: Bitcoin, Ethereum, Solana, XRP, Cardano, Dogecoin, Polkadot, Avalanche, Chainlink, Litecoin ja Uniswap."
  },
  {
    q: "Miten reaaliaikainen seuranta toimii?",
    a: "Multiply päivittää kryptojen hinnat sekunnin välein käyttäen luotettavia markkinadata-rajapintoja ja TradingView-kaavioita."
  },
  {
    q: "Onko tietoni turvassa?",
    a: "Kyllä. Käytämme pilvisynkronointia ja turvallista autentikointia, joten portfoliosi on aina suojattu ja saatavilla."
  }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      <AuthStarsBackground />

      <div className="relative z-10">
        {/* Hero */}
        <header className="min-h-screen flex flex-col pt-6 pb-20 px-6 text-center">
          <nav className="w-full flex items-center justify-between flex-shrink-0 px-6 md:px-8 lg:px-10" aria-label="Päänavigaatio">
            <div className="flex items-center gap-3">
              <Logo className="h-20 md:h-28" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Kirjaudu sisään"
              >
                Kirjaudu
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-5 py-2.5 bg-primary text-white text-outline-soft rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-95"
                aria-label="Aloita ilmaiseksi"
              >
                Aloita ilmaiseksi
              </button>
            </div>
          </nav>

          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-8">
            <h1 className="text-6xl md:text-7xl font-sans text-center font-medium tracking-wide leading-tight">
              Krypto portfolio tracker
              <br />
              <span className="text-gradient-brand">joka toimii reaaliajassa</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Seuraa Bitcoin, Ethereum ja muita kryptovaluuttoja reaaliajassa. Ammattitason TradingView-kaaviot ja turvallinen pilvisynkronointi yhdessä sovelluksessa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/auth")}
                className="text-white text-outline-soft px-10 py-4 rounded-2xl text-lg font-black transition-all hover:opacity-90 active:scale-95 flex items-center gap-3 justify-center bg-primary"
                aria-label="Aloita ilmaiseksi"
              >
                Aloita ilmaiseksi <ChevronRight size={20} />
              </button>
              <a
                href="#hinnoittelu"
                className="bg-secondary text-secondary-foreground px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:bg-muted flex items-center gap-2 justify-center"
              >
                Katso hinnoittelu
              </a>
            </div>
          </div>
        </header>

        {/* Social proof / stats */}
        <section className="py-12 px-6" aria-label="Tilastot">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12+", label: "Tuettua kryptoa" },
              { value: "1s", label: "Päivitysväli" },
              { value: "24/7", label: "Reaaliaikainen" },
              { value: "0€", label: "Aloitushinta" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="text-3xl font-black text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6" aria-labelledby="ominaisuudet-otsikko">
          <div className="max-w-5xl mx-auto">
            <h2 id="ominaisuudet-otsikko" className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
              Kaikki mitä tarvitset krypto seurantaan
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Multiply yhdistää reaaliaikaisen hintatiedon, ammattitason kaaviot ja turvallisen pilvisynkronoinnin yhteen helppokäyttöiseen sovellukseen.
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
        <section className="py-16 px-6" aria-labelledby="tuetut-kryptot">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="tuetut-kryptot" className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Tuetut kryptovaluutat
            </h2>
            <p className="text-muted-foreground mb-10">
              Seuraa suosituimpia kryptovaluuttoja yhdessä paikassa
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
        <section className="py-20 px-6" aria-labelledby="miten-toimii">
          <div className="max-w-4xl mx-auto">
            <h2 id="miten-toimii" className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
              Näin pääset alkuun
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Wallet, step: "1", title: "Luo tili", desc: "Rekisteröidy ilmaiseksi muutamassa sekunnissa." },
                { icon: BarChart3, step: "2", title: "Lisää kryptot", desc: "Valitse seurattavat kryptovaluutat portfolioosi." },
                { icon: Clock, step: "3", title: "Seuraa reaaliajassa", desc: "Näe hinnat, kaaviot ja portfolion arvo reaaliajassa." },
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
        <section id="hinnoittelu" className="py-20 px-6" aria-labelledby="hinnoittelu-otsikko">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 id="hinnoittelu-otsikko" className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Selkeä hinnoittelu
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
                  { ok: true, text: "Seuraa 1 kryptoa" },
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
              <h3 className="text-xl font-black mb-1">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">
                  {STRIPE_CONFIG.premium.price}€
                </span>
                <span className="text-muted-foreground text-sm">/{STRIPE_CONFIG.premium.interval}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Portfolio tracker",
                  "Rajaton krypto seuranta",
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
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-outline-soft font-black transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Aloita Premium
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6" aria-labelledby="ukk-otsikko">
          <div className="max-w-3xl mx-auto">
            <h2 id="ukk-otsikko" className="text-3xl md:text-4xl font-black tracking-tight text-center mb-12">
              Usein kysytyt kysymykset
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
        <section className="py-20 px-6 text-center" aria-label="Toimintakutsu">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Aloita kryptojesi seuranta tänään
            </h2>
            <p className="text-muted-foreground mb-8">
              Liity Multiply-käyttäjien joukkoon ja pidä krypto portfoliosi hallinnassa reaaliajassa.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-white text-outline-soft px-10 py-4 rounded-2xl text-lg font-black transition-all hover:opacity-90 active:scale-95 bg-primary"
            >
              Luo ilmainen tili
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Logo className="h-14 md:h-20" />
            </div>
            <nav aria-label="Footer-linkit" className="flex gap-6">
              <a href="#ominaisuudet-otsikko" className="hover:text-foreground transition-colors">Ominaisuudet</a>
              <a href="#hinnoittelu" className="hover:text-foreground transition-colors">Hinnoittelu</a>
              <a href="#ukk-otsikko" className="hover:text-foreground transition-colors">UKK</a>
            </nav>
            <span>© {new Date().getFullYear()} Multiply. Kaikki oikeudet pidätetään.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
