export interface CepResult {
  logradouro: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;         // estado (sigla)
  complemento: string;
}

export async function fetchCep(raw: string): Promise<CepResult | null> {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
      complemento: data.complemento || '',
    };
  } catch {
    return null;
  }
}

/** Formata CEP para 00000-000 conforme o usuário digita */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}
