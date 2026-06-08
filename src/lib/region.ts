export const REGION_STORAGE_KEY = 'feira_user_region';

export type SavedRegion = {
  label: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  cep?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  timestamp?: number;
};

export function getSavedRegion(): SavedRegion | null {
  if (typeof window === 'undefined') return null;
  try {
    // Tenta chave principal, depois fallback para chave antiga
    let raw = localStorage.getItem(REGION_STORAGE_KEY);
    if (!raw) raw = localStorage.getItem('feira_region');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedRegion;

    // TTL de 30 minutos — depois pede GPS de novo
    if (parsed.timestamp) {
      const age = Date.now() - parsed.timestamp;
      if (age > 30 * 60 * 1000) return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveRegion(region: SavedRegion) {
  const data = { ...region, timestamp: Date.now() };
  // Salva nas duas chaves para garantir consistência
  localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem('feira_region', JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('regionUpdated', { detail: data }));
}

export function clearRegion() {
  localStorage.removeItem(REGION_STORAGE_KEY);
  localStorage.removeItem('feira_region');
  window.dispatchEvent(new CustomEvent('regionUpdated', { detail: null }));
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function regionButtonLabel(region: SavedRegion | null): string {
  if (!region?.label) return 'Sua Região';

  // Mostra bairro se disponível e curto o suficiente
  if (region.neighborhood && region.neighborhood.length <= 22) {
    return region.neighborhood;
  }

  // Senão mostra a primeira parte do label (antes da vírgula)
  const short = region.label.split(',')[0]?.trim();
  return short && short.length <= 22 ? short : 'Sua Região';
}