'use client';

import React from 'react';
import { Users, UserPlus, Shield, Key, MoreVertical, Search, Filter } from 'lucide-react';

export default function UserManagementPage() {
  const users = [
    { id: '1', name: 'Carlos Alberto', email: 'carlos@feira.casa', role: 'admin', status: 'active', lastLogin: '10 min atrás' },
    { id: '2', name: 'Ana Souza', email: 'ana.producao@feira.casa', role: 'moderator', status: 'active', lastLogin: '2 horas atrás' },
    { id: '3', name: 'Marcos Pires', email: 'marcos@sitio.com', role: 'producer', status: 'pending', lastLogin: '-' },
    { id: '4', name: 'Clara Maria', email: 'clara@delivery.com', role: 'logistics', status: 'active', lastLogin: '1 dia atrás' },
  ];

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; color: string; bg: string }> = {
      admin: { label: 'Administrador', color: '#7c3aed', bg: '#f5f3ff' },
      moderator: { label: 'Moderador', color: '#2563eb', bg: '#eff6ff' },
      producer: { label: 'Produtor', color: '#059669', bg: '#ecfdf5' },
      logistics: { label: 'Logística', color: '#d97706', bg: '#fffbeb' },
    };
    const r = roles[role] || { label: role, color: '#666', bg: '#f5f5f5' };
    return <span className="role-badge" style={{ color: r.color, background: r.bg }}>{r.label}</span>;
  };

  return (
    <div className="users-container">
      <header className="page-header">
        <div>
          <h1>Gestão de Usuários e Perfis</h1>
          <p>Gerencie acessos, permissões e perfis do sistema</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn"><Shield size={18} /> Perfis de Acesso</button>
          <button className="primary-btn"><UserPlus size={18} /> Novo Usuário</button>
        </div>
      </header>

      <div className="table-controls">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nome, email ou cargo..." />
        </div>
        <button className="filter-btn"><Filter size={18} /> Filtros</button>
      </div>

      <div className="users-table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="user-cell">
                  <div className="avatar">{user.name.charAt(0)}</div>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <span className={`status-pill ${user.status}`}>
                    {user.status === 'active' ? 'Ativo' : 'Pendente'}
                  </span>
                </td>
                <td className="login-cell">{user.lastLogin}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="Resetar Senha"><Key size={16} /></button>
                    <button className="icon-btn"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .users-container {
          padding: 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .page-header p {
          color: #666;
        }
        .header-actions {
          display: flex;
          gap: 12px;
        }
        .primary-btn {
          background: var(--text-main);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .secondary-btn {
          background: white;
          border: 1px solid #ddd;
          color: #555;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .table-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .search-bar {
          flex: 1;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #999;
        }
        .search-bar input {
          width: 100%;
          border: none;
          padding: 14px 0;
          outline: none;
        }
        .filter-btn {
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 0 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .users-table-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #eee;
          overflow: hidden;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .users-table th {
          background: #fafafa;
          padding: 16px 24px;
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
        }
        .users-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #f5f5f5;
          font-size: 14px;
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: #eef7f2;
          color: var(--leaf-green);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .user-info strong {
          display: block;
          color: var(--text-main);
        }
        .user-info span {
          font-size: 12px;
          color: #888;
        }
        .role-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .status-pill {
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-pill::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-pill.active { color: #059669; }
        .status-pill.active::before { background: #059669; }
        .status-pill.pending { color: #d97706; }
        .status-pill.pending::before { background: #d97706; }
        .login-cell {
          color: #888;
        }
        .action-btns {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #ccc;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          background: #f5f5f5;
          color: #555;
        }
      `}</style>
    </div>
  );
}
