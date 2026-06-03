'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { 
  Users, 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  UserCheck,
  UserX,
  Lock,
  Mail,
  UserCircle
} from 'lucide-react';
import { supabase, getTableName } from '@/lib/supabase';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', name: 'Todos' },
    { id: 'admin', name: 'Admins' },
    { id: 'feirante', name: 'Feirantes' },
    { id: 'b2b', name: 'B2B/Atacado' },
    { id: 'chef', name: 'Chefs' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('mktplace_feira_profiles').select('*');
      
      if (activeTab !== 'all') {
        query = query.eq('role', activeTab);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (user.full_name?.toLowerCase().includes(s) || user.email?.toLowerCase().includes(s));
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBox}>
             <Shield size={24} color="#0e6b17" />
          </div>
          <div>
            <h1>Gestão de Perfis e Acessos</h1>
            <p>Gerencie as permissões e níveis de acesso de todos os usuários da plataforma.</p>
          </div>
        </div>
        <button className={styles.btnAdd}>
           <Users size={18} /> Novo Usuário
        </button>
      </header>

      <div className={styles.filtersArea}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <section className={styles.tableSection}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Carregando perfis...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil / Cargo</th>
                <th>Tipo de Conta</th>
                <th>Status</th>
                <th className={styles.textRight}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className={styles.userName}>{user.full_name || 'Usuário Sem Nome'}</p>
                          <p className={styles.userEmail}>{user.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.roleTag}>
                        <Lock size={12} /> {user.role?.toUpperCase() || 'CLIENTE'}
                      </div>
                    </td>
                    <td>
                      <span className={styles.typeLabel}>{user.role === 'admin' ? 'Administrador' : 'Padrão'}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                        Ativo
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <button className={styles.btnOptions}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
