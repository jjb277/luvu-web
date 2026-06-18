'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PROFILE_KEY = 'luvu-profile';
type Profile = { name?: string; postcode?: string; lat?: string; lng?: string; radius?: string; categories?: string[] };
function loadProfile(): Profile | null {
  try { const p = localStorage.getItem(PROFILE_KEY); return p ? JSON.parse(p) : null; } catch { return null; }
}

const DATE_OPTIONS = [
  { label: 'Vandaag', value: 'today' },
  { label: 'Dit weekend', value: 'weekend' },
  { label: 'Deze week', value: 'week' },
  { label: 'Deze maand', value: 'month' },
];

type Props = {
  activeDate?: string;
  activeLat?: string;
  activeLng?: string;
  activeRadius?: string;
  cat?: string;
  q?: string;
};

export default function EventFilters({ activeDate, activeLat, activeRadius, cat, q }: Props) {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(activeRadius ?? '25');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [profileLoc, setProfileLoc] = useState<{ postcode: string; lat: string; lng: string; radius: string } | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p?.lat && p?.lng && p?.postcode) setProfileLoc({ postcode: p.postcode!, lat: p.lat, lng: p.lng, radius: p.radius ?? '25' });
  }, []);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      cat: cat !== 'Alle' ? cat : undefined,
      q: q || undefined,
      date: activeDate,
      lat: activeLat,
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
      if (!data[0]) { setLocError('Locatie niet gevonden'); return; }
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
      <div className="flex flex-wrap gap-2">
        {DATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleDate(opt.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              activeDate === opt.value
                ? { background: '#4c6f71', color: '#c9d3d4' }
                : { background: 'rgba(201,211,212,0.07)', color: 'rgba(232,240,240,0.6)', border: '1px solid rgba(201,211,212,0.12)' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Profile location shortcut */}
      {profileLoc && !activeLat && (
        <button
          onClick={() => router.push(buildUrl({ lat: profileLoc.lat, lng: profileLoc.lng, radius: profileLoc.radius, page: undefined }))}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all w-fit"
          style={{ background: 'rgba(76,111,113,0.2)', color: '#c9d3d4', border: '1px solid rgba(76,111,113,0.4)' }}
        >
          📍 Gebruik mijn locatie ({profileLoc.postcode}, {profileLoc.radius} km)
        </button>
      )}

      {/* Location row */}
      <form onSubmit={handleLocation} className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder={hasLocation ? `Straal: ${activeRadius} km actief` : 'Postcode of stad…'}
          className="px-4 py-2 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(201,211,212,0.08)',
            border: `1px solid ${hasLocation ? 'rgba(76,111,113,0.6)' : 'rgba(201,211,212,0.15)'}`,
            color: '#e8f0f0',
            width: '180px',
          }}
        />
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(201,211,212,0.08)', border: '1px solid rgba(201,211,212,0.15)', color: '#e8f0f0' }}
        >
          {[5, 10, 20, 30, 50].map((r) => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={locating}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: '#4c6f71', color: '#c9d3d4', opacity: locating ? 0.6 : 1 }}
        >
          {locating ? '…' : '📍 Zoek'}
        </button>
        {hasLocation && (
          <button
            type="button"
            onClick={clearLocation}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ color: 'rgba(232,240,240,0.5)', border: '1px solid rgba(201,211,212,0.15)' }}
          >
            ✕ wis locatie
          </button>
        )}
      </form>
      {locError && <p className="text-xs" style={{ color: '#e87070' }}>{locError}</p>}
      {hasLocation && (
        <p className="text-xs" style={{ color: 'rgba(232,240,240,0.4)' }}>
          Events binnen {activeRadius} km van je locatie
        </p>
      )}
    </div>
  );
}
