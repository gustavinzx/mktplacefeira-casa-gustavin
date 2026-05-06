'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const CartPreview = () => {
  // Mock data - in real app, get from context/store
  const items = [
    { id: '1', title: 'Tomate Grape Orgânico', price: 12.90, quantity: 2, imageUrl: '/images/tomato.png' },
    { id: '3', title: 'Alface Crespa Fresca', price: 4.50, quantity: 1, imageUrl: '/images/lettuce.png' },
  ];

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-preview-dropdown">
      <div className="preview-header">
        <h3>Seu Carrinho</h3>
        <span>{items.length} itens</span>
      </div>

      <div className="preview-items">
        {items.map(item => (
          <div key={item.id} className="preview-item">
            <img src={item.imageUrl} alt={item.title} />
            <div className="item-info">
              <h4>{item.title}</h4>
              <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
            </div>
            <span className="item-total">R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="preview-footer">
        <div className="total-row">
          <span>Subtotal</span>
          <strong>R$ {total.toFixed(2)}</strong>
        </div>
        <div className="actions">
          <Link href="/cart" className="view-cart">Ver Carrinho</Link>
          <Link href="/checkout" className="checkout-btn">
            Finalizar Compra <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .cart-preview-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 360px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid #eee;
          margin-top: 12px;
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .preview-header {
          padding: 20px;
          border-bottom: 1px solid #f5f5f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-header h3 { font-size: 16px; margin: 0; }
        .preview-header span { font-size: 13px; color: #888; }
        
        .preview-items {
          max-height: 280px;
          overflow-y: auto;
          padding: 10px 0;
        }
        .preview-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          transition: background 0.2s;
        }
        .preview-item:hover { background: #fafafa; }
        .preview-item img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background: #f9f9f9;
          object-fit: contain;
        }
        .item-info { flex: 1; }
        .item-info h4 { font-size: 14px; margin: 0 0 4px; }
        .item-info span { font-size: 12px; color: #666; }
        .item-total { font-weight: 700; font-size: 14px; color: var(--text-main); }

        .preview-footer {
          padding: 20px;
          background: #fafafa;
          border-top: 1px solid #eee;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 15px;
        }
        .total-row strong { font-size: 18px; color: var(--market-orange); }
        
        .actions {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }
        .view-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          text-decoration: none;
        }
        .checkout-btn {
          background: var(--leaf-green);
          color: white;
          padding: 12px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        .checkout-btn:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default CartPreview;
