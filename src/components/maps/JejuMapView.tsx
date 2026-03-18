'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { JejuLocation } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  gym: '#ef4444',
  eliteGym: '#ec4899',
  stop: '#84cc16',
  showcaseStop: '#22c55e',
  powerSpot: '#a855f7',
};

const TYPE_LABELS: Record<string, string> = {
  gym: '체육관',
  eliteGym: '엘리트체육관',
  stop: '스탑',
  showcaseStop: '쇼케이스스탑',
  powerSpot: '파워스폿',
};

const ALL_TYPES: JejuLocation['type'][] = ['gym', 'eliteGym', 'stop', 'showcaseStop', 'powerSpot'];

interface Props {
  locations: JejuLocation[];
  onChangeType?: (index: number, newType: JejuLocation['type']) => void;
  onDelete?: (index: number) => void;
  onEditCoords?: (index: number, lat: number, lng: number) => void;
  onAddLocation?: (lat: number, lng: number) => void;
  addMode?: boolean;
  flyTo?: { lat: number; lng: number } | null;
  highlightIndex?: number | null;
}

function AddMarkerHandler({ onAddLocation }: { onAddLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToHandler({ flyTo }: { flyTo: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 17, { duration: 1 });
    }
  }, [flyTo, map]);
  return null;
}

// Pulsing highlight marker for search result
function HighlightMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.circleMarker([lat, lng], {
      radius: 18,
      color: '#facc15',
      fillColor: '#facc15',
      fillOpacity: 0.3,
      weight: 3,
      className: 'highlight-pulse',
    }).addTo(map);

    markerRef.current = marker;

    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [lat, lng, map]);

  return null;
}

function CoordEditor({ index, loc, onEditCoords }: { index: number; loc: JejuLocation; onEditCoords: (index: number, lat: number, lng: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [lat, setLat] = useState(String(loc.lat));
  const [lng, setLng] = useState(String(loc.lng));

  if (!editing) {
    return (
      <button
        onClick={() => { setLat(String(loc.lat)); setLng(String(loc.lng)); setEditing(true); }}
        style={{ fontSize: 11, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
      >
        📍 좌표수정
      </button>
    );
  }

  return (
    <div style={{ marginTop: 4, padding: '6px 0' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#888' }}>위도</label>
          <input value={lat} onChange={e => setLat(e.target.value)} style={{ width: '100%', fontSize: 11, padding: '2px 4px', border: '1px solid #ddd', borderRadius: 3 }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#888' }}>경도</label>
          <input value={lng} onChange={e => setLng(e.target.value)} style={{ width: '100%', fontSize: 11, padding: '2px 4px', border: '1px solid #ddd', borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => {
            const newLat = parseFloat(lat);
            const newLng = parseFloat(lng);
            if (isNaN(newLat) || isNaN(newLng)) { alert('올바른 좌표를 입력하세요'); return; }
            onEditCoords(index, newLat, newLng);
            setEditing(false);
          }}
          style={{ fontSize: 10, color: '#fff', background: '#f59e0b', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
        >
          적용
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{ fontSize: 10, color: '#888', background: 'none', border: '1px solid #ddd', cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default function JejuMapView({ locations, onChangeType, onDelete, onEditCoords, onAddLocation, addMode, flyTo, highlightIndex }: Props) {
  const highlightLoc = highlightIndex != null && highlightIndex >= 0 ? locations[highlightIndex] : null;

  return (
    <>
      <style>{`
        .highlight-pulse {
          animation: pulse-ring 1s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
      <MapContainer
        center={[33.38, 126.55]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {addMode && onAddLocation && <AddMarkerHandler onAddLocation={onAddLocation} />}
        <FlyToHandler flyTo={flyTo || null} />
        {highlightLoc && <HighlightMarker lat={highlightLoc.lat} lng={highlightLoc.lng} />}
        {locations.map((loc, i) => (
          <CircleMarker
            key={`${loc.lat}-${loc.lng}-${i}`}
            center={[loc.lat, loc.lng]}
            radius={5}
            pathOptions={{
              color: TYPE_COLORS[loc.type] || '#888',
              fillColor: TYPE_COLORS[loc.type] || '#888',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-sm" style={{ minWidth: 200 }}>
                <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{loc.name}</p>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{loc.district} {loc.address}</p>
                <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>타입:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                  {ALL_TYPES.map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                      <input
                        type="radio"
                        name={`type-${i}`}
                        checked={loc.type === t}
                        onChange={() => onChangeType?.(i, t)}
                        style={{ margin: 0 }}
                      />
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: TYPE_COLORS[t], display: 'inline-block'
                      }} />
                      {TYPE_LABELS[t]}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 6 }}>
                  <button
                    onClick={() => { if (confirm(`"${loc.name}" 삭제?`)) onDelete?.(i); }}
                    style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  >
                    🗑 삭제
                  </button>
                  {onEditCoords && <CoordEditor index={i} loc={loc} onEditCoords={onEditCoords} />}
                  <button
                    onClick={() => { alert('저장되었습니다.'); }}
                    style={{ fontSize: 11, color: '#fff', background: '#3b82f6', border: 'none', cursor: 'pointer', padding: '2px 10px', borderRadius: 4 }}
                  >
                    저장
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
}
