'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContatoPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Fale Conosco</h1>
          <p>Dúvidas, sugestões ou apenas quer dar um oi? Estamos aqui para ouvir você.</p>
        </div>

        <div className={styles.content}>
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <Mail className={styles.icon} />
              <h3>E-mail</h3>
              <p>contato@feira.casa</p>
              <p>suporte@feira.casa</p>
            </div>
            <div className={styles.infoCard}>
              <Phone className={styles.icon} />
              <h3>Telefone</h3>
              <p>(11) 4003-XXXX</p>
              <p>Seg a Sex, 9h às 18h</p>
            </div>
            <div className={styles.infoCard}>
              <MessageSquare className={styles.icon} />
              <h3>WhatsApp</h3>
              <p>(11) 9XXXX-XXXX</p>
              <p>Atendimento rápido</p>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formCard}>
              {status === 'success' ? (
                <div className={styles.successMessage}>
                  <div className={styles.successIcon}>✓</div>
                  <h2>Mensagem Enviada!</h2>
                  <p>Agradecemos seu contato. Retornaremos em breve.</p>
                  <button onClick={() => setStatus('idle')} className={styles.btnReset}>Enviar outra</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Nome</label>
                    <input type="text" placeholder="Seu nome completo" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Assunto</label>
                    <select required>
                      <option value="">Selecione um assunto</option>
                      <option value="duvida">Dúvida sobre pedido</option>
                      <option value="elogio">Sugestão ou Elogio</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="parceria">Quero ser parceiro</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mensagem</label>
                    <textarea rows={5} placeholder="Como podemos ajudar?" required></textarea>
                  </div>
                  <button type="submit" className={styles.btnSubmit} disabled={status === 'sending'}>
                    {status === 'sending' ? 'Enviando...' : <>Enviar Mensagem <Send size={18} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
