'use client';

import React, { useState, useEffect } from 'react';
import styles from '../users/page.module.css';
import { Search, Store, MoreHorizontal, UserCheck, Loader2 } from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function VendorsPage() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .select('*')
        .in('role', ['feirante', 'chef']); // Supondo que feirante/chef são produtores
        
      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error('Erro ao buscar feirantes:', err);
    } finally {
      setLoading(false);
    }
  }

  // Lógica de Filtro
  const filteredVendors = vendors.filter(v => {
    // Busca por texto
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (v.full_name?.toLowerCase().includes(searchLower) || v.email?.toLowerCase().includes(searchLower));
    
    // Filtro por Aba
    let matchesTab = true;
    if (activeTab === 'Feirantes') matchesTab = v.role === 'feirante';
    if (activeTab === 'Produtores') matchesTab = v.role === 'chef'; // Mapeado para exemplo
    if (activeTab === 'Pendentes') matchesTab = false; // Mapeado para exemplo futuro

    return matchesSearch && matchesTab;
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBox}>
            <Store size={24} color="#0e6b17" />
          </div>
          <div>
            <h1>Feirantes e Produtores</h1>
            <p>Gerencie os fornecedores cadastrados na plataforma e aprove novos registros.</p>
          </div>
        </div>
        <button className={styles.btnAdd} onClick={() => window.location.href = '/admin'}>
          <UserCheck size={18} /> Revisar Cadastros
        </button>
      </header>

      <div className={styles.filtersArea}>
        <div className={styles.tabs}>
          {['Todos', 'Feirantes', 'Produtores', 'Pendentes'].map(tab => (
            <button 
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por loja ou email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableSection}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produtor / Loja</th>
              <th>Tipo</th>
              <th>Status</th>
              <th className={styles.textRight}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 size={24} className="animate-spin text-green-600 mx-auto" />
                </td>
              </tr>
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#78716c' }}>
                  Nenhum feirante ou produtor encontrado.
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        <Store size={18} />
                      </div>
                      <div>
                        <p className={styles.userName}>{v.full_name || 'Sem Nome'}</p>
                        <p className={styles.userEmail}>{v.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeLabel} style={{ textTransform: 'capitalize' }}>{v.role}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                      Ativo
                    </span>
                  </td>
                  <td className={styles.textRight}>
                    <button 
                      className={styles.btnOptions}
                      onClick={() => {
                        if(confirm(`Tem certeza que deseja desativar a loja ${v.full_name || v.email}?`)) {
                          setVendors(vendors.filter(u => u.id !== v.id));
                          showToast('Loja desativada temporariamente. Para remoção definitiva, gerencie através do painel completo em "Gestão de Feirantes".', 'info');
                        }
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
