import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support — LUVU" };

const FAQ = [
  { q: "Hoe stel ik mijn locatie in?", a: "Ga naar Instellingen in de app en kies 'Locatie wijzigen'. Je kunt een stad zoeken of je exacte locatie gebruiken." },
  { q: "Waarom zie ik geen events in mijn buurt?", a: "Controleer of je postcode of stad correct is ingesteld. Vergroot eventueel de zoekradius via de filteropties." },
  { q: "Hoe werk de aanbevelingen?", a: "LUVU houdt rekening met jouw favoriete categorieën, eerder gelikte events en jouw locatie om de beste matches te tonen." },
  { q: "Kan ik de app gebruiken zonder account?", a: "Ja, je kunt LUVU volledig gebruiken zonder account. Een account is alleen nodig voor extra functies zoals ticketing." },
  { q: "Hoe verwijder ik mijn gegevens?", a: "Stuur een e-mail naar info@luvu.app met de vermelding 'Verwijder mijn gegevens' en we verwerken je aanvraag binnen 30 dagen." },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#e8f0f0" }}>Support</h1>
        <p className="text-sm mb-12" style={{ color: "rgba(232,240,240,0.45)" }}>Heb je een vraag of probleem? We helpen je graag.</p>

        {/* Contact */}
        <div className="rounded-2xl p-6 mb-12" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
          <h2 className="font-semibold mb-2" style={{ color: "#c9d3d4" }}>Contact</h2>
          <p className="text-sm mb-4" style={{ color: "rgba(232,240,240,0.65)" }}>
            Stuur ons een e-mail en we reageren binnen 2 werkdagen.
          </p>
          <a href="mailto:info@luvu.app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#4c6f71", color: "#c9d3d4" }}>
            ✉ info@luvu.app
          </a>
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-semibold mb-6" style={{ color: "#e8f0f0" }}>Veelgestelde vragen</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="rounded-xl p-5 group" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
              <summary className="font-medium text-sm cursor-pointer select-none" style={{ color: "#e8f0f0" }}>
                {item.q}
              </summary>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "rgba(232,240,240,0.65)" }}>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t text-sm" style={{ borderColor: "rgba(201,211,212,0.1)", color: "rgba(232,240,240,0.4)" }}>
          <Link href="/" className="hover:underline">← Terug naar LUVU</Link>
        </div>
      </main>
    </div>
  );
}
