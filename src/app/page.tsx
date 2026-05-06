'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Star, ShoppingBag, Utensils } from 'lucide-react';

export default function Home() {
  const featuredProducts = [
    { id: '1', title: 'Tomate Italiano Selecionado', price: 9.60, oldPrice: 12.00, unit: 'kg', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTkYMP13gRgMr34Ik67Ie_aum87GByFod0NXYFyEq2rmHlHwF9mBndi818Zx3Kha6MXrb-jV_3rIVcL9HEpDk47C0h45NnC77xjhJ1_D19ZyJNepIgvq9J6LGOw-aJeF2668GNXCZkBjgzaFEwI7diGGLkTk1BI_taaN406luYPlr9yEFYxDae61Gl97upyIfZn0XYmLj910wVBxMCSDJ9vN5_DwGYvmuY4oJbKuu1awJVqZ1F3fJq2JLEAYG61qraZMjkT7mnc3g', producer: 'Barraca do Sr. Joaquim', tags: ['-20%'] },
    { id: '2', title: 'Mix Folhas Higienizado', price: 7.50, unit: 'un', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3_tSH1k-khlRCimL8_BQMczSrhrzSM7s6nCLfwKxHyIPF723is0ZfdWe1pqUkabFmguV6LIZheZfiX6Ll21quwZWMc0yJzIaj8A5GpuNNSBZJHpZiNBu7KHKZ8JwbtqJznwg8gqsf1F-eoZIHUJQF5WJ0iqePLxWjLatg2cgNTQWrGKgA11S-3O6Qm80i3UdnlMLBZ0HfglbzzLwMbBA_pNHydK4jcegb3naZmDIMSsCLK1jLXkCnxvPWFdODcEkAOI2t_SvHqbY', producer: 'Horta da Família' },
    { id: '3', title: 'Kit Tempero Fresco', price: 15.90, unit: 'kit', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGHBU9daJmq03F9iyqW8PhJCC8mUU4b-7EQG_FvX7hDldhP4dSRO9xqToHB6m-nHRBzFzi8g_MPOEh6uI3750eSajnz744JNuRZvxxdL6h4TeMnJksi2pnVsoo0Px7juQermJz8gA5iMK3eKlbhRmZcZZhNvelQkKxL-lCPFK7jV7itrwX01-iMuRnnQGncq6G58ilvaB_OvHRc-KlXTNrjowg8yxRN31A1MGTC31oPAS1pK5VTvLE7phBRqb60Z2g79Aqw1N1RR4', producer: 'Temperos do Mundo' },
    { id: '4', title: 'Pastel de Feira (Congelado)', price: 22.00, unit: 'pct', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAday7fH6w0zfs5UGJnVl_xGobiAQwOj7pzi9M_VrqOREfODDeiq9ZsaEHgAhKW_WAO5ydeNBRtKEV11hoo62uQxiA0mSBXNnBXQB0dBsC-IPWwOpSE9rNreja9vljC1cmWrbUkAJyDfSye210Dz3ei_bcr5Qksa1T8p5h32LgMI2Jsi2kMi6jGHfVgdVqr3rZW4tKcLzFUI_571b1oyV9ZL7D5iC40qrcJ9G9GL1nd1mAU1Q9c7vzANuyZRLJLj9ujcqK12E5CqLc', producer: 'Pastel do Japa' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroImage}>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzLm7uis6sOHCw4QvgNXiEz01JT2OXNeai8SlbBlK3yd8AoUIMZpqIJMJJuhMLChwdyJ6gq1i6SxElvlbf3UBQYI09fMy0Vy-sd3Znm0EziyOM_FheNCowsvbJRaY0Dz__ePE6emjpqPTAjEf6u6kgr1QWnJdqhWvz1sy8CMLANuMvHZT07qb28pEiXyMX9ODlII6bm51Paofijf4oGgq9kxXGoQ6a66poJA4sfD-NWZvlg9tQTb2FOrvKYbEmJ4RRpkU-6SoL0aI" 
              alt="Feira Livre Digital" 
            />
            <div className={styles.heroOverlay}>
              <span className={styles.heroBadge}>OFERTA DO DIA</span>
              <h1>Frescor da feira direto na sua porta.</h1>
              <p>Produtos colhidos hoje pelos melhores produtores locais da sua região.</p>
              <Link href="/categories/ofertas-dia" className={styles.heroBtn}>
                Ver Ofertas
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.categories}>
          <CategoryGrid />
        </section>

        <div className={styles.bentoGrid}>
          {/* Sidebar Area */}
          <aside className={styles.sidebar}>
            {/* Nearest Fair Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <MapPin className="text-primary" size={20} />
                <h2>Feira mais próxima</h2>
              </div>
              <div className={styles.mapPreview}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBASNv9n7XlcEB3YyXwI8I9ZjpmshY9HQShTR6L18l3AA8p18Z96kmZQ-5KkFG5-qsiIwYMU60q8hjJXhjBIiM958BoChobhCsZ-xdnQ1KqS0uh7iKTT5R0UIT8mnFpGA_ZFvB1ScK69y5e8teGk7DyTL912x4NIp6g6W5nfWn-Yiz8uTfF-27-gdH0yfCumZi7Qv50pvmMHLGpodLcjE0f8axnj_jEo1EbP5bYOXTCTKxoPU7n76PaaSPBAGtsvzWJs9VRG6wpEvc" alt="Mapa" />
                <span className={styles.mapLabel}>FEIRA DA VILA MARIANA</span>
              </div>
              <div className={styles.fairInfo}>
                <div className={styles.infoRow}>
                  <Clock size={16} />
                  <div>
                    <p><strong>Terças e Sábados</strong></p>
                    <p>Das 07:00 às 13:00</p>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <MapPin size={16} />
                  <p>Rua Joaquim Távora, 1200 - São Paulo</p>
                </div>
                <button className={styles.btnOutline}>Como chegar</button>
              </div>
            </div>

            {/* Featured Producer */}
            <div className={`${styles.card} ${styles.featuredProducer}`}>
              <span className={styles.badge}>PATROCINADO</span>
              <div className={styles.producerHeader}>
                <div className={styles.avatar}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1FG-jnWPKSx-tDrDDsa-XymDSKX888u2hJR3TXhVd16M85HIMM0TvRFOo5qL32tBeM5NTLNg51_iM3l2kKWnzpacDZ91tK2F3h9vd4jDQQrMxFymHzTs1a47FODc65PDBTamL-uRx-HYwZekk1zcC8mMXJR9c_rdrBNJ0M6jDhd-gj_-DkrNDpFh80Ntt7Zamhfv22YV4QTpaKp8pZ2W0cYjeHh6hZRMsiFlIB3in4bvlB1VfsECKlSEY6tENVfmx0HXn8FurR2A" alt="Sr. Zé" />
                </div>
                <div>
                  <h3>Barraca do Sr. Zé</h3>
                  <div className={styles.rating}>
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    <span>(4.9)</span>
                  </div>
                </div>
              </div>
              <p className={styles.quote}>&quot;As melhores laranjas-lima da região, colhidas em nossa chácara familiar.&quot;</p>
              <div className={styles.miniProducts}>
                <div className={styles.miniItem}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeIqu5QB13vfT_m3A4SmqhAz5lLBWgBkmmDbXWHSFR7n0hW5l_VKfEllMaKaa_z-_4Lm3kj5_4n7R11Jrl3WL1wYJx8FzmDvS0D3mcpO2fYcGQ7rzuxCOme6YOTeKdHeWtJUyTnmSWqJ9MJifx7n74c6yRnmbqyULJg6_GEeSIbYuOb8tsldeRg72yvQwA7QYW5R9cssFKtJciwLwOAdYbgNSE9HaFl2J1hXHYPE1W6X5prr0b_hxmh5J8TNeviW8aWZOWaQBDMW8" alt="Laranja" />
                  <p>Laranja Lima</p>
                  <span>R$ 8,90/kg</span>
                </div>
                <div className={styles.miniItem}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMXZZyPamRZmWwJt3QpNojqRH7YW-gFf3l4KakDF215lI8IP1tdqwC97vykj79ogAZloItEcyzTurRXzqMIvT6DHpztqNTzEwyAxiqr7yj1wLxdlD_3kWyd_JDXQdUHTgI1DL7sUslQ3EfDHsprK0XMHtrAxcqAZNTkdEMUAh_jBP96a18-INAofzpZNEymFzQjCASXUhtmEaAqKlAi_l_GYSJVUrDbBZkg883OO0CiPT2DLZ_M9qPhJ6Lz_2nHzDxce9Z_5nfMTo" alt="Banana" />
                  <p>Banana Nanica</p>
                  <span>R$ 5,50/dz</span>
                </div>
              </div>
              <button className={styles.btnSecondary}>Ver Banca Completa <ArrowRight size={16} /></button>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2>Ofertas de Hoje</h2>
              <Link href="/search" className={styles.viewAll}>
                Ver tudo <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className={styles.productsGrid}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Promo Banners Area */}
            <div className={styles.bannersGrid}>
              <Link href="/categories/organicos" className={styles.banner}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6QcBF7CpDEQQGKp5WZn1G5UGS-uULEdkJvUMKfQ-oCrezUCXHT1WHhSDH1SXn_2WYYxmS-FfUPg3a4JCTZDcdLTNTB36lTGQsO6JE7Mr-dTd-6PrvIdkmDyHdxG9vaZaJHfpS9thSSCGNvqG7PLrkjDpXSx64R3Bz4pxynXPMDl3HPtqa0jeQTnMNnNmN1UJuQkuBDkIE_qVPHcmH3ypTb3DD5A1vpEH-dwxCAbUdXnybRtq8M2uQxFEd-klR84ROW1fJ-LptT4M" alt="Orgânicos" />
                <div className={styles.bannerContent}>
                  <span>Orgânicos</span>
                </div>
              </Link>
              <Link href="/categories/temperos" className={styles.banner}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0IcpLO2buPDC37z7vfUbL050hPu3GSTjEGERao_NcygozlDXkZU-n4Hh-_6ujKrvYdE3wRtEWEB7ATBgaktAt6CXhST_5t1ZGMIGUTaaHlMKON8O7-rLWEyNsnLgC0F-zSQPrGno7f3J3_mYFlIpzMrIGfFWo7NDHt7apncTicutHjhHdIruts33D0AfK4p4_sughWGpxe5QYO56XzQZyEKyDsSxkRp1D2Qwp4J1EQ7GbHxt1fX61eixtAHm7pvH2GZJaVrrJd8g" alt="Temperos" />
                <div className={styles.bannerContent}>
                  <span>Temperos do Mundo</span>
                </div>
              </Link>
              <Link href="/categories/kit-pastel" className={styles.banner}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX3ryE0F7w1TLmKuxxWGTgM-OQ2X8LyXlpPIuUl3hgwl6eNm2JutuVyxTI4jVcS-0mSyFa_O-PpjVyw-dpQ9QxFgSC1Md56Y2P9IhGCJqFxZPhhvT9xDfJ1K29Op4yQTexGR4aa1cYcTpP2swO_-yAbgFgN28IIcKbjwx_cGH7oJkLeybX2UUnk6dssnp1HdEvS9hNmPEu2yShYOIExuh9iBxxCl66r0vWVEw6XwwU2xS141hiXMZqBEMCerfXrhQFR7PgbRzy7NI" alt="Pastel" />
                <div className={styles.bannerContent}>
                  <span>Kit Pastel</span>
                </div>
              </Link>
              <Link href="/categories/ofertas-dia" className={styles.banner}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm6ZiU0ov7XrTtbr2oUYHarA9bWdLYUMuf8HijtcIRJUxQY2HWOL5hNsCGKS_CZ_Dv7ice62I4a2z0qb0QTBvEHNizAc37ItLKLC2e0UgNtzO6IqqVggKy02DewVFEUPFTacqqKR5oW1QNOi9SgOoKKV6XQoWSEkya72g0QtODmJ3hAFbq4-2OizEIcmH_GeLCxnBQIagCjEscjrLL7JNi1wFHMsXbO5iE4W2jyzJkBdsx6HmjB6_ywfRUP2vuCTYCaPlMVNW_jDQ" alt="Ofertas" />
                <div className={styles.bannerContent}>
                  <span>Ofertas do Dia</span>
                </div>
              </Link>
            </div>

            {/* Recipes Area */}
            <div className={styles.recipesSection}>
              <div className={styles.sectionHeader}>
                <h2>Receitas do Chef</h2>
                <Link href="/recipe" className={styles.viewAll}>
                  Todas as receitas <ArrowRight size={16} />
                </Link>
              </div>
              <div className={styles.recipesGrid}>
                <div className={styles.recipeCard}>
                  <div className={styles.recipeImage}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoBPD_Am0blcg8SURE3cT3kZ5Gvwm4ZvnV74nYnodQbLs931I0vcVlCPVTmiNJ34cGvcMcL9bOzhtM2rkHzp7vTeN06RMHE-HmVB8nAiPXEKkfh51PerYGCKa668aSLctamxU-yCgQVyBisfsJW29yVKfIb2J-tKq3V31gA3Yna4fvGmIcLKuB_43iiB9tUXXIRa8cv0kTq_UlR1nhhs3VCmMn-_cCl_Xyrut0Tn9g7w-UT9mZeP6cTaygwG4SpGY2gQ7Rls9awQg" alt="Sopa" />
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3>Sopa de Legumes da Vovó</h3>
                    <p>Uma receita clássica usando os melhores ingredientes da feira.</p>
                    <div className={styles.recipeTags}>
                      <span>+ Abóbora</span>
                      <span>+ Batata</span>
                    </div>
                    <button className={styles.buyIngredients}>
                      Comprar Ingredientes <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.recipeCard}>
                  <div className={styles.recipeImage}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMgrrD2slpYSx8pWc1gNjgHfANRH6i2HbOgZefEWOVDzIPNqsMD9Tir785dYYFKLRxfo5pyQesT9xGN8NntTvAEvibwE3D8v7O3dTWakUiMOkFRseKeiQJ2hIjgayFY3D_5M0BMP0rTtTA_KYH8wToKAd1bu0r2LWiUI-kRumwjweeU0XaUC_jb1FsB697ZHHS7axoVa10nYAoPqB_sPp6SY3bvqpXQchv4lctySeKlS5LXbu9eq8zTH3bAGJ_7odvMuwG2uAS43I" alt="Salada" />
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3>Salada de Frutas Tropical</h3>
                    <p>Refrescante e direta do pomar dos nossos feirantes.</p>
                    <div className={styles.recipeTags}>
                      <span>+ Mamão</span>
                      <span>+ Manga</span>
                    </div>
                    <button className={styles.buyIngredients}>
                      Comprar Ingredientes <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}