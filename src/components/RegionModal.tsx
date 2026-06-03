'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { formatCep, saveRegion, type SavedRegion } from '@/lib/region';

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (region: SavedRegion) => void;
}

import { useRouter } from 'next/navigation';

const popularRegions: SavedRegion[] = [
  { label: 'São Paulo, SP', city: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333 },
  { label: 'Rio de Janeiro, RJ', city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729 },
  { label: 'Belo Horizonte, MG', city: 'Belo Horizonte', state: 'MG', lat: -19.9208, lng: -43.9378 },
  { label: 'Curitiba, PR', city: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733 },
  { label: 'Campinas, SP', city: 'Campinas', state: 'SP', lat: -22.9099, lng: -47.0626 },
];

const RegionModal = ({ isOpen, onClose, onSelect }: RegionModalProps) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const selectRegion = (region: SavedRegion) => {
    saveRegion(region);
    onSelect(region);
    onClose();
    setError('');
    setCep('');
    
    // Força o mapa a atualizar redirecionando para a coordenada selecionada
    if (region.lat && region.lng) {
      router.push(`/fairs?lat=${region.lat}&lng=${region.lng}&radius=30`);
    }
  };

  const handleCepConfirm = async () => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setError('CEP não encontrado.');
        setLoading(false);
        return;
      }

      const city = data.localidade || '';
      const state = data.uf || '';
      const street = data.logradouro || '';
      const neighborhood = data.bairro || '';
      
      let lat, lng;
      try {
        const addressQuery = `${street ? street + ', ' : ''}${neighborhood ? neighborhood + ', ' : ''}${city}, ${state}, Brasil`;
        const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&limit=1`, { headers: { 'User-Agent': 'feira.casa/1.0' } });
        const geocodeData = await geocodeRes.json();
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
        }
      } catch (err) {
        console.warn('Could not geocode CEP', err);
      }

      selectRegion({
        label: `${city}, ${state}`,
        city,
        state,
        cep: formatCep(digits),
        lat,
        lng,
      });

      if (lat && lng) {
        window.location.href = `/fairs?lat=${lat}&lng=${lng}&radius=30`;
      }
    } catch {
      setError('Não foi possível buscar o CEP. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Seu navegador não suporta localização.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let cityName = 'Sua Região';
        let stateName = '';
        try {
          const res = await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng })
          });
          const data = await res.json();
          if (data.success && data.details) {
            cityName = data.details.city || data.details.town || data.details.village || 'Sua Região';
            stateName = data.details.state === 'Distrito Federal' ? 'DF' : (data.details.state || '');
          }
        } catch {}

        selectRegion({
          label: stateName ? `${cityName}, ${stateName}` : cityName,
          city: cityName,
          state: stateName,
          lat,
          lng,
        });
        setLoading(false);
      },
      () => {
        setError('Permissão de localização negada.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sua Localização">
      <div className="region-modal-content">
        <p className="desc">
          Selecione sua localização para ver produtos e feiras mais próximos de você.
        </p>

        {error && <p className="error-msg">{error}</p>}

        <div className="input-section">
          <div className="input-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="Digite seu CEP"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleCepConfirm()}
              maxLength={9}
            />
            <button
              type="button"
              className="confirm-btn"
              onClick={handleCepConfirm}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
            </button>
          </div>
          <button
            type="button"
            className="location-btn"
            onClick={handleGeolocation}
            disabled={loading}
          >
            <Navigation size={18} /> Usar minha localização atual
          </button>
        </div>

        <div className="popular-section">
          <h4>Cidades populares</h4>
          <div className="chips">
            {popularRegions.map((region) => (
              <button
                key={region.label}
                type="button"
                className="chip"
                onClick={() => selectRegion(region)}
              >
                <MapPin size={14} /> {region.label}
              </button>
            ))}
          </div>
        </div>

        <a href="/fairs" className="fairs-link" onClick={onClose}>
          Ver feiras na minha região →
        </a>
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
          margin: 0;
        }
        .error-msg {
          color: #ba1a1a;
          font-size: 13px;
          margin: 0;
          padding: 10px 12px;
          background: #ffebee;
          border-radius: 8px;
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
          background: var(--text-main, #1b1c19);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .location-btn {
          width: 100%;
          background: #eef7f2;
          color: var(--leaf-green, #0e6b17);
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }
        .location-btn:disabled {
          opacity: 0.6;
        }
        .popular-section h4 {
          font-size: 13px;
          color: #999;
          text-transform: uppercase;
          margin: 0 0 16px;
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
        }
        .chip:hover {
          border-color: var(--leaf-green, #0e6b17);
          color: var(--leaf-green, #0e6b17);
        }
        .fairs-link {
          font-size: 14px;
          font-weight: 600;
          color: var(--leaf-green, #0e6b17);
          text-align: center;
        }
      `}</style>
    </Modal>
  );
};

export default RegionModal;
