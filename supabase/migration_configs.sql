-- Migration: Expansão Total PicknGo 3.0 e Gestão de Tokens (CORRIGIDA)
-- Executar no Supabase SQL Editor

-- 1. Criar a tabela primeiro com TODAS as colunas necessárias
CREATE TABLE IF NOT EXISTS public.mktplace_feira_integration_configs (
  platform_id       TEXT        PRIMARY KEY, -- 'ifood', 'pickngo', 'rappi', etc.
  base_url          TEXT,
  global_headers    JSONB       DEFAULT '[]',
  requests          JSONB       DEFAULT '[]',
  auth_token        TEXT,
  token_expires_at  TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantir que as colunas de auth existam (para o caso da tabela já existir sem elas)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mktplace_feira_integration_configs' AND column_name='auth_token') THEN
    ALTER TABLE public.mktplace_feira_integration_configs ADD COLUMN auth_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mktplace_feira_integration_configs' AND column_name='token_expires_at') THEN
    ALTER TABLE public.mktplace_feira_integration_configs ADD COLUMN token_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Habilitar RLS e criar políticas
ALTER TABLE public.mktplace_feira_integration_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_integrations" ON public.mktplace_feira_integration_configs;
CREATE POLICY "allow_all_integrations" ON public.mktplace_feira_integration_configs
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Inserir/Atualizar configuração completa da PicknGo 3.0
INSERT INTO public.mktplace_feira_integration_configs (platform_id, base_url, global_headers, requests)
VALUES (
  'pickngo',
  'https://api.pickngo.com.br',
  '[
    {"name": "x-partner-id", "value": ""},
    {"name": "x-app-id", "value": ""},
    {"name": "x-app-key", "value": ""},
    {"name": "Content-Type", "value": "application/json"}
  ]'::jsonb,
  '[
    {
      "id": "auth",
      "name": "Autenticar (Gerar Token)",
      "method": "POST",
      "endpoint": "/api/autenticacao",
      "bodyTemplate": "{}"
    },
    {
      "id": "list-states",
      "name": "Listar Estados",
      "method": "POST",
      "endpoint": "/api/listarestados",
      "bodyTemplate": "{\"pagina\": {pagina}, \"paginacao\": {paginacao}}"
    },
    {
      "id": "list-cities",
      "name": "Listar Cidades",
      "method": "POST",
      "endpoint": "/api/listarcidades",
      "bodyTemplate": "{\"pagina\": {pagina}, \"paginacao\": {paginacao}, \"estadoID\": {estadoID}}"
    },
    {
      "id": "list-payment-methods",
      "name": "Listar Formas de Pagamento",
      "method": "POST",
      "endpoint": "/api/listarformaspagamento",
      "bodyTemplate": "{\"ordenacaoCampo\": 1, \"pagina\": 1, \"paginacao\": -1}"
    },
    {
      "id": "list-order",
      "name": "Consultar Pedido Único",
      "method": "POST",
      "endpoint": "/api/listarpedido/{pedidoID}",
      "bodyTemplate": "{}"
    },
    {
      "id": "list-orders",
      "name": "Listar Todos os Pedidos",
      "method": "POST",
      "endpoint": "/api/listarpedidos",
      "bodyTemplate": "{\"dataCorte\": \"{dataCorte}\", \"pagina\": {pagina}, \"paginacao\": {paginacao}}"
    },
    {
      "id": "get-quote",
      "name": "Solicitar Cotação Simples",
      "method": "POST",
      "endpoint": "/api/solicitarcotacao",
      "bodyTemplate": "{\"origemEndereco\": {origem}, \"entregaEndereco\": {entrega}}"
    },
    {
      "id": "get-route-quote",
      "name": "Solicitar Cotação de Rota",
      "method": "POST",
      "endpoint": "/api/cotarrota",
      "bodyTemplate": "{\"cobrarPorKmTotal\": {cobrarKm}, \"pedidos\": {pedidos}}"
    },
    {
      "id": "create-order",
      "name": "Criar Novo Pedido",
      "method": "POST",
      "endpoint": "/api/fazerpedido",
      "bodyTemplate": "{\"codigoExterno\": \"{ref}\", \"detalhes\": \"{detalhes}\", \"valor\": {valor}, \"clienteNome\": \"{nome}\", \"clienteTelefone\": \"{tel}\", \"formaPagamentoID\": \"{pagId}\", \"entregaEndereco\": {entrega}, \"origemEndereco\": {origem}}"
    },
    {
      "id": "create-route",
      "name": "Criar Nova Rota (Multi-pedidos)",
      "method": "POST",
      "endpoint": "/api/solicitarrota",
      "bodyTemplate": "{\"cobrarPorKmTotal\": {cobrarKm}, \"pedidos\": {pedidos}}"
    },
    {
      "id": "mark-ready",
      "name": "Marcar Pedido como Pronto",
      "method": "POST",
      "endpoint": "/api/marcarpronto",
      "bodyTemplate": "{\"PedidoID\": \"{pedidoID}\"}"
    },
    {
      "id": "cancel-order",
      "name": "Cancelar Pedido",
      "method": "POST",
      "endpoint": "/api/cancelar",
      "bodyTemplate": "{\"PedidoID\": \"{pedidoID}\"}"
    }
  ]'::jsonb
)
ON CONFLICT (platform_id) DO UPDATE SET
  requests = EXCLUDED.requests,
  global_headers = EXCLUDED.global_headers,
  base_url = EXCLUDED.base_url;
