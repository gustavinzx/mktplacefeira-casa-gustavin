'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { MapPin, CreditCard, ShieldCheck, ChevronRight, Loader2, QrCode, Copy, Check, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  producer: string;
  producer_id?: string;
}

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

// ─── Formulário de Cartão de Crédito ─────────────────────────────────────
function CardForm({ onChange }: { onChange: (data: CardData) => void }) {
  const [cardData, setCardData] = useState<CardData>({ number: '', name: '', expiry: '', cvv: '' });

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  const update = (field: keyof CardData, value: string) => {
    const next = { ...cardData, [field]: value };
    setCardData(next);
    onChange(next);
  };

  return (
    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>
          Número do Cartão
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={cardData.number}
          onChange={e => update('number', formatCardNumber(e.target.value))}
          maxLength={19}
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', fontFamily: 'monospace', letterSpacing: '2px', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#0e6b17'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      <div>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>
          Nome no Cartão
        </label>
        <input
          type="text"
          placeholder="NOME COMO NO CARTÃO"
          value={cardData.name}
          onChange={e => update('name', e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', textTransform: 'uppercase', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#0e6b17'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>
            Validade
          </label>
          <input
            type="text"
            placeholder="MM/AA"
            value={cardData.expiry}
            onChange={e => update('expiry', formatExpiry(e.target.value))}
            maxLength={5}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#0e6b17'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px', display: 'block' }}>
            CVV
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="•••"
            value={cardData.cvv}
            onChange={e => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#0e6b17'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>
    </div>
  );
}

interface CardData { number: string; name: string; expiry: string; cvv: string; }

// ─── QR Code PIX ────────────────────────────────────────────────────────────
function PixPanel({ total }: { total: number }) {
  const pixKey = 'feira.casa@pix.com.br'; // chave PIX da empresa
  const pixCode = `00020126360014BR.GOV.BCB.PIX0114${pixKey}5204000053039865406${total.toFixed(2).replace('.', '')}5802BR5909FeiraCasa6009SaoPaulo62140510feira2025630${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: '16px', textAlign: 'center' }}>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <QrCode size={48} style={{ color: '#0e6b17' }} />
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Escaneie o QR Code ou copie a chave PIX</p>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', width: '100%' }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chave PIX</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>{pixKey}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb', width: '100%' }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#0e6b17' }}>R$ {total.toFixed(2)}</p>
        </div>
        <button
          onClick={copyCode}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: copied ? '#166534' : '#0e6b17', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
        >
          {copied ? <><Check size={18} /> Copiado!</> : <><Copy size={18} /> Copiar Código PIX</>}
        </button>
        <p style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>
          Após o pagamento, clique em "Confirmar Pedido"
        </p>
      </div>
    </div>
  );
}

// ─── Checkout Page ──────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [cardData, setCardData] = useState<CardData>({ number: '', name: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState('');
  const [error, setError] = useState('');

  const total = subtotal + deliveryFee - discount;

  useEffect(() => {
    const savedItems = localStorage.getItem('checkout_items');
    const savedSubtotal = localStorage.getItem('checkout_subtotal');
    const savedDiscount = localStorage.getItem('checkout_discount');
    const savedDelivery = localStorage.getItem('checkout_deliveryFee');
    const savedCoupon = localStorage.getItem('checkout_coupon');

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedSubtotal) setSubtotal(parseFloat(savedSubtotal));
    if (savedDiscount) setDiscount(parseFloat(savedDiscount));
    if (savedDelivery) setDeliveryFee(parseFloat(savedDelivery));
    if (savedCoupon) setCoupon(savedCoupon);

    async function loadAddresses() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();

        if (data.success && data.data?.length) {
          setAddresses(data.data);
          const def = data.data.find((a: Address) => a.is_default) || data.data[0];
          setAddress(def);
        } else {
          setAddresses([]);
          setAddress(null);
          setAddressesError('');
        }
      } catch {
        setAddressesError('Não foi possível carregar seus endereços. Tente recarregar a página.');
      } finally {
        setAddressesLoading(false);
      }
    }
    loadAddresses();

    // Escuta mudanças de autenticação em tempo real (logout, troca de conta)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        // Limpa tudo e redireciona
        setAddresses([]);
        setAddress(null);
        setItems([]);
        setSubtotal(0);
        setDiscount(0);
        setDeliveryFee(0);
        router.push('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Recarrega endereços para a nova sessão
        setAddressesLoading(true);
        loadAddresses();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    if (!address) {
      setLoading(false);
      setError('Selecione ou cadastre um endereço de entrega para continuar.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardData.number.replace(/\s/g, '') || cardData.number.replace(/\s/g, '').length < 16) {
        setError('Digite o número completo do cartão (16 dígitos).');
        return;
      }
      if (!cardData.name.trim()) {
        setError('Digite o nome como aparece no cartão.');
        return;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        setError('Digite a validade do cartão no formato MM/AA.');
        return;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        setError('Digite o código CVV do cartão (3 ou 4 dígitos).');
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push('/login'); return; }

      if (paymentMethod === 'card') {
        const stripeRes = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customer_email: session?.user?.email,
            order_id: 'temp_order' 
          })
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
          return;
        } else {
          throw new Error(stripeData.error || 'Erro ao iniciar Stripe');
        }
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, product_id: i.id, quantity: i.quantity, price: i.price, title: i.title, producer_id: i.producer_id })),
          address_id: address.id,
          payment_method: paymentMethod,
          coupon_code: coupon || undefined,
          delivery_fee: deliveryFee,
          discount,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Erro ao processar pagamento. Tente novamente.');
        setLoading(false);
        return;
      }

      localStorage.setItem('last_order_id', data.orders?.[0]?.id || '');
      useCartStore.getState().clearCart();
      ['checkout_items', 'checkout_subtotal', 'checkout_discount', 'checkout_deliveryFee', 'checkout_coupon'].forEach(k => localStorage.removeItem(k));

      router.push('/checkout/confirmation');
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.container}>

        {/* Voltar ao Carrinho */}
        <button
          className={styles.backBtn}
          onClick={() => router.push('/cart')}
        >
          <ArrowLeft size={18} /> Voltar ao Carrinho
        </button>

        <div className={styles.formCol}>
          <h1 className={styles.title}>Finalizar Compra</h1>

          {/* Endereço */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><MapPin size={24} /> Endereço de Entrega</h2>
            {addressesLoading ? (
              <div style={{ display: 'flex', gap: '12px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                <Loader2 size={20} className="animate-spin" style={{ color: '#0e6b17' }} />
                <span style={{ fontSize: '14px', color: '#888' }}>Carregando endereços...</span>
              </div>
            ) : addressesError ? (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
                ⚠️ {addressesError}
              </div>
            ) : (
              <div className={styles.addressList}>
                {addresses.length > 0 ? (
                  addresses.map((addr) => {
                    const isSelected = address?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setAddress(addr)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setAddress(addr)}
                        className={`${styles.addressCard} ${isSelected ? styles.addressCardActive : ''}`}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                          border: isSelected ? '6px solid #0e6b17' : '2px solid #ccc',
                          background: 'white', transition: 'all 0.2s'
                        }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: isSelected ? '#0e6b17' : '#111' }}>
                            {addr.is_default ? '⭐ Endereço Principal' : 'Endereço'}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            {addr.street}, {addr.number}
                            {addr.complement ? ` — ${addr.complement}` : ''}
                            {addr.neighborhood ? <><br />{addr.neighborhood}</> : null}
                            <br />
                            {addr.city}, {addr.state} — CEP {addr.zip_code}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fefce8', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                    <MapPin size={36} style={{ color: '#d97706', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>Nenhum endereço cadastrado</h3>
                    <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '20px', lineHeight: '1.5' }}>
                      Para finalizar sua compra, você precisa adicionar um endereço de entrega.
                    </p>
                    <a
                      href="/account/addresses"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0e6b17', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', transition: 'background 0.2s' }}
                    >
                      <Plus size={18} /> Adicionar Endereço de Entrega
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><CreditCard size={24} /> Método de Pagamento</h2>
            <div className={styles.paymentMethods}>
              <div
                className={`${styles.method} ${paymentMethod === 'pix' ? styles.methodActive : ''}`}
                onClick={() => setPaymentMethod('pix')}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setPaymentMethod('pix')}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: paymentMethod === 'pix' ? '6px solid #0e6b17' : '2px solid #ccc',
                  background: 'white', transition: 'all 0.2s'
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: paymentMethod === 'pix' ? '#0e6b17' : '#111', fontSize: '15px' }}>
                    Pagar com PIX
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Aprovação instantânea • Mais seguro</p>
                </div>
                {paymentMethod === 'pix' && <span style={{ fontSize: '11px', background: '#0e6b17', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>RECOMENDADO</span>}
              </div>

              {paymentMethod === 'pix' && <PixPanel total={total} />}

              <div
                className={`${styles.method} ${paymentMethod === 'card' ? styles.methodActive : ''}`}
                onClick={() => setPaymentMethod('card')}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setPaymentMethod('card')}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: paymentMethod === 'card' ? '6px solid #0e6b17' : '2px solid #ccc',
                  background: 'white', transition: 'all 0.2s'
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: paymentMethod === 'card' ? '#0e6b17' : '#111', fontSize: '15px' }}>
                    Cartão de Crédito
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Visa, Mastercard, Elo, Amex</p>
                </div>
              </div>

              {paymentMethod === 'card' && <CardForm onChange={setCardData} />}
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Sidebar — Resumo */}
        <aside>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>

            {items.length > 0 && (
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#555' }}>
                    <span style={{ flex: 1, paddingRight: '8px' }}>{item.title} <strong>x{item.quantity}</strong></span>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.summaryRow}><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className={styles.summaryRow}><span>Frete</span><span>{deliveryFee === 0 ? '✅ Grátis' : `R$ ${deliveryFee.toFixed(2)}`}</span></div>
            {discount > 0 && (
              <div className={styles.summaryRow} style={{ color: '#0e6b17' }}>
                <span>Cupom: {coupon}</span>
                <span>- R$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.totalRow}><span>Total</span><span>R$ {total.toFixed(2)}</span></div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '32px', padding: '16px', borderRadius: '16px', fontSize: '16px' }}
              onClick={handleConfirm}
              disabled={loading || items.length === 0 || addressesLoading || !address}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Processando...</>
              ) : (
                <>Confirmar e Pagar <ChevronRight size={20} /></>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#888', fontSize: '13px', justifyContent: 'center' }}>
              <ShieldCheck size={16} /> Pagamento 100% Seguro e Criptografado
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
