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
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: 'https://instagram.com/feira.casa',
    whatsapp: '#',
    facebook: '#'
  });

  React.useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSocialLinks(prev => ({
            ...prev,
            instagram: json.data.instagram_url || prev.instagram,
            whatsapp: json.data.whatsapp_number ? `https://wa.me/${json.data.whatsapp_number}` : prev.whatsapp,
            facebook: json.data.facebook_url || prev.facebook
          }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand and Mission */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <img src="/Logo-feira.png" alt="feira.casa" style={{ height: '32px', width: 'auto' }} />
            </Link>
            <p className={styles.description}>
              Levando o frescor das melhores feiras livres diretamente para sua casa, apoiando produtores locais.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h4>Categorias</h4>
            <ul>
              <li><Link href="/categories/frutas">Frutas</Link></li>
              <li><Link href="/categories/legumes">Legumes</Link></li>
              <li><Link href="/categories/verduras">Verduras</Link></li>
              <li><Link href="/categories/organicos">Orgânicos</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4>Institucional</h4>
            <ul>
              <li><Link href="/sobre">Sobre nós</Link></li>
              <li><Link href="/sobre">Como funciona</Link></li>
              <li><Link href="/feirantes">Produtores</Link></li>
              <li><Link href="/contato">Contato</Link></li>
            </ul>
          </div>

          {/* Social and Admin Access */}
          <div className={styles.socialCol}>
            <h4>Redes Sociais</h4>
            <div className={styles.socialIcons}>
              <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon size={20} /></Link>
              <Link href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={20} /></Link>
              <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><Send size={20} /></Link>
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
            <div className={styles.adminWrapper}>
              <button 
                onClick={() => {
                  sessionStorage.setItem('admin_entry_unlocked', 'true');
                  window.location.href = '/admin/login';
                }} 
                className={styles.adminAccess}
              >
                <ShieldCheck size={16} />
              </button>
              <div className={styles.adminTooltip}>Acesso Restrito</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
