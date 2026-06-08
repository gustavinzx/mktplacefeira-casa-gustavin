'use client';

import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Loader2, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAddresses(data.data);
      } else {
        setAddresses(getMockAddresses());
      }
    } catch (err) {
      console.error(err);
      setAddresses(getMockAddresses());
    } finally {
      setLoading(false);
    }
  };

  const getMockAddresses = () => {
    return [
      {
        id: 'mock-addr-1',
        zip_code: '01310-100',
        street: 'Avenida Paulista',
        number: '1578',
        complement: 'Apt 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        is_default: true
      },
      {
        id: 'mock-addr-2',
        zip_code: '13010-111',
        street: 'Rua Barão de Jaguara',
        number: '1022',
        complement: 'Casa',
        neighborhood: 'Centro',
        city: 'Campinas',
        state: 'SP',
        is_default: false
      }
    ];
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, zip_code: cep });

    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  };

  const openNewAddress = () => {
    setEditingId(null);
    setFormData({ zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', is_default: false });
    setIsModalOpen(true);
  };

  const openEditAddress = (addr: any) => {
    setEditingId(addr.id);
    setFormData({
      zip_code: addr.zip_code,
      street: addr.street,
      number: addr.number,
      complement: addr.complement || '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      is_default: addr.is_default
    });
    setIsModalOpen(true);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const url = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar endereço', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Endereço excluído com sucesso.', 'success');
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir endereço.', 'error');
    }
  };

  const setAsDefault = async (addr: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`/api/account/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, is_default: true })
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Meus Endereços</h1>
          <p className={styles.pageSubtitle} style={{ marginBottom: 0 }}>Gerencie seus endereços de entrega.</p>
        </div>
        <button className={styles.addBtn} onClick={openNewAddress}>
          <Plus size={18} /> Novo Endereço
        </button>
      </div>

      <div className={styles.addressesGrid}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : addresses.length > 0 ? (
          addresses.map(addr => (
            <div key={addr.id} className={`${styles.addressCard} ${addr.is_default ? styles.addressCardDefault : ''}`}>
              {addr.is_default && <span className={styles.defaultBadge}>Padrão</span>}
              
              <h3 className={styles.addressStreet}>{addr.street}, {addr.number}</h3>
              {addr.complement && <p className={styles.addressDetail}>{addr.complement}</p>}
              <p className={styles.addressDetail}>{addr.neighborhood}</p>
              <p className={styles.addressDetail}>{addr.city} - {addr.state}, {addr.zip_code}</p>

              <div className={styles.actionsRow}>
                <button className={styles.actionBtn} onClick={() => openEditAddress(addr)}>
                  Editar
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => deleteAddress(addr.id)}>
                  Excluir
                </button>
                {!addr.is_default && (
                  <button className={styles.actionBtn} onClick={() => setAsDefault(addr)} style={{ marginLeft: 'auto', color: 'var(--leaf-green)' }}>
                    Tornar Padrão
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <MapPin size={48} style={{ marginBottom: 16, opacity: 0.5, margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Nenhum endereço salvo</h3>
            <p>Adicione um endereço para facilitar suas compras.</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</h2>
            
            <form onSubmit={saveAddress}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>CEP</label>
                  <input required maxLength={8} placeholder="00000000" value={formData.zip_code} onChange={handleCepChange} />
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Rua/Avenida</label>
                  <input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Número</label>
                  <input required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Complemento</label>
                  <input placeholder="Apto, Bloco..." value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Bairro</label>
                  <input required value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Cidade</label>
                  <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Estado (UF)</label>
                  <input required maxLength={2} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.checkboxRow}>
                    <input 
                      type="checkbox" 
                      checked={formData.is_default} 
                      onChange={e => setFormData({...formData, is_default: e.target.checked})} 
                    />
                    Definir como endereço padrão
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar Endereço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
