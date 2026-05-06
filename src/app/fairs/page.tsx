'use client';

import React from 'react';
import Header from '@/components/Header';
import styles from './page.module.css';
import { MapPin, Search, Sliders, Calendar, Clock, Navigation, Star } from 'lucide-react';

const FairsPage = () => {
  const fairs = [
    {
      id: '1',
      name: 'Feira de Pinheiros',
      distance: '1.2 km',
      address: 'Praça Benedito Calixto, 112',
      days: 'Sábados',
      hours: '07h - 14h',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6ssFQPUXXvyiF4bMba9a5an_wVGGn-GpPCx1GTPQ5_jtaCHV7iBvN0X7n6zn8JzJzVieayEIIhlUJnvrvBy8fq5DtbNTGOuC7W1JSs7XG_Ru1bZz7i5DTrOlSb5UyCgHsrPRpbIavVd1NhGywsRUrQELRGEIVKzc1AaVlZu91ih7HkPI5dYmc-w2mL_em0MjvJYLQ_qZHgBmXT1h_31-qjKQYRUlAhcXt5CBKC6R_TZt9WHeM16vWju1aK26bxKnsd1B5nT23PUU',
      type: 'tradicional'
    },
    {
      id: '2',
      name: 'Orgânicos Ibirapuera',
      distance: '4.8 km',
      address: 'Rua Tutóia, 1125',
      days: 'Ter, Qui, Dom',
      hours: '06h - 13h',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvX99-vNl1pggolXOmdCCDiQnVV3YWb84RJ5evnwZ2eCoRUyO3MpJfVDP-UyQpCG70N6ccuw9BMb7wyB1N30k1StwSqTwJq5_ur9CirVVzMtDEHQcz3zB924CQXgoD3rZ_etqOHO7c4FEUMnFhyjJkmXhIX1aoozKLhnbDCDidMfWjQIG7LxbJd8g6OVkBx1bC5MjIxzA6j-Kp2vhOE7eHI2kTIcavT7D4q3b-gTflcmptZRFUnHX6W2_Qo3eRxydbDxP3ywoWgs8',
      type: 'organica'
    },
    {
      id: '3',
      name: 'Feira da Vila Madalena',
      distance: '2.1 km',
      address: 'Rua Mourato Coelho, 800',
      days: 'Domingos',
      hours: '07h - 15h',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPAWoSDCpTlXJ4IoZsRxUj3d6yRUgmWgQCuRfi2yROKX9YYhmzMv99DDP_dqFv_K9ajhK2SfzPrHszrJLSDWDrsgrtm-Bz0F2cUq9Lxg-gJlY_t8CoD4AlEU036AJfmoPaX021hEV7_cqXVmSwJAV82Mwa6coRgQBPuhorg2g6oZqY3X3PM5qVkEtgUKEbMExKSLvx_tlambCqLejsgtRCKVCFhhCxrr6Y-c9Q-5vOkOR3PqA6tV9UTVn86bfpSPagKDiobXsZJqA',
      type: 'tradicional'
    },
    {
      id: '4',
      name: 'Feira Noturna Pacaembu',
      distance: '7.5 km',
      address: 'Praça Charles Miller, s/n',
      days: 'Quintas',
      hours: '17h - 21h',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEPf99_7BuGMkh7RHa79sKFRwUZu6HWMXGM2ueMNThjRgX1N_tmaQGggDodQpWlf3DqWGBxiMZGNLMlYk_tnmLeo04fga8WF9_oaHrUD0WC_GHJVJuHqraWY4So6tatuIeaV4tduQF0gG-KtU3-C0IRKfUD5ytob0rhoNSgF-k2PpJYOlQ0z12ln79ftC632czSWHTtitL92TTBsqJbZN_RtFX5mYTQqkjP4BxxeX1Qw6i-l2zNuLNOQLFlCGryCGq06kjRK9_X6Q',
      type: 'noturna'
    }
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        {/* Left Area: Map Preview */}
        <section className={styles.mapArea}>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyyzQMCJr5SWuC-TvVanlPjRXke814hsNXyyR4uqaJ4Gt93eBE1qP70ws3wHkUUqAzGNcVB8MeqQaLwQ6loHM9s3qHA7nWaTO9YMOE0gSbJScSKPWODpJZ8tLc1_StlevHNu8lz6ttA6yw86pAuqSBaVYQaNztxtX78oZr8i2YAbx8doIQuzXW9cA6iHi-WnnJKfra9RbmtUIqUj5MVIclu2pDQvp-C1Qlhd3fB0PDNJJt1EMwp88K8sqdRiwRCz5vQhWFJiyAQdg" 
            alt="Mapa das Feiras" 
            className={styles.mapImage}
          />
          <div className={styles.mapSearch}>
            <Search size={18} />
            <input type="text" placeholder="Buscar feira ou bairro..." />
          </div>
          
          {/* Mock Map Markers */}
          <div className={styles.marker} style={{ top: '30%', left: '40%' }}>
            <div className={styles.markerIcon}><MapPin size={16} fill="currentColor" /></div>
          </div>
          <div className={styles.marker} style={{ top: '60%', left: '70%' }}>
            <div className={`${styles.markerIcon} ${styles.markerSecondary}`}><MapPin size={16} fill="currentColor" /></div>
          </div>
        </section>

        {/* Right Area: Sidebar List */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.titleRow}>
              <h1>Feiras Próximas</h1>
              <span className={styles.radiusBadge}>Raio 24km</span>
            </div>
            <div className={styles.filterChips}>
              <button className={styles.btnFilter}><Navigation size={14} /> Filtrar</button>
              <button className={styles.chip}>Hoje</button>
              <button className={styles.chip}>Orgânicas</button>
              <button className={styles.chip}>Noturnas</button>
            </div>
          </div>

          <div className={styles.list}>
            {fairs.map(fair => (
              <div key={fair.id} className={styles.fairCard}>
                <div className={styles.fairImage}>
                  <img src={fair.imageUrl} alt={fair.name} />
                </div>
                <div className={styles.fairInfo}>
                  <div className={styles.fairTitleRow}>
                    <h3>{fair.name}</h3>
                    <span className={styles.distance}>{fair.distance}</span>
                  </div>
                  <p className={styles.address}>{fair.address}</p>
                  <div className={styles.tags}>
                    <span className={fair.type === 'organica' ? styles.tagGreen : styles.tagOrange}>
                      <Calendar size={12} /> {fair.days}
                    </span>
                    <span className={styles.tagGray}>
                      <Clock size={12} /> {fair.hours}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FairsPage;
