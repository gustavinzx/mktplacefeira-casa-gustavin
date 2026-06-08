'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';

export default function CartSync() {
  const { items, clearCart, addItem } = useCartStore();
  const lastSyncItems = useRef(JSON.stringify(items));
  const isHydrating = useRef(true);

  // Carregar do Supabase ao logar
  useEffect(() => {
    async function loadCart() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        isHydrating.current = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mktplace_feira_carts')
          .select('items')
          .eq('user_id', session.user.id)
          .single();

        if (data && data.items) {
          // Apenas carrega se o carrinho local estiver vazio para não sobrescrever o que o usuário fez deslogado
          const localItems = useCartStore.getState().items;
          if (localItems.length === 0 && Array.isArray(data.items)) {
            data.items.forEach((item: any) => useCartStore.getState().addItem(item));
          } else if (localItems.length > 0) {
            // Se já tem itens locais, logo vamos dar o primeiro sync pra nuvem
          }
        }
      } catch (err) {
        console.error('Erro ao carregar carrinho da nuvem:', err);
      } finally {
        isHydrating.current = false;
      }
    }
    loadCart();
  }, []);

  // Salvar no Supabase a cada mudança
  useEffect(() => {
    async function syncCart() {
      if (isHydrating.current) return;
      
      const currentItemsStr = JSON.stringify(items);
      if (currentItemsStr === lastSyncItems.current) return;
      
      lastSyncItems.current = currentItemsStr;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        await supabase
          .from('mktplace_feira_carts')
          .upsert({
            user_id: session.user.id,
            items: items,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Erro ao sincronizar carrinho:', err);
      }
    }

    const timeoutId = setTimeout(syncCart, 1000); // Debounce de 1s
    return () => clearTimeout(timeoutId);
  }, [items]);

  return null;
}
