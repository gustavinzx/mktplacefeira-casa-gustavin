-- Execute DEPOIS do script principal, no SQL Editor do Supabase
-- 1) Substitua SEU_USER_ID pelo UUID do usuário em Authentication → Users

-- Cupom de teste (carrinho)
INSERT INTO mktplace_feira_coupons (code, description, discount_type, value, min_purchase, active)
VALUES ('PRIMEIRAFEIRA', 'Desconto de boas-vindas', 'fixed', 10.00, 0, true)
ON CONFLICT (code) DO NOTHING;

-- Endereço padrão para o usuário logado (checkout)
-- Troque SEU_USER_ID pelo id do usuário que vai comprar (role cliente)
/*
INSERT INTO mktplace_feira_addresses (user_id, street, number, neighborhood, city, state, zip_code, is_default)
VALUES (
  'SEU_USER_ID',
  'Rua das Orquídeas', '123', 'Vila Mariana', 'São Paulo', 'SP', '04101-000', true
);
*/
