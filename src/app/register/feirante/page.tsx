'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Check, Upload, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

const steps = [
  { label: 'Dados Pessoais', icon: 'User' },
  { label: 'KYC & Docs', icon: 'FileCheck' },
  { label: 'Sua Banca', icon: 'Store' },
  { label: 'Revisão', icon: 'Eye' }
];

const RegisterFeirante = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Seja um Feirante Digital</h1>
          <p>Leve o frescor da sua banca para milhares de casas.</p>
        </div>

        <div className={styles.stepper}>
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`${styles.step} ${currentStep === idx + 1 ? styles.stepActive : ''} ${currentStep > idx + 1 ? styles.stepCompleted : ''}`}
            >
              <div className={styles.stepCircle}>
                {currentStep > idx + 1 ? <Check size={18} /> : idx + 1}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          {currentStep === 1 && (
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Nome Completo</label>
                <input type="text" placeholder="Como no seu RG" />
              </div>
              <div className={styles.inputGroup}>
                <label>CPF</label>
                <input type="text" placeholder="000.000.000-00" />
              </div>
              <div className={styles.inputGroup}>
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" />
              </div>
              <div className={styles.inputGroup}>
                <label>Telefone / WhatsApp</label>
                <input type="tel" placeholder="(11) 99999-9999" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.grid}>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Documento de Identidade (RG ou CNH)</label>
                <div className={styles.uploadArea}>
                  <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <p>Clique ou arraste o arquivo aqui</p>
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>PNG, JPG até 5MB</span>
                </div>
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Comprovante de Endereço</label>
                <div className={styles.uploadArea}>
                  <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <p>Clique ou arraste o arquivo aqui</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Nome da Banca</label>
                <input type="text" placeholder="Ex: Banca do Zé das Frutas" />
              </div>
              <div className={styles.inputGroup}>
                <label>Feira Principal</label>
                <select>
                  <option>Selecione uma feira</option>
                  <option>Feira da Praça da Árvore</option>
                  <option>Feira da Vila Mariana</option>
                  <option>Feira de Atibaia</option>
                </select>
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Sobre sua Produção</label>
                <textarea rows={4} placeholder="Conte um pouco sobre seus produtos e sua história..."></textarea>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Revise seus dados</h3>
                <div className={styles.reviewItem}><span>Perfil:</span> <span>Feirante Atacadista</span></div>
                <div className={styles.reviewItem}><span>Banca:</span> <span>Banca do Zé das Frutas</span></div>
                <div className={styles.reviewItem}><span>Localização:</span> <span>Vila Mariana, SP</span></div>
              </div>

              <div style={{ background: 'var(--surface-container-low)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px' }}>
                <Shield size={48} style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ marginBottom: '8px' }}>LGPD & Segurança</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    Ao finalizar, você concorda com nossos Termos de Uso e Política de Privacidade. 
                    Seus dados estão seguros e serão usados apenas para validação cadastral.
                  </p>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="lgpd" />
                    <label htmlFor="lgpd" style={{ fontSize: '14px', fontWeight: '600' }}>Aceito os termos e condições</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className="btn-secondary" 
              onClick={prevStep}
              style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
            >
              <ArrowLeft size={20} /> Voltar
            </button>
            <button className="btn-primary" onClick={nextStep}>
              {currentStep === 4 ? 'Finalizar Cadastro' : 'Continuar'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFeirante;
