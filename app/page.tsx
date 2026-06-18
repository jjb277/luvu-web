import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CAT_ICONS: Record<string, string> = {
  Music: "🎵", Theater: "🎭", Comedy: "😄", Dance: "💃",
  Family: "👨‍👩‍👧", Film: "🎬", Other: "✨",
};

const CATEGORIES = [
  { label: "Muziek", value: "Music", icon: "🎵" },
  { label: "Theater", value: "Theater", icon: "🎭" },
  { label: "Comedy", value: "Comedy", icon: "😄" },
  { label: "Dans", value: "Dance", icon: "💃" },
  { label: "Familie", value: "Family", icon: "👨‍👩‍👧" },
  { label: "Film", value: "Film", icon: "🎬" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE", { weekday: "short", day: "numeric", month: "short" });
}

function formatPrice(price: number | null) {
  if (!price) return "Gratis";
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

export default async function Home() {
  const sb = createClient(SB_URL, SB_KEY);

  // Fetch 9 featured upcoming events
  const { data: featured } = await sb
    .from("events")
    .select("id, title, short_tagline, category, event_date, venue_name, city, base_price, primary_image_url")
    .in("visibility_status", ["live", "public"])
    .gt("event_date", new Date().toISOString())
    .not("primary_image_url", "is", null)
    .order("event_date", { ascending: true })
    .limit(9);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </div>
        <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>
          <Link href="/saved" className="hover:opacity-100 transition-opacity flex items-center gap-1">♥ Bewaard</Link>
          <Link href="/profile" className="hover:opacity-100 transition-opacity">Profiel</Link>
          <Link href="/support" className="hover:opacity-100 transition-opacity">Support</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* Hero */}
        <div className="pt-10 pb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight" style={{ color: "#e8f0f0" }}>
            Ontdek events<br />
            <span style={{ color: "#c9d3d4" }}>in jouw buurt</span>
          </h1>
          <p className="text-base max-w-lg mb-8" style={{ color: "rgba(232,240,240,0.55)" }}>
            Concerts, theater, comedy, dans en meer — gepersonaliseerd op jouw locatie.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/events?cat=${c.value}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
                style={{ background: "rgba(201,211,212,0.1)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.2)" }}
              >
                {c.icon} {c.label}
              </Link>
            ))}
            <Link
              href="/events"
              className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "rgba(76,111,113,0.35)", color: "#c9d3d4", border: "1px solid rgba(76,111,113,0.5)" }}
            >
              Alle events →
            </Link>
          </div>
        </div>

        {/* Upcoming events grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#e8f0f0" }}>Binnenkort</h2>
          <Link href="/events" className="text-sm" style={{ color: "rgba(201,211,212,0.55)" }}>Alles bekijken →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {featured?.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5"
              style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}
            >
              <div className="relative h-44 overflow-hidden" style={{ background: "#1a2a2b" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.primary_image_url!} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(42,63,64,0.85)", color: "#c9d3d4" }}>
                    {CAT_ICONS[e.category ?? ""] ?? ""} {e.category}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs mb-1" style={{ color: "rgba(201,211,212,0.6)" }}>{formatDate(e.event_date)}</p>
                <h3 className="font-semibold text-sm mb-0.5 leading-snug" style={{ color: "#e8f0f0" }}>{e.title}</h3>
                {e.short_tagline && <p className="text-xs mb-2" style={{ color: "rgba(201,211,212,0.7)" }}>{e.short_tagline}</p>}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs" style={{ color: "rgba(232,240,240,0.45)" }}>
                    {e.venue_name ?? e.city ?? ""}
                    {e.city && e.venue_name ? ` · ${e.city}` : ""}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#c9d3d4" }}>{formatPrice(e.base_price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Browse CTA */}
        <div className="text-center py-8 rounded-2xl" style={{ background: "rgba(201,211,212,0.04)", border: "1px solid rgba(201,211,212,0.1)" }}>
          <p className="text-base font-semibold mb-1" style={{ color: "#e8f0f0" }}>Meer dan 1000 events in België</p>
          <p className="text-sm mb-5" style={{ color: "rgba(232,240,240,0.45)" }}>Filter op datum, locatie en categorie</p>
          <Link href="/events" className="inline-block px-8 py-3 rounded-xl font-semibold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>
            Bekijk alle events →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: "rgba(201,211,212,0.1)", color: "rgba(232,240,240,0.4)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <Link href="/privacy" className="hover:underline">Privacybeleid</Link>
          <span>·</span>
          <Link href="/support" className="hover:underline">Support</Link>
          <span>·</span>
          <a href="mailto:luvulive1@gmail.com" className="hover:underline">luvulive1@gmail.com</a>
        </div>
        <p>© {new Date().getFullYear()} LUVU. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
