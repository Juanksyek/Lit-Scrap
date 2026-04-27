import type { ScoredBusiness } from "../scoring/types";

const KEY = "litscrap_session_v1";

export function loadSession(): ScoredBusiness[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScoredBusiness[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(items: ScoredBusiness[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

export function upsertSession(item: ScoredBusiness): ScoredBusiness[] {
  const current = loadSession();
  const idx = current.findIndex((i) => i.placeId === item.placeId);
  if (idx >= 0) current[idx] = item;
  else current.push(item);
  saveSession(current);
  return [...current];
}

export function removeFromSession(placeId: string): ScoredBusiness[] {
  const current = loadSession().filter((i) => i.placeId !== placeId);
  saveSession(current);
  return [...current];
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
