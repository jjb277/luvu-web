'use client';
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const PROFILE_KEY = "luvu-profile";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CATEGORIES = [
  { label: "Muziek", value: "Music", icon: "🎵" },
  { label: "Theater", value: "Theater", icon: "🎭" },
  { label: "Comedy", value: "Comedy", icon: "😄" },
  { label: "Dans", value: "Dance", icon: "💃" },
  { label: "Familie", value: "Family", icon: "👨‍👩‍👧" },
  { label: "Film", value: "Film", icon: "🎬" },
];

const CAT_ICONS: Record<string, string> = {
  Music: "🎵", Theater: "🎭", Comedy: "😄", Dance: "💃",
  Family: "👨‍👩‍👧", Film: "🎬", Other: "✨",
};

type Profile = {
  name: string;
  postcode: string;
  lat: string;
  lng: string;
  radius: string;
  categories: string[];
};

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

const DEFAULT: Profile = { name: "", postcode: "", lat: "", lng: "", radius: "25", categories: [] };

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE", { weekday: "short", day: "numeric", month: "short" });
}

function formatPrice(price: number | null) {
  if (!price) return "Gratis";
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = (radiusKm / 6371) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180);
  return { minLat: lat - latDelta, maxLat: lat + latDelta, minLng: lng - lngDelta, maxLng: lng + lngDelta };
}

