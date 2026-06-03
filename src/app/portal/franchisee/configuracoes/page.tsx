'use client';

import React, { useState } from 'react';
import { Building2, Map, Zap, Headphones, Save, Trash2, Plus, Edit2, Cloud } from 'lucide-react';

const initialZones = ['Zona Sul', 'Centro Histórico'];

const peakTimes = [
  { label: 'Sábado de Feira', time: '07:00 – 11:00', extra: '+R$ 4,50' },
  { label: 'Pico de Domingo', time: '08:00 – 12:00', extra: '+R$ 6,00' },
];

export default function ConfiguracoesPage() {
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [fantasia, setFantasia] = useState('Feira Casa - Regional Sudeste');
  const [endereco, setEndereco] = useState('Av. das Hortaliças, 1024 - Vila Verde, São Paulo - SP');
  const [raio, setRaio] = useState(15);
  const [zones, setZones] = useState(initialZones);
  const [newZone, setNewZone] = useState('');
  const [email, setEmail] = useState('sudeste@feira.casa');
  const [whatsapp, setWhatsapp] = useState('(11) 98765-4321');
  const [saved, setSaved] = useState(false);

  const removeZone = (z: string) => setZones(prev => prev.filter(z2 => z2 !== z));
  const addZone = () => {
    if (newZone.trim()) { setZones(prev => [...prev, newZone.trim()]); setNewZone(''); }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-7 pb-24">

      {/* Header */}
      <div>
        <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight">Configurações da Unidade</h1>
        <p className="text-gray-500 font-medium mt-1">Gerencie os parâmetros operacionais, dados cadastrais e contatos regionais da sua franquia feira.casa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Column 1 */}
        <div className="space-y-5">

          {/* Dados da Unidade */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-green-700" />
              </div>
              <h2 className="font-black text-gray-900">Dados da Unidade Física</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CNPJ da Franquia</label>
                <input value={cnpj} onChange={e => setCnpj(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[16px] outline-none font-bold text-sm transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Fantasia Regional</label>
                <input value={fantasia} onChange={e => setFantasia(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[16px] outline-none font-bold text-sm transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço da Sede/Extensão</label>
                <input value={endereco} onChange={e => setEndereco(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[16px] outline-none font-bold text-sm transition-all" />
              </div>
            </div>
          </div>

          {/* Parâmetros de Entrega */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Map size={18} className="text-blue-600" />
              </div>
              <h2 className="font-black text-gray-900">Parâmetros de Entrega</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-bold text-gray-700">Raio de Atuação Máximo</label>
                  <span className="px-3 py-1 bg-green-700 text-white text-xs font-black rounded-full">{raio} KM</span>
                </div>
                <input type="range" min={1} max={50} value={raio} onChange={e => setRaio(Number(e.target.value))}
                  className="w-full h-2 accent-[#125d30] cursor-pointer" />
                <div className="flex justify-between text-[10px] font-black text-gray-400 mt-1">
                  <span>1 KM</span><span>50 KM</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Zonas de Entrega Ativas</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {zones.map(z => (
                    <span key={z} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700">
                      {z}
                      <button onClick={() => removeZone(z)} className="text-gray-400 hover:text-red-600 transition-colors ml-1">✕</button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input value={newZone} onChange={e => setNewZone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addZone()}
                      placeholder="+ Adicionar Região"
                      className="px-4 py-2 border border-dashed border-green-600/40 rounded-full text-sm font-bold text-green-700 placeholder-green-600/50 outline-none bg-transparent w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-5">

          {/* Taxas Dinâmicas */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-yellow-600" />
              </div>
              <h2 className="font-black text-gray-900">Taxas Dinâmicas (Pico)</h2>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-5">Defina horários onde a alta demanda exige um acréscimo logístico para manter o frescor da entrega.</p>
            <div className="space-y-3 mb-4">
              {peakTimes.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.time} · <span className="text-green-700 font-bold">{t.extra}</span></p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                    <Edit2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-[16px] text-sm font-bold text-gray-400 hover:border-green-600/40 hover:text-green-700 transition-all flex items-center justify-center gap-2">
              <Plus size={15} /> Novo Horário de Pico
            </button>
          </div>

          {/* Contatos */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Headphones size={18} className="text-purple-600" />
              </div>
              <h2 className="font-black text-gray-900">Contatos de Suporte</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail de Atendimento Regional</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[16px] outline-none font-bold text-sm transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp de Emergência (Logística)</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-green-600/30 focus:bg-white rounded-[16px] outline-none font-bold text-sm transition-all" />
              </div>
            </div>
          </div>

          {/* Map preview */}
          <div className="relative rounded-[28px] overflow-hidden h-44 shadow-sm">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600" className="w-full h-full object-cover" alt="Mapa" />
            <div className="absolute inset-0 bg-black/40" />
            <button className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-white/90 backdrop-blur text-gray-900 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white transition-all shadow-lg">
              <Map size={15} /> Visualizar Área de Cobertura
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-[210px] right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <Cloud size={16} />
          As alterações são salvas automaticamente em rascunho.
        </div>
        <div className="flex gap-3">
          <button onClick={() => {
            setCnpj('12.345.678/0001-90');
            setFantasia('Feira Casa - Regional Sudeste');
            setEndereco('Av. das Hortaliças, 1024 - Vila Verde, São Paulo - SP');
            setRaio(15);
            setZones(initialZones);
          }} className="px-6 py-3 bg-white border border-gray-200 rounded-[16px] font-bold text-gray-700 hover:border-gray-400 transition-all">
            Descartar
          </button>
          <button onClick={handleSave} className={`px-6 py-3 rounded-[16px] font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${saved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#125d30] text-white hover:bg-green-800 shadow-green-900/10'}`}>
            <Save size={16} /> {saved ? 'Salvo!' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
