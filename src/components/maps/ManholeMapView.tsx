'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ManholeMarker } from '@/types';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const visitedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Props {
  markers: ManholeMarker[];
  visitedIds?: Set<number>;
  onToggleVisit?: (id: number) => void;
}

export default function ManholeMapView({ markers, visitedIds, onToggleVisit }: Props) {
  return (
    <MapContainer
      center={[36.5, 138]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(m => {
        const visited = visitedIds?.has(m.id) ?? false;
        return (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={visited ? visitedIcon : defaultIcon}>
            <Popup>
              <div className="text-sm" style={{ minWidth: 180 }}>
                <p className="font-bold">{m.pokemon}</p>
                <p className="text-xs">{m.city} ({m.region})</p>
                {m.stopName && <p className="text-xs mt-1">스탑: {m.stopName}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid #eee' }}>
                  {m.detailUrl && (
                    <a
                      href={m.detailUrl.replace('/ko/', '/') + (m.detailUrl.includes('?') ? '' : '?is_modal=1')}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'underline' }}
                    >
                      상세 보기
                    </a>
                  )}
                  {onToggleVisit && (
                    <button
                      onClick={() => onToggleVisit(m.id)}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: 'none',
                        cursor: 'pointer',
                        background: visited ? '#22c55e' : '#e5e7eb',
                        color: visited ? '#fff' : '#666',
                      }}
                    >
                      {visited ? '✓ 방문완료' : '방문 체크'}
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
