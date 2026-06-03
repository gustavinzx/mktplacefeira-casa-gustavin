'use client';
import { useState } from 'react';
import { Send, Mail, MessageSquare, Smartphone, FileText, TrendingUp, CheckCheck, AlertCircle } from 'lucide-react';

type Channel = 'email' | 'sms' | 'inapp';

type HistoryItem = {
  canal: Channel;
  assunto: string;
  para: string;
  enviados: string;
  abertos: string;
  data: string;
};

type Template = {
  nome: string;
  preview: string;
  canal: Channel;
};

const historyData: HistoryItem[] = [
  { canal: 'email', assunto: 'Sua fatura de abril está disponível', para: 'Feirantes', enviados: '2.840', abertos: '64,2%', data: 'Hoje 08:00' },
  { canal: 'sms', assunto: 'Pedido #4821 confirmado', para: 'Clientes', enviados: '1.200', abertos: '98,4%', data: 'Ontem 14:30' },
  { canal: 'inapp', assunto: 'Bem-vindo à feira.casa!', para: 'Novos usuários', enviados: '380', abertos: '88,1%', data: 'Ontem 10:00' },
  { canal: 'email', assunto: 'Novidades da semana na feira.casa', para: 'Todos', enviados: '18.400', abertos: '29,8%', data: '08/05' },
  { canal: 'sms', assunto: 'Código de verificação: 482921', para: 'Clientes', enviados: '940', abertos: '99,9%', data: '07/05' },
  { canal: 'inapp', assunto: 'Seu feirante favorito publicou novos produtos', para: 'Clientes', enviados: '5.200', abertos: '51,3%', data: '06/05' },
];

const templates: Template[] = [
  { nome: 'Boas-vindas', preview: 'Bem-vindo à feira.casa! Explore os melhores produtos diretamente dos produtores...', canal: 'email' },
  { nome: 'Confirmação de Pedido', preview: 'Seu pedido #{{id}} foi confirmado e está sendo preparado pelo feirante...', canal: 'sms' },
  { nome: 'Promoção Semanal', preview: 'Confira as ofertas desta semana selecionadas especialmente para você na feira.casa...', canal: 'email' },
  { nome: 'Novo Produto Disponível', preview: 'Um produto que você pode gostar chegou na sua feira regional. Veja agora!', canal: 'inapp' },
  { nome: 'Recuperação de Carrinho', preview: 'Você deixou itens no seu carrinho. Complete seu pedido e aproveite frete reduzido!', canal: 'email' },
];

const segmentoOptions = ['Todos os usuários', 'Feirantes', 'Clientes', 'Entregadores', 'Franqueados', 'Novos usuários', 'Usuários inativos'];

const canalIcon: Record<Channel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  inapp: Smartphone,
};

const canalLabel: Record<Channel, string> = {
  email: 'Email',
  sms: 'SMS',
  inapp: 'In-App',
};

const canalBadge: Record<Channel, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  inapp: 'bg-purple-100 text-purple-700',
};

export default function ComunicacaoPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>('email');
  const [segmento, setSegmento] = useState(segmentoOptions[0]);
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [agendamento, setAgendamento] = useState<'imediato' | 'agendado'>('imediato');
  const [dataHora, setDataHora] = useState('');

  const filteredHistory = historyData;
  const filteredTemplates = templates.filter((t) => t.canal === activeChannel || true);

  const useTemplate = (t: Template) => {
    setActiveChannel(t.canal);
    setMensagem(t.preview);
    if (t.canal === 'email') setAssunto(t.nome);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">Comunicação</h1>
          <p className="text-gray-500 font-medium mt-1">Central de mensagens por email, SMS e notificações in-app.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mensagens Enviadas', value: '29.160', icon: Send, color: 'text-green-700 bg-green-50' },
          { label: 'Taxa de Abertura', value: '41,8%', icon: TrendingUp, color: 'text-blue-700 bg-blue-50' },
          { label: 'SMS Entregues', value: '99,2%', icon: CheckCheck, color: 'text-orange-700 bg-orange-50' },
          { label: 'Email Bounce Rate', value: '0,8%', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
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

      {/* Channel tabs */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-6 pt-2">
          {(['email', 'sms', 'inapp'] as Channel[]).map((ch) => {
            const Icon = canalIcon[ch];
            return (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-5 py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all -mb-px ${activeChannel === ch ? 'border-[#125d30] text-[#125d30]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              >
                <Icon size={16} />
                {canalLabel[ch]}
              </button>
            );
          })}
        </div>

        {/* Compose */}
        <div className="p-7 space-y-5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compor Mensagem — {canalLabel[activeChannel]}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Destinatários (Segmento)</label>
              <select
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
              >
                {segmentoOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {activeChannel === 'email' && (
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Assunto</label>
                <input
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                  placeholder="Ex: Novidades da semana"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Mensagem</label>
            <textarea
              rows={5}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30 resize-none"
              placeholder="Escreva aqui o conteúdo da mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Agendamento</label>
              <div className="flex gap-2">
                {(['imediato', 'agendado'] as const).map((ag) => (
                  <button
                    key={ag}
                    onClick={() => setAgendamento(ag)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold capitalize transition-all ${agendamento === ag ? 'bg-[#125d30] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {ag === 'imediato' ? 'Imediato' : 'Agendado'}
                  </button>
                ))}
              </div>
            </div>
            {agendamento === 'agendado' && (
              <div className="flex-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#125d30]/30"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                />
              </div>
            )}
            <div className="ml-auto pt-6">
              <button className="px-6 py-3 bg-[#125d30] text-white rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg">
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-[#125d30]" />
          <p className="font-black text-gray-900 text-lg">Templates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((t, i) => (
            <div key={i} className="border border-gray-100 rounded-[24px] p-5 hover:border-[#125d30]/30 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="font-black text-gray-900 text-sm">{t.nome}</p>
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${canalBadge[t.canal]}`}>{canalLabel[t.canal]}</span>
              </div>
              <p className="text-[12px] text-gray-500 line-clamp-2 mb-4">{t.preview}</p>
              <button
                onClick={() => useTemplate(t)}
                className="w-full py-2 rounded-2xl border border-[#125d30] text-[#125d30] text-xs font-black hover:bg-[#125d30] hover:text-white transition-all"
              >
                Usar Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-7 py-6 border-b border-gray-100">
          <p className="font-black text-gray-900 text-lg">Histórico de Mensagens</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Canal', 'Assunto / Título', 'Para', 'Enviados', 'Abertos / Lidos', 'Data'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, i) => {
                const Icon = canalIcon[item.canal];
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 w-fit ${canalBadge[item.canal]}`}>
                        <Icon size={11} />
                        {canalLabel[item.canal]}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm max-w-[220px] truncate whitespace-nowrap">{item.assunto}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.para}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{item.enviados}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#125d30]">{item.abertos}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{item.data}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
