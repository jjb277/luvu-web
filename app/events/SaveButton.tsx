'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'luvu-saved';

export function getSaved(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function SaveButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSaved().includes(id));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = getSaved();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(!saved);
    window.dispatchEvent(new Event('luvu-saved-change'));
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Verwijder uit bewaard' : 'Bewaar event'}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={{
        background: saved ? 'rgba(76,111,113,0.85)' : 'rgba(26,42,43,0.75)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(201,211,212,0.2)',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1, color: saved ? '#e8f0f0' : 'rgba(232,240,240,0.55)' }}>
        {saved ? '♥' : '♡'}
      </span>
    </button>
  );
}
