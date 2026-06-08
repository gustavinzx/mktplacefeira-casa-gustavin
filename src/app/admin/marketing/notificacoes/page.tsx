'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Bell, CheckCheck, MousePointerClick, Clock } from 'lucide-react';
import { useToast } from '@/components/Toast';

type Agendamento = 'imediato' | 'agendado';
type Publico = 'todos' | 'feirantes' | 'clientes' | 'entregadores' | 'franqueados';

type Notification = {
  titulo: string;
  publico: string;
  enviados: string;
  entregues: string;
  abertos: string;
  clicados: string;
  data: string;
};

const history: Notification[] = [
  { titulo: 'Nova feira na sua região!', publico: 'Clientes', enviados: '14.200', entregues: '98,1%', abertos: '34,2%', clicados: '8,8%', data: 'Hoje 09:00' },
  { titulo: 'Seu pedido foi aprovado', publico: 'Feirantes', enviados: '842', entregues: '99,4%', abertos: '71,3%', clicados: '12,1%', data: 'Ontem' },
  { titulo: 'Promoção relâmpago -30%', publico: 'Todos', enviados: '28.400', entregues: '97,8%', abertos: '42,1%', clicados: '18,4%', data: '08/05' },
];

const publicoOptions: { value: Publico; label: string }[] = [
  { value: 'todos', label: 'Todos os usuários' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'feirantes', label: 'Feirantes' },
  { value: 'entregadores', label: 'Entregadores' },
  { value: 'franqueados', label: 'Franqueados' },
];

const MAX_CHARS = 160;

export default function NotificacoesPage() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [publico, setPublico] = useState<Publico>('todos');
  const [agendamento, setAgendamento] = useState<Agendamento>('imediato');
  const [dataHora, setDataHora] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { showToast } = useToast();

  const handleEnviar = async () => {
    if (!titulo || !mensagem) return;
    setEnviando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ titulo, mensagem, publico }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Notificação enviada para ${data.data?.count || data.count} usuários.`, 'success');
        setTitulo('');
        setMensagem('');
      } else {
        showToast('Erro: ' + data.error, 'error');
      }
    } catch {
      showToast('Erro de conexão', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Notificações Push</h1>
          <p className="text-gray-500 font-medium mt-1">Envie mensagens segmentadas para os usuários do aplicativo.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enviadas', value: '43.442', icon: Bell, color: 'text-green-700 bg-green-50' },
          { label: 'Média de Abertura', value: '49,2%', icon: CheckCheck, color: 'text-blue-700 bg-blue-50' },
          { label: 'Média CTR', value: '13,1%', icon: MousePointerClick, color: 'text-orange-700 bg-orange-50' },
          { label: 'Agendadas', value: '3', icon: Clock, color: 'text-purple-700 bg-purple-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose panel */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-7 space-y-5 h-fit">
          <p className="font-black text-gray-900 text-lg">Compor Notificação</p>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Título</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
              placeholder="Ex: Oferta especial para você!"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mensagem</label>
              <span className={`text-[10px] font-black ${mensagem.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
                {mensagem.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30 resize-none"
              placeholder="Texto da notificação..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value.slice(0, MAX_CHARS))}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Público-alvo</label>
            <div className="space-y-2">
              {publicoOptions.map((op) => (
                <label key={op.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${publico === op.value ? 'border-[#125d30] bg-[#125d30]' : 'border-gray-300'}`}>
                    {publico === op.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="radio" className="sr-only" value={op.value} checked={publico === op.value} onChange={() => setPublico(op.value)} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{op.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Agendamento</label>
            <div className="flex gap-3">
              {(['imediato', 'agendado'] as Agendamento[]).map((ag) => (
                <button
                  key={ag}
                  onClick={() => setAgendamento(ag)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all ${agendamento === ag ? 'bg-[#125d30] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {ag === 'imediato' ? 'Imediato' : 'Agendado'}
                </button>
              ))}
            </div>
          </div>

          {agendamento === 'agendado' && (
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data e Hora</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleEnviar}
            disabled={enviando || !titulo || !mensagem}
            className="w-full px-5 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {enviando ? 'Enviando...' : 'Enviar Notificação'}
          </button>
        </div>

        {/* History panel */}
        <div className="lg:col-span-3 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-100">
            <p className="font-black text-gray-900 text-lg">Histórico de Envios</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Título', 'Público', 'Enviados', 'Entregues', 'Abertos', 'Clicados', 'Data'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((n, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm whitespace-nowrap max-w-[180px] truncate">{n.titulo}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-green-50 text-green-700">{n.publico}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{n.enviados}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{n.entregues}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#125d30]">{n.abertos}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#fc6c29]">{n.clicados}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{n.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-medium">Exibindo os últimos 3 envios. Os dados de entrega são atualizados a cada 15 minutos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
