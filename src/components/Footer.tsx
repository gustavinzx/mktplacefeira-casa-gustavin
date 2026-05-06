'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { 
  Leaf, 
  MessageCircle, 
  Send,
  ShieldCheck,
  Heart
} from 'lucide-react';

const InstagramIcon = ({ size = 20, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand and Mission */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Leaf size={24} fill="currentColor" />
              <span>Feira <strong>Casa</strong></span>
            </Link>
            <p className={styles.description}>
              Levando o frescor das melhores feiras livres diretamente para sua casa, apoiando produtores locais.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h4>Categorias</h4>
            <ul>
              <li><Link href="/category/frutas">Frutas</Link></li>
              <li><Link href="/category/legumes">Legumes</Link></li>
              <li><Link href="/category/verduras">Verduras</Link></li>
              <li><Link href="/category/organicos">Orgânicos</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4>Institucional</h4>
            <ul>
              <li><Link href="/about">Sobre nós</Link></li>
              <li><Link href="/how-it-works">Como funciona</Link></li>
              <li><Link href="/vendors">Produtores</Link></li>
              <li><Link href="/contact">Contato</Link></li>
            </ul>
          </div>

          {/* Social and Admin Access */}
          <div className={styles.socialCol}>
            <h4>Redes Sociais</h4>
            <div className={styles.socialIcons}>
              <Link href="#"><InstagramIcon size={20} /></Link>
              <Link href="#"><MessageCircle size={20} /></Link>
              <Link href="#"><Send size={20} /></Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2024 feira.casa - Cultivando conexões reais.
          </p>
          <div className={styles.bottomActions}>
            <p className={styles.madeWith}>
              Feito com <Heart size={14} fill="#e11d48" color="#e11d48" /> por Antigravity
            </p>
            {/* Botão de Escudo para Acesso Admin (padrão Stitch) */}
            <div className={styles.adminWrapper}>
              <Link href="/admin" className={styles.adminAccess} title="Acesso Administrativo">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>security</span>
              </Link>
              <span className={styles.adminTooltip}>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
