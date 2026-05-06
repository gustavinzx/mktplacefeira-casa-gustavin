'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const [items, setItems] = useState([
    { id: '1', title: 'Tomate Grape Orgânico', price: 12.90, unit: 'bandeja', quantity: 2, imageUrl: '/images/tomato.png', producer: 'Sítio Sol Nascente' },
    { id: '3', title: 'Alface Crespa Fresca', price: 4.50, unit: 'unidade', quantity: 1, imageUrl: '/images/lettuce.png', producer: 'Banca do Zé' },
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 9.90;
  const total = subtotal + deliveryFee;

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

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
                      <img src={item.imageUrl} alt={item.title} />
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
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
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
            
            <Link href="/" className="continue-link">
              ← Continuar Comprando
            </Link>
          </div>

          <aside className="summary-section">
            <div className="summary-card">
              <h2>Resumo do Pedido</h2>
              
              <div className="coupon-box">
                <label>Cupom de Desconto</label>
                <div className="input-group">
                  <Tag size={16} />
                  <input type="text" placeholder="Digite seu cupom" />
                  <button>Aplicar</button>
                </div>
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
                <div className="row total">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="delivery-info">
                <Truck size={18} />
                <span>Previsão: Hoje, entre 18:00 e 20:00</span>
              </div>

              <Link href="/checkout">
                <button className="checkout-btn">
                  Finalizar Compra <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .cart-page {
          background: var(--bg-main);
          min-height: 100vh;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .page-title {
          font-size: 32px;
          margin-bottom: 40px;
        }
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
        }
        .items-section {
          background: white;
          padding: 32px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
        }
        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr 120px 100px 40px;
          gap: 24px;
          align-items: center;
          padding: 24px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .cart-item:last-child {
          border-bottom: none;
        }
        .item-image {
          width: 100px;
          height: 100px;
          background: #f9f9f9;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image img {
          width: 80%;
          object-fit: contain;
        }
        .item-producer {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .item-info h3 {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .item-unit {
          font-size: 13px;
          color: #666;
        }
        .item-quantity {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          padding: 6px;
          border-radius: 12px;
          justify-content: space-between;
        }
        .item-quantity button {
          width: 28px;
          height: 28px;
          border: none;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .item-quantity span {
          font-weight: 700;
          font-size: 14px;
        }
        .item-price {
          font-weight: 700;
          font-size: 18px;
          color: var(--text-main);
          text-align: right;
        }
        .remove-btn {
          background: transparent;
          border: none;
          color: #ccc;
          cursor: pointer;
          transition: color 0.2s;
        }
        .remove-btn:hover {
          color: #ff4d4d;
        }
        .continue-link {
          display: inline-block;
          margin-top: 32px;
          color: var(--leaf-green);
          font-weight: 600;
          font-size: 14px;
        }
        .summary-card {
          background: white;
          padding: 32px;
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 100px;
        }
        .summary-card h2 {
          font-size: 20px;
          margin-bottom: 24px;
        }
        .coupon-box {
          margin-bottom: 32px;
        }
        .coupon-box label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .input-group {
          display: flex;
          align-items: center;
          background: #f9f9f9;
          border-radius: 12px;
          padding: 4px 4px 4px 12px;
          gap: 8px;
        }
        .input-group input {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 14px;
          padding: 10px 0;
        }
        .input-group button {
          background: var(--text-main);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .summary-details {
          border-top: 1px solid #f5f5f5;
          padding-top: 24px;
          margin-bottom: 32px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #666;
          font-size: 15px;
        }
        .row.total {
          margin-top: 20px;
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
        }
        .delivery-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff8f5;
          color: #904d00;
          padding: 16px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .checkout-btn {
          width: 100%;
          background: var(--leaf-green);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .checkout-btn:hover {
          transform: translateY(-2px);
        }
        
        @media (max-width: 1000px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
          .cart-item {
            grid-template-columns: 80px 1fr 100px;
          }
          .item-price, .remove-btn {
            grid-row: 2;
            grid-column: 3;
          }
        }
      `}</style>
    </div>
  );
}
