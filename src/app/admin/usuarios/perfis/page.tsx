'use client';

import { useState, useEffect } from 'react';
import {
  Filter, Download, CheckCircle2, XCircle, Edit, History,
  ShieldCheck, Plus, ChevronDown, Truck, DollarSign, Megaphone,
  Headphones, Globe, AlertTriangle, Clock, Settings2
} from 'lucide-react';
import Modal from '@/components/admin/Modal';
import { fetchRoles, syncRole } from '@/lib/database';
import { useToast } from '@/components/Toast';

// ─── types ────────────────────────────────────────────────────────────────────

interface RoleData {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Record<string, any>;
  is_active: boolean;
}

type CardVariant = 'table' | 'toggles' | 'pills' | 'custom-table';

// ─── fallback seed (matches migration SQL) ────────────────────────────────────

const SEED_ROLES: RoleData[] = [
  {
    id: 'seed-1', name: 'Admin Master', is_active: true, color: '#15803d',
    description: 'Acesso total e irrestrito a todos os módulos.',
    permissions: { all: true },
  },
  {
    id: 'seed-2', name: 'Financeiro', is_active: true, color: '#2563eb',
    description: 'Gestão de faturamento, repasses e relatórios contábeis.',
    permissions: { financeiro: { view: true, edit: true }, relatorios: { view: true } },
  },
  {
    id: 'seed-3', name: 'Operador Logístico', is_active: true, color: '#f97316',
    description: 'Gestão de rotas, delivery, feiras e frotas.',
    permissions: { logistica: { view: true, edit: true }, feiras: { view: true, edit: true } },
  },
  {
    id: 'seed-4', name: 'Marketing & CRM', is_active: true, color: '#9333ea',
    description: 'Gestão de banners, campanhas, cupons e leads.',
    permissions: { marketing: { view: true, edit: true }, crm: { view: true, edit: true } },
  },
  {
    id: 'seed-5', name: 'Suporte', is_active: true, color: '#6b7280',
    description: 'Atendimento ao cliente, visualização de pedidos e perfis básicos.',
    permissions: { suporte: { view: true }, pedidos: { view: true }, usuarios: { view: true } },
  },
  {
    id: 'seed-6', name: 'Franqueado Regional', is_active: true, color: '#0891b2',
    description: 'Visão regionalizada de métricas e logística.',
    permissions: { franquia: { view: true, edit: false }, logistica: { view: true } },
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function getVariant(name: string): CardVariant {
  const n = name.toLowerCase();
  if (n.includes('operador') || n.includes('logíst') || n.includes('logist')) return 'toggles';
  if (n.includes('suporte')) return 'pills';
  if (n.includes('franq')) return 'custom-table';
  return 'table';
}

function getRoleIcon(name: string, size = 22) {
  const n = name.toLowerCase();
  if (n.includes('admin') || n.includes('master')) return <ShieldCheck size={size} />;
  if (n.includes('financ')) return <DollarSign size={size} />;
  if (n.includes('operador') || n.includes('logist') || n.includes('logíst')) return <Truck size={size} />;
  if (n.includes('marketing') || n.includes('crm')) return <Megaphone size={size} />;
  if (n.includes('suporte')) return <Headphones size={size} />;
  if (n.includes('franq')) return <Globe size={size} />;
  return <ShieldCheck size={size} />;
}

function hasPerm(permissions: Record<string, any>, module: string, action: string): boolean {
  if (permissions?.all) return true;
  const mod = permissions?.[module];
  if (!mod) return false;
  if (typeof mod === 'boolean') return mod;
  return !!mod[action];
}

function getTableModules(name: string) {
  const n = name.toLowerCase();
  if (n.includes('financ')) return [
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'relatorios', label: 'Relatórios' },
    { key: 'faturamento', label: 'Faturamento' },
  ];
  if (n.includes('marketing') || n.includes('crm')) return [
    { key: 'marketing', label: 'Marketing' },
    { key: 'crm', label: 'CRM' },
    { key: 'campanhas', label: 'Campanhas' },
  ];
  return [
    { key: 'vendas', label: 'Vendas' },
    { key: 'produtos', label: 'Produtos' },
    { key: 'usuarios', label: 'Usuários' },
  ];
}

const FRANQUIA_MODULES = [
  { key: 'logistica', label: 'Logística Regional' },
  { key: 'financeiro', label: 'Financeiro Unidade' },
];

const TOGGLE_ITEMS = [
  { key: 'rotas',     label: 'Gestão de Rotas em Tempo Real', permKey: 'logistica', action: 'edit' },
  { key: 'entregas',  label: 'Status de Entrega',             permKey: 'logistica', action: 'view' },
  { key: 'inventario',label: 'Edição de Inventário de Galpão',permKey: 'feiras',    action: 'edit' },
];

const ALL_MODULES = [
  { key: 'vendas',      label: 'Vendas' },
  { key: 'produtos',    label: 'Produtos' },
  { key: 'usuarios',    label: 'Usuários' },
  { key: 'financeiro',  label: 'Financeiro' },
  { key: 'marketing',   label: 'Marketing' },
  { key: 'crm',         label: 'CRM' },
  { key: 'logistica',   label: 'Logística' },
  { key: 'feiras',      label: 'Feiras' },
  { key: 'relatorios',  label: 'Relatórios' },
  { key: 'suporte',     label: 'Suporte' },
  { key: 'pedidos',     label: 'Pedidos' },
  { key: 'franquia',    label: 'Franquia' },
];

// ─── card sub-components ──────────────────────────────────────────────────────

function PermIcon({ active }: { active: boolean }) {
  return active
    ? <CheckCircle2 size={18} className="text-[#15803d] mx-auto" />
    : <XCircle size={18} className="text-gray-200 mx-auto" />;
}

function TableCard({ role }: { role: RoleData }) {
  const modules = getTableModules(role.name);
  return (
    <table className="w-full">
      <thead>
        <tr className="border-y border-gray-100 bg-gray-50/70">
          <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left w-[36%]">Módulo</th>
          {['Visualizar', 'Criar', 'Editar', 'Excluir'].map(h => (
            <th key={h} className="py-2.5 text-[10px] font-bold text-gray-400 uppercase text-center tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {modules.map(mod => (
          <tr key={mod.key} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{mod.label}</td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'view')}   /></td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'create')} /></td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'edit')}   /></td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'delete')} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomTableCard({ role }: { role: RoleData }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-y border-gray-100 bg-gray-50/70">
          <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left w-[40%]">Módulo</th>
          {['Visualizar', 'Aprovar', 'Gestão'].map(h => (
            <th key={h} className="py-2.5 text-[10px] font-bold text-gray-400 uppercase text-center tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {FRANQUIA_MODULES.map(mod => (
          <tr key={mod.key} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{mod.label}</td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'view')} /></td>
            <td className="py-3.5"><PermIcon active={hasPerm(role.permissions, mod.key, 'edit')} /></td>
            <td className="py-3.5">
              <PermIcon active={hasPerm(role.permissions, mod.key, 'manage') || hasPerm(role.permissions, mod.key, 'edit')} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TogglesCard({ role }: { role: RoleData }) {
  return (
    <div className="px-5 divide-y divide-gray-50">
      {TOGGLE_ITEMS.map(item => {
        const active = hasPerm(role.permissions, item.permKey, item.action);
        return (
          <div key={item.key} className="flex items-center justify-between py-4">
            <span className="text-sm font-semibold text-gray-800 pr-4">{item.label}</span>
            <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-[#15803d]' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PillsCard({ role }: { role: RoleData }) {
  const pills: string[] = [];
  for (const [mod, val] of Object.entries(role.permissions || {})) {
    if (typeof val === 'object') {
      for (const [action, v] of Object.entries(val as Record<string, boolean>)) {
        if (v) {
          const label = action === 'view' ? 'Visualizar' : action === 'edit' ? 'Editar' : action === 'create' ? 'Criar' : action;
          pills.push(`${label} ${mod.charAt(0).toUpperCase() + mod.slice(1)}`);
        }
      }
    }
  }
  const display = pills.length > 0 ? pills : ['Visualizar Suporte', 'Consultar Pedidos', 'Ver Perfis'];

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {display.slice(0, 6).map(p => (
          <span
            key={p}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: `${role.color}50`, color: role.color, backgroundColor: `${role.color}0a` }}
          >
            {p}
          </span>
        ))}
      </div>
      <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-orange-600 font-medium leading-snug">
          Acesso limitado ao módulo de suporte e visualização básica de dados.
        </p>
      </div>
    </div>
  );
}

function RoleCard({ role, onEdit }: { role: RoleData; onEdit: (r: RoleData) => void }) {
  const variant = getVariant(role.name);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ background: `${role.color}12` }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: role.color }}
          >
            {getRoleIcon(role.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-[19px] font-bold leading-tight truncate" style={{ color: role.color }}>
              {role.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
              {role.description || 'Perfil do sistema'}
            </p>
          </div>
        </div>
        {role.is_active && (
          <span className="ml-3 flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded bg-green-100 text-green-700 uppercase tracking-wide">
            Ativo
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex-1">
        {variant === 'table'        && <TableCard       role={role} />}
        {variant === 'custom-table' && <CustomTableCard role={role} />}
        {variant === 'toggles'      && <TogglesCard     role={role} />}
        {variant === 'pills'        && <PillsCard       role={role} />}
      </div>

      {/* footer */}
      <div className="px-4 py-3 flex items-center justify-end gap-1 border-t border-gray-50">
        {variant === 'toggles' && (
          <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors mr-auto" title="Configurações avançadas">
            <Settings2 size={18} />
          </button>
        )}
        <button onClick={() => onEdit(role)} className="p-2 text-gray-400 hover:text-[#125d30] transition-colors" title="Editar permissões">
          <Edit size={18} />
        </button>
        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Histórico de auditoria">
          <History size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminPerfisAcessoPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);

  const VISIBLE_COUNT = 4;

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadRoles();
      setLoading(false);
    })();
  }, []);

  async function loadRoles() {
    try {
      const data = await fetchRoles();
      if (data && data.length > 0) {
        setRoles(data);
      } else {
        setRoles(SEED_ROLES);
      }
    } catch (e) {
      setRoles(SEED_ROLES);
    }
  }

  function openEdit(role: RoleData) {
    setEditingRole({ ...role });
    setIsModalOpen(true);
  }

  function openNew() {
    setEditingRole({ id: '', name: '', description: '', color: '#125d30', permissions: {}, is_active: true });
    setIsModalOpen(true);
  }

  function updatePerm(moduleKey: string, action: string) {
    if (!editingRole) return;
    const perms = { ...(editingRole.permissions || {}) };
    const current = perms[moduleKey] ?? {};
    const normalized = typeof current === 'boolean'
      ? { view: current, create: current, edit: current, delete: current }
      : { ...current };
    perms[moduleKey] = { ...normalized, [action]: !normalized[action] };
    setEditingRole({ ...editingRole, permissions: perms });
  }

  async function handleSave() {
    if (!editingRole) return;
    const { id, ...rest } = editingRole;
    // só inclui id se for um UUID real — ignora ids fake do seed ("seed-1", "") e strings vazias
    const payload = id && UUID_RE.test(id) ? { id, ...rest } : rest;
    
    try {
      const result = await syncRole(payload as any);
      if (result.success) {
        await loadRoles();
        setIsModalOpen(false);
      } else {
        showToast('Erro ao salvar: ' + result.error, 'error');
      }
    } catch (e: any) {
      showToast('Erro ao salvar: ' + e.message, 'error');
    }
  }

  const visibleRoles = expanded ? roles : roles.slice(0, VISIBLE_COUNT);
  const hiddenCount  = Math.max(0, roles.length - VISIBLE_COUNT);

  return (
    <div className="pb-24">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-[28px] font-bold text-green-600 leading-tight">
              Gestão de Perfis de Acesso
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Configure os níveis de acesso e privilégios para cada tipo de usuário no ecossistema Feira.Casa.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 text-sm whitespace-nowrap">
              <Filter size={16} /> Filtros
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 text-sm whitespace-nowrap">
              <Download size={16} /> Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {visibleRoles.map(role => (
              <RoleCard key={role.id} role={role} onEdit={openEdit} />
            ))}
          </div>

          {hiddenCount > 0 && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-2 text-green-600 font-bold text-sm hover:underline"
              >
                {expanded ? 'Ocultar perfis' : `Ver mais ${hiddenCount} perfis administrativos`}
                <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Última alteração</span>
            <Clock size={18} className="text-gray-400" />
          </div>
          <p className="text-base font-bold text-gray-900">Hoje, 14:32</p>
          <p className="text-xs text-gray-500 mt-1">
            Alterado por <span className="font-bold text-gray-700">Admin_Carlos</span>{' '}
            em &quot;Logística&quot;
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-orange-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Usuários s/ Perfil</span>
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <p className="text-base font-bold text-gray-900">12 usuários</p>
          <p className="text-xs text-orange-600 mt-1 font-medium">Aguardando definição de privilégios</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Nível de Segurança</span>
            <ShieldCheck size={18} className="text-green-600" />
          </div>
          <p className="text-base font-bold text-gray-900">98% Compliance</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-green-600 h-full rounded-full" style={{ width: '98%' }} />
          </div>
        </div>
      </div>

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <button
        onClick={openNew}
        className="fixed left-80 bottom-8 h-12 px-5 bg-[#125d30] hover:bg-[#0e4d27] text-white rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 active:scale-95 z-50"
      >
        <Plus size={20} /> Novo Perfil
      </button>

      {/* ── Edit / Create Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole?.id ? `Editar: ${editingRole.name}` : 'Novo Perfil'}
      >
        {editingRole && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-sm font-semibold focus:ring-2 focus:ring-green-700/20"
                  placeholder="Ex: Operador Regional"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cor</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingRole.color || '#125d30'}
                    onChange={e => setEditingRole({ ...editingRole, color: e.target.value })}
                    className="w-12 h-[46px] rounded-xl border border-gray-100 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={editingRole.color}
                    onChange={e => setEditingRole({ ...editingRole, color: e.target.value })}
                    className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-sm font-mono focus:ring-2 focus:ring-green-700/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
              <input
                type="text"
                value={editingRole.description || ''}
                onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-sm font-semibold focus:ring-2 focus:ring-green-700/20"
                placeholder="Descreva as responsabilidades deste perfil"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <h4 className="font-bold text-gray-900 text-sm">Permissões por Módulo</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-gray-500">Acesso Total</span>
                  <input
                    type="checkbox"
                    checked={!!editingRole.permissions?.all}
                    onChange={e => setEditingRole({ ...editingRole, permissions: e.target.checked ? { all: true } : {} })}
                    className="w-4 h-4 rounded accent-green-700"
                  />
                </label>
              </div>

              {!editingRole.permissions?.all && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Módulo</th>
                        {['Ver', 'Criar', 'Editar', 'Excluir'].map(h => (
                          <th key={h} className="py-2 text-xs font-bold text-gray-400 uppercase text-center tracking-wider px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ALL_MODULES.map(mod => {
                        const perms = editingRole.permissions?.[mod.key] ?? {};
                        return (
                          <tr key={mod.key} className="hover:bg-gray-50/40">
                            <td className="py-2.5 text-sm font-semibold text-gray-700">{mod.label}</td>
                            {['view', 'create', 'edit', 'delete'].map(action => (
                              <td key={action} className="py-2.5 text-center px-2">
                                <input
                                  type="checkbox"
                                  checked={!!(typeof perms === 'boolean' ? perms : perms[action])}
                                  onChange={() => updatePerm(mod.key, action)}
                                  className="w-4 h-4 rounded accent-green-700 cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 bg-[#125d30] text-white rounded-xl font-bold hover:bg-[#0e4d27] transition-colors shadow-md text-sm"
              >
                Salvar Perfil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
