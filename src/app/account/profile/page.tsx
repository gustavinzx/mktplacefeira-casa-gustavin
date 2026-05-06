'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Mail, Phone, MapPin, Camera, Settings, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="profile-page">
      <Header />
      
      <main className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="user-card">
              <div className="avatar-wrapper">
                <div className="avatar">JS</div>
                <button className="edit-avatar"><Camera size={14} /></button>
              </div>
              <h3>José Silva</h3>
              <p>Membro desde Abril 2024</p>
            </div>

            <nav className="side-nav">
              <a href="/account/profile" className="active"><User size={18} /> Dados Pessoais</a>
              <a href="/account/addresses"><MapPin size={18} /> Meus Endereços</a>
              <a href="/account/wallet"><Settings size={18} /> Pagamentos</a>
              <a href="/account/coupons"><Settings size={18} /> Meus Cupons</a>
            </nav>
          </aside>

          <div className="profile-content">
            <div className="content-card">
              <div className="card-header">
                <h2>Dados Pessoais</h2>
                <button className="edit-btn">Editar Perfil</button>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Nome Completo</label>
                  <p>José da Silva Sauro</p>
                </div>
                <div className="info-item">
                  <label>E-mail</label>
                  <p>jose.silva@email.com</p>
                </div>
                <div className="info-item">
                  <label>Telefone</label>
                  <p>(11) 98765-4321</p>
                </div>
                <div className="info-item">
                  <label>CPF</label>
                  <p>***.456.***-00</p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2>Segurança</h2>
              </div>
              <div className="security-item">
                <div className="sec-info">
                  <strong>Senha</strong>
                  <span>Atualizada há 3 meses</span>
                </div>
                <button className="outline-btn">Alterar Senha</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .profile-page { background: var(--bg-main); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        
        .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
        
        .profile-sidebar { display: flex; flex-direction: column; gap: 32px; }
        .user-card { 
          background: white; 
          padding: 32px; 
          border-radius: 24px; 
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        .avatar-wrapper { position: relative; width: 80px; height: 80px; margin: 0 auto 16px; }
        .avatar { 
          width: 100%; height: 100%; background: #eef7f2; color: var(--leaf-green);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800;
        }
        .edit-avatar {
          position: absolute; bottom: 0; right: 0; background: var(--text-main);
          color: white; border: none; width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .user-card h3 { font-size: 18px; margin-bottom: 4px; }
        .user-card p { font-size: 13px; color: #888; }

        .side-nav { background: white; padding: 12px; border-radius: 24px; box-shadow: var(--shadow-sm); }
        .side-nav a {
          display: flex; align-items: center; gap: 12px; padding: 14px 16px;
          border-radius: 12px; text-decoration: none; color: #555; font-weight: 600;
          transition: all 0.2s;
        }
        .side-nav a.active { background: #eef7f2; color: var(--leaf-green); }
        .side-nav a:hover:not(.active) { background: #f9f9f9; }

        .profile-content { display: flex; flex-direction: column; gap: 32px; }
        .content-card { background: white; padding: 32px; border-radius: 32px; box-shadow: var(--shadow-sm); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .card-header h2 { font-size: 20px; }
        
        .edit-btn { background: #eef7f2; color: var(--leaf-green); border: none; padding: 8px 20px; border-radius: 100px; font-weight: 700; cursor: pointer; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .info-item label { display: block; font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
        .info-item p { font-size: 16px; font-weight: 600; color: var(--text-main); }

        .security-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f9f9f9; border-radius: 16px; }
        .sec-info strong { display: block; margin-bottom: 4px; }
        .sec-info span { font-size: 12px; color: #888; }
        .outline-btn { background: transparent; border: 1px solid #ddd; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
}
