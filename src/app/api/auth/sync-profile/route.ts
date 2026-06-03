import {
  createSupabaseAdmin,
  getAuthUser,
  TABLE,
  ok,
  err,
} from '@/lib/supabase-server';
import { resolveSignupRole, type SyncProfilePayload } from '@/lib/signup';

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  let body: SyncProfilePayload;
  try {
    body = await request.json();
  } catch {
    return err('JSON inválido', 400);
  }

  const role = resolveSignupRole(body.role);
  const admin = createSupabaseAdmin();

  const profileRow: Record<string, unknown> = {
    id: user.id,
    email: body.email || user.email || '',
    full_name: body.fullName || '',
    role,
    phone: body.phone || null,
    updated_at: new Date().toISOString(),
  };

  if (body.companyName) profileRow.company_name = body.companyName;
  if (body.cnpj) profileRow.cnpj = body.cnpj;

  const { error: profileError } = await admin
    .from(TABLE.profiles)
    .upsert(profileRow, { onConflict: 'id' });

  if (profileError) {
    const msg = profileError.message || '';
    if (msg.includes('company_name') || msg.includes('cnpj')) {
      delete profileRow.company_name;
      delete profileRow.cnpj;
      const { error: retryError } = await admin
        .from(TABLE.profiles)
        .upsert(profileRow, { onConflict: 'id' });
      if (retryError) return err(retryError.message, 400);
    } else {
      return err(profileError.message, 400);
    }
  }

  if (role === 'feirante') {
    const stallName = body.businessName?.trim() || 'Minha Banca';
    const { error: producerError } = await admin.from(TABLE.producers).upsert(
      {
        id: user.id,
        stall_name: stallName,
        bio: body.category || null,
        is_verified: false,
        rating: 5.0,
      },
      { onConflict: 'id' },
    );
    if (producerError) return err(producerError.message, 400);
  }

  return ok({ role, id: user.id });
}
