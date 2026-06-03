/** Papéis gravados em mktplace_feira_profiles.role */
export type SignupRole = 'cliente' | 'feirante' | 'chef' | 'b2b' | 'admin';

export function resolveSignupRole(value?: string | null): SignupRole {
  const v = (value || '').toLowerCase().trim();
  if (v === 'feirante' || v === 'vendor') return 'feirante';
  if (v === 'chef') return 'chef';
  if (v === 'b2b' || v === 'atacadista' || v === 'wholesale') return 'b2b';
  if (v === 'admin') return 'admin';
  return 'cliente';
}

export type SignupMetadataInput = {
  role: SignupRole;
  fullName: string;
  phone?: string;
  businessName?: string;
  category?: string;
  cnpj?: string;
  companyName?: string;
  specialty?: string;
  portfolio?: string;
};

/** Metadata enviada ao Supabase Auth (trigger lê raw_user_meta_data). */
export function buildAuthMetadata(input: SignupMetadataInput): Record<string, string> {
  const data: Record<string, string> = {
    role: input.role,
    full_name: input.fullName,
  };
  if (input.phone) data.phone = input.phone;
  if (input.businessName) data.business_name = input.businessName;
  if (input.category) data.category = input.category;
  if (input.cnpj) data.cnpj = input.cnpj;
  if (input.companyName) data.company_name = input.companyName;
  if (input.specialty) data.specialty = input.specialty;
  if (input.portfolio) data.portfolio = input.portfolio;
  return data;
}

export type SyncProfilePayload = SignupMetadataInput & {
  email?: string;
};

/** Garante perfil (e banca do feirante) após signUp — funciona mesmo se o trigger SQL ainda não foi atualizado. */
export async function syncProfileAfterSignup(
  accessToken: string | undefined,
  payload: SyncProfilePayload,
): Promise<{ ok: boolean; error?: string }> {
  if (!accessToken) {
    return { ok: false, error: 'Sem sessão — confirme o e-mail e faça login.' };
  }

  try {
    const res = await fetch('/api/auth/sync-profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) {
      return { ok: false, error: data.error || 'Erro ao salvar perfil' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erro de conexão ao salvar perfil' };
  }
}
