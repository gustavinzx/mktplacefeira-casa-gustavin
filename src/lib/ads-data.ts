// Shared ad/banner types and default data.
// Admin panel writes via PUT /api/ads/banners.
// RotatingBanner reads via GET /api/ads/banners.
// During dev the module-level store in the API route persists per session.

export type AdBannerType = 'oferta' | 'patrocinado' | 'destaque' | 'novo';
export type AnuncianteType = 'feirante' | 'chef' | 'restaurante' | 'atacadista';
export type BannerPlataforma = 'web' | 'mobile' | 'ambos';

export interface AdBanner {
  id: string;
  titulo: string;
  subtitulo: string;
  cta: string;
  badge: string;
  badgeType: AdBannerType;
  imageUrl: string;
  linkUrl: string;
  anunciante?: string;
  anuncianteType?: AnuncianteType;
  isAd: boolean;
  ativo: boolean;
  ordem: number;
  plataforma?: BannerPlataforma;
  // stats (read-only from frontend perspective)
  impressoes?: number;
  cliques?: number;
  // commercial
  packageId?: string;
  vigenciaFim?: string; // ISO date
}

export interface AdSlot {
  id: string;
  posicao: string;
  dimensao: string;
  anunciante: string;
  valorMensal: number;
  impressoes: number;
  ctr: number;
  ativo: boolean;
  vigenciaFim?: string;
}

export interface AdPackage {
  id: string;
  nome: string;
  descricao: string;
  slots: string[]; // which positions are included
  duracao: number; // days
  preco: number;
  impressoesGarantidas: number;
  beneficios: string[];
  destaque: boolean; // most popular
  cor: string; // tailwind bg class for card accent
  publicoAlvo: AnuncianteType[];
}

// ─── Default hero banners (ordem controls the carousel sequence) ─────────────

export const DEFAULT_BANNERS: AdBanner[] = [
  {
    id: 'hero-default',
    titulo: 'O frescor da feira direto na sua porta.',
    subtitulo: 'Produtos colhidos hoje pelos melhores produtores locais da sua região. Entrega rápida e garantida.',
    cta: 'Ver Ofertas',
    badge: 'OFERTA DO DIA',
    badgeType: 'oferta',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzLm7uis6sOHCw4QvgNXiEz01JT2OXNeai8SlbBlK3yd8AoUIMZpqIJMJJuhMLChwdyJ6gq1i6SxElvlbf3UBQYI09fMy0Vy-sd3Znm0EziyOM_FheNCowsvbJRaY0Dz__ePE6emjpqPTAjEf6u6kgr1QWnJdqhWvz1sy8CMLANuMvHZT07qb28pEiXyMX9ODlII6bm51Paofijf4oGgq9kxXGoQ6a66poJA4sfD-NWZvlg9tQTb2FOrvKYbEmJ4RRpkU-6SoL0aI',
    linkUrl: '/categories/ofertas-dia',
    plataforma: 'ambos',
    isAd: false,
    ativo: true,
    ordem: 0,
    impressoes: 0,
    cliques: 0,
  },
  {
    id: 'ad-fazendaorg',
    titulo: 'Orgânicos certificados, direto do campo.',
    subtitulo: 'FazendaOrg — Certificação IBD. Alimentos limpos e nutritivos para sua família.',
    cta: 'Conhecer Banca',
    badge: 'PATROCINADO',
    badgeType: 'patrocinado',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200',
    linkUrl: '/feirantes/fazendaorg',
    plataforma: 'web',
    anunciante: 'FazendaOrg',
    anuncianteType: 'feirante',
    isAd: true,
    ativo: true,
    ordem: 1,
    impressoes: 48200,
    cliques: 2024,
    packageId: 'pkg-hero-30',
    vigenciaFim: '2026-05-31',
  },
  {
    id: 'ad-nutrichef',
    titulo: 'Refeições saudáveis sob encomenda.',
    subtitulo: 'Cardápio semanal personalizado com ingredientes frescos da feira, preparado com carinho pelo Chef Pedro Alves.',
    cta: 'Encomendar Agora',
    badge: 'CHEF PARCEIRO',
    badgeType: 'destaque',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200',
    linkUrl: '/chefs/nutrichef',
    plataforma: 'ambos',
    anunciante: 'Chef Pedro Alves',
    anuncianteType: 'chef',
    isAd: true,
    ativo: true,
    ordem: 2,
    impressoes: 31400,
    cliques: 1188,
    packageId: 'pkg-hero-15',
    vigenciaFim: '2026-05-20',
  },
  {
    id: 'ad-mercadofresco',
    titulo: 'Atacado para restaurantes e negócios.',
    subtitulo: 'Mercado Fresco Atacado — pedido mínimo R$150. Entrega em 24h. CNPJ obrigatório.',
    cta: 'Fazer Pedido B2B',
    badge: 'ATACADO B2B',
    badgeType: 'novo',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200',
    linkUrl: '/b2b/mercadofresco',
    plataforma: 'mobile',
    anunciante: 'Mercado Fresco',
    anuncianteType: 'atacadista',
    isAd: true,
    ativo: false,
    ordem: 3,
    impressoes: 22100,
    cliques: 662,
    packageId: 'pkg-vitrine',
    vigenciaFim: '2026-05-15',
  },
];

