'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, TerminalSquare, Database, Globe, ShieldAlert,
  Search, ArrowLeft, ServerCrash, Activity, Plus, X, Loader2,
  Save, ChevronLeft, ChevronRight, Pencil, Trash2, Layout,
  Code2, RefreshCw, CheckCircle2, Clock, AlertCircle, Blocks,
  Layers, Zap, CreditCard, Truck, Lock, Palette,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';



// ── Build tasks types ─────────────────────────────────────────────────────────

type TaskStatus  = 'backlog' | 'todo' | 'doing' | 'done' | 'blocked';
type TaskPrio    = 'alta' | 'media' | 'baixa';
type TaskArea    = 'frontend' | 'backend' | 'database' | 'integracao' | 'ux' | 'auth' | 'financeiro' | 'logistica' | 'geral';

type BuildTask = {
  id: string;
  title: string;
  description: string | null;
  how_to: string | null;
  solution: string | null;
  status: TaskStatus;
  priority: TaskPrio;
  area: TaskArea;
  order_index: number;
  created_at: string;
};

type TaskForm = {
  title: string;
  description: string;
  how_to: string;
  solution: string;
  status: TaskStatus;
  priority: TaskPrio;
  area: TaskArea;
};

const EMPTY_FORM: TaskForm = {
  title: '', description: '', how_to: '', solution: '',
  status: 'todo', priority: 'media', area: 'geral',
};

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'backlog', label: 'Backlog',       color: 'text-gray-500',   bg: 'bg-gray-100',   dot: 'bg-gray-400'   },
  { id: 'todo',    label: 'A Fazer',       color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500'   },
  { id: 'doing',   label: 'Em Andamento',  color: 'text-orange-600', bg: 'bg-orange-50',  dot: 'bg-orange-500' },
  { id: 'done',    label: 'Concluído',     color: 'text-green-700',  bg: 'bg-green-50',   dot: 'bg-green-600'  },
  { id: 'blocked', label: 'Bloqueado',     color: 'text-red-600',    bg: 'bg-red-50',     dot: 'bg-red-500'    },
];

const PRIO_STYLE: Record<TaskPrio, string> = {
  alta:  'bg-red-50 text-red-600 border border-red-100',
  media: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  baixa: 'bg-gray-50 text-gray-500 border border-gray-100',
};

const AREA_ICON: Record<TaskArea, React.ReactNode> = {
  frontend:   <Palette size={10} />,
  backend:    <Code2 size={10} />,
  database:   <Database size={10} />,
  integracao: <Zap size={10} />,
  ux:         <Layout size={10} />,
  auth:       <Lock size={10} />,
  financeiro: <CreditCard size={10} />,
  logistica:  <Truck size={10} />,
  geral:      <Layers size={10} />,
};

const AREA_COLOR: Record<TaskArea, string> = {
  frontend:   'bg-violet-50 text-violet-600',
  backend:    'bg-blue-50 text-blue-600',
  database:   'bg-emerald-50 text-emerald-700',
  integracao: 'bg-yellow-50 text-yellow-700',
  ux:         'bg-pink-50 text-pink-600',
  auth:       'bg-orange-50 text-orange-600',
  financeiro: 'bg-green-50 text-green-700',
  logistica:  'bg-sky-50 text-sky-600',
  geral:      'bg-gray-50 text-gray-500',
};

