'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  X,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function B2BSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.contactPerson,
            company_name: formData.companyName,
            cnpj: formData.cnpj,
            phone: formData.phone,
            user_type: 'b2b'
          }
        }
      });

      if (authError) throw authError;
      router.push('/login?signup=success');
    } catch (err: any) {
      console.error('Erro no cadastro B2B:', err);
      setError(err.message || 'Erro ao processar seu cadastro corporativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] min-h-screen font-['Plus_Jakarta_Sans'] flex items-center justify-center p-4">
      {/* Container Principal Estilo B2B focused */}
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Side Branding Panel */}
        <div className="hidden md:block w-1/3 bg-[#30852f] relative">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img 
              alt="Logistics and Business" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2aHop8Q_uAtskGjTmqGsbdmB3jYcBuYulU-L72i9xFgwo5FkjlW8wOpEKx6W8UiSjIj031Wcl4MSs0dWhmiNzNQYeRg5lXQLn47Dy1_ObVM6LOAQI-Wu-o_ZhS98HejK4X3EDQu9lAlyJ1WbyV2jtLX8ihFbGk3LyXS1QnAlyXeiG9hl-quqsjzG-ZWK1uUo8pq7-RQA67itJswWvbkLH2dG1iz9tBRBTV0cXhUIi6BB-JBxLuGWaa70HCZyOibe-tJz-LT5MWGw"
            />
          </div>
          <div className="relative h-full flex flex-col justify-between p-10 text-[#f8fff0]">
            <span className="text-xl font-extrabold tracking-tighter">feira.casa</span>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Briefcase size={24} />
              </div>
              <h2 className="text-2xl font-bold leading-tight mb-4">Soluções Corporativas de Frescor.</h2>
              <p className="text-sm opacity-90">Abasteça seu negócio com o melhor do campo. Condições especiais para compras em volume.</p>
            </div>
            <div className="flex items-center gap-2 opacity-60 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Ambiente de Negócios</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 md:p-12 bg-[#f5f4ef]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[32px] font-bold text-[#1b1c19] leading-tight">Cadastro B2B</h2>
              <p className="text-[#40493c] text-xs font-bold uppercase tracking-widest mt-1">Mercado e Atacado</p>
            </div>
            <Link href="/signup" className="p-2 bg-stone-200 rounded-full text-[#40493c] hover:bg-stone-300 transition-colors">
              <X size={20} />
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#40493c] px-1">Razão Social / Nome da Empresa</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Nome da sua empresa" 
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">CNPJ</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00" 
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Pessoa de Contato</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Seu nome" 
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">E-mail Corporativo</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="compras@empresa.com" 
                  type="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">WhatsApp / Telefone</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000" 
                  type="tel"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Senha</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Confirmar Senha</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#30852f] focus:border-[#30852f] outline-none transition-all text-sm" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  type="password"
                  required
                />
              </div>
            </div>

            <button 
              className="w-full py-4 bg-[#30852f] text-white font-bold rounded-2xl shadow-[0_8px_20px_-4px_rgba(48,133,47,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <span>Criar Conta Corporativa</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs font-medium text-stone-500 mt-4">
              Dúvidas sobre faturamento? <a className="text-[#30852f] font-bold hover:underline" href="#">Fale com um consultor</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
