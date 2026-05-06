'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Flame, Calendar, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

const ClubePage = () => {
  const featuredDeals = [
    { id: '101', title: 'Laranja Pera Doce (kg)', price: 4.99, oldPrice: 8.90, unit: 'kg', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcJDRFQPjMiF7RkmUn3Qb9sSdL4v9KRtO-lFmskmRrg08whHo98nFF1ARqyuiDplfAN9OtpRsLCT8OX3eP_EbK9IBQrFkyVaOKlfiiGpfujH2jHw3LRMVOe2Kjm1JR9RoYvTPeQK5H2FEuL5Gr2g56-Ka4mlpx8cgTnmwxPcFG32POS5xoWEcMuziPNifPtgugiegfclRFxWiVqooIE0wDBA2k9fnTw3LAaFfTH91ZEW_Zkv3EHrF7DpDNulP5pZK2YTYSqBr_KPk', producer: 'Zé das Frutas', tags: ['OFERTAÇO'] },
    { id: '102', title: 'Tomate Italiano (500g)', price: 7.80, oldPrice: 12.50, unit: '500g', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfMnElhsDY_nle49iGL0Vp5p3xuxUj69WBn7kRJi6PhxDPkgrS8OYzxRVCuSMQkeComEhmAtczS0bHJkb34MnEaMgVAjI_e14THL67FZIaQ2EP10_1iqPqT7m7-EPSZ9OH4X4nx6nHA0ycJG5IoYHKGg66kaFTBggjbLROeqoeYR45mowL73pL68W9exf4OnfmdFuscU6c2TTgRle3TG4PcDBamHIj8nlcenl4P0w1A47w3rry4oObHQYo9Qnt3Fbfdv1H1_zzpWw', producer: 'Orgânicos da Serra' },
    { id: '103', title: 'Pão Italiano Sourdough', price: 18.90, oldPrice: 24.00, unit: 'un', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD7pqvV3vADkCSu2t3aHuFzn4I_bPla8-_wDIWmT0dueCe4Rw9vDvxSofcRXTAyw38KCMj4INg5_19PMCHFfN1LWABNPAKU9KanyQWgI6chApocCEWhJ4tz65y2RlKWnUj9HpEl6DRWzLM9OBNk_W_VAMOIDj1JZ7XSeiyH9dagxU4js7e3ZR9VH9IBvhrl6Zmp2cg_cDsQdyuY5USJRGSEIAVdtxMGMFoLTHasymawxmB7jynsaoEMq3CYxUdBccV9_7LhrK05_8', producer: 'Padaria Bella' },
    { id: '104', title: 'Banana Nanica (Dúzia)', price: 6.99, oldPrice: 9.50, unit: 'dz', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj3XptzHAlVLfbaL1zuyGpFNvr547JeEZiATzlPduNNSPpR5WmXAomvIuf8QYLLdkg6qzGWDetsxBzl0YRYQLFRe3X4y9bsoXmNedij8ZOdHmbKZuFmrz7KKDxUom4H6nAX-H5UITcrIUtbaz6N07rZ-lc7-ECB_DomseJOUjHUcvXpFzE_tV168NRoAmsi1dA8uE3WUd7h5DArDNcMsmIU-3NGTIkBFska2nNw4GRDLoNXkIHX7TDFIxBWBcKoaXOK2UivfgNN3U', producer: 'Sítio Três Irmãos' },
    { id: '105', title: 'Mel Silvestre (250g)', price: 25.00, oldPrice: 32.00, unit: '250g', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA70DagyMM_ihfWzp3KUo6jekYixb4ZOilU3uX-ep5_OJ1ZjT_BsTliJI_g6VW67UeciSns6Eww1Vv5Zu4ac6lXfS1kMspCc_Ehwjzr_EicL7gQvjRctTNJAU3Tp_tYP_eVsHlotOkE_QolqKnTcjDLxGablfj1dc27P_rT2rvrI4qoFs21TRSCVEGuJKsO2jdXDhSCAvHeeHdXvogYJT1mv7xuuatrz-WYRr-x7hE1-sp1kF99sT6GrV9t7qb3CdtbhXCdgA-xx3A', producer: 'Apiário das Flores' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Exclusivo Clube</span>
            <h1>Clube Tabloide</h1>
            <p>Ofertas imbatíveis direto do produtor. Frescor garantido na sua mesa toda quarta-feira.</p>
          </div>
          <div className={styles.heroImage}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY7YNj_VeKRCGPkVBt0dkPJoAODSChZIEuOEEYyVdaQ7fe-YUDqfU4aIJ8dylz74T4YD8DNPt2iSRUfD9tIA3ejl04iyGOGsMsGJqwsFKnTsx8AS2UDHV0opgSRECuPDoA1plXd2FPdRdKm3sfPIOdFWt9FlNVUa75p9Q2vwSn1FG5Vit9nRCe8LU54C45zuia-4L-CKAgh3WuxF52958T0wVKWAIc702OzrtmaAMnrQSPXM_N5s2SmUhVu36JwIZj-YW9MW1MRHQ" alt="Frutas" />
          </div>
        </section>

        {/* Location & Context Bar */}
        <div className={styles.contextBar}>
          <div className={styles.contextItem}>
            <div className={styles.iconBox}><Calendar size={20} /></div>
            <div>
              <p className={styles.label}>Você está vendo todas as ofertas de:</p>
              <h2>Ofertas de Quarta-feira</h2>
            </div>
          </div>
          <div className={styles.contextItemSecondary}>
            <div className={styles.iconBoxSecondary}><MapPin size={20} /></div>
            <div>
              <p className={styles.label}>Raio de 24km ativo</p>
              <h2>CEP 05412-000</h2>
            </div>
          </div>
        </div>

        {/* Fair Filter */}
        <section className={styles.fairFilter}>
          <p>Feiras no seu raio (24km):</p>
          <div className={styles.chipsRow}>
            <button className={styles.chipActive}>Todas</button>
            <button className={styles.chip}>Vila Madalena (0.5km)</button>
            <button className={styles.chip}>Pinheiros (2km)</button>
            <button className={styles.chip}>Sumaré (4.5km)</button>
            <button className={styles.chip}>Perdizes (3.8km)</button>
          </div>
        </section>

        {/* High Highlights Section */}
        <section className={styles.dealsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <Flame size={24} className="text-tertiary" />
              <h3>Destaques em Todas as Feiras</h3>
            </div>
            <div className={styles.countdown}>Termina em 04:22:15</div>
          </div>
          <div className={styles.dealsGrid}>
            {featuredDeals.map(deal => (
              <ProductCard key={deal.id} {...deal} />
            ))}
          </div>
        </section>

        {/* Categories / Grid of Small Items */}
        <section className={styles.denseSection}>
          <div className={styles.sectionHeaderBordered}>
            <div className={styles.headerTitle}>
              <ShoppingBag size={20} />
              <h3>Direto da Horta (Multifeiras)</h3>
            </div>
          </div>
          <div className={styles.denseGrid}>
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className={styles.miniCard}>
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Txjig3B4eq0P-MJ-tvZzYdWLometCfRI70Qlk-ZlFsivDwSeLU_MKUVMxT8hE7p7PUMxa-dk12qJ-IMD5-Lh6VNEOKDcxHPlRY-l_YfkR-ST5mIOOu035r1CVEsTN9Ehu6QXCgmgHgmch-rW-wGG1xy1owVhVoR3oz48cBi23Fn6U_GA6_Q6gTyVRwQ1JJUl9g9xFpmyJddxhot9sBD3WyJ-tBardPtXMvD3tlpQADgD6JWoFPRuXk-1gUSSqy7fmgAFVSqI21M" alt="Produto" />
                 <div className={styles.miniInfo}>
                   <span className={styles.locationTag}><MapPin size={8} /> VILA MADALENA</span>
                   <h4>Alface Crespa Org.</h4>
                   <div className={styles.miniPrice}>
                     <strong>R$ 3,50</strong>
                     <span>un</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ClubePage;
