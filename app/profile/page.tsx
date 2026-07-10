'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PROFILE_KEY = "luvu-profile";
const CATEGORIES = [
  { value: "Music",   label: "Muziek",   icon: "🎵" },
  { value: "Theater", label: "Theater",  icon: "🎭" },
  { value: "Comedy",  label: "Comedy",   icon: "😄" },
  { value: "Dance",   label: "Dans",     icon: "💃" },
  { value: "Family",  label: "Familie",  icon: "👨‍👩‍👧" },
  { value: "Film",    label: "Film",     icon: "🎬" },
  { value: "Museum",  label: "Museum",   icon: "🏛️" },
  { value: "Festival",label: "Festival", icon: "🎪" },
  { value: "Other",   label: "Overige",  icon: "✨" },
];

type Profile = {
  name: string;
  email: string;
  marketingConsent: boolean;
  postcode: string;
  lat: string;
  lng: string;
  radius: string;
  categories: string[];
};

const DEFAULT: Profile = { name: "", email: "", marketingConsent: false, postcode: "", lat: "", lng: "", radius: "25", categories: [] };

function loadProfile(): Profile {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; }
  catch { return DEFAULT; }
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(loadProfile()); }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function toggleCategory(cat: string) {
    setProfile((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));
  }

  async function geocode() {
    if (!profile.postcode.trim()) return;
    setLocating(true);
    setLocError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.postcode + " Belgium")}&limit=1`,
        { headers: { "User-Agent": "LUVU Events App" } }
      );
      const data = await res.json();
      if (!data[0]) { setLocError("Locatie niet gevonden"); return; }
      setProfile((p) => ({ ...p, lat: data[0].lat, lng: data[0].lon }));
      setLocError("");
    } catch {
      setLocError("Fout bij ophalen locatie");
    } finally {
      setLocating(false);
    }
  }

  function save() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
    setProfile(DEFAULT);
  }

  const hasLocation = !!profile.lat;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#4c6f71", color: "#c9d3d4" }}>L</div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </Link>
        <Link href="/events" className="text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>← Events</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-24">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "#e8f0f0" }}>Mijn profiel</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(232,240,240,0.45)" }}>
          Opgeslagen op dit toestel — geen account nodig
        </p>

        <div className="space-y-8">
          {/* Naam + e-mail */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(201,211,212,0.5)" }}>Naam</h2>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jouw naam…"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(201,211,212,0.08)", border: "1px solid rgba(201,211,212,0.15)", color: "#e8f0f0" }}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(201,211,212,0.5)" }}>
                E-mailadres <span style={{ color: "#e87070" }}>*</span>
              </h2>
              <p className="text-xs mb-3" style={{ color: "rgba(232,240,240,0.35)" }}>
                Vereist om events en locaties te bewaren
              </p>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jouw@email.be"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(201,211,212,0.08)", border: `1px solid ${profile.email ? "rgba(76,111,113,0.6)" : "rgba(201,211,212,0.15)"}`, color: "#e8f0f0" }}
              />
              <label className="flex items-start gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.marketingConsent}
                  onChange={(e) => set("marketingConsent", e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: "#4c6f71" }}
                />
                <span className="text-xs leading-relaxed" style={{ color: "rgba(232,240,240,0.5)" }}>
                  Ik ga akkoord dat LUVU mijn e-mailadres gebruikt voor ticketinformatie, evenementaanbevelingen en andere marketingberichten. Je kan je altijd uitschrijven.
                </span>
              </label>
            </div>
          </section>

          {/* Locatie */}
          <section className="rounded-2xl p-6" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(201,211,212,0.5)" }}>Locatie</h2>
            <p className="text-xs mb-4" style={{ color: "rgba(232,240,240,0.35)" }}>
              Wordt automatisch toegepast als filter op de events pagina
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={profile.postcode}
                onChange={(e) => { set("postcode", e.target.value); set("lat", ""); set("lng", ""); }}
                placeholder="Postcode of stad…"
                className="px-4 py-2.5 rounded-xl text-sm outline-none flex-1 min-w-0"
                style={{
                  background: "rgba(201,211,212,0.08)",
                  border: `1px solid ${hasLocation ? "rgba(76,111,113,0.6)" : "rgba(201,211,212,0.15)"}`,
                  color: "#e8f0f0",
                }}
              />
              <select
                value={profile.radius}
                onChange={(e) => set("radius", e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(201,211,212,0.08)", border: "1px solid rgba(201,211,212,0.15)", color: "#e8f0f0" }}
              >
                {[5, 10, 20, 30, 50].map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>
              <button
                onClick={geocode}
                disabled={locating || !profile.postcode.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#4c6f71", color: "#c9d3d4", opacity: locating || !profile.postcode.trim() ? 0.5 : 1 }}
              >
                {locating ? "…" : "Bevestig"}
              </button>
            </div>
            {locError && <p className="text-xs mt-2" style={{ color: "#e87070" }}>{locError}</p>}
            {hasLocation && !locError && (
              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "rgba(76,200,160,0.8)" }}>
                ✓ Locatie opgeslagen · events binnen {profile.radius} km
              </p>
            )}
          </section>

          {/* Categorieën */}
          <section className="rounded-2xl p-6" style={{ background: "rgba(201,211,212,0.06)", border: "1px solid rgba(201,211,212,0.12)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(201,211,212,0.5)" }}>Favoriete categorieën</h2>
            <p className="text-xs mb-4" style={{ color: "rgba(232,240,240,0.35)" }}>
              Kies wat jou interesseert
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = profile.categories.includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleCategory(c.value)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={
                      active
                        ? { background: "#4c6f71", color: "#c9d3d4" }
                        : { background: "rgba(201,211,212,0.07)", color: "rgba(232,240,240,0.6)", border: "1px solid rgba(201,211,212,0.12)" }
                    }
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={!profile.email || !profile.marketingConsent}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: saved ? "rgba(76,200,160,0.3)" : "#4c6f71", color: "#c9d3d4", opacity: !profile.email || !profile.marketingConsent ? 0.45 : 1, cursor: !profile.email || !profile.marketingConsent ? "not-allowed" : "pointer" }}
            >
              {saved ? "✓ Opgeslagen" : "Opslaan"}
            </button>
            {profile.categories.length > 0 && (
              <Link
                href={`/events?cat=${profile.categories[0]}`}
                className="px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(201,211,212,0.08)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.15)" }}
              >
                Bekijk mijn events →
              </Link>
            )}
            {!profile.categories.length && profile.lat && (
              <Link
                href={`/events?lat=${profile.lat}&lng=${profile.lng}&radius=${profile.radius}`}
                className="px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(201,211,212,0.08)", color: "#c9d3d4", border: "1px solid rgba(201,211,212,0.15)" }}
              >
                Bekijk events in mijn buurt →
              </Link>
            )}
          </div>

          {/* Clear */}
          <button
            onClick={clearProfile}
            className="text-xs"
            style={{ color: "rgba(232,240,240,0.3)" }}
          >
            Profiel wissen
          </button>
        </div>
      </main>
    </div>
  );
}