// ─── Ad packages with pricing ─────────────────────────────────────────────────

export const DEFAULT_PACKAGES: AdPackage[] = [
  {
    id: 'pkg-vitrine',
    nome: 'Vitrine Básica',
    descricao: 'Ideal para feirantes que querem começar a anunciar.',
    slots: ['Sidebar Superior (300×250px)'],
    duracao: 7,
    preco: 89,
    impressoesGarantidas: 8000,
    beneficios: [
      'Sidebar superior na homepage',
      'Até 8.000 impressões garantidas',
      'Link direto para sua banca',
      'Badge "Patrocinado"',
    ],
    destaque: false,
    cor: 'bg-gray-50',
    publicoAlvo: ['feirante'],
  },
  {
    id: 'pkg-hero-7',
    nome: 'Destaque Semanal',
    descricao: 'Banner principal por 7 dias com alta visibilidade.',
    slots: ['Hero Banner (1200×400px)'],
    duracao: 7,
    preco: 249,
    impressoesGarantidas: 25000,
    beneficios: [
      'Banner Hero rotativo (1200×400px)',
      'Até 25.000 impressões garantidas',
      'Segmentação por cidade/região',
      'Relatório de performance ao final',
      'Foto, título e CTA personalizados',
    ],
    destaque: false,
    cor: 'bg-blue-50',
    publicoAlvo: ['feirante', 'chef', 'restaurante'],
  },
  {
    id: 'pkg-hero-15',
    nome: 'Presença Quinzenal',
    descricao: 'Banner hero por 15 dias + sidebar. Mais visibilidade.',
    slots: ['Hero Banner (1200×400px)', 'Sidebar Superior (300×250px)'],
    duracao: 15,
    preco: 599,
    impressoesGarantidas: 60000,
    beneficios: [
      'Banner Hero rotativo por 15 dias',
      'Sidebar superior por 15 dias',
      'Até 60.000 impressões garantidas',
      'Relatório semanal por email',
      'Suporte prioritário via WhatsApp',
      'Segmentação por bairro/cidade',
    ],
    destaque: true,
    cor: 'bg-green-50',
    publicoAlvo: ['feirante', 'chef', 'restaurante', 'atacadista'],
  },
  {
    id: 'pkg-hero-30',
    nome: 'Presença Mensal',
    descricao: 'Máxima visibilidade por 30 dias com todas as posições.',
    slots: ['Hero Banner (1200×400px)', 'Sidebar Superior (300×250px)', 'Popup Homepage (600×400px)'],
    duracao: 30,
    preco: 999,
    impressoesGarantidas: 130000,
    beneficios: [
      'Banner Hero rotativo por 30 dias',
      'Sidebar superior + popup homepage',
      'Até 130.000 impressões garantidas',
      'Relatório semanal + reunião mensal',
      'Criação do banner incluída (grátis)',
      'Destaque na seção "Patrocinado"',
    ],
    destaque: false,
    cor: 'bg-purple-50',
    publicoAlvo: ['feirante', 'chef', 'restaurante', 'atacadista'],
  },
  {
    id: 'pkg-premium',
    nome: 'Patrocinador Premium',
    descricao: 'Pacote completo para máxima exposição na plataforma.',
    slots: ['Hero Banner', 'Sidebar Superior', 'Sidebar Inferior', 'Popup', 'Footer', 'Featured Banca'],
    duracao: 30,
    preco: 2499,
    impressoesGarantidas: 400000,
    beneficios: [
      'Todos os slots de banner (hero, sidebar, footer, popup)',
      'Destaque "Feirante do Mês" na homepage',
      'Email marketing para base de clientes (28k contatos)',
      'Notificação push para usuários da região',
      '400.000+ impressões garantidas',
      'Relatório semanal + dashboard exclusivo',
      'Gerente de conta dedicado',
      'Produção de banner e copy incluída',
    ],
    destaque: false,
    cor: 'bg-amber-50',
    publicoAlvo: ['feirante', 'restaurante', 'atacadista'],
  },
];

export const ANUNCIANTE_CONFIG: Record<AnuncianteType, { label: string; bg: string; color: string }> = {
  feirante:   { label: 'Feirante',    bg: 'bg-green-100',  color: 'text-green-800'  },
  chef:       { label: 'Chef',        bg: 'bg-orange-100', color: 'text-orange-800' },
  restaurante:{ label: 'Restaurante', bg: 'bg-red-100',    color: 'text-red-800'    },
  atacadista: { label: 'Atacadista',  bg: 'bg-blue-100',   color: 'text-blue-800'   },
};

export const BADGE_STYLES: Record<AdBannerType, string> = {
  oferta:     'bg-[#fc6c29] text-white',
  patrocinado:'bg-black/70 text-white',
  destaque:   'bg-[#125d30] text-white',
  novo:       'bg-blue-600 text-white',
};
