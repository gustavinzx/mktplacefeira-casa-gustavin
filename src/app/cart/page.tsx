'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShoppingBag, Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  producer: string;
}
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const router = useRouter();
  
  // Zustand store
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Frete Dinâmico
  const [cep, setCep] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingMsg, setShippingMsg] = useState('');
  const [deliveryForecast, setDeliveryForecast] = useState('');

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Zustand persist hydratation trick to avoid mismatch on initial render
    setLoaded(true);

    const hour = new Date().getHours();
    if (hour < 16) {
      setDeliveryForecast('Hoje, entre 18:00 e 20:00');
    } else {
      setDeliveryForecast('Amanhã, entre 09:00 e 12:00');
    }
  }, []);

  const total = subtotal + deliveryFee - discount;

  // Se o subtotal atualizar (itens removidos/adicionados), recalculamos o frete se já houver um CEP
  useEffect(() => {
    if (cep.length >= 8 && subtotal > 0) {
      calculateShipping();
    }
  }, [subtotal]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplyingCoupon(true);
    setCouponMsg('');
    try {
      const res = await fetch(`/api/payments/coupon?code=${coupon.toUpperCase()}`);
      const data = await res.json();
      if (data.success && data.data) {
        const disc = data.data.discount_type === 'percent'
          ? subtotal * (data.data.discount_value / 100)
          : data.data.discount_value;
        setDiscount(disc);
        setCouponMsg(`✅ Cupom aplicado! Desconto de R$ ${disc.toFixed(2)}`);
      } else {
        setCouponMsg('❌ Cupom inválido ou expirado.');
        setDiscount(0);
      }
    } catch {
      // Se o endpoint de cupom não existir ainda, usa validação simples
      if (coupon.toUpperCase() === 'PRIMEIRAFEIRA') {
        setDiscount(10);
        setCouponMsg('✅ Cupom aplicado! Desconto de R$ 10,00');
      } else {
        setCouponMsg('❌ Cupom inválido.');
        setDiscount(0);
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const calculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length < 8) return;
    setCalculatingShipping(true);
    try {
      const res = await fetch(`/api/shipping?cep=${cleanCep}&subtotal=${subtotal}`);
      const data = await res.json();
      if (data.success) {
        setDeliveryFee(data.data.fee);
        setShippingMsg(data.data.message);
      } else {
        setShippingMsg('❌ Erro ao calcular frete.');
        setDeliveryFee(0);
      }
    } catch {
      setShippingMsg('❌ Erro ao calcular frete.');
      setDeliveryFee(0);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Salva os dados do checkout no localStorage para usar na página de checkout
  const goToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkingOut) return;

    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login?tab=signup');
      return;
    }

    setCheckingOut(true);
    try {
      localStorage.setItem('checkout_items', JSON.stringify(items));
      localStorage.setItem('checkout_subtotal', subtotal.toFixed(2));
      localStorage.setItem('checkout_discount', discount.toFixed(2));
      localStorage.setItem('checkout_deliveryFee', deliveryFee.toFixed(2));
      localStorage.setItem('checkout_total', total.toFixed(2));
      localStorage.setItem('checkout_coupon', coupon.toUpperCase());
      localStorage.setItem('checkout_cep', cep.replace(/\D/g, ''));

      router.push('/checkout');
    } catch {
      setCheckingOut(false);
    }
  };

  const handleRemoveItem = (id: string, title: string) => {
    const confirmed = window.confirm(`Remover "${title}" do carrinho?`);
    if (confirmed) removeItem(id);
  };

  if (!loaded) return null;

  return (
    <div className="cart-page">
      <Header />

      <main className="container">
        <h1 className="page-title">Meu Carrinho</h1>

        <div className="cart-layout">
          <div className="items-section">
            {items.length > 0 ? (
              <div className="items-list">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.imageUrl || '/images/placeholder.png'} alt={item.title} />
                    </div>
                    <div className="item-info">
                      <p className="item-producer">{item.producer}</p>
                      <h3>{item.title}</h3>
                      <p className="item-unit">Unidade: {item.unit}</p>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                    </div>
                    <div className="item-price">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.id, item.title)} title="Remover item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-cart">
                <ShoppingBag size={48} />
                <p>Seu carrinho está vazio</p>
                <Link href="/">
                  <button className="back-btn">Voltar para a feira</button>
                </Link>
              </div>
            )}

            <Link href="/" className="continue-link">← Continuar Comprando</Link>
          </div>

          <aside className="summary-section">
            <div className="summary-card">
              <h2>Resumo do Pedido</h2>

              <div className="coupon-box">
                <label>Cupom de Desconto</label>
                <div className="input-group">
                  <Tag size={16} />
                  <input
                    type="text"
                    placeholder="Digite seu cupom"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} disabled={applyingCoupon}>
                    {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
                {couponMsg && <p className="coupon-msg">{couponMsg}</p>}
              </div>

              <div className="coupon-box" style={{ marginTop: 16 }}>
                <label>Calcular Frete</label>
                <div className="input-group">
                  <Truck size={16} />
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculateShipping()}
                    maxLength={9}
                  />
                  <button onClick={calculateShipping} disabled={calculatingShipping}>
                    {calculatingShipping ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
                  </button>
                </div>
                {shippingMsg && <p className="coupon-msg" style={{ color: deliveryFee === 0 ? '#10b981' : '#666' }}>{shippingMsg}</p>}
              </div>

              <div className="summary-details">
                <div className="row">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Frete Estimado</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="row" style={{ color: '#1e8e3e' }}>
                    <span>Desconto ({coupon})</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="row total">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="delivery-info">
                <Truck size={18} />
                <span>Previsão: {deliveryForecast}</span>
              </div>

              <button
                className="checkout-btn"
                disabled={items.length === 0 || checkingOut}
                onClick={goToCheckout}
                style={{background: '#0e6b17', color: 'white', width: '100%', padding: '18px', borderRadius: '16px', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: checkingOut ? 'not-allowed' : 'pointer', border: 'none', opacity: checkingOut ? 0.75 : 1}}
              >
                {checkingOut ? (
                  <><Loader2 size={20} className="animate-spin" /> Processando...</>
                ) : (
                  <>Finalizar Compra <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .cart-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .page-title { font-size: 32px; margin-bottom: 40px; }
        .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
        .items-section { background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-sm); }
        .cart-item { display: grid; grid-template-columns: 100px 1fr 120px 100px 40px; gap: 24px; align-items: center; padding: 24px 0; border-bottom: 1px solid #f5f5f5; }
        .cart-item:last-child { border-bottom: none; }
        .item-image { width: 100px; height: 100px; background: #f9f9f9; border-radius: 16px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .item-image img { width: 80%; object-fit: contain; }
        .item-producer { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
        .item-info h3 { font-size: 18px; margin-bottom: 4px; }
        .item-unit { font-size: 13px; color: #666; }
        .item-quantity { display: flex; align-items: center; background: #f5f5f5; padding: 6px; border-radius: 12px; justify-content: space-between; }
        .item-quantity button { width: 28px; height: 28px; border: none; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .item-quantity span { font-weight: 700; font-size: 14px; }
        .item-price { font-weight: 700; font-size: 18px; color: var(--text-main); text-align: right; }
        .remove-btn { background: transparent; border: none; color: #ccc; cursor: pointer; transition: color 0.2s; }
        .remove-btn:hover { color: #ff4d4d; }
        .continue-link { display: inline-block; margin-top: 32px; color: var(--leaf-green); font-weight: 600; font-size: 14px; }
        .empty-cart { text-align: center; padding: 60px 20px; color: #888; }
        .empty-cart p { margin: 16px 0; font-size: 18px; }
        .back-btn { background: var(--leaf-green); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; margin-top: 8px; }
        .summary-card { background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-sm); position: sticky; top: 100px; }
        .summary-card h2 { font-size: 20px; margin-bottom: 24px; }
        .coupon-box { margin-bottom: 32px; }
        .coupon-box label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
        .coupon-msg { font-size: 12px; margin-top: 8px; }
        .input-group { display: flex; align-items: center; background: #f9f9f9; border-radius: 12px; padding: 4px 4px 4px 12px; gap: 8px; }
        .input-group input { flex: 1; background: transparent; border: none; font-size: 14px; padding: 10px 0; outline: none; }
        .input-group button { background: var(--text-main); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; }
        .summary-details { border-top: 1px solid #f5f5f5; padding-top: 24px; margin-bottom: 32px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #666; font-size: 15px; }
        .row.total { margin-top: 20px; font-size: 20px; font-weight: 800; color: var(--text-main); }
        .delivery-info { display: flex; align-items: center; gap: 10px; background: #fff8f5; color: #904d00; padding: 16px; border-radius: 16px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
        .checkout-btn { width: 100%; background: var(--leaf-green); color: white; border: none; padding: 18px; border-radius: 16px; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: transform 0.2s; }
        .checkout-btn:hover { transform: translateY(-2px); }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        @media (max-width: 1000px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-item { grid-template-columns: 80px 1fr 100px; }
          .item-price, .remove-btn { grid-row: 2; grid-column: 3; }
        }
      `}</style>
    </div>
  );
}
