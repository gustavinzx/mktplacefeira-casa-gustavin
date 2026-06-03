# Status do projeto Feira Casa

Última atualização: maio/2026

## Funciona de ponta a ponta (com Supabase configurado)

- Home, busca, produto, categorias
- Carrinho (localStorage) → checkout → pedido no Supabase
- Login/cadastro B2C, perfil, meus pedidos
- Cupom no carrinho (`PRIMEIRAFEIRA` se cadastrado no SQL)
- Endereços (API + tela em Minha Conta)
- Sua Região (CEP, cidades, localStorage)
- Quem somos, Contato (grava ticket se SQL guest aplicado), Restaurantes & Chefs
- Feiras (`/fairs` + API; seed opcional em `supabase/extras_fairs_seed.sql`)

## SQL opcional no Supabase

Rodar no SQL Editor, se ainda não rodou:

1. `supabase/extras_pos_setup.sql` — cupom
2. `supabase/extras_support_guest.sql` — contato sem login
3. `supabase/extras_fairs_seed.sql` — feiras demo
4. `supabase/extras_trigger_role.sql` — role correta no cadastro chef/feirante

## Ainda mock / incompleto

| Área | Situação |
|------|----------|
| Carrinho | Só no navegador, não sincroniza entre dispositivos |
| Pagamento | Simulado (marca pedido como `pago`) |
| Múltiplos feirantes por produto | Um produtor por produto (real) |
| Portal feirante/chef/admin | UI em grande parte estática |
| Cadastro feirante (`/register/feirante`) | Formulário sem salvar no banco |
| Receitas, B2B quotes | Telas de design |
| Google/Apple login | Botões visuais, sem OAuth |
| E-mail real (contato) | Ticket no banco; não envia e-mail |
| Imagens seed | Algumas URLs repetidas no SQL |
| Pedidos antigos com "0 itens" | Pedidos criados antes de corrigir itens |

## Rotas úteis

- Loja: `/`
- Login: `/login` ou `/login/b2c`
- Admin: `/admin/login` (usuário com `role = admin`)
