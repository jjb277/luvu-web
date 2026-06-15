import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacybeleid — LUVU" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#e8f0f0" }}>Privacybeleid</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(232,240,240,0.45)" }}>Laatst bijgewerkt: juni 2026</p>

        {[
          {
            title: "1. Wie zijn wij?",
            body: "LUVU is een app waarmee je culturele events in je buurt ontdekt. We hechten veel waarde aan jouw privacy en verwerken je gegevens alleen waar nodig om de app te laten werken."
          },
          {
            title: "2. Welke gegevens verzamelen we?",
            body: `We verzamelen alleen de gegevens die je zelf invoert of die technisch noodzakelijk zijn:\n\n• Naam en postcode (bij onboarding)\n• Locatiegegevens (alleen wanneer de app actief is, om events dichtbij te tonen)\n• Voorkeuren en interesses (om aanbevelingen te personaliseren)\n• Gelikte events (lokaal opgeslagen op je toestel)\n• E-mailadres (alleen als je een account aanmaakt)`
          },
          {
            title: "3. Waarvoor gebruiken we je gegevens?",
            body: `• Om relevante culturele events in jouw buurt te tonen\n• Om aanbevelingen te personaliseren op basis van jouw voorkeuren\n• Om de werking van de app te verbeteren\n\nWe verkopen je gegevens nooit aan derden.`
          },
          {
            title: "4. Locatiegegevens",
            body: "LUVU vraagt toegang tot je locatie om events in de buurt te tonen. Je kunt deze toestemming op elk moment intrekken via de instellingen van je toestel. Zonder locatie werkt de app nog steeds, maar toon je postcode wordt dan gebruikt als referentiepunt."
          },
          {
            title: "5. Gegevensopslag",
            body: "Je gegevens worden veilig opgeslagen via Supabase (EU-regio). We gebruiken encryptie voor alle dataoverdracht en passen strikte beveiligingsmaatregelen toe."
          },
          {
            title: "6. Jouw rechten",
            body: `Je hebt het recht om:\n• Inzage te vragen in de gegevens die we over jou bewaren\n• Onjuiste gegevens te laten corrigeren\n• Je gegevens te laten verwijderen\n• Je toestemming voor gegevensverwerking in te trekken\n\nNeem contact op via luvulive1@gmail.com.`
          },
          {
            title: "7. Contact",
            body: "Voor vragen over dit privacybeleid kun je ons bereiken via luvulive1@gmail.com."
          },
        ].map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: "#c9d3d4" }}>{section.title}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgba(232,240,240,0.65)" }}>{section.body}</p>
          </section>
        ))}

        <div className="mt-12 pt-6 border-t text-sm" style={{ borderColor: "rgba(201,211,212,0.1)", color: "rgba(232,240,240,0.4)" }}>
          <Link href="/" className="hover:underline">← Terug naar LUVU</Link>
        </div>
      </main>
    </div>
  );
}
