'use client';

import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationButtonProps {
  onLocationFound?: (address: string, details?: any) => void;
}

export default function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState('Usar minha localização atual');
  const [errorMsg, setErrorMsg] = useState('');

  const { locate } = useGeolocation();

  const requestLocation = async () => {
    setErrorMsg('');
    setLoading(true);
    setLocationText('Buscando sinal GPS...');

    const pos = await locate();
    if (!pos) {
      setLoading(false);
      setErrorMsg('Erro ao obter localização. GPS desativado ou negado.');
      setLocationText('Tentar novamente');
      return;
    }

    try {
      setLocationText('Identificando bairro...');
      
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: pos.lat, longitude: pos.lng })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLocationText(data.address);
        if (onLocationFound) onLocationFound(data.address, data.details);
      } else {
        setErrorMsg(data.error || 'Erro ao identificar local.');
        setLocationText('Tentar novamente');
      }
    } catch (err) {
      setErrorMsg('Falha na comunicação com o servidor.');
      setLocationText('Tentar novamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button 
        type="button"
        onClick={requestLocation} 
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: '#0e6b17', // Verde Feira.Casa
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          transition: 'background 0.2s',
          width: '100%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
        {locationText}
      </button>
      
      {errorMsg && (
        <p style={{ color: '#ba1a1a', fontSize: '13px', margin: 0, textAlign: 'center', fontWeight: 500 }}>
          {errorMsg}
        </p>
      )}
      <p style={{ fontSize: '11px', color: '#777', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
        *No computador, o GPS pode errar o bairro. Recomenda-se buscar por CEP se impreciso.
      </p>
    </div>
  );
}
