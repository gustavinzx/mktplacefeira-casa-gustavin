-- Migration: adiciona roles ausentes ao ENUM user_role
-- ATENÇÃO: Este script deve ser rodado ANTES de tentar cadastrar usuários com esses roles!
-- Execute no SQL Editor do Supabase (apenas uma vez)

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'delivery';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'logistica';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'franchisee';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'b2b';