function EventCard({ e }: { e: Event }) {
  return (
    <Link
      href={`/events/${e.id}`}
      className="rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5"
      style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}
    >
      <div className="relative h-44 overflow-hidden" style={{ background: "#1a2a2b" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.primary_image_url!}
          alt={e.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(42,63,64,0.85)", color: "#c9d3d4" }}>
            {CAT_ICONS[e.category ?? ""] ?? ""} {e.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs mb-1" style={{ color: "rgba(201,211,212,0.6)" }}>{formatDate(e.event_date)}</p>
        <h3 className="font-semibold text-sm mb-0.5 leading-snug" style={{ color: "#e8f0f0" }}>{e.title}</h3>
        {e.short_tagline && (
          <p className="text-xs mb-2" style={{ color: "rgba(201,211,212,0.7)" }}>{e.short_tagline}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xs" style={{ color: "rgba(232,240,240,0.45)" }}>
            {e.venue_name ?? e.city ?? ""}
            {e.city && e.venue_name ? ` · ${e.city}` : ""}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#c9d3d4" }}>{formatPrice(e.base_price)}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
      <div className="h-44" style={{ background: "rgba(201,211,212,0.08)" }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded w-1/3" style={{ background: "rgba(201,211,212,0.08)" }} />
        <div className="h-4 rounded w-3/4" style={{ background: "rgba(201,211,212,0.08)" }} />
        <div className="h-3 rounded w-1/2" style={{ background: "rgba(201,211,212,0.08)" }} />
      </div>
    </div>
  );
}

export default function PersonalizedHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  // Setup form
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState("25");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  // Events
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // UI state
  const [editing, setEditing] = useState(false);

  const fetchEvents = useCallback(async (p: Profile, cat: string | null) => {
    if (!p.lat || !p.lng) return;
    setEventsLoading(true);
    const sb = createClient(SB_URL, SB_KEY);
    const box = getBoundingBox(parseFloat(p.lat), parseFloat(p.lng), parseInt(p.radius ?? "25"));

    let query = sb
      .from("events")
      .select("id, title, short_tagline, category, event_date, venue_name, city, base_price, primary_image_url")
      .in("visibility_status", ["live", "public"])
      .not("primary_image_url", "is", null)
      .gt("event_date", new Date().toISOString())
      .gte("venue_lat", box.minLat).lte("venue_lat", box.maxLat)
      .gte("venue_lng", box.minLng).lte("venue_lng", box.maxLng)
      .order("event_date", { ascending: true })
      .limit(12);

    if (cat) query = query.eq("category", cat);

    const { data } = await query;
    setEvents(data ?? []);
    setEventsLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const p = loadProfile();
    setProfile(p);
    if (p?.lat && p?.lng) {
      const initCat = p.categories?.[0] ?? null;
      setActiveCat(initCat);
      fetchEvents(p, initCat);
    }
  }, [fetchEvents]);

  async function geocodeAndSave() {
    if (!postcode.trim()) return;
    setLocating(true);
    setLocError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(postcode + " Belgium")}&limit=1`,
        { headers: { "User-Agent": "LUVU Events App" } }
      );
      const data = await res.json();
      if (!data[0]) {
        setLocError("Locatie niet gevonden. Probeer een andere postcode of stad.");
        setLocating(false);
        return;
      }
      const newProfile: Profile = {
        ...(profile ?? DEFAULT),
        postcode,
        lat: data[0].lat,
        lng: data[0].lon,
        radius,
      };
      saveProfile(newProfile);
      setProfile(newProfile);
      setEditing(false);
      setLocError("");
      fetchEvents(newProfile, activeCat);
    } catch {
      setLocError("Fout bij ophalen locatie. Probeer opnieuw.");
    } finally {
      setLocating(false);
    }
  }

  function handleCatToggle(cat: string) {
    const newCat = activeCat === cat ? null : cat;
    setActiveCat(newCat);
    if (profile?.lat) fetchEvents(profile, newCat);
  }

  const hasLocation = !!profile?.lat;

  // SSR skeleton — no flash on hydration
  if (!mounted) {
    return (
      <div>
        <div className="mb-8 rounded-2xl p-6" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
          <div className="h-6 w-48 rounded mb-2" style={{ background: "rgba(201,211,212,0.08)" }} />
          <div className="h-4 w-72 rounded mb-4" style={{ background: "rgba(201,211,212,0.06)" }} />
          <div className="flex gap-2">
            <div className="h-10 w-48 rounded-xl" style={{ background: "rgba(201,211,212,0.08)" }} />
            <div className="h-10 w-20 rounded-xl" style={{ background: "rgba(201,211,212,0.08)" }} />
            <div className="h-10 w-32 rounded-xl" style={{ background: "rgba(76,111,113,0.3)" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Region bar (when location is set and not editing) */}
      {hasLocation && !editing && (
        <div
          className="flex items-center justify-between mb-6 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(76,111,113,0.15)", border: "1px solid rgba(76,111,113,0.3)" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#4c6f71" }}>📍</span>
            <span className="text-sm font-medium" style={{ color: "#c9d3d4" }}>
              {profile!.postcode}
            </span>
            <span className="text-xs" style={{ color: "rgba(201,211,212,0.5)" }}>
              · {profile!.radius} km radius
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: "rgba(201,211,212,0.5)" }}
            >
              Profiel
            </Link>
            <button
              onClick={() => { setEditing(true); setPostcode(profile!.postcode); setRadius(profile!.radius); }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(201,211,212,0.08)", color: "rgba(201,211,212,0.7)", border: "1px solid rgba(201,211,212,0.15)" }}
            >
              Wijzigen
            </button>
          </div>
        </div>
      )}

      {/* Setup / Edit form */}
      {(!hasLocation || editing) && (
        <div
          className="mb-8 rounded-2xl p-6"
          style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: "#e8f0f0" }}>
            {editing ? "Regio aanpassen" : "📍 Kies jouw regio"}
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(232,240,240,0.45)" }}>
            {editing
              ? "Pas je postcode en zoekradius aan."
              : "Vul je postcode of stad in om events dicht bij jou te ontdekken."}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && geocodeAndSave()}
              placeholder="Postcode of stad…"
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(201,211,212,0.08)",
                border: "1px solid rgba(201,211,212,0.2)",
                color: "#e8f0f0",
                width: "200px",
              }}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={!hasLocation}
            />
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "rgba(201,211,212,0.08)", border: "1px solid rgba(201,211,212,0.15)", color: "#e8f0f0" }}
            >
              {[10, 20, 30, 50, 75].map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>
            <button
              onClick={geocodeAndSave}
              disabled={locating || !postcode.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "#4c6f71",
                color: "#c9d3d4",
                opacity: locating || !postcode.trim() ? 0.5 : 1,
                cursor: locating || !postcode.trim() ? "not-allowed" : "pointer",
              }}
            >
              {locating ? "Zoeken…" : editing ? "Opslaan" : "Events zoeken →"}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(false); setLocError(""); }}
                className="px-3 py-2.5 rounded-xl text-sm"
                style={{ color: "rgba(232,240,240,0.4)" }}
              >
                Annuleren
              </button>
            )}
          </div>
          {locError && (
            <p className="text-xs mt-2" style={{ color: "#e87070" }}>{locError}</p>
          )}
          {!hasLocation && (
            <p className="text-xs mt-3" style={{ color: "rgba(232,240,240,0.3)" }}>
              Of{" "}
              <Link href="/events" className="underline hover:opacity-80">
                bekijk alle events in België
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => handleCatToggle(c.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={
              activeCat === c.value
                ? { background: "#4c6f71", color: "#c9d3d4" }
                : { background: "rgba(201,211,212,0.1)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.2)" }
            }
          >
            {c.icon} {c.label}
          </button>
        ))}
        <Link
          href={`/events${activeCat ? `?cat=${activeCat}` : ""}${
            hasLocation
              ? `${activeCat ? "&" : "?"}lat=${profile!.lat}&lng=${profile!.lng}&radius=${profile!.radius}`
              : ""
          }`}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "rgba(76,111,113,0.35)", color: "#c9d3d4", border: "1px solid rgba(76,111,113,0.5)" }}
        >
          Alle events →
        </Link>
      </div>

      {/* Events section */}
      {hasLocation ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "#e8f0f0" }}>
              {eventsLoading
                ? "Events zoeken…"
                : events.length
                ? `${events.length} events in jouw buurt`
                : "Geen events gevonden"}
            </h2>
            {!eventsLoading && events.length > 0 && (
              <Link
                href={`/events?lat=${profile!.lat}&lng=${profile!.lng}&radius=${profile!.radius}${activeCat ? `&cat=${activeCat}` : ""}`}
                className="text-sm"
                style={{ color: "rgba(201,211,212,0.55)" }}
              >
                Alles bekijken →
              </Link>
            )}
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : events.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {events.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          ) : (
            <div
              className="text-center py-14 rounded-2xl mb-10"
              style={{ background: "rgba(201,211,212,0.04)", border: "1px solid rgba(201,211,212,0.1)" }}
            >
              <p className="text-sm mb-1" style={{ color: "rgba(232,240,240,0.6)" }}>
                Geen events gevonden in jouw buurt
                {activeCat ? ` voor ${activeCat}` : ""}
              </p>
              <p className="text-xs mb-5" style={{ color: "rgba(232,240,240,0.3)" }}>
                Probeer een grotere radius of een andere categorie
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setEditing(true); setPostcode(profile!.postcode); setRadius(profile!.radius); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#4c6f71", color: "#c9d3d4" }}
                >
                  Radius aanpassen
                </button>
                <Link
                  href="/events"
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(201,211,212,0.08)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.15)" }}
                >
                  Alle events
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        /* No location — generic CTA */
        <div
          className="text-center py-12 rounded-2xl"
          style={{ background: "rgba(201,211,212,0.04)", border: "1px solid rgba(201,211,212,0.1)" }}
        >
          <p className="text-base font-semibold mb-1" style={{ color: "#e8f0f0" }}>
            Meer dan 1000 events in België
          </p>
          <p className="text-sm mb-5" style={{ color: "rgba(232,240,240,0.45)" }}>
            Filter op datum, locatie en categorie
          </p>
          <Link
            href="/events"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#4c6f71", color: "#c9d3d4" }}
          >
            Bekijk alle events →
          </Link>
        </div>
      )}
    </div>
  );
}
