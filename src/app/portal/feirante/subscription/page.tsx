'use client';

import React from 'react';
import { Check, Zap, Star, ShieldCheck, Crown } from 'lucide-react';

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Essencial',
      price: 'Grátis',
      features: ['Até 10 produtos ativos', 'Taxa de 15% por venda', 'Recebimento em 14 dias', 'Suporte via ticket'],
      icon: <ShieldCheck size={32} />,
      current: true
    },
    {
      name: 'Premium',
      price: 'R$ 89,90/mês',
      features: ['Produtos ilimitados', 'Taxa de 10% por venda', 'Recebimento em 7 dias', 'Destaque nas buscas', 'Suporte via WhatsApp'],
      icon: <Star size={32} />,
      recommended: true
    },
    {
      name: 'Master',
      price: 'R$ 199,90/mês',
      features: ['Tudo do Premium', 'Taxa de 8% por venda', 'Recebimento em 2 dias', 'Banner fixo em categorias', 'Consultoria de Marketing'],
      icon: <Crown size={32} />
    }
  ];

  return (
    <div className="subscription-container">
      <header className="page-header">
        <h1>Minha Assinatura</h1>
        <p>Escolha o plano ideal para escalar suas vendas na feira</p>
      </header>

      <div className="current-plan-banner">
        <div className="plan-info">
          <span className="label">Plano Atual</span>
          <h2>Essencial</h2>
          <p>Próxima renovação: 12 de Maio, 2026</p>
        </div>
        <div className="plan-badge">Ativo</div>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.name} className={`plan-card ${plan.recommended ? 'recommended' : ''}`}>
            {plan.recommended && <div className="recommended-tag">MAIS POPULAR</div>}
            <div className="plan-icon">{plan.icon}</div>
            <h3>{plan.name}</h3>
            <div className="price">{plan.price}</div>
            <ul className="features">
              {plan.features.map(f => (
                <li key={f}><Check size={16} /> {f}</li>
              ))}
            </ul>
            <button className={`plan-btn ${plan.current ? 'current' : ''}`} disabled={plan.current}>
              {plan.current ? 'Seu Plano Atual' : 'Mudar para este plano'}
            </button>
          </div>
        ))}
      </div>

      <section className="faq-section">
        <h2>Perguntas Frequentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Como funcionam as taxas?</h4>
            <p>As taxas são descontadas automaticamente de cada venda realizada na plataforma.</p>
          </div>
          <div className="faq-item">
            <h4>Posso cancelar a qualquer momento?</h4>
            <p>Sim, você pode cancelar ou mudar de plano sem fidelidade ou multas.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .subscription-container {
          padding: 20px;
          max-width: 1200px;
        }
        .page-header {
          margin-bottom: 40px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .page-header p {
          color: #666;
        }
        .current-plan-banner {
          background: white;
          padding: 32px;
          border-radius: 24px;
          border: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 60px;
        }
        .plan-info h2 {
          font-size: 24px;
          margin: 8px 0;
          color: var(--leaf-green);
        }
        .plan-info p {
          color: #888;
          font-size: 14px;
        }
        .plan-badge {
          background: #eef7f2;
          color: var(--leaf-green);
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 80px;
        }
        .plan-card {
          background: white;
          padding: 40px;
          border-radius: 32px;
          border: 2px solid #eee;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .plan-card.recommended {
          border-color: var(--leaf-green);
          transform: scale(1.05);
          box-shadow: var(--shadow-md);
          z-index: 2;
        }
        .recommended-tag {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--leaf-green);
          color: white;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .plan-icon {
          color: var(--leaf-green);
          margin-bottom: 24px;
        }
        .plan-card h3 {
          font-size: 22px;
          margin-bottom: 8px;
        }
        .price {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
          color: var(--text-main);
        }
        .features {
          list-style: none;
          margin-bottom: 40px;
          flex: 1;
        }
        .features li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #555;
        }
        .features li :global(svg) {
          color: var(--leaf-green);
          flex-shrink: 0;
        }
        .plan-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .plan-card.recommended .plan-btn {
          background: var(--leaf-green);
          color: white;
        }
        .plan-btn:not(.recommended):not(.current) {
          background: #f5f5f5;
          color: #555;
        }
        .plan-btn.current {
          background: #eef7f2;
          color: var(--leaf-green);
          cursor: default;
        }
        .faq-section h2 {
          margin-bottom: 32px;
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .faq-item h4 {
          font-size: 16px;
          margin-bottom: 8px;
        }
        .faq-item p {
          color: #666;
          line-height: 1.6;
        }
        
        @media (max-width: 1000px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
          .plan-card.recommended {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
