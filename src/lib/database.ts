import { supabase, supabaseAdmin, supabasePublic, getTableName } from './supabase';

/**
 * REGRA DE OURO - PERSISTÊNCIA FEIRA.CASA:
 * 1. Toda inserção de dados DEVE usar UPSERT (PostgreSQL).
 * 2. Se o dado não existe, é criado. Se existe, é atualizado (Override).
 * 3. As tabelas devem possuir restrições UNIQUE para garantir a integridade do conflito.
 * 4. O prefixo 'mktplace_feira_' é obrigatório em todas as tabelas (gerido automaticamente).
 * 
 * @param tableName Nome da tabela (sem o prefixo mktplace_feira_)
 * @param data Objeto com os dados a serem inseridos ou atualizados
 * @param conflictColumn A coluna que define a unicidade para o conflito (ex: 'id', 'email' ou 'cidade,estado')
 */
export async function upsertData(tableName: string, data: any, conflictColumn: string = 'id') {
  try {
    const { data: result, error } = await supabase
      .from(getTableName(tableName))
      .upsert(data, { onConflict: conflictColumn })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[Database Utils] Erro no upsert na tabela ${tableName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sincroniza o perfil do usuário na tabela de profiles.
 * Útil para chamadas após o SignUp ou alteração de dados cadastrais.
 */
export async function syncUserProfile(profileData: {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  user_type: string;
  [key: string]: any;
}) {
  return await upsertData('profiles', profileData, 'id');
}

/**
 * Sincroniza ou cria um registro administrativo.
 */
export async function syncAdminRecord(adminData: {
  email: string;
  full_name: string;
  department: string;
  job_role: string;
  access_level: string;
  role_id?: string;
  [key: string]: any;
}) {
  return await upsertData('admins', adminData, 'email');
}

/**
 * Sincroniza (upsert) um papel/perfil de acesso.
 * Usa supabaseAdmin para bypassar RLS — operação exclusiva do painel admin.
 */
export async function syncRole(roleData: {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  permissions?: any;
  is_active?: boolean;
}) {
  try {
    const { data: result, error } = await (supabaseAdmin || supabase)
      .from(getTableName('roles'))
      .upsert(roleData, { onConflict: 'name' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Database] Erro ao salvar role:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Busca todos os papéis de acesso cadastrados.
 * Usa supabaseAdmin para garantir leitura mesmo sem perfil admin configurado.
 */
export async function fetchRoles() {
  const { data, error } = await (supabaseAdmin || supabase)
    .from(getTableName('roles'))
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[Database] Erro ao buscar roles:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Registra um log de auditoria.
 * Usa supabaseAdmin para não depender de RLS no INSERT.
 */
export async function logAudit(logData: {
  user_id: string;
  action: string;
  module: string;
  details?: any;
  ip_address?: string;
}) {
  let finalUserId = logData.user_id;
  if (finalUserId === 'SYSTEM') {
    finalUserId = null as any;
    logData.details = { ...logData.details, actor: 'SYSTEM' };
  }

  const { error } = await (supabaseAdmin || supabase)
    .from(getTableName('audit_logs'))
    .insert({ ...logData, user_id: finalUserId });

  if (error) {
    console.error('[Database] Erro ao registrar log de auditoria:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Busca os logs de auditoria.
 */
export async function fetchAuditLogs(limit = 100) {
  // Try joining with profiles table. Note that the foreign key might be missing,
  // but if the join fails, it will just return the logs without profiles.
  const { data, error } = await (supabaseAdmin || supabase)
    .from(getTableName('audit_logs'))
    .select(`
      *,
      profiles:mktplace_feira_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Database] Erro ao buscar logs de auditoria:', error.message);
    // Fallback: try fetching without the join if the join fails due to relationship error
    const { data: fallbackData } = await (supabaseAdmin || supabase)
      .from(getTableName('audit_logs'))
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return fallbackData ?? [];
  }
  return data ?? [];
}

/**
 * Registra ou atualiza dados de verificação/KYC.
 */
export async function syncVerificationData(userId: string, verificationType: string, status: string, details: any = {}) {
  return await upsertData('verifications', {
    user_id: userId,
    type: verificationType,
    status: status,
    details: details,
    updated_at: new Date().toISOString()
  }, 'user_id');
}

export interface DeliveryZone {
  id?: string;
  cidade: string;
  estado: string;
  cep: string;
  tipos_frete: string[];
  parceiro: string;
  status?: string;
  rain_tax?: number;
  weekend_tax?: number;
  fairs?: any[];
  distance_tiers?: any[];
  fleet?: any[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Upsert de zona de entrega — conflict em (cidade, estado).
 * Cria a zona se não existir; atualiza se já houver uma com mesma cidade+estado.
 */
export async function syncDeliveryZone(zone: DeliveryZone) {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('delivery_zones'))
      .upsert(
        { ...zone, updated_at: new Date().toISOString() },
        { onConflict: 'cidade,estado' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as DeliveryZone };
  } catch (error: any) {
    console.error('[Database] Erro ao salvar delivery_zone:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Busca todas as zonas de entrega ativas.
 */
export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  const { data, error } = await (supabaseAdmin || supabase)
    .from(getTableName('delivery_zones'))
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Erro ao buscar delivery_zones:', error.message);
    return [];
  }
  return (data ?? []) as DeliveryZone[];
}

/**
 * Busca a zona de entrega de uma cidade/estado.
 */
export async function fetchDeliveryZoneByCity(city: string, state: string) {
  try {
    const { data } = await (supabaseAdmin || supabase)
      .from(getTableName('delivery_zones'))
      .select('id, cidade, estado')
      .ilike('cidade', city)
      .ilike('estado', state)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Busca todas as feiras de uma cidade/estado, com JOIN na zona de entrega.
 * Aceita opcionalmente um delivery_zone_id para busca direta (mais eficiente).
 */
export async function fetchFairsByCity(city: string, state: string, deliveryZoneId?: string) {
  try {
    let query = (supabaseAdmin || supabase)
      .from(getTableName('fairs'))
      .select('*')
      .order('name');

    if (deliveryZoneId) {
      query = query.eq('delivery_zone_id', deliveryZoneId);
    } else {
      query = query.ilike('city', city).ilike('state', state);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('[Database] Erro ao buscar feiras por cidade:', error.message);
    return [];
  }
}

/**
 * Sincroniza uma feira individual.
 * Vincula automaticamente à zona de entrega via delivery_zone_id.
 */
export async function syncFair(fair: any) {
  try {
    // Resolve delivery_zone_id from city+state if not provided
    let deliveryZoneId = fair.delivery_zone_id || null;
    if (!deliveryZoneId && (fair.city || fair.cidade)) {
      const city  = fair.city  || fair.cidade || '';
      const state = fair.state || fair.uf     || fair.estado || '';
      const zone  = await fetchDeliveryZoneByCity(city, state);
      deliveryZoneId = zone?.id ?? null;
    }

    const dbFair = {
      id: fair.id && typeof fair.id === 'string' && fair.id.length > 20 ? fair.id : undefined,
      name: fair.name,
      location: fair.neighborhood || fair.city || fair.cidade || fair.name,
      city: fair.city || fair.cidade,
      state: fair.state || fair.uf || fair.estado,
      address: fair.address,
      neighborhood: fair.neighborhood,
      cep: fair.cep,
      latitude: fair.latitude ? Number(fair.latitude) : null,
      longitude: fair.longitude ? Number(fair.longitude) : null,
      operating_days: fair.days || fair.operating_days || [],
      operating_hours: fair.hours
        ? (typeof fair.hours === 'string' ? fair.hours : JSON.stringify(fair.hours))
        : (fair.operating_hours || '07:00 - 13:00'),
      image_url: fair.imageUrl || fair.image_url,
      type: fair.type,
      modality: fair.modality,
      periodicity: fair.periodicity,
      how_to_get_there: fair.howToGetThere || fair.how_to_get_there,
      history: fair.history,
      complement: fair.complement,
      status: fair.status,
      is_active: fair.status === 'Ativo' || fair.is_active !== false,
      delivery_zone_id: deliveryZoneId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('fairs'))
      .upsert(dbFair, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Database] Erro ao sincronizar feira:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta uma feira por ID.
 */
export async function deleteFair(id: string) {
  try {
    const { error } = await (supabaseAdmin || supabase)
      .from(getTableName('fairs'))
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('[Database] Erro ao deletar feira:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Upsert avançado para configuração logística completa por cidade.
 * SQL Recomendado:
 * CREATE TABLE IF NOT EXISTS mktplace_feira_logistics_configs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   cidade TEXT NOT NULL,
 *   estado TEXT NOT NULL,
 *   cep TEXT,
 *   rain_tax NUMERIC DEFAULT 0,
 *   weekend_tax NUMERIC DEFAULT 0,
 *   fairs JSONB DEFAULT '[]',
 *   distance_tiers JSONB DEFAULT '[]',
 *   fleet JSONB DEFAULT '[]',
 *   updated_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(cidade, estado)
 * );
 */
export async function syncLogisticsConfig(config: any) {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_configs'))
      .upsert(
        {
          cidade: config.city,
          estado: config.uf,
          cep: config.cep,
          rain_tax: config.rainTax,
          weekend_tax: config.weekendTax,
          fairs: config.fairs,
          distance_tiers: config.distanceTiers,
          fleet: config.fleet,
          freight_config: {
            fixedFreightValue: config.fixedFreightValue ?? 15,
            freeAbove: config.freeAbove ?? 0,
            minOrderAtacado: config.minOrderAtacado ?? 500,
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: 'cidade,estado' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove uma configuração logística completa.
 */
export async function deleteLogisticsConfig(cidade: string, estado: string) {
  try {
    const { error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_configs'))
      .delete()
      .match({ cidade, estado });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('[Database] Erro ao deletar logistics_config:', error.message);
    return { success: false, error: error.message };
  }
}

export interface LogisticsTag {
  id?: string;
  name: string;
  group_type: 'tipo_feira' | 'modalidade' | 'periodicidade';
  color?: string;
  created_at?: string;
}

/**
 * Busca todas as tags de logística.
 */
export async function fetchLogisticsTags(): Promise<LogisticsTag[]> {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_tags'))
      .select('*')
      .order('group_type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []) as LogisticsTag[];
  } catch (error: any) {
    console.error('[Database] Erro ao buscar logistics_tags:', error.message);
    return [];
  }
}

/**
 * Sincroniza (upsert) uma tag de logística.
 */
export async function syncLogisticsTag(tag: LogisticsTag) {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_tags'))
      .upsert(
        {
          id: tag.id || undefined,
          name: tag.name,
          group_type: tag.group_type,
          color: tag.color || '#125d30'
        },
        { onConflict: 'name,group_type' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as LogisticsTag };
  } catch (error: any) {
    console.error('[Database] Erro ao salvar logistics_tag:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta uma tag de logística por id.
 */
export async function deleteLogisticsTag(id: string) {
  try {
    const { error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_tags'))
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('[Database] Erro ao deletar logistics_tag:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sincroniza as configurações globais do motor logístico.
 * Usa um registro especial com cidade = '___MOTOR___' e estado = 'GLOBAL'.
 */
export async function syncEngineConfig(config: { defaultRadius: number; dispatchPriority: string; smartRerouting: boolean }) {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_configs'))
      .upsert(
        { 
          cidade: '___MOTOR___', 
          estado: 'GLOBAL',
          rain_tax: config.defaultRadius,
          cep: config.dispatchPriority,
          fairs: [{ smartRerouting: config.smartRerouting }],
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'cidade,estado' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Busca as configurações globais do motor logístico.
 */
export async function fetchEngineConfig() {
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from(getTableName('logistics_configs'))
      .select('*')
      .eq('cidade', '___MOTOR___')
      .eq('estado', 'GLOBAL')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Registro não encontrado
        return {
          defaultRadius: 24,
          dispatchPriority: 'Menor Tempo (ETA)',
          smartRerouting: true
        };
      }
      throw error;
    }

    const smartRerouting = data.fairs?.[0]?.smartRerouting !== false;
    return {
      defaultRadius: Number(data.rain_tax ?? 24),
      dispatchPriority: data.cep ?? 'Menor Tempo (ETA)',
      smartRerouting
    };
  } catch (error: any) {
    console.error('[Database] Erro ao buscar engine config:', error.message);
    return {
      defaultRadius: 24,
      dispatchPriority: 'Menor Tempo (ETA)',
      smartRerouting: true
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteSetting {
  id?: string;
  key: string;
  value?: string | null;
  value_json?: any;
  label?: string;
  group_name?: string;
  input_type?: string;
  sort_order?: number;
  updated_at?: string;
}

/**
 * Busca todas as configurações do site.
 * Retorna um objeto { [key]: value } para fácil acesso.
 */
export async function fetchSiteSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabasePublic
      .from(getTableName('site_settings'))
      .select('key, value')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const settings: Record<string, string> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value ?? '';
    }
    return settings;
  } catch (error: any) {
    console.error('[Database] Erro ao buscar site_settings:', error.message);
    return {};
  }
}

/**
 * Salva múltiplas configurações do site de uma vez.
 * Usa supabaseAdmin para bypassar RLS na escrita.
 */
export async function syncSiteSettings(settings: Record<string, string>) {
  try {
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await (supabaseAdmin || supabase)
      .from(getTableName('site_settings'))
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('[Database] Erro ao salvar site_settings:', error.message);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM LEADS
// ─────────────────────────────────────────────────────────────────────────────

export interface CRMLead {
  id?: string;
  type: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  category?: string;
  source?: string;
  stage?: string; // Mapped to 'status'
  score?: number; // Mapped to 'value'
  metadata?: any; // Additional fields (e.g. cnh, raioKm, etc)
  history?: any[];
  created_at?: string;
  updated_at?: string;
}

export async function fetchCRMLeads(type?: string): Promise<CRMLead[]> {
  try {
    let query = (supabaseAdmin || supabase)
      .from('mktplace_feira_crm_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map((d: any) => ({
      id: d.id,
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone,
      stage: d.status,
      score: Number(d.value || 0),
      city: d.metadata?.city || '',
      category: d.metadata?.category || '',
      source: d.metadata?.source || '',
      metadata: d.metadata || {},
      history: d.history,
      created_at: d.created_at,
      updated_at: d.last_contact
    }));
  } catch (error: any) {
    console.error('[Database] Erro ao buscar CRM Leads:', error.message);
    return [];
  }
}

export async function syncCRMLead(lead: CRMLead) {
  try {
    const dbLead = {
      ...(lead.id ? { id: lead.id } : {}),
      type: lead.type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.stage || 'Novo',
      value: lead.score || 0,
      metadata: { city: lead.city, category: lead.category, source: lead.source, ...(lead.metadata || {}) },
      history: lead.history || [],
      last_contact: new Date().toISOString()
    };

    const { data, error } = await (supabaseAdmin || supabase)
      .from('mktplace_feira_crm_leads')
      .upsert(dbLead, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: { ...lead, id: data.id } };
  } catch (error: any) {
    console.error('[Database] Erro ao salvar CRM Lead:', error.message);
    return { success: false, error: error.message };
  }
}
