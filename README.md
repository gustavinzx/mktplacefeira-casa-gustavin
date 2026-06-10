<div align="center">
  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" alt="Feira Casa Banner" width="100%" style="border-radius: 16px; margin-bottom: 20px;" />
  
  # 🥬 Mktplace Feira.Casa

  **Conectando você diretamente aos melhores produtores locais e feirantes.**
  <br />
  Uma plataforma completa de e-commerce e gestão para o ecossistema de feiras livres, trazendo produtos frescos do campo para a mesa com segurança, agilidade e tecnologia.

  [Sobre o Projeto](#-sobre-o-projeto) •
  [Tecnologias](#-tecnologias) •
  [Funcionalidades](#-funcionalidades) •
  [Arquitetura](#-arquitetura) •
  [Como Rodar](#-como-rodar) •
  [Apresentação (Canva)](https://canva.link/h2czq5mvmbi1qws)

</div>

---

## 📖 Sobre o Projeto
O **Feira.Casa** é um marketplace B2C e B2B desenvolvido como trabalho acadêmico. Ele digitaliza o processo de compra e venda de produtos hortifrúti e artesanais, conectando consumidores finais e atacadistas a feirantes e pequenos produtores rurais.

Diferente de um e-commerce tradicional, a plataforma gerencia múltiplos vendedores (bancas/feirantes), distribuindo pagamentos, calculando estoques de forma distribuída e garantindo que o consumidor saiba exatamente a origem do seu alimento.

## 🚀 Tecnologias

Este projeto foi construído utilizando as ferramentas mais modernas do mercado de desenvolvimento web:

- **Frontend & Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** CSS Modules e Global CSS responsivo
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gerenciamento de Estado Global:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (com persistência em LocalStorage)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Gateways de Pagamento:** Stripe (Cartão de Crédito) e Mercado Pago (Integração PIX)
- **E-mails Transacionais:** Resend SMTP

## ✨ Funcionalidades

### Para o Consumidor (B2C & B2B)
- 🛒 **Carrinho Dinâmico:** Gerenciamento de carrinho inteligente com persistência e agrupamento automático por feirante.
- 🏪 **Perfil de Produtores:** Vitrine exclusiva para cada feirante com seus produtos, avaliações, localização no mapa e selos (Ex: Orgânico).
- 🏷️ **Cupons e Promoções:** Motor de cupons de desconto validados server-side no checkout.
- 💳 **Checkout Seguro:** Fluxo de pagamento flexível via PIX ou Cartão (Stripe), com validação de estoque em tempo real.

### Para o Feirante / Administrador
- 📊 **Painel de Gestão (Dashboard):** Visão completa de faturamento, pedidos pendentes e estoque.
- 📦 **Gestão de Produtos:** CRUD completo de produtos, preços dinâmicos (atacado/varejo) e status de disponibilidade.
- 🔐 **Segurança (RLS):** Row Level Security implementada diretamente no PostgreSQL. Feirantes só enxergam e gerenciam os próprios pedidos e produtos.
- 🚚 **Logística:** Gestão de status de entregas e integração com frete.

## 🏗️ Arquitetura

O projeto abandonou a arquitetura legada baseada em mocks de JSON e atualmente consome APIs REST e Realtime do **Supabase**.

- `src/app/api`: Endpoints REST nativos do Next.js (Route Handlers) para operações que exigem Service Role ou lógicas complexas (como validação de Cupons no Checkout).
- `src/lib/supabase-server.ts`: Configuração do cliente do Supabase separando o contexto do Servidor (Seguro, Bypassa RLS) e do Cliente (Sessões baseadas no usuário ativo, Respeita RLS).
- `src/components`: Componentes reutilizáveis isolados (Modais, Cards, Headers).
- `src/store`: Contexto global assíncrono gerenciado de forma leve com Zustand.

## ⚙️ Como Rodar (Ambiente de Desenvolvimento)

Siga os passos abaixo para testar a aplicação na sua máquina:

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20+)
- Uma conta e projeto configurados no [Supabase](https://supabase.com/).

### 1. Clonar o repositório
```bash
git clone https://github.com/gustavinzx/mktplacefeira-casa-gustavin.git
cd mktplacefeira-casa-gustavin
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto e preencha com as suas chaves do Supabase e Stripe:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (Opcional para rodar local, mas necessário para fluxo de cartão)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=sua_chave_publica_aqui
STRIPE_SECRET_KEY=sua_chave_secreta_aqui
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Rodar a Aplicação
Para ambiente de desenvolvimento:
```bash
npm run dev
```

Para ambiente simulando produção (mais rápido, ideal para apresentações):
```bash
npm run build
npm run start
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---
Feito com 💚 para fortalecer o produtor local e as feiras livres.
