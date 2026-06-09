'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n/client';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  LayoutDashboard,
  Users,
  Store,
  Handshake,
  Truck,
  Megaphone,
  CreditCard,
  Settings,
  Search,
  Bell,
  HelpCircle,
  LayoutGrid,
  BarChart3,
  LogOut,
  LogIn,
  FileText,
  DollarSign,
  MapPin,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Plus,
  ShoppingBag,
  History,
  UserCheck,
  Activity,
  Navigation,
  ShieldCheck,
  UserPlus,
  Tags,
  Layers,
  PieChart,
  LineChart,
  Boxes,
  Image,
  Gift,
  Mail,
  Receipt,
  BookOpen,
  TrendingUp,
  Target,
  ChefHat,
  Lightbulb,
  Zap,
  Globe,
  MessageSquare,
  Menu,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showFullNotifications, setShowFullNotifications] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'feira_role=; path=/; max-age=0';
    sessionStorage.setItem('has_logged_out', 'true');
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  const toggleNotificationRead = async (id: string, currentReadStatus: boolean) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: !currentReadStatus } : notif));
    try {
      await supabase.from('mktplace_feira_notifications').update({ is_read: !currentReadStatus }).eq('id', id);
    } catch(e) { console.error(e); }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    try {
      await supabase.from('mktplace_feira_notifications').delete().eq('id', id);
    } catch(e) { console.error(e); }
  };

  React.useEffect(() => {
    async function loadNotifications() {
      try {
        const { data, error } = await supabase
          .from('mktplace_feira_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;

        if (data) {
          setNotifications(data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: n.type || 'info',
            read: n.is_read || false
          })));
        }
      } catch (e) {
        console.error('Erro ao carregar notificações:', e);
      }
    }
    loadNotifications();
    
    // Optional: add realtime subscription
    const channel = supabase.channel('mktplace_feira_notifications_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mktplace_feira_notifications' }, payload => {
        loadNotifications();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const menuItems = [
    { 
      title: dictionary.admin.overview, 
      icon: LayoutDashboard, 
      href: '/admin',
      submenu: [
        { title: 'Overview Global', href: '/admin', icon: LayoutGrid },
        { title: 'Machine Learning & IA', href: '/admin/ml', icon: LineChart },
        { title: 'Relatórios Financeiros', href: '/admin/relatorios/contador', icon: PieChart },
      ]
    },
    { 
      title: dictionary.admin.users, 
      icon: Users, 
      href: '/admin/usuarios',
      submenu: [
        { title: 'Diretório de Usuários', href: '/admin/usuarios', icon: Users },
        { title: 'Gestão de Permissões', href: '/admin/usuarios/permissoes', icon: ShieldCheck },
        { title: 'Perfis de Acesso', href: '/admin/usuarios/perfis', icon: UserCheck },
        { title: 'Modo Implantação', href: '/admin/usuarios/implementacao', icon: LogIn },
        { title: 'Logs de Auditoria', href: '/admin/usuarios/logs', icon: History },
      ]
    },
    { 
      title: dictionary.admin.vendors, 
      icon: Store, 
      href: '/admin/gestao/feirantes',
      submenu: [
        { title: 'Diretório de Feirantes', href: '/admin/gestao/feirantes', icon: Store },
        { title: 'Catálogo Master', href: '/admin/gestao/produtos', icon: FileText },
        { title: 'Categorias & Tags', href: '/admin/gestao/produtos/categorias', icon: Tags },
        { title: 'Gestão de Assinaturas', href: '/admin/gestao/feirantes/assinaturas', icon: UserCheck },
        { title: 'Gestão de Devolucoes', href: '/admin/gestao/feirantes/devolucoes', icon: History },
        { title: 'Menus dos Feirantes', href: '/admin/gestao/feirantes/menus', icon: Menu },
        { title: 'Modo de Implementação', href: '/admin/gestao/feirantes/implementacao', icon: LogIn },
        { title: 'Configurações', href: '/admin/gestao/feirantes/configuracoes', icon: Settings },
      ]
    },
    {
      title: dictionary.admin.franchisees,
      icon: MapPin,
      href: '/admin/franqueados',
      submenu: [
        { title: 'Diretório de Franqueados', href: '/admin/franqueados', icon: Users },
        { title: 'Aprovação de Franquias', href: '/admin/franqueados/aprovacao', icon: UserCheck },
        { title: 'Métricas Regionais', href: '/admin/franqueados/metricas', icon: BarChart3 },
        { title: 'Perfil de Acesso', href: '/admin/perfis/franqueado-delivery', icon: ShieldCheck },
        { title: 'Login / Cadastro', href: '/signup/franchise', icon: UserPlus },
      ]
    },
    {
      title: 'B2B & Atacado',
      icon: Handshake,
      href: '/admin/b2b',
      submenu: [
        { title: 'Visão Geral B2B', href: '/admin/b2b', icon: Handshake },
        { title: 'Aprovação de Crédito', href: '/admin/b2b/credito', icon: DollarSign },
      ]
    },
    {
      title: dictionary.admin.logistics,
      icon: Truck,
      href: '/admin/logistica',
      submenu: [
        { title: 'Monitoramento Global', href: '/admin/logistica', icon: Activity },
        { title: 'Fornecedores Logísticos', href: '/admin/logistica/fornecedores', icon: Truck },
        { title: 'Performance & Métricas', href: '/admin/logistica/metricas', icon: BarChart3 },
        { title: 'Hub de Integrações', href: '/admin/logistica/integracoes', icon: Zap },
        { title: 'Gestão de Rotas', href: '/admin/logistica/rotas', icon: Navigation },
        { title: 'Tags e Categorias', href: '/admin/logistica/tags', icon: Tags },
      ]
    },
    {
      title: dictionary.admin.marketing,
      icon: Megaphone,
      href: '/admin/marketing',
      submenu: [
        { title: 'Visão Geral', href: '/admin/marketing', icon: Megaphone },
        { title: 'Central de Comunicação', href: '/admin/marketing/comunicacao', icon: Mail },
        { title: 'Central de Notificações', href: '/admin/marketing/notificacoes', icon: Bell },
        { title: 'Banners & Mídia', href: '/admin/marketing/banners', icon: Image },
        { title: 'Promoções', href: '/admin/marketing/promocoes', icon: Gift },
        { title: 'Campanhas & Popups', href: '/admin/marketing/campanhas', icon: Layers },
        { title: 'WhatsApp & Notificações', href: '/admin/integracoes/whatsapp', icon: MessageSquare },
      ]
    },
    {
      title: dictionary.admin.finance,
      icon: DollarSign,
      href: '/admin/financeiro',
      submenu: [
        { title: 'Dashboard Financeiro', href: '/admin/financeiro', icon: BarChart3 },
        { title: 'Contas a Pagar/Receber', href: '/admin/financeiro/contas', icon: Receipt },
        { title: 'Centro de Custos', href: '/admin/financeiro/gastos', icon: PieChart },
        { title: 'Contabilidade', href: '/admin/financeiro/contabil', icon: BookOpen },
        { title: 'DRE & Balanço', href: '/admin/financeiro/dre', icon: TrendingUp },
        { title: 'Gateways de Pagamento', href: '/admin/financeiro/gateways', icon: Zap },
        { title: 'Planos & Assinaturas', href: '/admin/financeiro/planos', icon: CreditCard },
        { title: 'Notas Fiscais', href: '/admin/notas-fiscais', icon: FileText },
      ]
    },
    {
      title: dictionary.admin.crm,
      icon: Target,
      href: '/admin/crm',
      submenu: [
        { title: 'Pipeline de Leads', href: '/admin/crm', icon: Target },
        { title: 'Prospecção Feirantes', href: '/admin/crm/feirantes', icon: Store },
        { title: 'Prospecção Restaurantes', href: '/admin/crm/restaurantes', icon: ChefHat },
        { title: 'Franqueados Full', href: '/admin/crm/franqueados', icon: MapPin },
        { title: 'Delivery Partners', href: '/admin/crm/delivery', icon: Truck },
        { title: 'Insiders & Insights', href: '/admin/crm/insiders', icon: Lightbulb },
      ]
    },
    {
      title: dictionary.admin.system_settings,
      icon: Settings,
      href: '/admin/configuracoes',
      submenu: [
        { title: 'Master Admin', href: '/admin/configuracoes', icon: Settings },
        { title: 'Financeiro & Repasses', href: '/admin/configuracoes/financeiro', icon: DollarSign },
        { title: 'Configurações do Site', href: '/admin/configuracoes/site', icon: Globe },
        { title: 'Módulos & Visibilidade', href: '/admin/configuracoes/modulos', icon: Layers },
        { title: 'SMTP & E-mail', href: '/admin/configuracoes/smtp', icon: Mail },
      ]
    },
  ];

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu?.some(sub => pathname === sub.href)) {
        setOpenSubmenu(item.title);
      }
    });
  }, [pathname]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('admin-global-search')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[var(--background)] font-sans selection:bg-green-100 selection:text-green-900 isolate">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-50">
        {/* Branding */}
        <div className="p-6 border-b border-gray-50 flex-shrink-0">
          <Link href="/" title="Ir para a Home">
            <img src="/Logo-feira.png" alt="Feira.Casa" style={{ height: '32px', width: 'auto' }} />
          </Link>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Painel Administrativo</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar py-6">
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === item.title;
            const isActive = pathname === item.href || item.submenu?.some(sub => pathname === sub.href);

            if (hasSubmenu) {
              return (
                <div key={item.title} className="space-y-1">
                  <button 
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                      isActive 
                        ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className={`flex-1 text-left text-sm ${isActive ? 'font-black' : 'font-bold'}`}>{item.title}</span>
                    <ChevronDown size={14} className={`shrink-0 ml-auto transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isSubmenuOpen && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.submenu?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link 
                            key={sub.title} 
                            href={sub.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm font-bold transition-all rounded-xl ${
                              isSubActive 
                                ? 'bg-green-50 text-green-700 shadow-sm shadow-green-900/5' 
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {sub.icon && <sub.icon size={16} className={`shrink-0 ${isSubActive ? 'text-green-700' : 'text-gray-400'}`} />}
                            <span className="flex-1 text-left">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link 
                key={item.title} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className={`flex-1 text-left text-sm ${isActive ? 'font-black' : 'font-bold'}`}>{item.title}</span>
                {!isActive && <ChevronRight size={14} className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-start gap-3 p-3 mb-2 bg-[#ffdad6]/20 rounded-2xl border border-[#ffdad6]/40">
            <ShieldCheck className="text-[#bb0014] shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-[9px] font-black text-[#93000d] uppercase tracking-[0.1em]">Ambiente Restrito</h4>
              <p className="text-[9px] text-[#93000d]/80 font-bold leading-snug mt-0.5">Ações monitoradas para sua segurança.</p>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
            <LogOut size={20} className="group-hover:text-red-600" />
            <span className="text-sm font-bold">{dictionary.common.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-40">
          <div className="flex-1 flex items-center">
            <div className="relative w-full" style={{ maxWidth: '600px', minWidth: '200px' }}>
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" />
              <input 
                id="admin-global-search"
                type="text" 
                placeholder="Buscar pedidos, produtos... (Ctrl+K)" 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-[24px] outline-none font-bold text-sm shadow-sm focus:border-green-600/30 transition-all"
                style={{ minWidth: '200px' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />

            <div className="flex items-center gap-2 relative">
              <Link href="/" className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-gray-900" title='Ir para Home do Site'>
                <LayoutGrid size={20} />
              </Link>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
                  className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-gray-900 relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {activeDropdown === 'notifications' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">Notificações</h4>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">3 Novas</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-colors">
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} />
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 font-medium">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setShowFullNotifications(true);
                        setActiveDropdown(null);
                      }}
                      className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                )}
              </div>

              {/* Help */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'help' ? null : 'help')}
                  className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-gray-900"
                >
                  <HelpCircle size={20} />
                </button>
                {activeDropdown === 'help' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-800">
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">Central de Ajuda</h4>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                        <FileText size={18} /> Documentação
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                        <Users size={18} /> Suporte via WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-800 mx-2"></div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                className="flex items-center gap-4 pl-2 cursor-pointer group"
              >
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">Admin Central</p>
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Logado agora</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-700 font-black border border-green-100 group-hover:border-green-600 transition-all shadow-sm overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=admin" className="w-full h-full object-cover" />
                </div>
              </div>

              {activeDropdown === 'profile' && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Conta Administrador</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">admin@feira.casa</p>
                  </div>
                  <div className="p-2">
                    <Link href="/admin/perfil" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                      <UserIcon size={18} /> Meu Perfil
                    </Link>
                    <Link href="/admin/configuracoes" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                      <Settings size={18} /> Configurações do Sistema
                    </Link>
                    <div className="h-[1px] bg-gray-50 dark:bg-gray-800 my-2 mx-4"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <LogOut size={18} /> Sair do Painel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8f9f8]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Full Notifications Inbox Modal */}
      {showFullNotifications && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-20">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFullNotifications(false)} />
          
          <div className="relative w-[80%] max-w-[80%] h-full bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <header className="h-20 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between px-8 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Central de Mensagens</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notificações do Ecossistema</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullNotifications(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </header>

            {/* Inbox Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar: Folders */}
              <aside className="w-64 border-r border-gray-50 dark:border-gray-800 p-4 space-y-2 hidden md:block bg-gray-50/30 dark:bg-gray-800/10">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-900/20 transition-all">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} />
                    <span>Entrada</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-all">
                  <Layers size={18} />
                  <span>Arquivadas</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all">
                  <History size={18} />
                  <span>Excluídas</span>
                </button>
              </aside>

              {/* List Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Search & Actions Bar */}
                <div className="h-16 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-xs w-full">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Pesquisar notificações..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-medium focus:ring-2 ring-green-700/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400" title="Marcar todas como lidas">
                      <ShieldCheck size={20} />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-400" title="Excluir tudo">
                      <History size={20} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`group flex items-center gap-4 p-6 border-b border-gray-50 dark:border-gray-800 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all cursor-pointer ${!n.read ? 'bg-green-50/10' : ''}`}
                    >
                      <div className={`w-3 h-3 rounded-full shrink-0 ${!n.read ? 'bg-green-700' : 'bg-transparent border border-gray-200'}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-sm truncate ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{n.title}</h3>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotificationRead(n.id, n.read);
                          }}
                          className="p-2 hover:bg-white rounded-lg shadow-sm text-gray-400 hover:text-green-700 transition-all"
                          title={n.read ? 'Marcar como não lida' : 'Marcar como lida'}
                        >
                          {n.read ? <Mail size={18} /> : <BookOpen size={18} />}
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg shadow-sm text-gray-400 hover:text-blue-600 transition-all" title="Arquivar">
                          <Layers size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-2 hover:bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-600 transition-all" 
                          title="Excluir"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
