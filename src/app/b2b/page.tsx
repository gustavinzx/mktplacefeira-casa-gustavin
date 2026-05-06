'use client';

import React from 'react';
import Header from '@/components/Header';
import styles from './page.module.css';
import { 
  LayoutDashboard, 
  Store, 
  Receipt, 
  Wallet, 
  Building2, 
  Search, 
  ShoppingCart, 
  Bell, 
  Truck,
  Heart,
  Plus
} from 'lucide-react';

const B2BPage = () => {
  const products = [
    {
      id: 'b1',
      name: 'Tomate Italiano Extra',
      producer: 'Fazenda Sol Nascente',
      price: 5.45,
      oldPrice: 8.90,
      unit: 'kg',
      minOrder: '20 kg (1 Caixa)',
      boxPrice: 109.00,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeKpoVUzmwXDZjpFYUThEMWYs5xweQ6iv3IQQ9gg4nGFBH2HBQS6PMNiNXx-HjPj8mRFnYgfx7wKEzCbAJN06YKykkWqhQZQjYISj2WSZdohoMuGiB5uxbDv0NgDkQqaWa-5rXiDl404cddMfQQweQM7mVAL6NnbMffFuz7AP84_4oNonbyMRrVJpJkmIxWiU5jzZb2AyrkM2Zhls-MMg9HgxB5XnWwuy-EOt_1zS1GnTaedYjvg_mOuVpuj3wEnHyBHHPei3M08E'
    },
    {
      id: 'b2',
      name: 'Cenoura Baby Selecionada',
      producer: 'Horta Comunitária Vale',
      price: 4.20,
      oldPrice: 6.50,
      unit: 'kg',
      minOrder: '10 kg (1 Saco)',
      boxPrice: 42.00,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBCdh4uNZhlnVheT_IoF9OXMXItAr7vcy67P5Hlz7b2MZ5TSxOk8YhY_HdVNENnB8OSaNGJd7nx_OTZPdcHLVkEipVy4UsL8LDv3HkFl-abIFQNQJW9w_m8hgtpVWapbwduCDKJA50V2qD7Sx8ZPskEMDBMY6xXxdZz0bS7ERbdcYCrDX3dowhCjeNu2G3gMS6eOFIGwbahsHc_7v1F7bdG-NpjC1zk3pgRVxOZ3K-yYcCsOu_F7hFBYDyJR7Ojc5m4lyiA6XL_2M'
    }
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileBox}>
            <div className={styles.avatar}>H</div>
            <div>
              <p className={styles.portalName}>Portal B2B</p>
              <p className={styles.cnpj}>00.000.000/0001-00</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <a href="#" className={styles.navItem}><LayoutDashboard size={20} /> Dashboard</a>
            <a href="#" className={`${styles.navItem} ${styles.active}`}><Store size={20} /> Catálogo</a>
            <a href="#" className={styles.navItem}><Receipt size={20} /> Meus Pedidos</a>
            <a href="#" className={styles.navItem}><Wallet size={20} /> Faturamento</a>
            <a href="#" className={styles.navItem}><Building2 size={20} /> Dados Empresa</a>
          </nav>

          <div className={styles.creditBox}>
            <p className={styles.creditLabel}>Status do Limite</p>
            <div className={styles.progressBar}><div style={{ width: '75%' }}></div></div>
            <p className={styles.creditInfo}>75% do crédito B2B utilizado</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          <header className={styles.contentHeader}>
             <div className={styles.searchBar}>
               <Search size={18} />
               <input type="text" placeholder="Buscar produtores ou produtos em atacado..." />
             </div>
             <div className={styles.headerActions}>
               <button><Bell size={20} /></button>
               <button className={styles.cartBtn}><ShoppingCart size={20} /> <span>3</span></button>
             </div>
          </header>

          <section className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK55aZE7MaX3YHsaZQDFFFo5zDwJis9M1jmdB_fI-5iqw8BBFtTQAazRHUPxYfqmHve_JgdDn42XeGtDpsUqq4-hYjWPef-fvUqntmvGfNeaR2JBaaoXrl9xPogX97my02LPE6RbSUeHar9RdzQ_oQYGEM-GA96ahqfDH51XJEsfV33ZQGj5Arw4SnzpfhT_Or_GYsWqtg3dYXDCzMyvLXP1Cc8XJOi58ZdH6zsu4AfHf_j_bUFsQX5pqTetgRJu35hfyziVJds4g" alt="Hortifruti" />
              <div className={styles.heroOverlay}>
                <span className={styles.badge}>Oferta da Semana</span>
                <h2>Hortifruti Fresco <br/>Direto do Produtor</h2>
                <p>Condições exclusivas para faturamentos acima de R$ 5.000,00.</p>
                <button className={styles.btnPrimary}>Explorar Ofertas</button>
              </div>
            </div>
            <div className={styles.heroSide}>
              <h3>Pedido Mínimo</h3>
              <p>Aproveite frete grátis para sua região em pedidos acima de R$ 1.200,00.</p>
              <div className={styles.shippingInfo}>
                <div>
                  <span>Próxima Saída</span>
                  <strong>Amanhã, 04:00</strong>
                </div>
                <Truck size={32} />
              </div>
            </div>
          </section>

          <div className={styles.productGrid}>
            {products.map(p => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.cardImage}>
                  <img src={p.imageUrl} alt={p.name} />
                  <div className={styles.cardBadges}>
                    <span className={styles.tagGreen}>Colhido hoje</span>
                    <span className={styles.tagOrange}>-15% Atacado</span>
                  </div>
                  <button className={styles.btnFav}><Heart size={16} /></button>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.producer}>{p.producer}</p>
                  <h4>{p.name}</h4>
                  <div className={styles.priceRow}>
                    <p className={styles.oldPrice}>Unid: R$ {p.oldPrice.toFixed(2)}</p>
                    <p className={styles.mainPrice}>R$ {p.price.toFixed(2)}<span>/{p.unit}</span></p>
                  </div>
                  <div className={styles.bulkInfo}>
                    <div className={styles.bulkRow}>
                      <span>Mín. Atacado:</span>
                      <strong>{p.minOrder}</strong>
                    </div>
                    <div className={styles.bulkRow}>
                      <span>Preço Fardo:</span>
                      <strong className={styles.boxPrice}>R$ {p.boxPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                  <button className={styles.btnAdd}><Plus size={16} /> Adicionar ao Pedido</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default B2BPage;
