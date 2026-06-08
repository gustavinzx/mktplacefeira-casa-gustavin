'use client';

import React from 'react';
import ConversationalFlow, { Step } from '@/components/ConversationalFlow';
import { validateCPF } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

const STEPS: Step[] = [
  {
    id: 'name',
    question: 'Olá! Sou o assistente da Feira.Casa. Para começarmos seu cadastro de feirante, qual o seu nome completo?',
    field: 'name',
    type: 'text',
    placeholder: 'Como no seu RG'
  },
  {
    id: 'cpf',
    question: 'Ótimo! Agora, por favor, me informe seu CPF:',
    field: 'cpf',
    type: 'text',
    placeholder: '000.000.000-00',
    validate: (val) => validateCPF(val) ? true : 'Ops, este CPF parece inválido. Poderia conferir os números?'
  },
  {
    id: 'email',
    question: 'E qual o seu melhor e-mail?',
    field: 'email',
    type: 'email',
    placeholder: 'seu@email.com'
  },
  {
    id: 'phone',
    question: 'Pode me informar seu WhatsApp para contato?',
    field: 'phone',
    type: 'tel',
    placeholder: '(11) 99999-9999'
  },
  {
    id: 'document',
    question: 'Agora preciso de uma foto do seu documento de identidade (RG ou CNH):',
    field: 'document',
    type: 'file'
  },
  {
    id: 'banca',
    question: 'Quase lá! Qual o nome da sua banca?',
    field: 'banca',
    type: 'text',
    placeholder: 'Ex: Banca do Zé'
  },
  {
    id: 'feira',
    question: 'Em qual feira você atua principalmente?',
    field: 'feira',
    type: 'select',
    options: ['Praça da Árvore', 'Vila Mariana', 'Atibaia', 'Outra']
  },
  {
    id: 'password',
    question: 'Para finalizar, crie uma senha segura (mínimo 6 caracteres):',
    field: 'password',
    type: 'password',
    placeholder: 'Sua senha segura'
  },
  {
    id: 'confirm',
    question: 'Você concorda com nossos termos de uso e política de privacidade?',
    field: 'terms',
    type: 'confirm'
  }
];

export default function ConversationalRegister() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleComplete = async (formData: any) => {
    try {
      // 1. Cadastra o usuário e o profile principal
      const authRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          phone: formData.phone,
          role: 'feirante',
        }),
      });
      const authData = await authRes.json();
      if (!authData.success) throw new Error(authData.error || 'Erro no cadastro de usuário.');

      // 2. Insere os dados específicos do produtor/feirante
      const producerRes = await fetch('/api/producer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.data.user.id,
          stall_name: formData.banca,
          document: formData.cpf, // ou formData.document_url
          // a feira selecionada será mapeada depois
        }),
      });
      const producerData = await producerRes.json();
      if (!producerData.success && producerData.error) {
         console.warn('Aviso: falha ao salvar dados de feirante', producerData.error);
      }

      router.push('/login?register=success');
    } catch (e: any) {
      showToast('Ocorreu um erro no cadastro: ' + e.message, 'error');
    }
  };

  return (
    <ConversationalFlow
      steps={STEPS}
      onComplete={handleComplete}
      botName="Suporte ao Feirante"
    />
  );
}
