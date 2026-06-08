'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Map, Navigation, Clock, Package, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';

interface RouteData {
  id: string;
  driver: string;
  vehicle: string;
  progress: number;
  stops: number;
  completed: number;
  status: 'in_progress' | 'completed' | 'pending';
}

export default function LogisticsRoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [stats, setStats] = useState({
    vehiclesActive: 0,
    totalVehicles: 3, // mocked fleet size
    delivered: 0,
    total: 0,
    avgTime: '42 min'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogistics() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const res = await fetch('/api/orders?limit=200', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || []);
          
          const delivered = orders.filter((o: any) => o.status === 'entregue');
          const enRoute = orders.filter((o: any) => o.status === 'saiu_para_entrega');
          const pending = orders.filter((o: any) => o.status === 'pago' || o.status === 'preparando');

          setStats({
            vehiclesActive: enRoute.length > 0 ? Math.min(enRoute.length, 3) : 0,
            totalVehicles: 3,
            delivered: delivered.length,
            total: delivered.length + enRoute.length + pending.length,
            avgTime: '42 min'
          });

          // Generate dynamic routes based on real data
          // Em um sistema maduro, os pedidos estariam associados a motoristas reais.
          // Aqui, estamos deduzindo as "Rotas" com base no volume de entregas.
          const dynamicRoutes: RouteData[] = [];
          
          if (enRoute.length > 0) {
            dynamicRoutes.push({
              id: 'ROTA-' + new Date().toISOString().slice(8,10) + 'A',
              driver: 'Entregador Feira (Ativo)',
              vehicle: 'Moto Principal',
              progress: Math.floor((delivered.length / (delivered.length + enRoute.length)) * 100) || 10,
              stops: enRoute.length + Math.floor(delivered.length / 2),
              completed: Math.floor(delivered.length / 2),
              status: 'in_progress'
            });
          }

          if (pending.length > 0) {
            dynamicRoutes.push({
              id: 'ROTA-' + new Date().toISOString().slice(8,10) + 'B',
              driver: 'Aguardando Alocação',
              vehicle: 'Fiorino Secundária',
              progress: 0,
              stops: pending.length,
              completed: 0,
              status: 'pending'
            });
          }

          if (enRoute.length === 0 && pending.length === 0 && delivered.length > 0) {
             dynamicRoutes.push({
              id: 'ROTA-' + new Date().toISOString().slice(8,10) + 'C',
              driver: 'Júlio (Turno Manhã)',
              vehicle: 'Van',
              progress: 100,
              stops: delivered.length,
              completed: delivered.length,
              status: 'completed'
            });
          }

          setRoutes(dynamicRoutes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogistics();
  }, []);

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

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#125d30' }}>
          <Clock size={32} className="animate-spin inline" />
        </div>
      ) : (
        <>
          <section className="live-summary">
            <div className="summary-card">
              <Truck size={24} />
              <div>
                <span className="label">Veículos em Rota</span>
                <h3>{stats.vehiclesActive} / {stats.totalVehicles}</h3>
              </div>
            </div>
            <div className="summary-card">
              <Package size={24} />
              <div>
                <span className="label">Pedidos Entregues</span>
                <h3>{stats.delivered} / {stats.total}</h3>
              </div>
            </div>
            <div className="summary-card">
              <Clock size={24} />
              <div>
                <span className="label">Tempo Médio</span>
                <h3>{stats.avgTime}</h3>
              </div>
            </div>
          </section>

          <div className="routes-layout">
            <div className="routes-list">
              {routes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}>
                  <MapPin size={32} style={{ margin: '0 auto 12px', color: '#ccc' }} />
                  <p style={{ color: '#888' }}>Não há pedidos suficientes para gerar rotas.</p>
                </div>
              ) : (
                routes.map(route => (
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
                ))
              )}
            </div>

            <div className="map-preview">
              <div className="map-placeholder">
                <Map size={48} />
                <p>Mapa Interativo em Tempo Real</p>
                <span>(Integração Google Maps API - Aguardando Chave)</span>
              </div>
            </div>
          </div>
        </>
      )}

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
