'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { ChefHat, BookOpen, Truck, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ChefDashboard = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [servicesCount, setServicesCount] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem('user_name');
    if (name) setUserName(name.split(' ')[0]);

    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }

    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.full_name) {
          setUserName(data.data.full_name.split(' ')[0]);
          localStorage.setItem('user_name', data.data.full_name);
        }
      });

    Promise.all([
      fetch('/api/recipes', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([recipesRes, servicesRes]) => {
        const recipesData = await recipesRes.json();
        const servicesData = await servicesRes.json();
        
        if (recipesData.success) {
          setRecipes(Array.isArray(recipesData.data) ? recipesData.data : []);
        }
        if (servicesData.success) {
          const servicesList = Array.isArray(servicesData.data) ? servicesData.data : [];
          setServicesCount(servicesList.length);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" color="#30852f" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Olá, {userName || 'Chef'}! 👨‍🍳</h1>
          <p>Gerencie suas receitas e pedidos de insumos para restaurantes.</p>
        </div>
        <Link href="/portal/chef/receitas/nova" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Nova Receita
        </Link>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#fff7ed' }}><BookOpen size={24} color="#ea580c" /></div>
          <h3>Minhas Receitas</h3>
          <p>{recipes.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#f0fdf4' }}><Truck size={24} color="#16a34a" /></div>
          <h3>Pedidos B2B</h3>
          <p>—</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#eff6ff' }}><ChefHat size={24} color="#2563eb" /></div>
          <h3>Serviços</h3>
          <p>{servicesCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconBox} style={{ backgroundColor: '#fdf2f8' }}><Star size={24} color="#db2777" /></div>
          <h3>Sua Nota</h3>
          <p>5.0 ★</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <h2>Minhas Receitas</h2>
          <div className={styles.recipeList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recipes.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14, marginTop: 12 }}>
                Nenhuma receita ainda.{' '}
                <Link href="/portal/chef/receitas/nova" style={{ color: '#30852f', fontWeight: 700 }}>
                  Criar primeira receita →
                </Link>
              </p>
            ) : (
              recipes.slice(0, 3).map((recipe) => (
                <Link href={`/receitas/${recipe.id}`} key={recipe.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #eee', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f5f5', overflow: 'hidden' }}>
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={20} color="#ccc" /></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 15, color: '#333' }}>{recipe.title}</h4>
                    <span style={{ fontSize: 12, color: '#888' }}>{new Date(recipe.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
            {recipes.length > 3 && (
              <Link href="/portal/chef/receitas" style={{ fontSize: 14, color: '#ea580c', fontWeight: 600, textAlign: 'center', display: 'block', marginTop: 8 }}>
                Ver todas as receitas
              </Link>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Gestão B2B</h2>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#14532d' }}>Atacado para Restaurantes</h3>
            <p style={{ fontSize: '13px', marginBottom: '16px', color: '#166534' }}>
              Compre insumos frescos diretamente dos feirantes com desconto B2B.
            </p>
            <Link href="/b2b" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', fontSize: 14 }}>
              Ver Catálogo Atacado
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
