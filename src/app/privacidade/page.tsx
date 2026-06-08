import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacidadePage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Política de Privacidade</h1>
        <div className="prose prose-green max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>A privacidade dos seus dados é de extrema importância para a Feira.Casa.</p>
          <h2>1. Coleta de Dados</h2>
          <p>Coletamos informações essenciais para garantir a entrega de produtos frescos na sua casa (nome, endereço, telefone).</p>
          <h2>2. Uso das Informações</h2>
          <p>As informações coletadas são usadas exclusivamente para processamento de pagamentos, logística de entregas e comunicações importantes sobre seus pedidos.</p>
          <h2>3. Proteção e Segurança</h2>
          <p>Implementamos tecnologias modernas (criptografia end-to-end e autenticação segura via Supabase) para proteger suas informações contra acesso não autorizado.</p>
          <p className="mt-8 text-gray-500 italic">Esta é uma página de espaço reservado. A política legal completa será adicionada em breve.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
