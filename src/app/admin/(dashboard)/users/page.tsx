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
  const [users, setUsers] = useState([
    { id: '1', name: 'Eurico Fernandes', email: 'eurico@feira.casa', role: 'TI', type: 'Admin', status: 'Ativo' },
    { id: '2', name: 'Maria da Horta', email: 'contato@horta.com', role: 'Vendas', type: 'Feirante', status: 'Pendente' },
    { id: '3', name: 'Restaurante Sabor', email: 'compras@sabor.com', role: 'Comprador', type: 'B2B', status: 'Ativo' },
    { id: '4', name: 'Chef Felipe', email: 'felipe@gourmet.com', role: 'Cozinha', type: 'Chef Gourmet', status: 'Ativo' },
  ]);

  const tabs = [
    { id: 'all', name: 'Todos' },
    { id: 'admin', name: 'Admins' },
    { id: 'vendor', name: 'Feirantes' },
    { id: 'b2b', name: 'B2B/Atacado' },
    { id: 'chef', name: 'Chefs' },
  ];

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
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      <UserCircle size={20} />
                    </div>
                    <div>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.roleTag}>
                    <Lock size={12} /> {user.role}
                  </div>
                </td>
                <td>
                  <span className={styles.typeLabel}>{user.type}</span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'Ativo' ? styles.statusActive : styles.statusPending}`}>
                    {user.status}
                  </span>
                </td>
                <td className={styles.textRight}>
                  <button className={styles.btnOptions}>
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
