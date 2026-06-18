import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import SaveButton from "../SaveButton";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CAT_ICONS: Record<string, string> = {
  Music: "🎵", Theater: "🎭", Comedy: "😄", Dance: "💃",
  Family: "👨‍👩‍👧", Film: "🎬", Other: "✨",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sb = createClient(SB_URL, SB_KEY);
  const { data } = await sb.from("events").select("title, short_tagline").eq("id", id).single();
  if (!data) return { title: "Event — LUVU" };
  return {
    title: `${data.title} — LUVU`,
    description: data.short_tagline ?? undefined,
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(price: number | null) {
  if (!price) return "Gratis";
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createClient(SB_URL, SB_KEY);

  const { data: e } = await sb
    .from("events")
    .select(`id, title, short_tagline, description, category, event_date, venue_name, venue_address, city, postcode, base_price, primary_image_url, event_language, organizers(id, company_name, venue_city)`)
    .eq("id", id)
    .single();

  if (!e) notFound();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
        <Link href="/events" className="text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>← Alle events</Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero image */}
        {e.primary_image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 h-72 sm:h-96 relative" style={{ background: "#1a2a2b" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.primary_image_url} alt={e.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(76,111,113,0.4)", color: "#c9d3d4" }}>
                {CAT_ICONS[e.category ?? ""] ?? ""} {e.category}
              </span>
              {e.event_language === "fr" && (
                <span className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(201,211,212,0.08)", color: "rgba(232,240,240,0.5)" }}>FR</span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "#e8f0f0" }}>{e.title}</h1>
              <SaveButton id={e.id} />
            </div>

            {e.short_tagline && (
              <p className="text-base mb-8" style={{ color: "rgba(201,211,212,0.8)" }}>{e.short_tagline}</p>
            )}

            {e.description && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(201,211,212,0.5)" }}>Over dit event</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgba(232,240,240,0.75)" }}>{e.description}</p>
              </div>
            )}

            {/* Organizer */}
            {e.organizers && (
              <div className="text-sm" style={{ color: "rgba(232,240,240,0.4)" }}>
                Aangeboden door <span style={{ color: "rgba(232,240,240,0.65)" }}>{(e.organizers as unknown as { company_name: string }).company_name}</span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-medium capitalize" style={{ color: "#e8f0f0" }}>{formatDate(e.event_date)}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(232,240,240,0.5)" }}>{formatTime(e.event_date)}</p>
                </div>
              </div>

              {(e.venue_name || e.city) && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    {e.venue_name && <p className="text-sm font-medium" style={{ color: "#e8f0f0" }}>{e.venue_name}</p>}
                    {e.venue_address && <p className="text-xs mt-0.5" style={{ color: "rgba(232,240,240,0.5)" }}>{e.venue_address}</p>}
                    {e.city && <p className="text-xs mt-0.5" style={{ color: "rgba(232,240,240,0.5)" }}>{e.postcode ? `${e.postcode} ` : ""}{e.city}</p>}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-xl">🎟️</span>
                <p className="text-lg font-bold" style={{ color: "#c9d3d4" }}>{formatPrice(e.base_price)}</p>
              </div>
            </div>

            {/* App CTA */}
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(76,111,113,0.25)", border: "1px solid rgba(76,111,113,0.35)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#e8f0f0" }}>Ontdek meer events in LUVU</p>
              <p className="text-xs mb-4" style={{ color: "rgba(232,240,240,0.55)" }}>Gepersonaliseerde aanbevelingen op jouw locatie</p>
              <Link href="/" className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#4c6f71", color: "#c9d3d4" }}>
                Download de app
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
