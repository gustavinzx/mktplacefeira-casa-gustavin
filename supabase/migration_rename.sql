-- Script de Migração: Renomear Tabelas para mktplace_feira_prefix

ALTER TABLE IF EXISTS profiles RENAME TO mktplace_feira_profiles;
ALTER TABLE IF EXISTS fairs RENAME TO mktplace_feira_fairs;
ALTER TABLE IF EXISTS producers RENAME TO mktplace_feira_producers;
ALTER TABLE IF EXISTS categories RENAME TO mktplace_feira_categories;
ALTER TABLE IF EXISTS products RENAME TO mktplace_feira_products;
ALTER TABLE IF EXISTS recipes RENAME TO mktplace_feira_recipes;
ALTER TABLE IF EXISTS recipe_ingredients RENAME TO mktplace_feira_recipe_ingredients;
ALTER TABLE IF EXISTS addresses RENAME TO mktplace_feira_addresses;
ALTER TABLE IF EXISTS orders RENAME TO mktplace_feira_orders;
ALTER TABLE IF EXISTS order_items RENAME TO mktplace_feira_order_items;
ALTER TABLE IF EXISTS product_images RENAME TO mktplace_feira_product_images;
ALTER TABLE IF EXISTS coupons RENAME TO mktplace_feira_coupons;
ALTER TABLE IF EXISTS reviews RENAME TO mktplace_feira_reviews;
ALTER TABLE IF EXISTS banners RENAME TO mktplace_feira_banners;
ALTER TABLE IF EXISTS subscriptions RENAME TO mktplace_feira_subscriptions;
ALTER TABLE IF EXISTS return_requests RENAME TO mktplace_feira_return_requests;
ALTER TABLE IF EXISTS payment_methods RENAME TO mktplace_feira_payment_methods;
ALTER TABLE IF EXISTS support_tickets RENAME TO mktplace_feira_support_tickets;
ALTER TABLE IF EXISTS b2b_quotes RENAME TO mktplace_feira_b2b_quotes;
ALTER TABLE IF EXISTS wishlist RENAME TO mktplace_feira_wishlist;
ALTER TABLE IF EXISTS notifications RENAME TO mktplace_feira_notifications;

-- Nota: O PostgreSQL atualiza automaticamente as referências de chaves estrangeiras.
-- No entanto, as políticas RLS e Triggers precisam ser recriadas ou renomeadas se usarem o nome antigo.
-- Recomenda-se rodar o schema.sql atualizado após este script para garantir que as políticas e triggers estejam corretos.
