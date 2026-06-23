'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PROFILE_KEY = 'luvu-profile';
type Profile = { name?: string; postcode?: string; lat?: string; lng?: string; radius?: string; categories?: string[] };
function loadProfile(): Profile | null {
  try { const p = localStorage.getItem(PROFILE_KEY); return p ? JSON.parse(p) : null; } catch { return null; }
}

const DATE_OPTIONS = [
  { label: 'Vandaag',        value: 'today' },
  { label: 'Dit weekend',    value: 'weekend' },
  { label: 'Deze week',      value: 'week' },
  { label: 'Deze maand',     value: 'month' },
  { label: 'Volgende maand', value: 'next-month' },
];

function getUpcomingMonths(n = 12) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `month-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
}

const POPULAR_CITIES = [
  { name: 'Antwerpen', lat: '51.2213', lng: '4.4051' },
  { name: 'Gent',      lat: '51.0543', lng: '3.7174' },
  { name: 'Brugge',    lat: '51.2093', lng: '3.2247' },
  { name: 'Brussel',   lat: '50.8503', lng: '4.3517' },
  { name: 'Leuven',    lat: '50.8798', lng: '4.7005' },
  { name: 'Mechelen',  lat: '51.0259', lng: '4.4776' },
  { name: 'Hasselt',   lat: '50.9307', lng: '5.3383' },
  { name: 'Kortrijk',  lat: '50.8282', lng: '3.2645' },
  { name: 'Genk',      lat: '50.9656', lng: '5.5024' },
  { name: 'Liège',     lat: '50.6450', lng: '5.5729' },
];

type Props = {
  activeDate?: string;
  activeLat?: string;
  activeLng?: string;
  activeRadius?: string;
  cat?: string;
  q?: string;
};

export default function EventFilters({ activeDate, activeLat, activeLng, activeRadius, cat, q }: Props) {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(activeRadius ?? '25');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [profileLoc, setProfileLoc] = useState<{ postcode: string; lat: string; lng: string; radius: string } | null>(null);
  const [showCities, setShowCities] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p?.lat && p?.lng && p?.postcode) {
      setProfileLoc({ postcode: p.postcode!, lat: p.lat, lng: p.lng, radius: p.radius ?? '25' });
    }
  }, []);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      cat: cat !== 'Alle' ? cat : undefined,
      q: q || undefined,
      date: activeDate,
      lat: activeLat,
      lng: activeLng,   // ← was missing before
      radius: activeRadius,
    };
    const merged = { ...base, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/events${s ? `?${s}` : ''}`;
  }

  function toggleDate(val: string) {
    router.push(buildUrl({ date: activeDate === val ? undefined : val, page: undefined }));
  }

  function pickCity(city: { name: string; lat: string; lng: string }) {
    setShowCities(false);
    router.push(buildUrl({ lat: city.lat, lng: city.lng, radius, page: undefined }));
  }

  async function handleLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) {
      router.push(buildUrl({ lat: undefined, lng: undefined, radius: undefined, page: undefined }));
      return;
    }
    setLocating(true);
    setLocError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(postcode + ' Belgium')}&limit=1`,
        { headers: { 'User-Agent': 'LUVU Events App' } }
      );
      const data = await res.json();
      if (!data[0]) { setLocError('Locatie niet gevonden'); setLocating(false); return; }
      router.push(buildUrl({ lat: data[0].lat, lng: data[0].lon, radius, page: undefined }));
    } catch {
      setLocError('Fout bij ophalen locatie');
    } finally {
      setLocating(false);
    }
  }

  function clearLocation() {
    setPostcode('');
    router.push(buildUrl({ lat: undefined, lng: undefined, radius: undefined, page: undefined }));
  }

  const hasLocation = !!activeLat;

  return (
    <div className="space-y-3 mb-8">
      {/* Date buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        {DATE_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => toggleDate(opt.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={activeDate === opt.value
              ? { background: '#4c6f71', color: '#c9d3d4' }
              : { background: 'rgba(201,211,212,0.07)', color: 'rgba(232,240,240,0.6)', border: '1px solid rgba(201,211,212,0.12)' }}>
            {opt.label}
          </button>
        ))}
        {/* Month picker */}
        <select
          value={activeDate?.startsWith('month-') ? activeDate : ''}
          onChange={(e) => e.target.value && router.push(buildUrl({ date: e.target.value, page: undefined }))}
          className="px-3 py-1.5 rounded-full text-sm font-medium outline-none"
          style={activeDate?.startsWith('month-')
            ? { background: '#4c6f71', color: '#c9d3d4' }
            : { background: 'rgba(201,211,212,0.07)', color: 'rgba(232,240,240,0.6)', border: '1px solid rgba(201,211,212,0.12)' }}>
          <option value=''>Kies maand</option>
          {getUpcomingMonths().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        {/* All */}
        <button onClick={() => router.push(buildUrl({ date: undefined, page: undefined }))}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          style={!activeDate
            ? { background: '#4c6f71', color: '#c9d3d4' }
            : { background: 'rgba(201,211,212,0.07)', color: 'rgba(232,240,240,0.6)', border: '1px solid rgba(201,211,212,0.12)' }}>
          Alles
        </button>
      </div>

      {/* Profile location shortcut */}
      {profileLoc && !hasLocation && (
        <button
          onClick={() => router.push(buildUrl({ lat: profileLoc.lat, lng: profileLoc.lng, radius: profileLoc.radius, page: undefined }))}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all w-fit"
          style={{ background: 'rgba(76,111,113,0.2)', color: '#c9d3d4', border: '1px solid rgba(76,111,113,0.4)' }}>
          📍 Gebruik mijn locatie ({profileLoc.postcode}, {profileLoc.radius} km)
        </button>
      )}

      {/* Active location bar */}
      {hasLocation && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm" style={{ color: 'rgba(232,240,240,0.55)' }}>📍 Straal</span>
          <select
            value={activeRadius ?? '25'}
            onChange={(e) => router.push(buildUrl({ radius: e.target.value, page: undefined }))}
            className="px-3 py-1 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(201,211,212,0.08)', border: '1px solid rgba(76,111,113,0.5)', color: '#c9d3d4' }}>
            {[5, 10, 20, 30, 50, 75, 100].map((r) => <option key={r} value={r}>{r} km</option>)}
          </select>
          <button onClick={() => setShowCities(!showCities)}
            className="px-3 py-1 rounded-lg text-xs"
            style={{ background: 'rgba(201,211,212,0.08)', color: '#c9d3d4', border: '1px solid rgba(201,211,212,0.15)' }}>
            Andere stad
          </button>
          <button onClick={clearLocation} className="px-3 py-1 rounded-lg text-xs"
            style={{ color: 'rgba(232,240,240,0.45)', border: '1px solid rgba(201,211,212,0.12)' }}>
            ✕ wis locatie
          </button>
        </div>
      )}

      {/* City picker — shown when no location, or when "Andere stad" is clicked */}
      {(!hasLocation || showCities) && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(201,211,212,0.05)', border: '1px solid rgba(201,211,212,0.1)' }}>
          <p className="text-xs mb-3" style={{ color: 'rgba(232,240,240,0.4)' }}>
            Kies een stad of typ een postcode
          </p>
          {/* Popular cities */}
          <div className="flex flex-wrap gap-2 mb-3">
            {POPULAR_CITIES.map((c) => (
              <button key={c.name} onClick={() => pickCity(c)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(201,211,212,0.09)', color: '#c9d3d4', border: '1px solid rgba(201,211,212,0.18)' }}>
                {c.name}
              </button>
            ))}
          </div>
          {/* Postcode form */}
          <form onSubmit={handleLocation} className="flex flex-wrap gap-2 items-center">
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)}
              placeholder="Andere postcode of stad…"
              className="px-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(201,211,212,0.08)', border: '1px solid rgba(201,211,212,0.15)', color: '#e8f0f0', width: '200px' }} />
            <select value={radius} onChange={(e) => setRadius(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(201,211,212,0.08)', border: '1px solid rgba(201,211,212,0.15)', color: '#e8f0f0' }}>
              {[5, 10, 20, 30, 50, 75].map((r) => <option key={r} value={r}>{r} km</option>)}
            </select>
            <button type="submit" disabled={locating || !postcode.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#4c6f71', color: '#c9d3d4', opacity: locating || !postcode.trim() ? 0.5 : 1 }}>
              {locating ? '…' : '📍 Zoek'}
            </button>
            {showCities && (
              <button type="button" onClick={() => setShowCities(false)} className="px-3 py-2 text-sm"
                style={{ color: 'rgba(232,240,240,0.4)' }}>
                Annuleren
              </button>
            )}
          </form>
          {locError && <p className="text-xs mt-2" style={{ color: '#e87070' }}>{locError}</p>}
        </div>
      )}
    </div>
  );
}
