'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export interface FairMarkerInfo {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface FairsMapProps {
  fairs: FairMarkerInfo[];
  centerLat?: number;
  centerLng?: number;
  flyTrigger?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

function MapInteraction({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) onLocationChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapController({
  fairs,
  centerLat,
  centerLng,
  flyTrigger,
}: {
  fairs: FairMarkerInfo[];
  centerLat: number;
  centerLng: number;
  flyTrigger?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (flyTrigger) {
      map.flyTo([centerLat, centerLng], 15, { duration: 1.5 });
      return;
    }

    if (fairs.length === 0) {
      map.flyTo([centerLat, centerLng], 13);
    } else if (fairs.length === 1) {
      map.flyTo([fairs[0].lat, fairs[0].lng], 14);
    } else {
      const allPoints: [number, number][] = [
        [centerLat, centerLng],
        ...fairs.map(f => [f.lat, f.lng] as [number, number]),
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [fairs, map, centerLat, centerLng, flyTrigger]);

  return null;
}

const FairsMap: React.FC<FairsMapProps> = ({
  fairs,
  centerLat = -15.7975,
  centerLng = -47.8919,
  flyTrigger,
  onLocationChange,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker position={[centerLat, centerLng]} icon={UserIcon}>
          <Popup>Sua localização</Popup>
        </Marker>
        <Circle
          center={[centerLat, centerLng]}
          radius={500}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
        />

        {fairs.map(fair => (
          <Marker key={fair.id} position={[fair.lat, fair.lng]}>
            <Popup>
              <strong>{fair.name}</strong>
              <br />
              {fair.address}
            </Popup>
          </Marker>
        ))}

        <MapController fairs={fairs} centerLat={centerLat} centerLng={centerLng} flyTrigger={flyTrigger} />
        <MapInteraction onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
};

export default FairsMap;
