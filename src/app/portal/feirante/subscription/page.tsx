'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Star, Zap, Shield } from 'lucide-react';
import styles from './page.module.css';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

const PLANS = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 0,
    icon: Shield,
    features: [
      'Presença no marketplace',
      'Até 50 produtos cadastrados',
      'Taxa de 10% por venda online',
      'Acesso ao PDV Básico'
    ]
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 49.90,
    icon: Star,
    features: [
      'Tudo do Plano Básico',
      'Produtos ILIMITADOS',
      'Taxa reduzida: 6% por venda',
      'Destaque nas buscas',
      'PDV Avançado (Múltiplos Vendedores)'
    ]
  },
  {
    id: 'master',
    name: 'Master / Atacado',
    price: 149.90,
    icon: Zap,
    features: [
      'Tudo do Plano Premium',
      'Acesso ao Portal B2B (Restaurantes)',
      'Taxa ZERO em vendas B2B',
      'Relatórios avançados de IA',
      'Gerente de conta dedicado'
    ]
  }
];

export default function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentSub(data.data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (plan: any) => {
    
    try {
      setProcessing(plan.id);
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan_type: plan.id, amount: plan.price })
      });
      if (res.ok) {
        showToast('Plano atualizado com sucesso!', 'success');
        fetchSubscription();
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar plano.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  const activePlanId = currentSub?.plan_type || 'basic';

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Minha Assinatura</h1>
        <p className={styles.subtitle}>Gerencie seu plano e libere novos recursos para sua banca.</p>
      </div>

      <div className={styles.currentPlan}>
        <div>
          <p className={styles.planLabel}>Plano Atual</p>
          <h2 className={styles.planName}>{currentSub?.plan_type || 'Básico'}</h2>
        </div>
        <div className={styles.planStatus}>
          {currentSub?.status === 'active' ? 'Ativo' : 'Pendente'}
        </div>
      </div>

      <div className={styles.grid}>
        {PLANS.map(plan => {
          const isActive = activePlanId === plan.id;
          const Icon = plan.icon;

          return (
            <div key={plan.id} className={`${styles.pricingCard} ${isActive ? styles.active : ''}`}>
              <div className={styles.planHeader}>
                <h3 className={styles.planType}><Icon size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/> {plan.name}</h3>
                <div className={styles.planPrice}>
                  R$ {plan.price.toFixed(2).replace('.', ',')} <span>/ mês</span>
                </div>
              </div>

              <div className={styles.featuresList}>
                {plan.features.map((feat, i) => (
                  <div key={i} className={styles.feature}>
                    <CheckCircle2 size={18} className={styles.featureIcon} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {isActive ? (
                <button className={`${styles.btnUpgrade} ${styles.btnActive}`} disabled>
                  Plano Atual
                </button>
              ) : (
                <button 
                  className={styles.btnUpgrade} 
                  onClick={() => handleUpgrade(plan)}
                  disabled={processing === plan.id}
                >
                  {processing === plan.id ? <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto' }} /> : 'Assinar Plano'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
