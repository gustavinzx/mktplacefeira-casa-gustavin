import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermosPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Termos de Uso</h1>
        <div className="prose prose-green max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Bem-vindo à Feira.Casa. Estes Termos de Uso governam a sua utilização do nosso marketplace e serviços relacionados.</p>
          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e utilizar a Feira.Casa, você concorda em cumprir e estar vinculado a estes termos.</p>
          <h2>2. Cadastro e Segurança</h2>
          <p>Você é responsável por manter a confidencialidade de sua conta e senha, bem como por restringir o acesso ao seu computador.</p>
          <h2>3. Vendas e Entregas</h2>
          <p>A Feira.Casa atua como intermediária. Prazos de entrega e qualidade dos produtos frescos são de responsabilidade do produtor.</p>
          <p className="mt-8 text-gray-500 italic">Esta é uma página de espaço reservado. Os termos legais completos serão adicionados em breve.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
