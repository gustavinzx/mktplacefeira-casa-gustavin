'use client';

import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Vendas Totais (GMV)', value: 'R$ 142.500', trend: '+12%', up: true, icon: TrendingUp },
    { label: 'Novos Usuários', value: '1.240', trend: '+5%', up: true, icon: Users },
    { label: 'Pedidos Ativos', value: '450', trend: '-2%', up: false, icon: ShoppingBag },
    { label: 'Feiras Ativas', value: '32', trend: '+2', up: true, icon: MapPin },
  ];

  return (
    <div className="admin-portal">
      <PortalSidebar role="admin" />
      
      <main className="admin-content">
        <header className="content-header">
          <div>
            <h1>Painel Administrativo Master</h1>
            <p>Visão geral de toda a rede Feira Casa</p>
          </div>
          <div className="date-picker">
            Últimos 30 dias
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon"><stat.icon size={20} /></div>
                <span className={`trend ${stat.up ? 'up' : 'down'}`}>
                  {stat.trend} {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
              </div>
              <div className="stat-body">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="dashboard-layout">
          <section className="chart-section">
            <div className="card-header">
              <h2>Volume de Vendas</h2>
              <Activity size={20} />
            </div>
            <div className="chart-placeholder">
              {/* Grafico aqui */}
              <div className="bar-grid">
                {[40, 60, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </section>

          <section className="recent-activity">
            <div className="card-header">
              <h2>Últimos Pedidos</h2>
              <Package size={20} />
            </div>
            <div className="activity-list">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="activity-item">
                  <div className="item-avatar">P</div>
                  <div className="item-info">
                    <strong>Pedido #102{i}</strong>
                    <span>R$ 142,90 • Há 5 min</span>
                  </div>
                  <span className="status-pill">Pendente</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .admin-portal { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background: #fdfdfd; }
        .admin-content { padding: 40px; }
        
        .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .content-header h1 { font-size: 28px; margin-bottom: 4px; }
        .content-header p { color: #666; }
        .date-picker { background: white; border: 1px solid #eee; padding: 8px 16px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 24px; border-radius: 24px; border: 1px solid #eee; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .stat-icon { width: 40px; height: 40px; background: #eef7f2; color: var(--leaf-green); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        
        .trend { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 2px; }
        .trend.up { color: #059669; }
        .trend.down { color: #dc2626; }
        
        .stat-body h3 { font-size: 24px; margin-bottom: 4px; }
        .stat-body p { font-size: 13px; color: #888; font-weight: 600; }

        .dashboard-layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; }
        
        .chart-section, .recent-activity { background: white; border-radius: 32px; border: 1px solid #eee; padding: 32px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; color: #ccc; }
        .card-header h2 { font-size: 18px; color: var(--text-main); }

        .chart-placeholder { height: 300px; display: flex; align-items: flex-end; padding-bottom: 20px; }
        .bar-grid { display: flex; align-items: flex-end; gap: 20px; width: 100%; height: 200px; }
        .bar { flex: 1; background: #eef7f2; border-radius: 8px; transition: height 0.3s, background 0.2s; position: relative; }
        .bar:hover { background: var(--leaf-green); }

        .activity-list { display: flex; flex-direction: column; gap: 20px; }
        .activity-item { display: flex; align-items: center; gap: 16px; }
        .item-avatar { width: 40px; height: 40px; background: #f5f5f5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #999; }
        .item-info { flex: 1; }
        .item-info strong { display: block; font-size: 14px; }
        .item-info span { font-size: 12px; color: #888; }
        .status-pill { font-size: 11px; font-weight: 700; background: #fffbeb; color: #d97706; padding: 4px 8px; border-radius: 6px; }
      `}</style>
    </div>
  );
}
