-- ========================================================================================
-- SCRIPT DE APLICAÇÃO DE ROW LEVEL SECURITY (RLS) - FEIRA.CASA
-- Rode este script no Editor SQL do seu painel Supabase.
-- ========================================================================================

-- ATIVAR RLS NAS TABELAS PRINCIPAIS
ALTER TABLE mktplace_feira_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktplace_feira_site_settings ENABLE ROW LEVEL SECURITY;

-- (Opcional) Limpar políticas antigas se estiver rodando o script novamente
-- DROP POLICY IF EXISTS ... ON mktplace_feira_profiles;

-- ========================================================================================
-- 1. TABELA PROFILES
-- ========================================================================================

-- Policy: Leitura - O usuário pode ler o próprio perfil
CREATE POLICY "Leitura do proprio perfil" 
ON mktplace_feira_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admin Leitura Global - Admins podem ler tudo
-- (Nota: Para não causar loop infinito, o ideal é checar um campo jwt no JWT, 
--  mas se for via supabase-admin (Service Role Key), ele já bypasseia o RLS automaticamente.)

-- Policy: Atualização - O usuário pode atualizar o próprio perfil
CREATE POLICY "Atualizacao do proprio perfil" 
ON mktplace_feira_profiles FOR UPDATE 
USING (auth.uid() = id);


-- ========================================================================================
-- 2. TABELA SITE_SETTINGS
-- ========================================================================================

-- Policy: Leitura Pública - Qualquer um pode ler as configurações do site
CREATE POLICY "Qualquer pessoa le settings" 
ON mktplace_feira_site_settings FOR SELECT 
USING (true);

-- Policy: Escrita é restrita. O service role admin vai bypassar isso de qualquer forma, 
-- então não precisamos criar policy pública de INSERT/UPDATE.


-- ========================================================================================
-- 3. TABELA PRODUCTS
-- ========================================================================================

-- Policy: Leitura Pública - Qualquer um (logado ou não) pode ler os produtos
CREATE POLICY "Qualquer pessoa le produtos" 
ON mktplace_feira_products FOR SELECT 
USING (true);

-- Policy: Inserção/Atualização - O dono do produto (feirante/produtor) pode gerenciar seus produtos
CREATE POLICY "Produtor gerencia os proprios produtos" 
ON mktplace_feira_products FOR ALL 
USING (auth.uid() = producer_id);


-- ========================================================================================
-- 4. TABELA FAIRS (Feiras)
-- ========================================================================================

-- Policy: Leitura Pública - Qualquer um pode ver as feiras
CREATE POLICY "Qualquer pessoa le feiras" 
ON mktplace_feira_fairs FOR SELECT 
USING (true);


-- ========================================================================================
-- 5. TABELA ORDERS (Pedidos)
-- ========================================================================================

-- Policy: Leitura Comprador - Usuário pode ver os próprios pedidos
CREATE POLICY "Usuario le os proprios pedidos" 
ON mktplace_feira_orders FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Inserção Comprador - Usuário pode fazer pedido para si mesmo
CREATE POLICY "Usuario insere os proprios pedidos" 
ON mktplace_feira_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Leitura Vendedor (Feirante/Chef) - Ver pedidos atrelados ao seu producer_id
CREATE POLICY "Vendedor le pedidos direcionados a ele" 
ON mktplace_feira_orders FOR SELECT 
USING (auth.uid() = producer_id);

-- Policy: Atualização Vendedor - Mudar status do pedido
CREATE POLICY "Vendedor altera pedidos direcionados a ele" 
ON mktplace_feira_orders FOR UPDATE 
USING (auth.uid() = producer_id);


-- ========================================================================================
-- 6. TABELA CHATS (Mensageria In-App)
-- ========================================================================================

-- (Se existir a tabela de chats, caso não, ela será ignorada se você não rodar esse bloco)
-- ALTER TABLE mktplace_feira_chats ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Comprador ou Vendedor acessam seus chats" 
-- ON mktplace_feira_chats FOR ALL 
-- USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);


-- ========================================================================================
-- MENSAGEM FINAL:
-- 1. O painel administrativo usando a "Service Role Key" sempre tem acesso total a tudo
--    independente das políticas acima.
-- 2. Isso bloqueia leituras não autorizadas do cliente usando a "Anon Key".
-- ========================================================================================
