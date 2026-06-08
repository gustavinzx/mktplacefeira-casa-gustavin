'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

export interface SubscriptionPlan {
  id?: string;
  name: string;
  targetProfile: string;
  price: number;
  recurrence: string;
  gracePeriodDays: number;
  features: string[];
  isActive: boolean;
}

interface NovoPlanoModalProps {
  onClose: () => void;
  onSave: (plan: SubscriptionPlan) => void;
  initialData?: SubscriptionPlan | null;
}

const PROFILE_LABEL: Record<string, string> = {
  feirante: 'Feirante',
  chef: 'Chef/Restaurante',
  comprador_b2b: 'Comprador B2B',
  comprador_b2c: 'Usuário Padrão',
};

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function NovoPlanoModal({ onClose, onSave, initialData }: NovoPlanoModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    targetProfile: 'feirante',
    price: 0,
    recurrence: 'mensal',
    gracePeriodDays: 0,
    features: [''],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const set = (field: keyof SubscriptionPlan, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  const setFeature = (i: number, v: string) => {
    const arr = [...(formData.features ?? [])];
    arr[i] = v;
    set('features', arr);
  };

  const canNext1 = !!(formData.name?.trim() && formData.targetProfile);
  const canNext2 = formData.price !== undefined && formData.recurrence;

  const handleSubmit = () => {
    const cleaned = (formData.features ?? []).filter((f: any) => f.trim());
    if (!cleaned.length) { showToast('Adicione pelo menos um benefício.', 'error'); return; }
    onSave({ ...(formData as SubscriptionPlan), features: cleaned });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white w-[80vw] h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Header + Stepper */}
        <div className="flex-none px-10 pt-10 pb-6 border-b border-[#efeee9] bg-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <X size={22} />
          </button>
          <h2 className="text-3xl font-black text-[#0e6b17] tracking-tight mb-6">
            {initialData ? 'Editar Plano' : 'Novo Plano de Assinatura'}
          </h2>
          <div className="flex gap-4 mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-colors duration-300 ${step >= s ? 'bg-[#0e6b17]' : 'bg-gray-100'}`} />
            ))}
          </div>
          <div className="flex justify-between px-1">
            {['1. Identidade', '2. Precificação', '3. Benefícios'].map((l, i) => (
              <span key={l} className={`text-xs font-black uppercase tracking-widest ${step >= i + 1 ? 'text-[#0e6b17]' : 'text-gray-400'}`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#fbfaf5]/30">

          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Identidade do Plano</h4>
                <p className="text-[#707a6f] font-medium">Defina o nome e para qual perfil este plano se destina.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Nome do Plano</label>
                <input
                  type="text"
                  value={formData.name ?? ''}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ex: Plano Premium Feirante"
                  className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#0e6b17]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Perfil Alvo</label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(PROFILE_LABEL).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => set('targetProfile', key)}
                      className={`p-5 rounded-[20px] border-2 text-left transition-all ${formData.targetProfile === key ? 'border-[#0e6b17] bg-green-50' : 'border-[#efeee9] bg-white hover:border-green-200'}`}>
                      <p className={`font-black text-base ${formData.targetProfile === key ? 'text-[#0e6b17]' : 'text-[#1b1c19]'}`}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Precificação & Carência</h4>
                <p className="text-[#707a6f] font-medium">Valor, recorrência e período de carência.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Valor (R$)</label>
                  <input type="number" min="0" step="0.01" value={formData.price ?? 0}
                    onChange={e => set('price', Number(e.target.value))}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#0e6b17]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Carência (dias grátis)</label>
                  <input type="number" min="0" value={formData.gracePeriodDays ?? 0}
                    onChange={e => set('gracePeriodDays', Number(e.target.value))}
                    className="w-full bg-white rounded-[16px] px-5 py-4 border border-[#efeee9] focus:border-[#0e6b17]/50 outline-none font-bold text-lg text-[#1b1c19] shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#707a6f]">Recorrência</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['mensal', 'trimestral', 'semestral', 'anual'] as const).map(r => (
                    <button key={r} type="button" onClick={() => set('recurrence', r)}
                      className={`p-4 rounded-[16px] border-2 text-center capitalize font-black text-sm transition-all ${formData.recurrence === r ? 'border-[#0e6b17] bg-green-50 text-[#0e6b17]' : 'border-[#efeee9] bg-white text-[#707a6f] hover:border-green-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-[#efeee9] shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#707a6f] mb-3">Resumo</p>
                <h5 className="font-black text-xl text-[#1b1c19]">{formData.name || '—'}</h5>
                <p className="text-sm text-[#707a6f] font-medium mt-1">{PROFILE_LABEL[formData.targetProfile ?? 'feirante']} · {formData.recurrence}</p>
                <p className="text-2xl font-black text-[#0e6b17] mt-3">{fmt(formData.price ?? 0)}</p>
                {(formData.gracePeriodDays ?? 0) > 0 && (
                  <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded-lg">{formData.gracePeriodDays} dias grátis</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-400">
              <div>
                <h4 className="text-2xl font-black text-[#1b1c19] mb-1">Recursos & Benefícios</h4>
                <p className="text-[#707a6f] font-medium">Liste os benefícios que o assinante terá acesso.</p>
              </div>
              <div className="space-y-3">
                {(formData.features ?? ['']).map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-[#0e6b17] shrink-0" />
                    <input type="text" value={f} onChange={e => setFeature(i, e.target.value)}
                      placeholder={`Benefício ${i + 1}`}
                      className="flex-1 bg-white rounded-[14px] px-4 py-3 border border-[#efeee9] focus:border-[#0e6b17]/50 outline-none font-medium text-sm text-[#1b1c19] shadow-sm" />
                    {(formData.features?.length ?? 0) > 1 && (
                      <button type="button" onClick={() => set('features', (formData.features ?? []).filter((_: any, idx: number) => idx !== i))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => set('features', [...(formData.features ?? []), ''])}
                  className="flex items-center gap-2 text-sm font-bold text-[#0e6b17] hover:text-green-800 mt-2">
                  <Plus size={16} /> Adicionar Benefício
                </button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-[24px] p-6">
                <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-3">Pré-visualização</p>
                <h5 className="font-black text-xl text-[#1b1c19]">{formData.name}</h5>
                <p className="text-sm text-[#707a6f] mt-1">{PROFILE_LABEL[formData.targetProfile ?? 'feirante']} · {formData.recurrence}</p>
                <p className="text-2xl font-black text-[#0e6b17] mt-2">{fmt(formData.price ?? 0)}</p>
                <ul className="mt-4 space-y-1">
                  {(formData.features ?? []).filter((f: any) => f.trim()).map((f: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#1b1c19] font-medium">
                      <Check size={14} className="text-[#0e6b17]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none px-10 py-6 border-t border-[#efeee9] bg-white flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-[#f0f0e8] text-[#707a6f] hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : <div />}
          {step < 3 ? (
            <button disabled={step === 1 ? !canNext1 : !canNext2} onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#1b1c19] text-white hover:bg-black transition-colors disabled:opacity-50">
              Próxima Etapa <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-[#0e6b17] text-white hover:bg-[#0b5512] transition-colors shadow-lg shadow-green-900/20 min-w-[200px] justify-center">
              <Check size={18} /> {initialData ? 'Salvar Alterações' : 'Criar Plano'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
