'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, TrendingUp, Users, Target, CheckCircle2, Loader2, MousePointerClick } from 'lucide-react';
import styles from './page.module.css';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

export default function MarketingHubPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({ title: '', type: 'discount', discount_value: '' });
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/marketing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
      const res = await fetch('/api/feirante/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast('Campanha criada com sucesso!', 'success');
        setForm({ title: '', type: 'discount', discount_value: '' });
        setActiveTab('dashboard');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Hub de Divulgação</h1>
        <p className={styles.subtitle}>Atraia mais clientes e impulsione suas vendas com ferramentas de marketing.</p>
      </div>

      <div className={styles.tabsContainer}>
        <button className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('dashboard')}>
          Minhas Campanhas
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('create')}>
          Criar Campanha
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'packages' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('packages')}>
          Pacotes de Impulso
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Alcance Total (Visualizações)</span>
              <span className={styles.metricValue}>{data.campaigns.reduce((acc: any, c: any) => acc + c.reach, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Cliques Gerados</span>
              <span className={styles.metricValue}>{data.campaigns.reduce((acc: any, c: any) => acc + c.clicks, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Conversões (Vendas)</span>
              <span className={styles.metricValue}>{data.campaigns.reduce((acc: any, c: any) => acc + c.conversions, 0)}</span>
            </div>
          </div>

          <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 800 }}>Campanhas Ativas</h3>
          <div className={styles.campaignsList}>
            {data.campaigns.length > 0 ? data.campaigns.map((camp: any) => (
              <div key={camp.id} className={styles.campaignCard}>
                <div className={styles.campLeft}>
                  <span className={styles.campTitle}>{camp.title}</span>
                  <span className={styles.campType}>Tipo: {camp.type === 'discount' ? 'Cupom de Desconto' : 'Destaque'}</span>
                  <div className={styles.campStats}>
                    <span className={styles.campStat}><Users size={14} /> {camp.reach} alcance</span>
                    <span className={styles.campStat}><MousePointerClick size={14} /> {camp.clicks} cliques</span>
                    <span className={styles.campStat}><Target size={14} /> {camp.conversions} vendas</span>
                  </div>
                </div>
                <div className={styles.campRight}>
                  <span className={`${styles.statusBadge} ${styles['status_' + camp.status]}`}>
                    {camp.status === 'active' ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 16 }}>Nenhuma campanha ativa.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className={styles.formContainer}>
          <h2 style={{ marginBottom: 24 }}>Nova Campanha</h2>
          <form onSubmit={handleCreate}>
            <div className={styles.formGroup}>
              <label>Nome da Campanha (Interno)</label>
              <input required placeholder="Ex: Queima de Estoque FDS" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Tipo de Ação</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="discount">Cupom de Desconto Global</option>
                <option value="featured">Produto em Destaque</option>
              </select>
            </div>
            {form.type === 'discount' && (
              <div className={styles.formGroup}>
                <label>Valor do Desconto (%)</label>
                <input required type="number" min="1" max="99" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} />
              </div>
            )}
            <button type="submit" className={styles.btnSubmit} disabled={creating}>
              {creating ? 'Criando...' : 'Publicar Campanha'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className={styles.packagesGrid}>
          {data.packages.map((pkg: any) => (
            <div key={pkg.id} className={styles.packageCard}>
              <h3 className={styles.pkgName}>{pkg.name}</h3>
              <div className={styles.pkgPrice}>R$ {pkg.price.toFixed(2).replace('.', ',')}</div>
              <div className={styles.pkgFeatures}>
                {(pkg.features || []).map((f: string, i: number) => (
                  <div key={i} className={styles.pkgFeature}><CheckCircle2 size={16} color="#10b981" /> {f}</div>
                ))}
              </div>
              <button className={styles.btnBuy} onClick={() => showToast('Integração de pagamento simulada com sucesso!', 'info')}>
                Comprar Pacote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
