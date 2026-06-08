'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Store, 
  Building2, 
  Truck, 
  User, 
  ChefHat, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  href: string;
  color: string;
  bg: string;
  roles: string[]; // which roles can see this
}

const WORKSPACES: Workspace[] = [
  {
    id: 'admin',
    title: 'Painel Administrativo',
    description: 'Gestão global da plataforma, usuários e métricas.',
    icon: ShieldCheck,
    href: '/admin',
    color: '#4f46e5',
    bg: '#e0e7ff',
    roles: ['admin']
  },
  {
    id: 'feirante',
    title: 'Minha Banca',
    description: 'Gestão de produtos, pedidos e faturamento da sua banca.',
    icon: Store,
    href: '/portal/feirante',
    color: '#059669',
    bg: '#d1fae5',
    roles: ['admin', 'feirante', 'vendor']
  },
  {
    id: 'b2b',
    title: 'Portal B2B (Atacado)',
    description: 'Acesso às compras em grande volume para o seu negócio.',
    icon: Building2,
    href: '/b2b',
    color: '#0284c7',
    bg: '#e0f2fe',
    roles: ['admin', 'b2b']
  },
  {
    id: 'chef',
    title: 'Meu Ateliê (Chef)',
    description: 'Gestão de receitas e ingredientes para chefs.',
    icon: ChefHat,
    href: '/portal/chef',
    color: '#d97706',
    bg: '#fef3c7',
    roles: ['admin', 'chef']
  },
  {
    id: 'logistica',
    title: 'Central Logística',
    description: 'Gestão de rotas, entregadores e PickNGo.',
    icon: Truck,
    href: '/portal/logistica',
    color: '#db2777',
    bg: '#fce7f3',
    roles: ['admin', 'delivery', 'logistica']
  },
  {
    id: 'account',
    title: 'Conta Pessoal (Comprador)',
    description: 'Seus pedidos, endereços e carteira na feira.',
    icon: User,
    href: '/account',
    color: '#475569',
    bg: '#f1f5f9',
    roles: ['admin', 'feirante', 'chef', 'delivery', 'logistica', 'franchisee', 'b2b', 'cliente', 'customer', 'b2c', 'vendor']
  }
];

export default function PortalHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('cliente');
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?next=/portal');
        return;
      }

      // Tenta pegar metadados do auth
      const user = session.user;
      let name = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
      let role = user.user_metadata?.role || user.user_metadata?.user_role || 'cliente';

      // Fallback para localStorage
      if (!role && typeof window !== 'undefined') {
        role = localStorage.getItem('user_role') || 'cliente';
      }
      if (name === 'Usuário' && typeof window !== 'undefined') {
        name = localStorage.getItem('user_name') || 'Usuário';
      }

      // Normalização
      const normalized: Record<string, string> = { b2c: 'cliente', customer: 'cliente' };
      role = normalized[role] || role;

      setUserName(name);
      setUserRole(role);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/login');
  };

  const availableWorkspaces = WORKSPACES.filter(w => w.roles.includes(userRole));

  if (loading) {
    return (
      <div className="hub-loader">
        <div className="spinner" />
        <p>Preparando seu ambiente...</p>
      </div>
    );
  }

  return (
    <div className="hub-container">
      <div className="hub-header">
        <div className="hub-header-inner">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> Voltar para a Feira
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </div>

      <main className="hub-main">
        <div className="welcome-section">
          <div className="avatar-circle">
            {userName.charAt(0).toUpperCase()}
          </div>
          <h1 className="welcome-title">
            Olá, <span>{userName.split(' ')[0]}</span>
          </h1>
          <p className="welcome-subtitle">
            Selecione qual ambiente você deseja acessar agora.
          </p>
        </div>

        <div className="workspaces-grid">
          {availableWorkspaces.map(ws => (
            <Link href={ws.href} key={ws.id} className="workspace-card">
              <div className="card-icon-wrap" style={{ backgroundColor: ws.bg, color: ws.color }}>
                <ws.icon size={32} strokeWidth={1.5} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{ws.title}</h3>
                <p className="card-desc">{ws.description}</p>
              </div>
              <div className="card-arrow" style={{ color: ws.color }}>
                <ChevronRight size={24} />
              </div>
            </Link>
          ))}
        </div>

        {userRole === 'cliente' && (
          <div className="upsell-banner">
            <div className="upsell-content">
              <h3>Deseja vender na feira?</h3>
              <p>Torne-se um feirante certificado e alcance milhares de clientes com seus produtos.</p>
            </div>
            <Link href="/signup/vendor" className="upsell-btn">
              Seja um Feirante
            </Link>
          </div>
        )}
      </main>

      <style jsx>{`
        .hub-container {
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
        }

        .hub-loader {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0e6b17;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .hub-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 24px;
        }

        .hub-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #0f172a;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          font-weight: 600;
          font-size: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #fef2f2;
        }

        .hub-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 24px 100px;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 50px;
          animation: fadeUp 0.5s ease-out;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0e6b17, #22c55e);
          color: white;
          font-size: 32px;
          font-weight: 800;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 25px rgba(14, 107, 23, 0.2);
        }

        .welcome-title {
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .welcome-title span {
          color: #0e6b17;
        }

        .welcome-subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0;
        }

        .workspaces-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .workspace-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          text-decoration: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeUp 0.6s ease-out backwards;
        }

        .workspace-card:nth-child(2) { animation-delay: 0.1s; }
        .workspace-card:nth-child(3) { animation-delay: 0.2s; }
        .workspace-card:nth-child(4) { animation-delay: 0.3s; }
        .workspace-card:nth-child(5) { animation-delay: 0.4s; }

        .workspace-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border-color: #e2e8f0;
        }

        .card-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .card-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .card-arrow {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .workspace-card:hover .card-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .upsell-banner {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 24px;
          padding: 32px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          margin-top: 40px;
          animation: fadeUp 0.7s ease-out backwards;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3);
        }

        .upsell-content h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .upsell-content p {
          font-size: 15px;
          color: #94a3b8;
          margin: 0;
          max-width: 400px;
          line-height: 1.5;
        }

        .upsell-btn {
          background: #22c55e;
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .upsell-btn:hover {
          background: #16a34a;
        }

        @media (max-width: 768px) {
          .workspaces-grid {
            grid-template-columns: 1fr;
          }
          .upsell-banner {
            flex-direction: column;
            text-align: center;
            gap: 24px;
            padding: 32px 24px;
          }
          .welcome-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
