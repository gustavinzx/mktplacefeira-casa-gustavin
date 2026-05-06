-- Script de Limpeza: Remover Tabelas Antigas (Sem Prefixo)

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS b2b_quotes CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS return_requests CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS producers CASCADE;
DROP TABLE IF EXISTS fairs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Nota: O CASCADE remove também as constraints e referências ligadas a estas tabelas.
-- Após rodar este script, você pode rodar o schema.sql para ter a estrutura limpa com o prefixo mktplace_feira_.
