'use client';

import React from 'react';
import styles from './page.module.css';
import { Upload, ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

const NovoProduto = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/portal/feirante/produtos" className={styles.backBtn}>
          <ChevronLeft size={20} /> Voltar para Produtos
        </Link>
        <h1>Cadastrar Novo Produto</h1>
      </header>

      <div className={styles.formCard}>
        <form className={styles.grid}>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label>Fotos do Produto</label>
            <div className={styles.uploadGrid}>
              <div className={styles.uploadBoxMain}>
                <Upload size={32} />
                <p>Foto Principal</p>
              </div>
              <div className={styles.uploadBox}> <Upload size={20} /> </div>
              <div className={styles.uploadBox}> <Upload size={20} /> </div>
              <div className={styles.uploadBox}> <Upload size={20} /> </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Nome do Produto</label>
            <input type="text" placeholder="Ex: Maçã Fuji Orgânica" />
          </div>

          <div className={styles.inputGroup}>
            <label>Categoria</label>
            <select>
              <option>Selecione...</option>
              <option>Frutas</option>
              <option>Legumes</option>
              <option>Verduras</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Preço</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--on-surface-variant)' }}>R$</span>
              <input type="text" placeholder="0,00" style={{ paddingLeft: '40px' }} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Unidade de Medida</label>
            <select>
              <option>Quilo (kg)</option>
              <option>Unidade (un)</option>
              <option>Bandeja</option>
              <option>Maço</option>
            </select>
          </div>

          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label>Descrição</label>
            <textarea rows={4} placeholder="Descreva as características do produto, origem, etc."></textarea>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '24px', marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" /> É um produto orgânico?
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" /> Colocar em promoção?
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn-secondary">Descartar</button>
            <button type="submit" className="btn-primary">
              <Save size={20} /> Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoProduto;
