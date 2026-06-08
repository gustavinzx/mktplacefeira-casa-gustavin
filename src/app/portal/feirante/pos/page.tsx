'use client';

import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Minus, Plus, CreditCard, Banknote, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // pix, cartao, dinheiro
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/produtos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.filter((p: any) => p.stock > 0)); // Apenas com estoque
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price })),
          payment_method: paymentMethod,
          total_amount: totalAmount
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setCart([]);
        fetchProducts(); // Refresh stock
        setTimeout(() => setSuccess(false), 3000);
      } else {
        showToast(data.error || 'Erro ao processar venda', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro na conexão', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={styles.layout}>
      {/* Products Section */}
      <div className={styles.productsSection}>
        <div className={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Buscar produto pelo nome..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin" size={32} /></div>
          ) : filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard} onClick={() => addToCart(product)}>
              <img src={product.image_url || '/images/placeholder.png'} className={styles.productImage} alt={product.title} />
              <h3 className={styles.productTitle}>{product.title}</h3>
              <p className={styles.productPrice}>R$ {product.price.toFixed(2).replace('.', ',')} / {product.unit}</p>
              <span className={styles.stockBadge}>{product.stock} em estoque</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className={styles.cartSection}>
        <div className={styles.cartHeader}>
          <ShoppingCart size={24} /> PDV - Caixa Aberto
        </div>
        
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>Nenhum item no carrinho</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.title}</div>
                  <div className={styles.itemPrice}>R$ {item.product.price.toFixed(2).replace('.', ',')} / {item.product.unit}</div>
                </div>
                <div className={styles.qtyControls}>
                  <button className={styles.qtyBtn} onClick={() => removeFromCart(item.product.id)}><Minus size={14} /></button>
                  <span style={{ fontSize: 14, fontWeight: 'bold', width: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => addToCart(item.product)}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.paymentMethods}>
            <button className={`${styles.payBtn} ${paymentMethod === 'pix' ? styles.active : ''}`} onClick={() => setPaymentMethod('pix')}>PIX</button>
            <button className={`${styles.payBtn} ${paymentMethod === 'cartao' ? styles.active : ''}`} onClick={() => setPaymentMethod('cartao')}>Cartão</button>
            <button className={`${styles.payBtn} ${paymentMethod === 'dinheiro' ? styles.active : ''}`} onClick={() => setPaymentMethod('dinheiro')}>Dinheiro</button>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
          </div>

          {success ? (
            <button className={styles.checkoutBtn} style={{ background: '#16a34a' }} disabled>
              <CheckCircle2 size={20} /> Venda Concluída!
            </button>
          ) : (
            <button className={styles.checkoutBtn} disabled={cart.length === 0 || processing} onClick={handleCheckout}>
              {processing ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
              Finalizar Venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
