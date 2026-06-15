import Link from "next/link";

const FEATURES = [
  { icon: "🎭", title: "Concerts & theater", desc: "Van indie rock tot opera — ontdek wat er speelt in jouw streek." },
  { icon: "📍", title: "Dichtbij jou", desc: "Events op maat van jouw locatie, tot op de km nauwkeurig." },
  { icon: "✨", title: "Gepersonaliseerd", desc: "LUVU leert jouw smaak kennen en toont wat écht bij jou past." },
  { icon: "🎟️", title: "Alles op één plek", desc: "Concerts, comedy, dans, familievoorstellingen — één app voor alles." },
];

const CATEGORIES = ["🎵 Muziek", "🎭 Theater", "😄 Comedy", "💃 Dans", "👨‍👩‍👧 Familie", "🎬 Film"];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>
            L
          </div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </div>
        <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>
          <Link href="/support" className="hover:opacity-100 transition-opacity">Support</Link>
          <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
          style={{ background: "rgba(201,211,212,0.1)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.2)" }}>
          ✦ Binnenkort beschikbaar op iOS & Android
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight" style={{ color: "#e8f0f0" }}>
          Jouw cultuurapp
          <br />
          <span style={{ color: "#c9d3d4" }}>voor België</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(232,240,240,0.65)" }}>
          Ontdek concerts, theater, comedy, dans en meer — gepersonaliseerd op jouw smaak en locatie.
          Swipe, ontdek, geniet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-default"
            style={{ background: "#c9d3d4", color: "#2a3f40" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Binnenkort op App Store
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-default"
            style={{ background: "rgba(201,211,212,0.12)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.25)" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M3.18 23.76c.3.16.65.19.98.08l12.54-7.25-2.54-2.54-10.98 9.71zM.54 1.18C.2 1.54 0 2.1 0 2.83v18.34c0 .73.2 1.29.54 1.65l.09.08 10.27-10.27v-.24L.63 1.1l-.09.08zM20.9 10.66l-2.93-1.7-2.84 2.84 2.84 2.84 2.96-1.71c.84-.49.84-1.28-.03-1.77zM4.16.24L16.7 7.49l-2.54 2.54L3.62.26c.15-.11.34-.1.54-.02z"/>
            </svg>
            Binnenkort op Google Play
          </div>
        </div>
      </section>

      {/* Events CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16 text-center">
        <Link href="/events"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-80"
          style={{ background: "rgba(201,211,212,0.1)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.25)" }}>
          <span>Bekijk alle events</span>
          <span>→</span>
        </Link>
        <p className="text-xs mt-3" style={{ color: "rgba(232,240,240,0.35)" }}>Concerts, theater, comedy, dans en meer in België</p>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <span key={cat} className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: "rgba(201,211,212,0.08)", color: "rgba(232,240,240,0.75)", border: "1px solid rgba(201,211,212,0.15)" }}>
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#e8f0f0" }}>Waarom LUVU?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6"
              style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-base mb-2" style={{ color: "#e8f0f0" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,240,240,0.6)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-12" style={{ color: "#e8f0f0" }}>Hoe werkt het?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Download de app", desc: "Gratis beschikbaar op iOS en Android." },
            { step: "2", title: "Stel je voorkeuren in", desc: "Kies je categorieën, locatie en maximale afstand." },
            { step: "3", title: "Ontdek & geniet", desc: "Swipe door gepersonaliseerde events in jouw buurt." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4"
                style={{ background: "#4c6f71", color: "#c9d3d4" }}>
                {s.step}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "#e8f0f0" }}>{s.title}</h3>
              <p className="text-sm" style={{ color: "rgba(232,240,240,0.6)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: "rgba(201,211,212,0.1)", color: "rgba(232,240,240,0.4)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <Link href="/privacy" className="hover:underline">Privacybeleid</Link>
          <span>·</span>
          <Link href="/support" className="hover:underline">Support</Link>
          <span>·</span>
          <a href="mailto:info@luvu.app" className="hover:underline">info@luvu.app</a>
        </div>
        <p>© {new Date().getFullYear()} LUVU. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
