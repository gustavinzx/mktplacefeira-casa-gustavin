import { useState } from 'react';

export function useGeolocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = async (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocalização não suportada pelo seu navegador.');
        resolve(null);
        return;
      }
      setLocating(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Não foi possível obter sua localização exata.');
          setLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: Infinity }
      );
    });
  };

  return { locate, locating, error };
}
