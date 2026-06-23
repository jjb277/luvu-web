const PROFILE_KEY = "luvu-profile";

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return !!p.email && !!p.marketingConsent;
  } catch { return false; }
}

export function saveConsentData(email: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...existing, email, marketingConsent: true }));
  } catch {}
}
