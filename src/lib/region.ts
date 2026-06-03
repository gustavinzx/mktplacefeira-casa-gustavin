export const REGION_STORAGE_KEY = 'feira_user_region';

export type SavedRegion = {
  label: string;
  city?: string;
  state?: string;
  cep?: string;
  lat?: number;
  lng?: number;
  radius?: number;
};

export function getSavedRegion(): SavedRegion | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REGION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedRegion;
  } catch {
    return null;
  }
}

export function saveRegion(region: SavedRegion) {
  localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
  window.dispatchEvent(new CustomEvent('regionUpdated', { detail: region }));
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function regionButtonLabel(region: SavedRegion | null): string {
  if (!region?.label) return 'Sua Região';
  const short = region.label.split(',')[0]?.trim();
  return short && short.length <= 18 ? short : 'Sua Região';
}
