'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Loader2, History, PlusCircle, Send } from 'lucide-react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function AccountWalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showToast } = require('@/components/Toast')();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/account/wallet', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWalletData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!walletData) return <div>Erro ao carregar carteira.</div>;

  const filteredTransactions = walletData.transactions.filter((t: any) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div>
      <h1 className={styles.pageTitle}>Minha Carteira</h1>
      <p className={styles.pageSubtitle}>Acompanhe seu saldo, cashback e estornos.</p>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Saldo Atual</p>
        <h2 className={styles.balanceAmount}>R$ {walletData.balance.toFixed(2).replace('.', ',')}</h2>
        
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Total Recebido</p>
            <p className={styles.statValue}>+ R$ {walletData.totalCredited.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Total Utilizado</p>
            <p className={styles.statValue}>- R$ {walletData.totalDebited.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            onClick={async () => {
              const amountStr = window.prompt('Qual valor deseja recarregar? (ex: 50)');
              if (!amountStr) return;
              const amount = parseFloat(amountStr);
              if (isNaN(amount) || amount <= 0) return showToast('Valor inválido', 'error');
              
              showToast('Gerando link de pagamento...', 'info');
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch('/api/payments/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                  body: JSON.stringify({ items: [{ id: 'wallet_recharge', title: 'Recarga de Carteira', price: amount, quantity: 1 }] })
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else showToast(data.error || 'Erro ao gerar pagamento', 'error');
              } catch (e) {
                showToast('Falha na comunicação com gateway.', 'error');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--leaf-green)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            <PlusCircle size={18} /> Recarregar
          </button>
          <button 
            onClick={() => showToast('Módulo de transferência em desenvolvimento!', 'info')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Send size={18} /> Transferir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.tabsContainer}>
        <button className={`${styles.tabBtn} ${filter === 'all' ? styles.tabBtnActive : ''}`} onClick={() => setFilter('all')}>
          Tudo
        </button>
        <button className={`${styles.tabBtn} ${filter === 'credit' ? styles.tabBtnActive : ''}`} onClick={() => setFilter('credit')}>
          Entradas
        </button>
        <button className={`${styles.tabBtn} ${filter === 'debit' ? styles.tabBtnActive : ''}`} onClick={() => setFilter('debit')}>
          Saídas
        </button>
      </div>

      {/* Transactions List */}
      <div className={styles.transactionsList}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx: any) => (
            <div key={tx.id} className={styles.txRow}>
              <div className={styles.txLeft}>
                <div className={`${styles.txIcon} ${tx.type === 'credit' ? styles.txIconCredit : styles.txIconDebit}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className={styles.txDesc}>{tx.description}</p>
                  <p className={styles.txDate}>{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className={`${styles.txAmount} ${tx.type === 'credit' ? styles.txAmountCredit : styles.txAmountDebit}`}>
                {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <History size={48} style={{ marginBottom: 16, opacity: 0.5, margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Nenhuma transação</h3>
            <p>Você ainda não possui movimentações na carteira.</p>
          </div>
        )}
      </div>
    </div>
  );
}
