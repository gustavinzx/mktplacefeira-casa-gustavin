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

import ConversationalRegister from './ConversationalRegister';

const RegisterFeirante = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Seja um Feirante Digital</h1>
          <p>Cadastre-se de forma simples conversando com nosso assistente.</p>
        </div>

        <ConversationalRegister />
      </div>
    </div>
  );
};

export default RegisterFeirante;
