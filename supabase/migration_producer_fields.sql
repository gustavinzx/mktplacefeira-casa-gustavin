-- Migration: adiciona colunas status e document em mktplace_feira_producers
-- Execute no SQL Editor do Supabase (apenas uma vez)
ALTER TABLE mktplace_feira_producers
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS document TEXT;
