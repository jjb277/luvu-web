'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import SaveButton from "../events/SaveButton";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const STORAGE_KEY = "luvu-saved";

const CAT_ICONS: Record<string, string> = {
  Music: "🎵", Theater: "🎭", Comedy: "😄", Dance: "💃",
  Family: "👨‍👩‍👧", Film: "🎬", Other: "✨",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(price: number | null) {
  if (!price) return "Gratis";
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

type Event = {
  id: string;
  title: string;
  short_tagline: string | null;
  category: string | null;
  event_date: string;
  venue_name: string | null;
  city: string | null;
  base_price: number | null;
  primary_image_url: string | null;
};

export default function SavedPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSaved() {
    const ids: string[] = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
    })();
    if (!ids.length) { setEvents([]); setLoading(false); return; }
    const sb = createClient(SB_URL, SB_KEY);
    const { data } = await sb
      .from("events")
      .select("id, title, short_tagline, category, event_date, venue_name, city, base_price, primary_image_url")
      .in("id", ids)
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSaved();
    window.addEventListener("luvu-saved-change", loadSaved);
    return () => window.removeEventListener("luvu-saved-change", loadSaved);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
        <Link href="/events" className="text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>← Alle events</Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#e8f0f0" }}>Bewaard</h1>
          <p className="text-sm" style={{ color: "rgba(232,240,240,0.45)" }}>
            {loading ? "Laden…" : events.length === 0 ? "Nog niets bewaard" : `${events.length} bewaarde events`}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: "rgba(201,211,212,0.06)" }} />
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">♡</p>
            <p className="text-base mb-2" style={{ color: "rgba(232,240,240,0.6)" }}>Nog geen bewaarde events</p>
            <p className="text-sm mb-8" style={{ color: "rgba(232,240,240,0.35)" }}>Klik op het hartje op een event om het te bewaren</p>
            <Link href="/events" className="px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: "#4c6f71", color: "#c9d3d4" }}>
              Ontdek events →
            </Link>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`}
                className="rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5"
                style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
                <div className="relative h-44 overflow-hidden" style={{ background: "#1a2a2b" }}>
                  {e.primary_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.primary_image_url} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "rgba(201,211,212,0.2)" }}>
                      {CAT_ICONS[e.category ?? ""] ?? "✨"}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(42,63,64,0.85)", color: "#c9d3d4" }}>
                      {CAT_ICONS[e.category ?? ""] ?? ""} {e.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <SaveButton id={e.id} />
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
        )}
      </main>
    </div>
  );
}
