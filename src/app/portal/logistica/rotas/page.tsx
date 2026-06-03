'use client';

import React from 'react';
import { Truck, Map, Navigation, Clock, Package, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';

export default function LogisticsRoutesPage() {
  const routes = [
    { id: 'ROTA-A1', driver: 'Marcos Entregas', vehicle: 'Fiorino Branca', progress: 65, stops: 12, completed: 8, status: 'in_progress' },
    { id: 'ROTA-A2', driver: 'Julio Silva', vehicle: 'Moto Honda', progress: 100, stops: 15, completed: 15, status: 'completed' },
    { id: 'ROTA-B1', driver: 'Claudio Lima', vehicle: 'Van Sprinter', progress: 10, stops: 20, completed: 2, status: 'pending' },
  ];

  return (
    <div className="routes-container">
      <header className="page-header">
        <div>
          <h1>Gestão de Rotas Otimizadas</h1>
          <p>Acompanhamento de entregas e performance da frota</p>
        </div>
        <button className="optimize-btn">
          <Navigation size={18} /> Otimizar Novas Rotas
        </button>
      </header>

      <section className="live-summary">
        <div className="summary-card">
          <Truck size={24} />
          <div>
            <span className="label">Veículos em Rota</span>
            <h3>12 / 15</h3>
          </div>
        </div>
        <div className="summary-card">
          <Package size={24} />
          <div>
            <span className="label">Pedidos Entregues</span>
            <h3>142 / 180</h3>
          </div>
        </div>
        <div className="summary-card">
          <Clock size={24} />
          <div>
            <span className="label">Tempo Médio</span>
            <h3>42 min</h3>
          </div>
        </div>
      </section>

      <div className="routes-layout">
        <div className="routes-list">
          {routes.map(route => (
            <div key={route.id} className={`route-card ${route.status}`}>
              <div className="route-header">
                <div className="route-id">
                  <strong>{route.id}</strong>
                  <span>{route.driver} • {route.vehicle}</span>
                </div>
                {route.status === 'completed' && <CheckCircle2 size={20} className="done-icon" />}
              </div>
              
              <div className="progress-section">
                <div className="progress-info">
                  <span>Progresso</span>
                  <span>{route.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: `${route.progress}%` }}></div>
                </div>
              </div>

              <div className="route-footer">
                <div className="stops-info">
                  <MapPin size={14} />
                  <span>{route.completed} de {route.stops} paradas</span>
                </div>
                <button className="details-btn">
                  Detalhes <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="map-preview">
          <div className="map-placeholder">
            <Map size={48} />
            <p>Mapa Interativo em Tempo Real</p>
            <span>(Integração Google Maps API)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .routes-container {
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
        }
        .optimize-btn {
          background: var(--text-main);
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
        .live-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .summary-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 20px;
          color: var(--leaf-green);
        }
        .summary-card .label {
          display: block;
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          font-weight: 700;
        }
        .summary-card h3 {
          font-size: 24px;
          color: var(--text-main);
          margin-top: 4px;
        }
        .routes-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 32px;
        }
        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .route-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #eee;
          transition: border-color 0.2s;
        }
        .route-card:hover {
          border-color: var(--leaf-green);
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .route-id strong {
          display: block;
          font-size: 16px;
        }
        .route-id span {
          font-size: 13px;
          color: #888;
        }
        .done-icon {
          color: var(--leaf-green);
        }
        .progress-section {
          margin-bottom: 20px;
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #555;
        }
        .progress-bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar .fill {
          height: 100%;
          background: var(--leaf-green);
          border-radius: 4px;
        }
        .route-card.completed .progress-bar .fill {
          background: #3b82f6;
        }
        .route-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stops-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }
        .details-btn {
          background: transparent;
          border: none;
          color: var(--leaf-green);
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .map-preview {
          background: #f9f9f9;
          border-radius: 32px;
          border: 2px dashed #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }
        .map-placeholder {
          text-align: center;
          color: #ccc;
        }
        .map-placeholder p {
          font-weight: 700;
          color: #999;
          margin-top: 16px;
        }
        .map-placeholder span {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

