'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Clock, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Fetch all active coupons for now
        const { data, error } = await supabase
          .from('mktplace_feira_coupons')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setCoupons(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoupons();
  }, []);

  return (
    <div className="coupons-container">
      <div className="page-header">
        <h1>Meus Cupons</h1>
        <div className="add-coupon">
          <input type="text" placeholder="Tem um código?" />
          <button>Resgatar</button>
        </div>
      </div>

      <div className="coupons-list">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--leaf-green)' }} />
          </div>
        ) : coupons.length > 0 ? (
          coupons.map((coupon, idx) => {
            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            const statusClass = isExpired ? 'expired' : (coupon.is_active ? 'active' : 'expired');
            
            return (
              <div key={idx} className={`coupon-card ${statusClass}`}>
                <div className="coupon-left">
                  <div className="icon-circle">
                    <Tag size={24} />
                  </div>
                  <div className="coupon-main">
                    <div className="code-row">
                      <span className="code">{coupon.code}</span>
                      {statusClass === 'active' && <span className="status-badge">Ativo</span>}
                    </div>
                    <h3>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `R$ ${coupon.discount_value} OFF`}</h3>
                    <div className="coupon-meta">
                      <span><Clock size={12} /> Expira em: {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('pt-BR') : 'Indeterminado'}</span>
                      <span><Info size={12} /> Min: R$ {Number(coupon.min_purchase_amount || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
                <div className="coupon-right">
                  <button 
                    disabled={statusClass === 'expired'}
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      showToast('Cupom copiado!', 'success');
                    }}
                  >
                    {statusClass === 'active' ? 'Copiar Código' : 'Indisponível'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <Tag size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
            <p>Nenhum cupom disponível no momento.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .coupons-container {
          padding: 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 24px;
        }
        .add-coupon {
          display: flex;
          gap: 8px;
          background: #f5f5f5;
          padding: 4px;
          border-radius: 12px;
        }
        .add-coupon input {
          background: transparent;
          border: none;
          padding: 8px 16px;
          font-size: 14px;
        }
        .add-coupon button {
          background: var(--text-main);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .coupons-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .coupon-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .coupon-card:hover {
          transform: translateX(5px);
        }
        .coupon-card.expired {
          opacity: 0.6;
          filter: grayscale(1);
        }
        .coupon-left {
          padding: 24px;
          display: flex;
          gap: 20px;
          flex: 1;
        }
        .icon-circle {
          width: 56px;
          height: 56px;
          background: #fdf2f0;
          color: var(--market-orange);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .code-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .code {
          font-family: monospace;
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 1px;
        }
        .status-badge {
          background: #eef7f2;
          color: var(--leaf-green);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }
        h3 {
          font-size: 15px;
          color: #555;
          margin-bottom: 12px;
        }
        .coupon-meta {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #888;
        }
        .coupon-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .coupon-right {
          background: #fafafa;
          border-left: 2px dashed #eee;
          width: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .coupon-right button {
          background: white;
          border: 1px solid var(--leaf-green);
          color: var(--leaf-green);
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
        }
        .coupon-right button:disabled {
          border-color: #ddd;
          color: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
