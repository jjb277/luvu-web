'use client';
import { useState, useEffect } from 'react';
import ConsentModal from '@/app/components/ConsentModal';
import { hasConsent, saveConsentData } from '@/app/lib/consent';

const STORAGE_KEY = 'luvu-saved';

export function getSaved(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function SaveButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    setSaved(getSaved().includes(id));
  }, [id]);

  function doToggle() {
    const current = getSaved();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(!saved);
    window.dispatchEvent(new Event('luvu-saved-change'));
  }

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) { doToggle(); return; }
    if (hasConsent()) { doToggle(); return; }
    setShowConsent(true);
  }

  function onConsent(email: string) {
    saveConsentData(email);
    setShowConsent(false);
    doToggle();
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-label={saved ? 'Verwijder uit bewaard' : 'Bewaar event'}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background: saved ? 'rgba(76,111,113,0.85)' : 'rgba(26,42,43,0.75)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(201,211,212,0.2)',
        }}>
        <span style={{ fontSize: '14px', lineHeight: 1, color: saved ? '#e8f0f0' : 'rgba(232,240,240,0.55)' }}>
          {saved ? '♥' : '♡'}
        </span>
      </button>
      <ConsentModal open={showConsent} onConsent={onConsent} onClose={() => setShowConsent(false)} />
    </>
  );
}
