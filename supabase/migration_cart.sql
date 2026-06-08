-- Migration: cria a tabela mktplace_feira_carts para futura sincronização de carrinhos
-- Execute no SQL Editor do Supabase (apenas uma vez)

CREATE TABLE IF NOT EXISTS mktplace_feira_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.mktplace_feira_profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mktplace_feira_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam seus próprios carrinhos" ON public.mktplace_feira_carts;
CREATE POLICY "Usuários gerenciam seus próprios carrinhos" 
ON public.mktplace_feira_carts FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
