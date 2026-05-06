'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { MapPin, Search, Navigation } from 'lucide-react';

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (region: string) => void;
}

const RegionModal = ({ isOpen, onClose, onSelect }: RegionModalProps) => {
  const [cep, setCep] = useState('');
  
  const popularRegions = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Curitiba, PR',
    'Campinas, SP'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sua Localização">
      <div className="region-modal-content">
        <p className="desc">Selecione sua localização para ver os produtos e produtores mais próximos de você.</p>
        
        <div className="input-section">
          <div className="input-group">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Digite seu CEP" 
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />
            <button className="confirm-btn">Confirmar</button>
          </div>
          <button className="location-btn">
            <Navigation size={18} /> Usar minha localização atual
          </button>
        </div>

        <div className="popular-section">
          <h4>Cidades Populares</h4>
          <div className="chips">
            {popularRegions.map(region => (
              <button 
                key={region} 
                className="chip"
                onClick={() => {
                  onSelect(region);
                  onClose();
                }}
              >
                <MapPin size={14} /> {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .region-modal-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .desc {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
        .input-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f5f5f5;
          padding: 4px 4px 4px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .input-group input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px 0;
          font-size: 15px;
          outline: none;
        }
        .confirm-btn {
          background: var(--text-main);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .location-btn {
          width: 100%;
          background: #eef7f2;
          color: var(--leaf-green);
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .location-btn:hover {
          background: #e1f2e8;
        }
        .popular-section h4 {
          font-size: 13px;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .chip {
          background: white;
          border: 1px solid #eee;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 14px;
          color: #555;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip:hover {
          border-color: var(--leaf-green);
          color: var(--leaf-green);
          background: #fdfdfd;
        }
      `}</style>
    </Modal>
  );
};

export default RegionModal;
