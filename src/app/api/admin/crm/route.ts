import { createSupabaseAdmin, getAuthUser, TABLE, ok, err } from '@/lib/supabase-server';

const LEADS = 'mktplace_feira_crm_leads';
const INTERACTIONS = 'mktplace_feira_crm_interactions';

async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from(TABLE.profiles).select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

// GET — lista leads com suas interações
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from(LEADS)
    .select(`*, history:${INTERACTIONS}(id, action, channel, created_at)`)
    .order('created_at', { ascending: false });
  if (error) return err(error.message);
  return ok(data ?? []);
}

// POST — cria novo lead
export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const body = await request.json();
  if (!body.name) return err('name é obrigatório', 400);

  const admin = createSupabaseAdmin();
  const { firstAction, firstChannel, ...leadData } = body;

  const { data: lead, error } = await admin
    .from(LEADS)
    .insert({ ...leadData, stage: leadData.stage || 'novo' })
    .select()
    .single();

  if (error) return err(error.message);

  // Se veio uma primeira interação, salva junto
  if (firstAction?.trim()) {
    await admin.from(INTERACTIONS).insert({
      lead_id: lead.id,
      action: firstAction,
      channel: firstChannel || 'note',
    });
  }

  return ok(lead, 201);
}

// PATCH — atualiza lead (stage, nextContact, etc)
export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return err('Sem permissão', 403);
  const { id, newInteraction, ...fields } = await request.json();
  if (!id) return err('id é obrigatório', 400);

  const admin = createSupabaseAdmin();

  // Atualiza o lead
  if (Object.keys(fields).length > 0) {
    await admin.from(LEADS).update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
  }

  // Se veio nova interação, salva no banco
  if (newInteraction?.action?.trim()) {
    await admin.from(INTERACTIONS).insert({
      lead_id: id,
      action: newInteraction.action,
      channel: newInteraction.channel || 'note',
    });
  }

  // Retorna lead atualizado com histórico
  const { data, error } = await admin
    .from(LEADS)
    .select(`*, history:${INTERACTIONS}(id, action, channel, created_at)`)
    .eq('id', id)
    .single();

  if (error) return err(error.message);
  return ok(data);
}
