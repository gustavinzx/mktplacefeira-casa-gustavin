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

  React.useEffect(() => {
    const saved = localStorage.getItem('admin_banners');
    if (saved) {
      setBanners(JSON.parse(saved));
    }
  }, []);

  const saveBanners = (newBanners: any[]) => {
    setBanners(newBanners);
    localStorage.setItem('admin_banners', JSON.stringify(newBanners));
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      saveBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleAdd = () => {
    const title = prompt('Título do Banner:');
    if (!title) return;
    const desc = prompt('Descrição (ex: Ativo até...):') || 'Sem descrição';
    const tag = prompt('Tag (ex: Página Inicial):') || 'Geral';
    const img = prompt('URL da Imagem:') || '/images/hero.png';
    
    const newBanner = { id: Date.now(), title, desc, tag, img };
    saveBanners([...banners, newBanner]);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Gestão de Banners</h1>
          <p>Adicione, edite ou remova os banners promocionais do aplicativo.</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleAdd}>
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
                  <button className={styles.btnAction} title="Editar" onClick={() => {
                    const title = prompt('Novo título:', b.title);
                    if (!title) return;
                    const desc = prompt('Nova descrição:', b.desc) || b.desc;
                    const tag = prompt('Nova tag:', b.tag) || b.tag;
                    const img = prompt('Nova URL de imagem:', b.img) || b.img;
                    const updated = banners.map(banner => banner.id === b.id ? { ...banner, title, desc, tag, img } : banner);
                    saveBanners(updated);
                    showToast('Banner editado com sucesso!', 'success');
                  }}><Edit2 size={16} /></button>
                  <button className={`${styles.btnAction} ${styles.btnDelete}`} title="Excluir" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
