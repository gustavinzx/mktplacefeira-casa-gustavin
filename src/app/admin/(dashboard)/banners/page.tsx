'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/Toast';
import styles from './page.module.css';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function BannersPage() {
  const { showToast } = useToast();
  const defaultBanners = [
    { id: 1, title: 'Hero Principal', desc: 'Ativo até 31/12/2024', tag: 'Página Inicial', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2zz9mSEXnF3-SX-ZvYRLKxO6upzzpBNAFtg0YXC4VLErBtqEJmU4cKeIQEPEGFrNmqNLyZXJ6GD9ldqzOgJ7fv_yf9e0EsInTgqvQ7JsC1YcaeTTQDxJLZxERyAEyxRnaZuRe5MCnAMcVtwi052fjM9WD6v3rrThL43O5iQtHeaa7bap4Xzm70qN6QNZFFhqnlrNaur9I0U_fvJQxJ-FK1AD2oWZfGTS7fJAGxF1awu1O37L9mchvfrC_vYEc-wriZJuigH_iydE' },
    { id: 2, title: 'Ofertas da Semana', desc: 'Sempre ativo', tag: 'Lateral', img: '/images/hero.png' },
    { id: 3, title: 'Campanha de Inverno', desc: 'Ativo até 30/08/2024', tag: 'Pop-up', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop' },
  ];

  const [banners, setBanners] = useState(defaultBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  const [formData, setFormData] = useState({ title: '', desc: '', tag: '', img: '' });

  const handleDelete = (id: number) => {
    setBanners(banners.filter(b => b.id !== id));
    showToast('Banner excluído com sucesso', 'success');
  };

  const openAdd = () => {
    setEditingBanner(null);
    setFormData({ title: '', desc: '', tag: '', img: '' });
    setModalOpen(true);
  };
  
  const openEdit = (b: any) => {
    setEditingBanner(b);
    setFormData({ title: b.title, desc: b.desc, tag: b.tag, img: b.img });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) return showToast('Título é obrigatório', 'error');
    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...formData } : b));
      showToast('Banner editado com sucesso', 'success');
    } else {
      setBanners([...banners, { id: Date.now(), ...formData }]);
      showToast('Banner criado com sucesso', 'success');
    }
    setModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Gestão de Banners</h1>
          <p>Adicione, edite ou remova os banners promocionais do aplicativo.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openAdd}>
          <Plus size={16} /> Novo Banner
        </button>
      </header>

      <div className={styles.grid}>
        {banners.length === 0 ? (
          <p style={{ color: '#78716c', padding: '20px 0' }}>Nenhum banner cadastrado.</p>
        ) : (
          banners.map(b => (
            <div key={b.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <img src={b.img} alt={b.title} />
                <span className={styles.tag}>{b.tag}</span>
              </div>
              <div className={styles.info}>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
                <div className={styles.actions}>
                  <button className={styles.btnAction} title="Editar" onClick={() => openEdit(b)}><Edit2 size={16} /></button>
                  <button className={`${styles.btnAction} ${styles.btnDelete}`} title="Excluir" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
              {editingBanner ? 'Editar Banner' : 'Novo Banner'}
            </h3>
            <input 
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#111827' }}
              placeholder="Título"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <input 
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#111827' }}
              placeholder="Descrição"
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
            />
            <input 
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#111827' }}
              placeholder="Tag"
              value={formData.tag}
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
            />
            <input 
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#111827' }}
              placeholder="URL da Imagem"
              value={formData.img}
              onChange={e => setFormData({ ...formData, img: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#6b7280' }} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button style={{ padding: '0.5rem 1rem', fontWeight: 'bold', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem' }} onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
