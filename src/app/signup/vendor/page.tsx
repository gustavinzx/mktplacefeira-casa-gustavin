'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Store, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Lock,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function VendorSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    cnpj: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            user_type: 'vendor'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Inserir dados da banca (producers)
        const { error: producerError } = await supabase
          .from(getTableName('producers'))
          .insert({
            user_id: authData.user.id,
            name: formData.businessName,
            category: formData.category,
            cnpj: formData.cnpj,
            status: 'pending'
          });

        if (producerError) throw producerError;

        router.push('/login?signup=success');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao processar seu cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] min-h-screen font-['Plus_Jakarta_Sans']">
      <div className="flex min-h-screen">
        {/* Sidebar Image Section (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-4/12 relative overflow-hidden bg-[#30852f]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#30852f]/80 via-transparent to-transparent z-10"></div>
          <img 
            alt="Feira Livre" 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbNaydZr16CQ8qQ2VV2LJYJ90oKtsiiy9JnKyJndGAcleI-unXg-U-W-mzWHgfLNtLybdS3XefjaPoIbWKrCxUZGPGnhdxUF-RET34EiA3Q75y8vdLKMWPldn_xCIYHuWPB6cLaV5lPlXNfLq3OyHJNpReoT4vpYiNvhUV57ffB7ufB1KSwJg4YOm_G0dXERrn1lcVxWHSeHrJatyRTXKMF4a8p-xLYk8OIT_CvqX4b2fLF5N4HVf1chwSWrxzOFWbZz5Quw3ygAM"
          />
          <div className="relative z-20 flex flex-col justify-end p-12 h-full text-[#f8fff0]">
            <h1 className="text-[48px] font-extrabold mb-4 leading-tight">Traga sua banca para o digital.</h1>
            <p className="text-xl opacity-90 max-w-md">Conecte-se com milhares de vizinhos e venda o frescor da sua colheita direto da sua banca.</p>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden" />
                ))}
              </div>
              <span className="text-xs font-semibold">+500 feirantes ativos</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <main className="flex-1 w-full lg:max-w-7/12 flex flex-col">
          {/* Header/TopBar */}
          <header className="flex justify-between items-center w-full px-8 h-20 bg-white border-b border-stone-100 shadow-sm shadow-emerald-900/5">
            <div className="text-xl font-extrabold text-[#0e6b17] tracking-tight">feira.casa</div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#707a6b]">Já tem conta?</span>
              <Link href="/login" className="text-xs font-bold text-[#0e6b17] hover:underline">Fazer Login</Link>
            </div>
          </header>

          <div className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
            {/* Stepper */}
            <div className="mb-12">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -translate-y-1/2 z-0"></div>
                
                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-[#0e6b17] text-white shadow-lg' : 'bg-stone-200 text-stone-500'}`}>1</div>
                  <span className={`mt-2 text-xs font-bold ${step >= 1 ? 'text-[#0e6b17]' : 'text-stone-400'}`}>Banca</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-[#0e6b17] text-white shadow-lg' : 'bg-stone-200 text-stone-500'}`}>2</div>
                  <span className={`mt-2 text-xs font-bold ${step >= 2 ? 'text-[#0e6b17]' : 'text-stone-400'}`}>Pessoal</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center opacity-40">
                  <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold">3</div>
                  <span className="mt-2 text-xs font-bold text-stone-400">Verificação</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#1b1c19] leading-tight">
                {step === 1 ? 'Sua Banca' : 'Seus Dados'}
              </h2>
              <p className="text-[#40493c] mt-1">
                {step === 1 ? 'Conte-nos sobre o seu negócio na feira.' : 'Agora, precisamos de algumas informações para sua conta.'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleNext}>
              {step === 1 && (
                <div className="bg-white p-8 rounded-2xl border border-[#bfcab9]/30 shadow-sm space-y-6">
                  <h3 className="text-[22px] font-bold mb-2 flex items-center gap-2 text-[#0e6b17]">
                    <Store size={24} /> A Sua Banca
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#40493c]">Nome da Banca</label>
                      <input 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Ex: Barraca do Zé das Frutas" 
                        required 
                        type="text"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40493c]">Categoria</label>
                      <select 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base appearance-none"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option>Frutas</option>
                        <option>Legumes</option>
                        <option>Verduras</option>
                        <option>Pastéis e Salgados</option>
                        <option>Queijos e Laticínios</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40493c]">CNPJ (Opcional)</label>
                      <input 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        placeholder="00.000.000/0000-00" 
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white p-8 rounded-2xl border border-[#bfcab9]/30 shadow-sm space-y-6">
                  <h3 className="text-[22px] font-bold mb-2 flex items-center gap-2 text-[#a63b00]">
                    <UserIcon size={24} /> Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#40493c]">Nome Completo</label>
                      <input 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Como você quer ser chamado" 
                        required 
                        type="text"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40493c]">E-mail</label>
                      <input 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com" 
                        required 
                        type="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40493c]">WhatsApp</label>
                      <input 
                        className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000" 
                        required 
                        type="tel"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#40493c]">Senha de Acesso</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-white border border-[#bfcab9] rounded-lg px-4 py-3 focus:border-[#0e6b17] focus:ring-1 focus:ring-[#0e6b17] outline-none transition-all text-base" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Mínimo 8 caracteres" 
                          required 
                          type={showPassword ? "text" : "password"}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707a6b]" 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  className="w-full bg-[#0e6b17] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-[#0e6b17]/20 hover:bg-[#126e19] active:scale-95 transition-all flex items-center justify-center gap-2" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : (
                    <>
                      {step === 1 ? 'Próximo Passo' : 'Finalizar Cadastro'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                {step === 2 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowLeft size={16} /> Voltar para Banca
                  </button>
                )}

                <p className="text-center text-xs font-medium text-[#707a6b] px-8">
                  Ao continuar, você concorda com nossos <a className="text-[#0e6b17] hover:underline" href="#">Termos de Uso</a> e <a className="text-[#0e6b17] hover:underline" href="#">Política de Privacidade</a>.
                </p>
              </div>
            </form>
          </div>

          <footer className="mt-auto px-8 py-6 text-center border-t border-stone-100">
            <div className="flex items-center justify-center gap-2 opacity-50">
              <Lock size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">Conexão segura e criptografada</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
