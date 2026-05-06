'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Plus, MoreVertical, TrendingUp, Users } from 'lucide-react';

export default function POSManagementPage() {
  const points = [
    { id: '1', name: 'Feira Livre de Pinheiros', days: 'Sábados e Domingos', hours: '07:00 - 14:00', salesToday: 'R$ 1.240,00', visitors: 142, status: 'open' },
    { id: '2', name: 'Feira do Pacaembu', days: 'Terças e Sextas', hours: '07:30 - 13:00', salesToday: 'R$ 0,00', visitors: 0, status: 'closed' },
  ];

  return (
    <div className="pos-container">
      <header className="page-header">
        <div>
          <h1>Pontos de Venda e Venda Diária</h1>
          <p>Gerencie suas bancas físicas e acompanhe o desempenho em tempo real</p>
        </div>
        <button className="add-btn">
          <Plus size={18} /> Novo Ponto de Venda
        </button>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-icon sales"><TrendingUp size={24} /></div>
          <div>
            <span className="label">Venda Total Hoje</span>
            <h3>R$ 1.240,00</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon visitors"><Users size={24} /></div>
          <div>
            <span className="label">Visitantes Hoje</span>
            <h3>142</h3>
          </div>
        </div>
      </section>

      <div className="points-list">
        {points.map(point => (
          <div key={point.id} className="point-card">
            <div className="point-header">
              <div className="point-main-info">
                <div className={`status-dot ${point.status}`}></div>
                <h3>{point.name}</h3>
              </div>
              <button className="menu-btn"><MoreVertical size={18} /></button>
            </div>

            <div className="point-details">
              <div className="detail">
                <Calendar size={16} />
                <span>{point.days}</span>
              </div>
              <div className="detail">
                <Clock size={16} />
                <span>{point.hours}</span>
              </div>
            </div>

            <div className="point-performance">
              <div className="perf-item">
                <span className="perf-label">Venda Hoje</span>
                <span className="perf-value">{point.salesToday}</span>
              </div>
              <div className="perf-item">
                <span className="perf-label">Visitantes</span>
                <span className="perf-value">{point.visitors}</span>
              </div>
            </div>

            <div className="point-actions">
              <button className="edit-btn">Editar Horários</button>
              <button className="report-btn">Ver Relatório</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pos-container {
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
        .add-btn {
          background: var(--leaf-green);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.sales { background: #eef7f2; color: var(--leaf-green); }
        .stat-icon.visitors { background: #eff6ff; color: #3b82f6; }
        .stat-card .label {
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
          font-weight: 600;
        }
        .stat-card h3 {
          font-size: 24px;
          margin-top: 4px;
        }
        .points-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }
        .point-card {
          background: white;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #eee;
          transition: transform 0.2s;
        }
        .point-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-sm);
        }
        .point-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .point-main-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .status-dot.open { background: var(--leaf-green); }
        .status-dot.closed { background: #ccc; }
        .point-main-info h3 {
          font-size: 18px;
        }
        .menu-btn {
          background: transparent;
          border: none;
          color: #ccc;
          cursor: pointer;
        }
        .point-details {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .detail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #666;
        }
        .point-performance {
          background: #fafafa;
          padding: 16px;
          border-radius: 16px;
          display: flex;
          justify-content: space-around;
          margin-bottom: 24px;
        }
        .perf-item {
          text-align: center;
        }
        .perf-label {
          display: block;
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .perf-value {
          font-weight: 700;
          color: var(--text-main);
        }
        .point-actions {
          display: flex;
          gap: 12px;
        }
        .point-actions button {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .edit-btn {
          background: white;
          border: 1px solid #ddd;
          color: #555;
        }
        .report-btn {
          background: #f5f5f5;
          border: none;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
