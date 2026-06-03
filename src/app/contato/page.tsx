'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '../institutional.module.css';
import { Mail, Phone, MapPin, MessageCircle, Loader2 } from 'lucide-react';

export default function ContatoPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'duvida',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ name: '', email: '', subject: 'duvida', message: '' });
      } else {
        alert(data.error || 'Erro ao enviar. Tente contato@feira.casa');
      }
    } catch {
      alert('Erro de conexão. Escreva para contato@feira.casa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Contato</h1>
          <p>
            Dúvidas sobre pedidos, parcerias ou cadastro de feirantes? Fale com a gente.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <section className={styles.section}>
            <h2>Canais</h2>
            <ul className={styles.contactList}>
              <li>
                <Mail size={20} color="#0e6b17" />
                <a href="mailto:contato@feira.casa">contato@feira.casa</a>
              </li>
              <li>
                <Phone size={20} color="#0e6b17" />
                <span>(11) 4000-0000 — Seg a Sex, 9h às 18h</span>
              </li>
              <li>
                <MapPin size={20} color="#0e6b17" />
                <span>São Paulo, SP — Brasil</span>
              </li>
              <li>
                <MessageCircle size={20} color="#0e6b17" />
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Envie uma mensagem</h2>
            {sent ? (
              <div className={styles.success}>
                Mensagem recebida! Retornaremos em breve no e-mail informado.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label htmlFor="name">Nome</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="subject">Assunto</label>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="duvida">Dúvida geral</option>
                    <option value="pedido">Pedido / entrega</option>
                    <option value="feirante">Quero ser feirante</option>
                    <option value="parceria">Parceria B2B / restaurante</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="message">Mensagem</label>
                  <textarea
                    id="message"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Enviar mensagem
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
