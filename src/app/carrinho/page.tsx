'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 5.00; // Fixa para demonstração, idealmente calcular por cep/distância
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Seu Carrinho</h1>
        </div>

        {items.length === 0 ? (
          <div className={styles.cartList} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={styles.emptyState}>
              <ShoppingBag size={64} />
              <h2>Seu carrinho está vazio</h2>
              <p>Que tal explorar as feiras e adicionar alguns produtos frescos?</p>
              <Link href="/produtos" className={styles.shopBtn}>
                Explorar Produtos
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.cartList}>
              {items.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.imageUrl || '/images/placeholder.png'} alt={item.title} className={styles.itemImage} />
                  
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <p className={styles.itemProducer}>{item.producer}</p>
                      </div>
                      <span className={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.quantityControl}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className={styles.summaryCard}>
                <h3>Resumo do Pedido</h3>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Taxa de Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>

                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                <button 
                  className={styles.checkoutBtn}
                  onClick={() => {
                    localStorage.setItem('checkout_items', JSON.stringify(items));
                    localStorage.setItem('checkout_subtotal', subtotal.toFixed(2));
                    localStorage.setItem('checkout_deliveryFee', deliveryFee.toFixed(2));
                    localStorage.setItem('checkout_discount', '0.00');
                    localStorage.setItem('checkout_total', total.toFixed(2));
                    localStorage.setItem('checkout_coupon', '');
                    localStorage.setItem('checkout_cep', '');
                    router.push('/checkout');
                  }}
                >
                  Continuar para Pagamento <ArrowRight size={20} />
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
