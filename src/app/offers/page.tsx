'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  Flame, Leaf, Clock, ShoppingCart, Star, Filter, Search,
  Percent, Timer, ArrowRight, ChevronRight
} from 'lucide-react';

const categories = ['Todos', 'Hortifruti', 'Frutas', 'Verduras', 'Empório', 'Laticínios', 'Ovos', 'Padaria', 'Cestas'];

function Countdown() {
  const [time, setTime] = useState({ days: 2, hours: 14, minutes: 45, seconds: 12 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex gap-3">
      {[{ v: time.days, l: 'Dias' }, { v: time.hours, l: 'Hrs' }, { v: time.minutes, l: 'Min' }, { v: time.seconds, l: 'Seg' }].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center bg-white/15 backdrop-blur-md rounded-2xl p-3 min-w-[64px] border border-white/20">
          <span className="text-2xl font-black leading-none">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function OfertasSemanaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?promotion=true&limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.products) {
          setProducts(data.data.products.map((p: any) => {
            const salePrice = Number(p.price);
            const originalPrice = p.old_price ? Number(p.old_price) : salePrice;
            const discount = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
            return {
              id: p.id,
              name: p.title,
              vendor: p.producer?.stall_name || 'Produtor Local',
              original: originalPrice,
              sale: salePrice,
              discount: discount,
              image: p.image_url || '/images/tomato.png',
              category: p.category?.name || 'Hortifruti',
              badge: p.is_organic ? 'Orgânico' : null,
              rating: 4.8 + (Math.random() * 0.2),
              reviews: Math.floor(Math.random() * 200) + 10,
              unit: p.unit
            };
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#faf9f4]">
      <Header />
      <main className="pt-20">

        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-[#125d30] text-white py-14 md:py-20">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1600&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="max-w-screen-xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fc6c29] text-white font-black text-[11px] uppercase tracking-widest mb-6 shadow-lg">
                <Flame size={14} />
                EVENTO EXCLUSIVO
              </span>
              <h1 className="text-[48px] md:text-[64px] font-black leading-none tracking-tight mb-4">
                Semana Verde<br />feira.casa
              </h1>
              <p className="text-white/80 text-lg font-medium mb-8 leading-relaxed max-w-lg">
                O frescor direto do campo com descontos imperdíveis. Apoie o produtor local e garanta saúde na sua mesa por muito menos.
              </p>
              <Countdown />
            </div>
            <div className="hidden lg:block relative">
              <div className="w-72 h-72 bg-white/10 rounded-full blur-3xl absolute -inset-4"></div>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
                className="relative z-10 w-72 h-72 object-cover rounded-3xl rotate-3 shadow-2xl"
                alt="Cesta de orgânicos"
              />
              <div className="absolute -top-4 -right-4 bg-[#fc6c29] text-white font-black text-2xl w-20 h-20 rounded-full flex items-center justify-center shadow-xl rotate-12 z-20">
                -38%
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-screen-xl mx-auto px-6 py-4 flex gap-8 overflow-x-auto">
            {[
              { icon: Percent, label: 'Até 40% OFF', sub: 'em centenas de produtos' },
              { icon: Leaf, label: '100% Orgânicos', sub: 'do produtor direto' },
              { icon: Clock, label: 'Entrega no dia', sub: 'colhido na manhã' },
              { icon: Star, label: '4.9 ★ média', sub: '12k avaliações' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 py-10">

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Buscar nas ofertas..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[24px] outline-none font-bold text-sm shadow-sm focus:border-green-600/30 transition-all"
              />
            </div>
            <button className="px-6 py-4 bg-white border border-gray-100 rounded-[24px] font-bold text-gray-500 flex items-center gap-2 shadow-sm hover:text-gray-900 transition-all">
              <Filter size={18} />
              Ordenar
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#125d30] text-white shadow-lg shadow-green-900/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-600 hover:text-green-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Title */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-[32px] font-black text-gray-900 leading-tight">
                <Flame size={28} className="inline text-[#fc6c29] mr-2 mb-1" />
                Ofertas em Destaque
              </h2>
              <p className="text-gray-400 font-medium text-sm mt-1">{loading ? 'Carregando ofertas...' : `${filtered.length} produtos com desconto especial`}</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => {
              const inCart = cart.includes(product.id);
              return (
                <div key={product.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                    {/* Discount badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 bg-[#fc6c29] text-white font-black text-[11px] px-2.5 py-1.5 rounded-xl shadow-lg">
                        -{product.discount}% OFF
                      </div>
                    )}
                    {product.badge && (
                      <div className={`absolute top-4 right-4 font-black text-[10px] px-2.5 py-1.5 rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1 ${
                        product.badge === 'Orgânico' ? 'bg-green-700 text-white' : product.badge === 'Colhido Hoje' ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {product.badge === 'Orgânico' && <Leaf size={10} />}
                        {product.badge === 'Colhido Hoje' && <Clock size={10} />}
                        {product.badge}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">{product.vendor}</p>
                      <h3 className="font-black text-gray-900 leading-tight">{product.name}</h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{product.unit}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#fc6c29" className="text-[#fc6c29]" />
                      <span className="text-[11px] font-black text-gray-700">{product.rating}</span>
                      <span className="text-[11px] text-gray-400">({product.reviews})</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        {product.original > product.sale && (
                          <p className="text-xs text-gray-400 line-through font-medium">R$ {product.original.toFixed(2).replace('.', ',')}</p>
                        )}
                        <p className="text-2xl font-black text-gray-900">R$ {product.sale.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <button
                        onClick={() => setCart(c => inCart ? c.filter(x => x !== product.id) : [...c, product.id])}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                          inCart ? 'bg-[#125d30] text-white' : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-[#125d30] rounded-[40px] p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 text-white shadow-xl shadow-green-900/20">
            <div className="flex-1 text-center md:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-green-300 mb-3 block">CLUBE FEIRA.CASA</span>
              <h3 className="text-[32px] font-black leading-tight mb-3">Assine e economize<br />ainda mais</h3>
              <p className="text-white/70 font-medium leading-relaxed max-w-md">
                Membros do clube têm acesso a ofertas exclusivas antes de todo mundo e cashback em todas as compras.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/clube" className="px-8 py-4 bg-white text-green-800 font-black rounded-[20px] text-sm hover:bg-green-50 transition-all flex items-center gap-2">
                Conhecer o Clube <ArrowRight size={16} />
              </Link>
              <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-[20px] text-sm hover:bg-white/20 transition-all border border-white/20">
                Ver todas as ofertas
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
