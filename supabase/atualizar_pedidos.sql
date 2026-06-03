-- 1. Adicionando o vínculo com o produtor (Feirante) em cada pedido
ALTER TABLE mktplace_feira_orders 
ADD COLUMN IF NOT EXISTS producer_id UUID REFERENCES mktplace_feira_producers(id) ON DELETE CASCADE;

-- 2. Atualizando as políticas de segurança (RLS) para o Feirante ver as suas vendas
CREATE POLICY "Feirantes veem seus proprios pedidos" 
ON mktplace_feira_orders FOR SELECT 
USING (producer_id = auth.uid());

CREATE POLICY "Feirantes atualizam status de seus pedidos" 
ON mktplace_feira_orders FOR UPDATE 
USING (producer_id = auth.uid());
