'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/feirante/returns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReturns(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const updateStatus = async (return_id: string, status: string) => {
    if (!confirm(`Deseja realmente ${status === 'approved' ? 'aprovar' : 'rejeitar'} esta devolução?`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/feirante/returns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ return_id, status })
      });
      if (res.ok) {
        fetchReturns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado (Estornado)';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Devoluções e Estornos</h1>
        <p className={styles.subtitle}>Gerencie solicitações de devolução de pedidos feitos na sua banca.</p>
      </div>

      <div className={styles.tableContainer}>
        {returns.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data da Solicitação</th>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>Motivo</th>
                <th>Valor do Estorno</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(ret => (
                <tr key={ret.id}>
                  <td>{new Date(ret.created_at).toLocaleString('pt-BR')}</td>
                  <td>{ret.order?.customer?.full_name || 'Desconhecido'}</td>
                  <td>#{ret.order_id.split('-')[0].toUpperCase()}</td>
                  <td>{ret.reason}</td>
                  <td style={{ fontWeight: 700 }}>R$ {Number(ret.order?.total_amount).toFixed(2).replace('.', ',')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${ret.status}`]}`}>
                      {statusLabel(ret.status)}
                    </span>
                  </td>
                  <td>
                    {ret.status === 'pending' && (
                      <div className={styles.actions}>
                        <button className={`${styles.btnAction} ${styles.btnApprove}`} onClick={() => updateStatus(ret.id, 'approved')}>
                          Aprovar
                        </button>
                        <button className={`${styles.btnAction} ${styles.btnReject}`} onClick={() => updateStatus(ret.id, 'rejected')}>
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <RefreshCw size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>Não há solicitações de devolução no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
