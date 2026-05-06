'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ChefHat, 
  Instagram, 
  Send, 
  X,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ChefSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    portfolio: '',
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
            full_name: formData.name,
            phone: formData.phone,
            specialty: formData.specialty,
            portfolio: formData.portfolio,
            user_type: 'chef'
          }
        }
      });

      if (authError) throw authError;
      router.push('/login?signup=success');
    } catch (err: any) {
      console.error('Erro no cadastro chef:', err);
      setError(err.message || 'Erro ao processar sua candidatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f4] text-[#1b1c19] min-h-screen font-['Plus_Jakarta_Sans'] flex items-center justify-center p-4">
      {/* Container Principal Estilo Modal Stitch */}
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Side Image/Brand Panel */}
        <div className="hidden md:block w-1/3 bg-gradient-to-br from-[#fc6c29] to-[#ba1a1a] relative">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img 
              alt="Professional chef portrait" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuN6mM2IQxYxcdrMi47_xnG1ICHA0bnqDgGLWFkdL56zfp2ay3u5_nNOBZwvvOXc9BlMNtW3z1DnBRXc0P-8EWDGbs19JiAoWTF3xOTG72dSuNGwCmyd4ypwyYwJoW6Ivfc2rJeJGqpUvwkIgx9DaXSYD7NUKCOTFxDE69Y7UO9F847gIUwYf1VyEgVdKFNe4k42D5JDcJkV89X-7bbQk271gCq95t7RUmIIhvdsTyNWeOcdeDtjXMqIyPnxAikGWm6rb4y8uJ4wE"
            />
          </div>
          <div className="relative h-full flex flex-col justify-between p-10 text-white">
            <span className="text-xl font-extrabold tracking-tighter">feira.casa</span>
            <div>
              <h2 className="text-2xl font-bold leading-tight mb-4 text-[#f8fff0]">Transforme sua paixão em negócio.</h2>
              <p className="text-sm opacity-90">Junte-se à nossa elite de Chefs Gourmet e leve frescor à mesa dos brasileiros.</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 md:p-12 bg-[#f5f4ef]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[32px] font-bold text-[#1b1c19] leading-tight">Candidatura de Chef</h2>
              <p className="text-[#40493c] text-xs font-bold uppercase tracking-widest mt-1">Torne-se um parceiro gourmet</p>
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Nome Completo</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Como deseja ser chamado" 
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Especialidade</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Ex: Cozinha Vegana, Massas" 
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#40493c] px-1">Link do Portfólio ou Redes Sociais</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707a6b]" size={18} />
                <input 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="instagram.com/seuusuario" 
                  type="url"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">E-mail Profissional</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="chef@exemplo.com" 
                  type="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">WhatsApp de Contato</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999" 
                  type="tel"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#40493c] px-1">Senha</label>
                <input 
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
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
                  className="w-full px-4 py-3 bg-white border border-[#bfcab9] rounded-xl focus:ring-2 focus:ring-[#0e6b17] focus:border-[#0e6b17] outline-none transition-all text-sm" 
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
              className="w-full py-4 bg-[#0e6b17] text-white font-bold rounded-2xl shadow-[0_8px_20px_-4px_rgba(14,107,23,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <span>Enviar Candidatura</span>
                  <Send size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs font-medium text-stone-500 mt-4">
              Já possui conta? <Link className="text-[#a63b00] font-bold hover:underline" href="/login">Fazer login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
