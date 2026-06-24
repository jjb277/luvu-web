'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PROFILE_KEY = 'luvu-profile';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    // Pass profile location if available
    const params = new URLSearchParams({ q: q.trim() });
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      if (p.lat && p.lng) {
        params.set('lat', p.lat);
        params.set('lng', p.lng);
        params.set('radius', p.radius ?? '25');
      }
    } catch { /* no profile */ }
    router.push(`/events?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-xl mb-8">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Zoek op artiest, event of venue…"
        className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(201,211,212,0.1)',
          border: '1px solid rgba(201,211,212,0.2)',
          color: '#e8f0f0',
        }}
      />
      <button
        type="submit"
        disabled={!q.trim()}
        className="px-5 py-3.5 rounded-xl text-sm font-semibold"
        style={{ background: '#4c6f71', color: '#c9d3d4', opacity: q.trim() ? 1 : 0.5 }}
      >
        Zoeken
      </button>
    </form>
  );
}
