'use client';
import { useState } from 'react';

type Props = {
  open: boolean;
  onConsent: (email: string) => void;
  onClose: () => void;
};

export default function ConsentModal({ open, onConsent, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  function submit() {
    if (!email.trim() || !accepted) return;
    onConsent(email.trim());
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#1a2a2b', border: '1px solid rgba(201,211,212,0.15)', borderRadius: '1.25rem', padding: '2rem', maxWidth: '420px', width: '100%' }}>
        <h2 style={{ color: '#e8f0f0', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Jouw e-mailadres
        </h2>
        <p style={{ color: 'rgba(232,240,240,0.5)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Om locaties en events te bewaren heb je een e-mailadres nodig. We gebruiken dit voor ticketinformatie en evenementaanbevelingen.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="jouw@email.be"
          autoFocus
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(201,211,212,0.2)', background: 'rgba(201,211,212,0.08)', color: '#e8f0f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
        />
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginTop: '3px', accentColor: '#4c6f71', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.75rem', color: 'rgba(232,240,240,0.55)', lineHeight: 1.6 }}>
            Ik ga akkoord dat LUVU mijn e-mailadres gebruikt voor ticketinformatie, evenementaanbevelingen en andere marketingberichten. Je kan je altijd uitschrijven.
          </span>
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={submit}
            disabled={!email.trim() || !accepted}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: '#4c6f71', color: '#c9d3d4', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: !email.trim() || !accepted ? 'not-allowed' : 'pointer', opacity: !email.trim() || !accepted ? 0.45 : 1 }}>
            Bevestigen
          </button>
          <button
            onClick={onClose}
            style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', background: 'transparent', color: 'rgba(232,240,240,0.4)', fontSize: '0.875rem', border: '1px solid rgba(201,211,212,0.12)', cursor: 'pointer' }}>
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
