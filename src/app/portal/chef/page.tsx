'use client';

import React from 'react';
import styles from './page.module.css';
import { ChefHat, BookOpen, Truck, Star } from 'lucide-react';

const ChefDashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Painel do Chef Gourmet</h1>
          <p>Gerencie suas receitas e pedidos de insumos para restaurantes.</p>
        </div>
        <button className="btn-primary">Nova Receita</button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#fff7ed' }}><BookOpen size={24} color="#ea580c" /></div>
          <h3>Receitas Ativas</h3>
          <p>12</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#f0fdf4' }}><Truck size={24} color="#16a34a" /></div>
          <h3>Pedidos B2B</h3>
          <p>5</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#eff6ff' }}><ChefHat size={24} color="#2563eb" /></div>
          <h3>Serviços Agendados</h3>
          <p>3</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#fdf2f8' }}><Star size={24} color="#db2777" /></div>
          <h3>Sua Nota</h3>
          <p>4.9 ★</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <h2>Receitas Populares</h2>
          <div className={styles.recipeList}>
            {[
              { title: 'Risoto de Cogumelos da Feira', views: '1.2k', link: '#' },
              { title: 'Salada Tropical Orgânica', views: '850', link: '#' },
              { title: 'Quiche de Alho Poró Premium', views: '640', link: '#' },
            ].map((recipe, idx) => (
              <div key={idx} className={styles.recipeItem}>
                <div className={styles.recipeThumb}></div>
                <div style={{ flex: 1 }}>
                  <h4>{recipe.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{recipe.views} visualizações • {idx + 5} ingredientes vinculados</p>
                </div>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Editar</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Gestão B2B</h2>
          <div style={{ background: 'var(--primary-container)', color: 'white', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Atacado para Restaurantes</h3>
            <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.9 }}>Você tem 2 novas solicitações de cotação de insumos.</p>
            <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)', border: 'none', width: '100%' }}>Ver Cotações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
