import { supabase } from './supabase';

export interface IntegrationConfig {
  platform_id: string;
  base_url: string;
  global_headers: { name: string; value: string }[];
  auth_token?: string;
  token_expires_at?: string;
  requests: {
    id: string;
    name: string;
    method: string;
    endpoint: string;
    bodyTemplate: string;
  }[];
}

/**
 * Busca a configuração de integração de uma plataforma específica.
 */
export async function getIntegrationConfig(platformId: string): Promise<IntegrationConfig | null> {
  const { data, error } = await supabase
    .from('mktplace_feira_integration_configs')
    .select('*')
    .eq('platform_id', platformId)
    .single();

  if (error) {
    console.error(`[Logistics] Erro ao buscar config para ${platformId}:`, error.message);
    return null;
  }

  return data as IntegrationConfig;
}

/**
 * Gerencia a autenticação e renovação automática de tokens.
 */
async function ensureValidToken(config: IntegrationConfig): Promise<string | null> {
  const now = new Date();
  
  // Se já temos um token e ele é válido por mais 30 minutos, usamos ele
  if (config.auth_token && config.token_expires_at) {
    const expiresAt = new Date(config.token_expires_at);
    const bufferTime = 30 * 60 * 1000; // 30 min
    if (expiresAt.getTime() > now.getTime() + bufferTime) {
      return config.auth_token;
    }
  }

  console.log(`[Logistics] Renovando token para ${config.platform_id}...`);
  
  const authReq = config.requests.find(r => r.id === 'auth');
  if (!authReq) return null;

  let url = authReq.endpoint.startsWith('http') ? authReq.endpoint : `${config.base_url}${authReq.endpoint}`;
  let headers: Record<string, string> = {};
  let body: any = null;

  // Montar headers globais
  config.global_headers.forEach(h => {
    if (h.name && h.value) headers[h.name] = h.value;
  });

  if (config.platform_id === 'ifood') {
    const client_id = config.global_headers.find(h => h.name === 'client_id')?.value || '';
    const client_secret = config.global_headers.find(h => h.name === 'client_secret')?.value || '';

    body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', client_id);
    body.append('client_secret', client_secret);
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (config.platform_id === 'ubereats') {
    // Uber Eats usa multipart/form-data conforme Developer Dashboard (-F flag)
    const client_id = config.global_headers.find(h => h.name === 'client_id')?.value || '';
    const client_secret = config.global_headers.find(h => h.name === 'client_secret')?.value || '';

    const form = new FormData();
    form.append('client_id', client_id);
    form.append('client_secret', client_secret);
    form.append('grant_type', 'client_credentials');
    form.append('scope', 'eats.store eats.order');
    body = form;
    // Content-Type é definido automaticamente com boundary pelo browser/fetch
  } else if (config.platform_id === 'rappi') {
    // Rappi usa JSON para o token (Auth0)
    const client_id = config.global_headers.find(h => h.name === 'client_id')?.value || '';
    const client_secret = config.global_headers.find(h => h.name === 'client_secret')?.value || '';
    const audience = config.global_headers.find(h => h.name === 'audience')?.value || 'https://int-public-api-v2/api';
    
    body = JSON.stringify({
      client_id,
      client_secret,
      audience,
      grant_type: 'client_credentials'
    });
    headers['Content-Type'] = 'application/json';
  } else {
    // PicknGo ou outros
    body = '{}';
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method: authReq.method,
      headers: headers,
      body: body
    });

    const result = await response.json();
    
    // Sucesso PicknGo
    if (result.sucesso && result.token) {
      const expiresInMin = result.expiracao_minutos || 1440;
      const expiresAt = new Date(now.getTime() + expiresInMin * 60000);
      await saveToken(config.platform_id, result.token, expiresAt);
      return result.token;
    }
    
    // Sucesso iFood / Uber Eats / Rappi
    const accessToken = result.accessToken || result.access_token;
    if (accessToken) {
      const expiresIn = result.expiresIn || result.expires_in || 3600;
      const expiresAt = new Date(now.getTime() + expiresIn * 1000);
      await saveToken(config.platform_id, accessToken, expiresAt);
      return accessToken;
    }
  } catch (error: any) {
    console.error(`[Logistics] Erro na autenticação ${config.platform_id}:`, error.message);
  }

  return null;
}

async function saveToken(platformId: string, token: string, expiresAt: Date) {
  await supabase
    .from('mktplace_feira_integration_configs')
    .update({
      auth_token: token,
      token_expires_at: expiresAt.toISOString()
    })
    .eq('platform_id', platformId);
}

/**
 * Executa uma requisição para uma plataforma logística externa.
 */
export async function callIntegrationApi(platformId: string, requestId: string, params: Record<string, any> = {}) {
  const config = await getIntegrationConfig(platformId);
  if (!config) throw new Error(`Configuração não encontrada para a plataforma: ${platformId}`);

  const request = config.requests.find(r => r.id === requestId);
  if (!request) throw new Error(`Requisição ${requestId} não configurada para a plataforma ${platformId}`);

  // Gerenciar Token se não for a chamada de auth
  let authToken: string | null = null;
  if (requestId !== 'auth') {
    authToken = await ensureValidToken(config);
  }

  // Substituir parâmetros no endpoint e body
  let endpoint = request.endpoint;
  let body = request.bodyTemplate;

  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    endpoint = endpoint.split(placeholder).join(replacement);
    if (body) {
      body = body.split(placeholder).join(replacement);
    }
  });

  const url = `${config.base_url}${endpoint}`;
  
  // Montar headers
  const headers: Record<string, string> = {};
  config.global_headers.forEach(h => {
    // Filtrar credenciais de auth dos headers de chamadas normais
    const authKeys = ['client_id', 'client_secret', 'audience'];
    if (!authKeys.includes(h.name) && h.name && h.value) {
      headers[h.name] = h.value;
    }
  });

  // Adicionar token conforme o padrão da plataforma
  if (authToken) {
    if (platformId === 'ifood' || platformId === 'ubereats') {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else if (platformId === 'rappi') {
      headers['x-authorization'] = `bearer ${authToken}`;
    } else if (platformId === 'pickngo') {
      headers['x-app-token'] = authToken;
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && body ? body : undefined
    });

    const data = await response.json();
    
    // Normalizar sucesso
    const isSuccess = response.ok && (data.sucesso !== false);
    
    return { success: isSuccess, data };
  } catch (error: any) {
    console.error(`[Logistics] Erro na chamada API (${platformId}/${requestId}):`, error.message);
    return { success: false, error: error.message };
  }
}
