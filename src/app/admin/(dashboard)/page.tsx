'use client';

import React from 'react';
import styles from './page.module.css';
import { 
  TrendingUp, 
  Users as UsersIcon, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Calendar,
  Download,
  Image as ImageIcon,
  PlusCircle,
  Edit2,
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const metrics = [
    { title: 'Vendas Totais', value: 'R$ 42.850,00', change: '+12.5%', icon: DollarSign, color: '#0e6b17', bg: '#f0fdf4' },
    { title: 'Novos Feirantes', value: '124', change: '+8 novos', icon: UsersIcon, color: '#a63b00', bg: '#fff7ed' },
    { title: 'Pedidos do Dia', value: '312', change: 'Ativos agora', icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff' },
  ];

  const approvals = [
    { id: 1, name: 'João Maria - Orgânicos', email: 'joao.m@horta.com', type: 'Novo Feirante', location: 'Atibaia, SP', date: 'Hoje, 10:45', initial: 'JM' },
    { id: 2, name: 'Feira do Bairro Novo', email: 'Associação Moradores', type: 'Sugerir Feira', location: 'Curitiba, PR', date: 'Ontem, 16:20', initial: 'FB' },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Visão Geral</h1>
          <p>Bem-vindo de volta, Ricardo. Aqui está o resumo da feira hoje.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <Calendar size={16} />
            Últimos 30 dias
          </button>
          <button className={styles.btnPrimary}>
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon} style={{ color: m.color, backgroundColor: m.bg }}>
                  <Icon size={20} />
                </div>
                <span className={styles.metricChange} style={{ color: m.color === '#2563eb' ? '#2563eb' : '#0e6b17' }}>
                  {m.change} {m.color !== '#2563eb' && <TrendingUp size={12} />}
                </span>
              </div>
              <p className={styles.metricTitle}>{m.title}</p>
              <h3 className={styles.metricValue}>{m.value}</h3>
              <div className={styles.metricProgress}>
                <div className={styles.progressBar} style={{ backgroundColor: m.color, width: i === 0 ? '75%' : i === 1 ? '50%' : '66%' }}></div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Bento Grid */}
      <div className={styles.bento}>
        {/* Approvals Table */}
        <div className={styles.approvalsSection}>
          <div className={styles.sectionHeader}>
            <h2>Aprovações Pendentes</h2>
            <button className={styles.btnLink}>Ver todos</button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Solicitante</th>
                  <th>Tipo</th>
                  <th>Localidade</th>
                  <th>Data</th>
                  <th className={styles.textRight}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>{a.initial}</div>
                        <div>
                          <p className={styles.userName}>{a.name}</p>
                          <p className={styles.userEmail}>{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge} style={{ 
                        backgroundColor: a.type === 'Novo Feirante' ? '#f0fdf4' : '#eff6ff',
                        color: a.type === 'Novo Feirante' ? '#166534' : '#1e40af'
                      }}>
                        {a.type}
                      </span>
                    </td>
                    <td>{a.location}</td>
                    <td>{a.date}</td>
                    <td className={styles.textRight}>
                      <div className={styles.actions}>
                        <button className={styles.btnAction} title="Aprovar"><CheckCircle2 size={18} color="#0e6b17" /></button>
                        <button className={styles.btnAction} title="Recusar"><XCircle size={18} color="#ba1a1a" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Growth Chart Placeholder */}
        <div className={styles.chartSection}>
          <h2>Crescimento Semanal</h2>
          <div className={styles.chart}>
             {[40, 60, 35, 85, 55, 100, 75].map((h, i) => (
               <div key={i} className={styles.barWrapper}>
                 <div className={styles.bar} style={{ height: `${h}%`, backgroundColor: i === 5 ? '#0e6b17' : '#e5e7eb' }}>
                   {i === 5 && <span className={styles.barLabel}>Sáb</span>}
                 </div>
               </div>
             ))}
          </div>
          <div className={styles.chartFooter}>
            <span>Melhor dia: Sábado</span>
            <span className={styles.growthText}>+14% vs anterior</span>
          </div>
        </div>

        {/* Banner Management */}
        <div className={styles.bannersSection}>
          <div className={styles.sectionHeader}>
            <h2>Gestão de Banners</h2>
            <button className={styles.btnOutline}>
              <PlusCircle size={16} />
              Novo Banner
            </button>
          </div>
          <div className={styles.bannersGrid}>
            <div className={styles.heroBanner}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2zz9mSEXnF3-SX-ZvYRLKxO6upzzpBNAFtg0YXC4VLErBtqEJmU4cKeIQEPEGFrNmqNLyZXJ6GD9ldqzOgJ7fv_yf9e0EsInTgqvQ7JsC1YcaeTTQDxJLZxERyAEyxRnaZuRe5MCnAMcVtwi052fjM9WD6v3rrThL43O5iQtHeaa7bap4Xzm70qN6QNZFFhqnlrNaur9I0U_fvJQxJ-FK1AD2oWZfGTS7fJAGxF1awu1O37L9mchvfrC_vYEc-wriZJuigH_iydE" alt="Banner" />
              <div className={styles.bannerOverlay}>
                <span className={styles.bannerTag}>Hero Principal</span>
                <h4>Frescor Direto da Horta</h4>
                <p>Ativo até 31/12/2024</p>
              </div>
              <div className={styles.bannerActions}>
                <button><Edit2 size={14} /></button>
                <button className={styles.btnDelete}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className={styles.subBanner}>
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3lm3uzSi-Ce3p26rwoAJ9OT3N36Tn48Knmu1dKYWsf-GFr33LTO3_I5D-QJ4d2Ya0pilMnI05vVi7uK1YRzvZ5Pw2JxhLXhhZGKMqu50OVooV-tIFeHq-IKcGfkyOfMpAJUmFavw9paSE_nW0wyCY8F5jyzaRZeUd4JJlQD-CKIV0n3HOIneHWTTdHwW33vMHUGg_or2dsOVtuaQUAmTC0LLKqtMwPvY1a4BLldaKhJMXFemu32PR7WYEc4wPsdO7gSv_c2ILU-E" alt="Sub Banner" />
               <div className={styles.bannerOverlay}>
                <span className={styles.bannerTag}>Lateral</span>
                <h4>Ofertas</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
