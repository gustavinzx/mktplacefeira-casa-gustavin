'use client';

import React from 'react';
import { RefreshCcw, AlertTriangle, CheckCircle, Clock, Eye, Search } from 'lucide-react';

export default function ReturnsManagementPage() {
  const returns = [
    { id: 'RET-001', customer: 'João Silva', date: '25 Abr 2026', product: 'Tomate Grape (250g)', reason: 'Produto danificado', status: 'pending', amount: 'R$ 12,90' },
    { id: 'RET-002', customer: 'Maria Oliveira', date: '24 Abr 2026', product: 'Banana Prata (1kg)', reason: 'Item errado', status: 'approved', amount: 'R$ 8,50' },
    { id: 'RET-003', customer: 'Ricardo Santos', date: '22 Abr 2026', product: 'Cesta Orgânica P', reason: 'Faltou um item', status: 'rejected', amount: 'R$ 45,00' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="status pending">Pendente</span>;
      case 'approved': return <span className="status approved">Aprovado</span>;
      case 'rejected': return <span className="status rejected">Recusado</span>;
      default: return null;
    }
  };

  return (
    <div className="returns-container">
      <header className="page-header">
        <div>
          <h1>Gestão de Devoluções</h1>
          <p>Acompanhe e responda solicitações de reembolso</p>
        </div>
        <div className="returns-summary">
          <div className="stat">
            <span className="value">3</span>
            <span className="label">Novas solicitações</span>
          </div>
        </div>
      </header>

      <div className="table-filters">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por pedido ou cliente..." />
        </div>
        <div className="tabs">
          <button className="active">Todos</button>
          <button>Pendentes</button>
          <button>Resolvidos</button>
        </div>
      </div>

      <div className="returns-table-container">
        <table className="returns-table">
          <thead>
            <tr>
              <th>ID Solicitação</th>
              <th>Cliente</th>
              <th>Produto</th>
              <th>Motivo</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(ret => (
              <tr key={ret.id}>
                <td className="id-cell">{ret.id}</td>
                <td>{ret.customer}</td>
                <td className="product-cell">{ret.product}</td>
                <td className="reason-cell">
                  <AlertTriangle size={14} /> {ret.reason}
                </td>
                <td className="amount-cell">{ret.amount}</td>
                <td>{getStatusBadge(ret.status)}</td>
                <td>
                  <button className="view-btn"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .returns-container {
          padding: 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .page-header p {
          color: #666;
        }
        .stat {
          background: #fff4e5;
          color: #904d00;
          padding: 12px 24px;
          border-radius: 16px;
          text-align: center;
        }
        .stat .value {
          display: block;
          font-size: 24px;
          font-weight: 800;
        }
        .stat .label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .table-filters {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .search-box {
          background: white;
          border: 1px solid #eee;
          padding: 10px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 300px;
        }
        .search-box input {
          border: none;
          outline: none;
          font-size: 14px;
          width: 100%;
        }
        .tabs {
          display: flex;
          background: #f5f5f5;
          padding: 4px;
          border-radius: 12px;
        }
        .tabs button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
        }
        .tabs button.active {
          background: white;
          color: var(--text-main);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .returns-table-container {
          background: white;
          border-radius: 24px;
          border: 1px solid #eee;
          overflow: hidden;
        }
        .returns-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .returns-table th {
          background: #fafafa;
          padding: 16px 24px;
          font-size: 13px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .returns-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #f5f5f5;
          font-size: 14px;
          color: #444;
        }
        .id-cell {
          font-family: monospace;
          font-weight: 700;
          color: var(--text-main);
        }
        .reason-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #904d00;
        }
        .amount-cell {
          font-weight: 700;
        }
        .status {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .status.pending { background: #fff4e5; color: #904d00; }
        .status.approved { background: #eef7f2; color: #0b612e; }
        .status.rejected { background: #fef2f2; color: #991b1b; }
        .view-btn {
          background: transparent;
          border: none;
          color: #ccc;
          cursor: pointer;
          transition: color 0.2s;
        }
        .view-btn:hover {
          color: var(--leaf-green);
        }
      `}</style>
    </div>
  );
}