const AREAS: TaskArea[] = ['frontend','backend','database','integracao','ux','auth','financeiro','logistica','geral'];
const PRIOS: TaskPrio[]  = ['alta','media','baixa'];

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task, colIndex, totalCols,
  onMove, onEdit, onDelete, onView,
  onPriorityChange,
  isDragging, onDragStart, onDragEnd,
}: {
  task: BuildTask;
  colIndex: number;
  totalCols: number;
  onMove: (id: string, dir: 'left' | 'right') => void;
  onEdit: (t: BuildTask) => void;
  onDelete: (id: string) => void;
  onView: (t: BuildTask) => void;
  onPriorityChange: (id: string, newPriority: TaskPrio) => void;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id); }}
      onDragEnd={onDragEnd}
      onClick={() => onView(task)}
      className={`rounded-2xl border shadow-sm transition-all p-4 group select-none ${
        isDragging
          ? 'opacity-30 scale-95 border-violet-300 bg-violet-50 cursor-grabbing shadow-none'
          : 'bg-white border-gray-100 hover:shadow-md hover:border-violet-200 cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* badges row */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${AREA_COLOR[task.area]}`}>
          {AREA_ICON[task.area]} {task.area}
        </span>
        <select
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPrio)}
          value={task.priority}
          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer ${PRIO_STYLE[task.priority]}`}
        >
          {PRIOS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* title */}
      <p className="text-sm font-black text-gray-900 leading-snug mb-2">{task.title}</p>

      {/* description */}
      {task.description && (
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* how_to preview */}
      {task.how_to && (
        <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Como fazer</p>
          <p className="text-[10px] text-blue-800 font-medium leading-relaxed line-clamp-2">{task.how_to}</p>
        </div>
      )}

      {/* solution preview */}
      {task.solution && (
        <div className="bg-green-50 rounded-xl p-2.5 mb-3">
          <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Solução</p>
          <p className="text-[10px] text-green-900 font-medium leading-relaxed line-clamp-2">{task.solution}</p>
        </div>
      )}

      {/* actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
        <div className="flex gap-1">
          {colIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(task.id, 'left'); }}
              className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Mover para coluna anterior"
            >
              <ChevronLeft size={13} />
            </button>
          )}
          {colIndex < totalCols - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(task.id, 'right'); }}
              className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Mover para próxima coluna"
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 text-gray-300 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function ViewModal({
  task,
  onClose,
  onEdit,
}: {
  task: BuildTask;
  onClose: () => void;
  onEdit: (t: BuildTask) => void;
}) {
  const col = COLUMNS.find(c => c.id === task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '80vw', height: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 py-5 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Blocks size={20} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${AREA_COLOR[task.area]}`}>
                  {AREA_ICON[task.area]} {task.area}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${PRIO_STYLE[task.priority]}`}>
                  {task.priority}
                </span>
                {col && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${col.bg} ${col.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    {col.label}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-snug">{task.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 shrink-0 ml-4">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Description */}
            {task.description ? (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  O que precisa ser feito
                </p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 rounded-2xl px-5 py-4">
                  {task.description}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl px-5 py-8 text-center">
                <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Sem descrição</p>
              </div>
            )}

            {/* How to */}
            {task.how_to && (
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Code2 size={11} /> Como será implementado
                </p>
                <div className="bg-blue-50 rounded-2xl px-5 py-4 border border-blue-100/50">
                  <p className="text-sm text-blue-900 font-medium leading-relaxed whitespace-pre-wrap">
                    {task.how_to}
                  </p>
                </div>
              </div>
            )}

            {/* Solution */}
            {task.solution && (
              <div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={11} /> Solução / Notas de Implementação
                </p>
                <div className="bg-green-50 rounded-2xl px-5 py-4 border border-green-100/50">
                  <p className="text-sm text-green-900 font-medium leading-relaxed whitespace-pre-wrap">
                    {task.solution}
                  </p>
                </div>
              </div>
            )}

            {/* Empty solution placeholder */}
            {!task.solution && task.status !== 'done' && (
              <div className="bg-green-50/50 rounded-2xl px-5 py-6 border border-green-100/40 text-center">
                <CheckCircle2 size={20} className="text-green-200 mx-auto mb-2" />
                <p className="text-xs text-green-400 font-bold uppercase tracking-widest">
                  Solução será preenchida ao concluir
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Criado em</p>
              <p className="text-xs text-gray-500 font-medium">
                {new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => { onClose(); onEdit(task); }}
            className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-black text-sm hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <Pencil size={15} /> Editar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Task Modal ────────────────────────────────────────────────────────────────

function TaskModal({
  form, setForm, saving, onSave, onClose, editId,
}: {
  form: TaskForm;
  setForm: (f: TaskForm) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  editId: string | null;
}) {
  const set = (k: keyof TaskForm, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '80vw', height: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Blocks size={20} className="text-violet-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              {editId ? 'Editar Tarefa' : 'Nova Tarefa de Construção'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Title */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Título *
              </label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex: Implementar checkout B2C com PIX"
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400/30 border border-transparent focus:border-violet-200"
              />
            </div>

            {/* Row: area + priority + status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Área</label>
                <select
                  value={form.area}
                  onChange={e => set('area', e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400/30 border border-transparent"
                >
                  {AREAS.map(a => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Prioridade</label>
                <select
                  value={form.priority}
                  onChange={e => set('priority', e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400/30 border border-transparent"
                >
                  {PRIOS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status Inicial</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400/30 border border-transparent"
                >
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                O que precisa ser feito
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder="Descreva a atividade a ser realizada..."
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400/30 resize-none border border-transparent focus:border-violet-200"
              />
            </div>

            {/* How to */}
            <div>
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <Code2 size={11} /> Como será implementado
              </label>
              <textarea
                value={form.how_to}
                onChange={e => set('how_to', e.target.value)}
                rows={4}
                placeholder="Descreva a abordagem técnica: quais arquivos, tabelas, APIs, fluxo de dados..."
                className="w-full px-5 py-3.5 bg-blue-50/50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-300/30 resize-none border border-blue-100/50 focus:border-blue-200"
              />
            </div>

            {/* Solution */}
            <div>
              <label className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={11} /> Solução / Notas de Implementação
              </label>
              <textarea
                value={form.solution}
                onChange={e => set('solution', e.target.value)}
                rows={4}
                placeholder="Quando concluído: descreva como foi resolvido, decisões tomadas, links relevantes..."
                className="w-full px-5 py-3.5 bg-green-50/50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-300/30 resize-none border border-green-100/50 focus:border-green-200"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title.trim()}
            className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-black text-sm hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editId ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SystemLogsPage() {
  // ── Logs tab ────────────────────────────────────────────────────────────────
  const [tab, setTab]         = useState<'logs' | 'build'>('logs');
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setLoadingLogs(true);
      try {
        const { data, error } = await supabase
          .from('mktplace_feira_system_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
          
        if (!error && data) {
          // Map to match frontend expectations (handling icon mapping in render if needed, but since we map icons by severity/source, it's fine)
          setLogs(data.map(l => ({
            id: l.id,
            severity: l.severity,
            source: l.source,
            message: l.message,
            timestamp: new Date(l.timestamp).toLocaleString('pt-BR'),
            code: l.code,
            icon: l.severity === 'error' ? ServerCrash : (l.severity === 'warning' ? AlertTriangle : Activity)
          })));
        } else {
          setLogs([]);
        }
      } catch (err) {
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    }
    
    if (tab === 'logs') {
      loadLogs();
    }
  }, [tab]);

  // ── Build tab ───────────────────────────────────────────────────────────────
  const [tasks, setTasks]         = useState<BuildTask[]>([]);
  const [loading, setLoading]     = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [viewTask, setViewTask]   = useState<BuildTask | null>(null);
  const [form, setForm]           = useState<TaskForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [areaFilter, setAreaFilter] = useState<TaskArea | 'todas'>('todas');

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const [draggedId, setDraggedId]     = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd   = ()           => { setDraggedId(null); setDragOverCol(null); };

  const handleDrop = async (targetStatus: TaskStatus) => {
    if (!draggedId) return;
    const task = tasks.find(t => t.id === draggedId);
    setDraggedId(null);
    setDragOverCol(null);
    if (!task || task.status === targetStatus) return;
    setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status: targetStatus } : t));
    await supabase
      .from('mktplace_feira_build_tasks')
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id);
  };

  // ── Fetch tasks ─────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mktplace_feira_build_tasks')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });
      if (data) setTasks(data as BuildTask[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'build') fetchTasks(); }, [tab, fetchTasks]);

  // ── Open modal ──────────────────────────────────────────────────────────────

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setIsModalOpen(true); };
  const openEdit = (t: BuildTask) => {
    setEditId(t.id);
    setForm({
      title: t.title, description: t.description ?? '',
      how_to: t.how_to ?? '', solution: t.solution ?? '',
      status: t.status, priority: t.priority, area: t.area,
    });
    setIsModalOpen(true);
  };

  // ── Save task ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        how_to: form.how_to || null,
        solution: form.solution || null,
        status: form.status,
        priority: form.priority,
        area: form.area,
        updated_at: new Date().toISOString(),
      };
      if (editId) {
        await supabase.from('mktplace_feira_build_tasks').update(payload).eq('id', editId);
      } else {
        const maxIdx = Math.max(0, ...tasks.filter(t => t.status === form.status).map(t => t.order_index));
        await supabase.from('mktplace_feira_build_tasks').insert({ ...payload, order_index: maxIdx + 1 });
      }
      await fetchTasks();
      setIsModalOpen(false);
    } catch (e: any) { alert('Erro ao salvar: ' + e.message); }
    finally { setSaving(false); }
  };

  // ── Delete task ─────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta tarefa?')) return;
    await supabase.from('mktplace_feira_build_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleMove = async (id: string, dir: 'left' | 'right') => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const colIdx = COLUMNS.findIndex(c => c.id === task.status);
    const newIdx = dir === 'left' ? colIdx - 1 : colIdx + 1;
    if (newIdx < 0 || newIdx >= COLUMNS.length) return;
    const newStatus = COLUMNS[newIdx].id;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('mktplace_feira_build_tasks').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
  };

  // ── Change Priority ─────────────────────────────────────────────────────────

  const handlePriorityChange = async (id: string, newPriority: TaskPrio) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
    try {
      await supabase.from('mktplace_feira_build_tasks').update({ priority: newPriority, updated_at: new Date().toISOString() }).eq('id', id);
    } catch (e: any) {
      console.error('Error updating priority', e);
      alert('Erro ao atualizar prioridade');
      fetchTasks(); // rollback on failure
    }
  };

  // ── Filter tasks ────────────────────────────────────────────────────────────

  const filteredTasks = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q);
    const matchArea = areaFilter === 'todas' || t.area === areaFilter;
    return matchSearch && matchArea;
  });

  const filteredLogs = logs.filter(l => {
    const q = logSearch.toLowerCase();
    return (logFilter === 'all' || l.severity === logFilter) &&
      (!q || l.message.toLowerCase().includes(q) || l.source.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
  });

  // ── Stats ───────────────────────────────────────────────────────────────────

  const counts = COLUMNS.reduce((acc, c) => {
    acc[c.id] = tasks.filter(t => t.status === c.id).length;
    return acc;
  }, {} as Record<TaskStatus, number>);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <Link href="/admin/overview" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-700 mb-4 transition-colors w-fit">
            <ArrowLeft size={15} /> Voltar ao Overview
          </Link>
          <h2 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
            {tab === 'logs' ? 'Logs do Sistema' : 'Construção do Projeto'}
          </h2>
          <p className="text-gray-500 mt-1 font-medium text-sm">
            {tab === 'logs'
              ? 'Monitoramento de infraestrutura, APIs e banco de dados.'
              : 'Mapeamento de tarefas, implementações e progresso da construção.'}
          </p>
        </div>

        {tab === 'build' && (
          <button
            onClick={openNew}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-violet-900/10 transition-all active:scale-95"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        )}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 w-fit">
        <button
          onClick={() => setTab('logs')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'logs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TerminalSquare size={14} /> Logs do Sistema
        </button>
        <button
          onClick={() => setTab('build')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'build' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-violet-600'
          }`}
        >
          <Blocks size={14} /> Construção
          {tasks.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${tab === 'build' ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-500'}`}>
              {tasks.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LOGS TAB
      ═══════════════════════════════════════════════════════════════════════ */}

      {tab === 'logs' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-7 rounded-[32px] border border-red-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Erros Críticos (Hoje)</p>
                <h3 className="text-3xl font-black text-red-900">4</h3>
              </div>
              <div className="w-12 h-12 bg-red-200 text-red-700 rounded-2xl flex items-center justify-center">
                <ServerCrash size={22} />
              </div>
            </div>
            <div className="bg-orange-50 p-7 rounded-[32px] border border-orange-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Avisos / Lentidão</p>
                <h3 className="text-3xl font-black text-orange-900">2</h3>
              </div>
              <div className="w-12 h-12 bg-orange-200 text-orange-700 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
            </div>
            <div className="bg-green-50 p-7 rounded-[32px] border border-green-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Status Geral</p>
                <h3 className="text-3xl font-black text-green-900">Degradado</h3>
              </div>
              <div className="w-12 h-12 bg-green-200 text-green-700 rounded-2xl flex items-center justify-center">
                <Activity size={22} />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  placeholder="Buscar por ID, source ou mensagem..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-600/20 shadow-sm"
                />
              </div>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5 overflow-x-auto">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'error', label: 'Erros' },
                  { key: 'warning', label: 'Avisos' },
                  { key: 'info', label: 'Info' },
                ].map(f => (
                  <button key={f.key} onClick={() => setLogFilter(f.key)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      logFilter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-8 bg-gray-50/30">
              {filteredLogs.map((log, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl flex items-center justify-center ${log.severity === 'error' ? 'bg-red-50 text-red-600' : log.severity === 'warning' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        <log.icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{log.source}</span>
                    </div>
                    {log.severity === 'error' && <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Error</span>}
                    {log.severity === 'warning' && <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase"><div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> Warn</span>}
                    {log.severity === 'info' && <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Info</span>}
                  </div>
                  <p className={`text-sm font-medium mb-4 ${log.severity === 'error' ? 'text-red-900' : 'text-gray-900'}`}>
                    {log.message}
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end mt-auto">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{log.id}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">CODE: <span className="text-gray-600">{log.code}</span></p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BUILD TAB — KANBAN
      ═══════════════════════════════════════════════════════════════════════ */}

      {tab === 'build' && (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COLUMNS.map(col => (
              <div key={col.id} className={`${col.bg} rounded-[24px] p-5 border border-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${col.color}`}>{col.label}</p>
                </div>
                <p className={`text-3xl font-black ${col.color}`}>{loading ? '—' : counts[col.id] ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tarefa..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium shadow-sm outline-none w-56"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setAreaFilter('todas')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${areaFilter === 'todas' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:border-violet-300'}`}>
                Todas
              </button>
              {AREAS.map(a => (
                <button key={a} onClick={() => setAreaFilter(a)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${areaFilter === a ? 'bg-violet-600 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:border-violet-300'}`}>
                  {AREA_ICON[a]} {a}
                </button>
              ))}
              <button onClick={fetchTasks} className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>
          </div>

          {/* ── Kanban ── */}
          {loading ? (
            <div className="grid grid-cols-5 gap-4">
              {COLUMNS.map(col => (
                <div key={col.id} className="space-y-3">
                  <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                  {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
              {COLUMNS.map((col, colIndex) => {
                const colTasks   = filteredTasks.filter(t => t.status === col.id);
                const isDropOver = dragOverCol === col.id && draggedId !== null;
                return (
                  <div
                    key={col.id}
                    className="flex flex-col gap-3"
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(col.id as TaskStatus); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                    onDrop={(e)     => { e.preventDefault(); handleDrop(col.id as TaskStatus); }}
                  >
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                      isDropOver ? 'ring-2 ring-violet-400 ring-offset-1' : ''
                    } ${col.bg}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${col.color}`}>{col.label}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/60 ${col.color}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Cards */}
                    {colTasks.length === 0 ? (
                      <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                        isDropOver ? 'border-violet-300 bg-violet-50' : 'border-gray-100'
                      }`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDropOver ? 'text-violet-400' : 'text-gray-300'}`}>
                          {isDropOver ? 'Soltar aqui' : 'Vazio'}
                        </p>
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          colIndex={colIndex}
                          totalCols={COLUMNS.length}
                          onMove={handleMove}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onView={setViewTask}
                          onPriorityChange={handlePriorityChange}
                          isDragging={draggedId === task.id}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                    )}

                    {/* Drop hint strip when dragging over a non-empty column */}
                    {isDropOver && colTasks.length > 0 && (
                      <div className="border-2 border-dashed border-violet-300 bg-violet-50 rounded-2xl py-3 text-center">
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Soltar aqui</p>
                      </div>
                    )}

                    {/* Add button at bottom of each column */}
                    <button
                      onClick={() => { setForm({ ...EMPTY_FORM, status: col.id }); setEditId(null); setIsModalOpen(true); }}
                      className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest hover:border-violet-300 hover:text-violet-500 transition-all"
                    >
                      <Plus size={12} /> Adicionar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── View Modal ── */}
      {viewTask && (
        <ViewModal
          task={viewTask}
          onClose={() => setViewTask(null)}
          onEdit={(t) => { setViewTask(null); openEdit(t); }}
        />
      )}

      {/* ── Task Modal ── */}
      {isModalOpen && (
        <TaskModal
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          editId={editId}
        />
      )}
    </div>
  );
}
