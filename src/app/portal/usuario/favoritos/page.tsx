'use client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import React from 'react';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

export default function FavoritosPage() {
  const { id: userId } = useCurrentUser();
  const [favorites, setFavorites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFavorites() {
      let productIds: string[] = [];
      if (userId) {
        const { data: favs } = await supabase
          .from('mktplace_feira_favorites')
          .select('product_id')
          .eq('user_id', userId);
        if (favs) {
          productIds = favs.map(f => f.product_id);
        }
      } else {
        productIds = JSON.parse(localStorage.getItem('feira_favorites') || '[]');
      }

      if (productIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: products } = await supabase
        .from('mktplace_feira_products')
        .select(`
          id, title, price, unit, image_url, is_organic,
          producer:mktplace_feira_producers(stall_name)
        `)
        .in('id', productIds);

      if (products) {
        const mapped = products.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          unit: p.unit,
          imageUrl: p.image_url || '/images/tomato.png',
          producer: p.producer?.stall_name || 'Produtor Local',
          isOrganic: p.is_organic,
        }));
        setFavorites(mapped);
      }
      setLoading(false);
    }
    
    fetchFavorites();
  }, []);

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Heart className="text-red-500 fill-red-500" size={30} />
          Lista de Desejos
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Os produtos que você mais gosta, salvos para comprar depois.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Carregando favoritos...</div>
      ) : favorites.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' }}>
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Você ainda não tem favoritos</h2>
          <p className="text-gray-500 mt-2">Navegue pelas ofertas e adicione os produtos que você mais gosta.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {favorites.map((produto) => (
            <ProductCard key={produto.id} {...produto} />
          ))}
        </div>
      )}
    </div>
  );
}
