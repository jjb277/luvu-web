import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { Suspense } from "react";
import EventFilters from "./EventFilters";
import SaveButton from "./SaveButton";

export const metadata: Metadata = { title: "Events — LUVU" };
export const revalidate = 3600;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PAGE_SIZE = 48;
const CATEGORIES = ["Alle", "Music", "Theater", "Comedy", "Dance", "Family", "Film", "Other"];
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

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return `/events${s ? `?${s}` : ""}`;
}

function getDateRange(date?: string): { from: string; to: string } | null {
  if (!date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (date) {
    case "today":
      return { from: today.toISOString(), to: new Date(today.getTime() + 86400000).toISOString() };
    case "weekend": {
      const day = today.getDay();
      let start: Date;
      if (day === 5 || day === 6 || day === 0) {
        start = today;
      } else {
        const daysToFri = (5 - day + 7) % 7;
        start = new Date(today.getTime() + daysToFri * 86400000);
      }
      const end = new Date(start);
      while (end.getDay() !== 1) end.setDate(end.getDate() + 1);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    case "week":
      return { from: today.toISOString(), to: new Date(today.getTime() + 7 * 86400000).toISOString() };
    case "month": {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { from: today.toISOString(), to: monthEnd.toISOString() };
    }
    default:
      return null;
  }
}

function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = (radiusKm / 6371) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180);
  return { minLat: lat - latDelta, maxLat: lat + latDelta, minLng: lng - lngDelta, maxLng: lng + lngDelta };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; page?: string; date?: string; lat?: string; lng?: string; radius?: string }>;
}) {
  const { cat, q, page, date, lat, lng, radius } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = createClient(SB_URL, SB_KEY);

  let query = sb
    .from("events")
    .select("id, title, short_tagline, category, event_date, venue_name, city, base_price, primary_image_url", { count: "exact" })
    .in("visibility_status", ["live", "public"])
    .not("primary_image_url", "is", null)
    .order("event_date", { ascending: true })
    .range(from, to);

  const dateRange = getDateRange(date);
  if (dateRange) {
    query = query.gte("event_date", dateRange.from).lt("event_date", dateRange.to);
  } else {
    query = query.gt("event_date", new Date().toISOString());
  }

  if (lat && lng) {
    const radiusKm = parseFloat(radius ?? "25");
    const box = getBoundingBox(parseFloat(lat), parseFloat(lng), radiusKm);
    query = query
      .gte("venue_lat", box.minLat).lte("venue_lat", box.maxLat)
      .gte("venue_lng", box.minLng).lte("venue_lng", box.maxLng);
  }

  if (cat && cat !== "Alle") query = query.eq("category", cat);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: events, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const activeCategory = cat || "Alle";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
        <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>
          <Link href="/saved" className="hover:opacity-100 transition-opacity flex items-center gap-1">♥ Bewaard</Link>
          <Link href="/profile" className="hover:opacity-100 transition-opacity">Profiel</Link>
          <Link href="/support" className="hover:opacity-100 transition-opacity">Support</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#e8f0f0" }}>Alle events</h1>
          <p className="text-sm" style={{ color: "rgba(232,240,240,0.45)" }}>
            {count ?? 0} {lat ? "events in jouw buurt" : "aankomende events in België"}
            {totalPages > 1 && ` · pagina ${pageNum} van ${totalPages}`}
          </p>
        </div>

        {/* Datum + locatie filters */}
        <Suspense>
          <EventFilters
            activeDate={date}
            activeLat={lat}
            activeLng={lng}
            activeRadius={radius}
            cat={activeCategory}
            q={q}
          />
        </Suspense>

        {/* Search */}
        <form method="GET" className="mb-6 flex gap-3">
          <input type="text" name="q" defaultValue={q} placeholder="Zoek op titel…"
            className="flex-1 max-w-sm px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(201,211,212,0.08)", border: "1px solid rgba(201,211,212,0.15)", color: "#e8f0f0" }} />
          {cat && <input type="hidden" name="cat" value={cat} />}
          {date && <input type="hidden" name="date" value={date} />}
          {lat && <input type="hidden" name="lat" value={lat} />}
          {lng && <input type="hidden" name="lng" value={lng} />}
          {radius && <input type="hidden" name="radius" value={radius} />}
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#4c6f71", color: "#c9d3d4" }}>
            Zoeken
          </button>
          {(q || (cat && cat !== "Alle") || date || lat) && (
            <Link href="/events" className="px-4 py-2.5 rounded-xl text-sm" style={{ color: "rgba(232,240,240,0.5)" }}>Wis alles</Link>
          )}
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <Link key={c} href={buildUrl({ cat: c === "Alle" ? undefined : c, q, date, lat, lng, radius })}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={activeCategory === c
                ? { background: "#4c6f71", color: "#c9d3d4" }
                : { background: "rgba(201,211,212,0.07)", color: "rgba(232,240,240,0.6)", border: "1px solid rgba(201,211,212,0.12)" }}>
              {c !== "Alle" ? `${CAT_ICONS[c] ?? ""} ` : ""}{c}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {!events?.length ? (
          <p className="text-center py-24 text-sm" style={{ color: "rgba(232,240,240,0.4)" }}>Geen events gevonden.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`}
                className="rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5"
                style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
                <div className="relative h-44 overflow-hidden" style={{ background: "#1a2a2b" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.primary_image_url!} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            {pageNum > 1 ? (
              <Link href={buildUrl({ cat: cat !== "Alle" ? cat : undefined, q, date, lat, lng, radius, page: String(pageNum - 1) })}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(201,211,212,0.08)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.15)" }}>
                ← Vorige
              </Link>
            ) : <span className="px-5 py-2.5 text-sm" style={{ color: "rgba(232,240,240,0.2)" }}>← Vorige</span>}

            <span className="text-sm" style={{ color: "rgba(232,240,240,0.45)" }}>{pageNum} / {totalPages}</span>

            {pageNum < totalPages ? (
              <Link href={buildUrl({ cat: cat !== "Alle" ? cat : undefined, q, date, lat, lng, radius, page: String(pageNum + 1) })}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#4c6f71", color: "#c9d3d4" }}>
                Volgende →
              </Link>
            ) : <span className="px-5 py-2.5 text-sm" style={{ color: "rgba(232,240,240,0.2)" }}>Volgende →</span>}
          </div>
        )}
      </main>
    </div>
  );
}
