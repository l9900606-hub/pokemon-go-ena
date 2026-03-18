'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { JejuLocation } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const JejuMapView = dynamic(() => import('@/components/maps/JejuMapView'), { ssr: false });

const TYPE_LABELS: Record<string, string> = {
  gym: '체육관',
  eliteGym: '엘리트체육관',
  stop: '스탑',
  showcaseStop: '쇼케이스스탑',
  powerSpot: '파워스폿',
};

const TYPE_COLORS: Record<string, string> = {
  gym: 'bg-red-500',
  eliteGym: 'bg-pink-500',
  stop: 'bg-lime-500',
  showcaseStop: 'bg-green-500',
  powerSpot: 'bg-purple-500',
};

export default function JejuMapPage() {
  const [seedLocations, setSeedLocations] = useState<JejuLocation[]>([]);
  const [overrides, setOverrides] = useLocalStorage<Record<number, Partial<JejuLocation>>>('pgm-jeju-overrides', {});
  const [deletedSeeds, setDeletedSeeds] = useLocalStorage<number[]>('pgm-jeju-deleted', []);
  const [customLocations, setCustomLocations] = useLocalStorage<JejuLocation[]>('pgm-jeju-custom', []);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [addMode, setAddMode] = useState(false);
  const [addForm, setAddForm] = useState({ lat: 0, lng: 0, name: '', type: 'stop' as JejuLocation['type'], district: '제주시', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [searchResults, setSearchResults] = useState<JejuLocation[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/jeju-map.json').then(r => r.json()).then(setSeedLocations);
  }, []);

  // Merge seed data with overrides, excluding deleted
  const allLocations = useMemo(() => {
    const merged = seedLocations
      .map((loc, i) => {
        if (deletedSeeds.includes(i)) return null;
        const override = overrides[i];
        return override ? { ...loc, ...override } : loc;
      })
      .filter((l): l is JejuLocation => l !== null);
    return [...merged, ...customLocations];
  }, [seedLocations, overrides, deletedSeeds, customLocations]);

  const districts = useMemo(() => {
    const set = new Set(allLocations.map(l => l.district));
    return Array.from(set).sort();
  }, [allLocations]);

  const filtered = useMemo(() => {
    return allLocations.filter(l => {
      if (typeFilter && l.type !== typeFilter) return false;
      if (districtFilter && l.district !== districtFilter) return false;
      return true;
    });
  }, [allLocations, typeFilter, districtFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allLocations.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return counts;
  }, [allLocations]);

  const handleChangeType = (filteredIndex: number, newType: JejuLocation['type']) => {
    const loc = filtered[filteredIndex];
    const allIndex = allLocations.findIndex(l => l.lat === loc.lat && l.lng === loc.lng && l.name === loc.name);
    if (allIndex < 0) return;

    // Count non-deleted seeds to determine boundary
    const activeSeedCount = seedLocations.length - deletedSeeds.length;
    if (allIndex < activeSeedCount) {
      // Find the real seed index
      let realSeedIndex = -1;
      let count = 0;
      for (let i = 0; i < seedLocations.length; i++) {
        if (!deletedSeeds.includes(i)) {
          if (count === allIndex) { realSeedIndex = i; break; }
          count++;
        }
      }
      if (realSeedIndex >= 0) {
        setOverrides(prev => ({ ...prev, [realSeedIndex]: { ...prev[realSeedIndex], type: newType } }));
      }
    } else {
      const customIndex = allIndex - activeSeedCount;
      setCustomLocations(prev => prev.map((l, i) => i === customIndex ? { ...l, type: newType } : l));
    }
  };

  const handleDelete = (filteredIndex: number) => {
    const loc = filtered[filteredIndex];
    const allIndex = allLocations.findIndex(l => l.lat === loc.lat && l.lng === loc.lng && l.name === loc.name);
    if (allIndex < 0) return;

    const activeSeedCount = seedLocations.length - deletedSeeds.length;
    if (allIndex < activeSeedCount) {
      // Find real seed index
      let realSeedIndex = -1;
      let count = 0;
      for (let i = 0; i < seedLocations.length; i++) {
        if (!deletedSeeds.includes(i)) {
          if (count === allIndex) { realSeedIndex = i; break; }
          count++;
        }
      }
      if (realSeedIndex >= 0) {
        setDeletedSeeds(prev => [...prev, realSeedIndex]);
      }
    } else {
      const customIndex = allIndex - activeSeedCount;
      setCustomLocations(prev => prev.filter((_, i) => i !== customIndex));
    }
  };

  const handleEditCoords = (filteredIndex: number, newLat: number, newLng: number) => {
    const loc = filtered[filteredIndex];
    const allIndex = allLocations.findIndex(l => l.lat === loc.lat && l.lng === loc.lng && l.name === loc.name);
    if (allIndex < 0) return;

    const activeSeedCount = seedLocations.length - deletedSeeds.length;
    if (allIndex < activeSeedCount) {
      let realSeedIndex = -1;
      let count = 0;
      for (let i = 0; i < seedLocations.length; i++) {
        if (!deletedSeeds.includes(i)) {
          if (count === allIndex) { realSeedIndex = i; break; }
          count++;
        }
      }
      if (realSeedIndex >= 0) {
        setOverrides(prev => ({ ...prev, [realSeedIndex]: { ...prev[realSeedIndex], lat: newLat, lng: newLng } }));
      }
    } else {
      const customIndex = allIndex - activeSeedCount;
      setCustomLocations(prev => prev.map((l, i) => i === customIndex ? { ...l, lat: newLat, lng: newLng } : l));
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setAddForm(prev => ({ ...prev, lat: Math.round(lat * 1000000) / 1000000, lng: Math.round(lng * 1000000) / 1000000 }));
    setShowAddForm(true);
  };

  const saveNewLocation = () => {
    if (!addForm.name.trim()) { alert('이름을 입력하세요'); return; }
    setCustomLocations(prev => [...prev, { ...addForm }]);
    setShowAddForm(false);
    setAddMode(false);
    setAddForm({ lat: 0, lng: 0, name: '', type: 'stop', district: '제주시', address: '' });
  };

  // Search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.trim().toLowerCase();
    const results = allLocations.filter(l => l.name.toLowerCase().includes(q));
    setSearchResults(results);
    if (results.length === 1) {
      const idx = filtered.findIndex(l => l.lat === results[0].lat && l.lng === results[0].lng && l.name === results[0].name);
      setFlyTo({ lat: results[0].lat, lng: results[0].lng });
      setHighlightIndex(idx);
    } else {
      setHighlightIndex(null);
    }
  }, [searchQuery, allLocations, filtered]);

  const goToLocation = (loc: JejuLocation) => {
    const idx = filtered.findIndex(l => l.lat === loc.lat && l.lng === loc.lng && l.name === loc.name);
    setFlyTo({ lat: loc.lat, lng: loc.lng });
    setHighlightIndex(idx);
    setSearchResults([]);
  };

  // CSV import
  const handleCSVImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());

      const newLocations: JejuLocation[] = [];
      const existingCoords = new Set(allLocations.map(l => `${l.lat.toFixed(5)},${l.lng.toFixed(5)}`));

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Try different CSV formats
        // Format 1: name,lat,lng (Zetaphor export)
        // Format 2: name,lat,lng,type
        // Format 3: lat,lng,name
        // Skip header if present
        if (i === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('title') || line.toLowerCase().includes('latitude'))) continue;

        const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));

        let name = '', lat = 0, lng = 0;

        // Detect format
        if (parts.length >= 3) {
          const firstIsNum = !isNaN(parseFloat(parts[0]));
          const secondIsNum = !isNaN(parseFloat(parts[1]));

          if (firstIsNum && secondIsNum) {
            // Format: lat,lng,name
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
            name = parts.slice(2).join(',');
          } else {
            // Format: name,lat,lng
            name = parts[0];
            lat = parseFloat(parts[1]);
            lng = parseFloat(parts[2]);
          }
        }

        if (!name || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;

        // Skip if outside Jeju approximate bounds
        if (lat < 33.0 || lat > 34.0 || lng < 126.0 || lng > 127.0) continue;

        // Skip duplicates
        const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (existingCoords.has(coordKey)) continue;
        existingCoords.add(coordKey);

        newLocations.push({
          lat,
          lng,
          name,
          type: 'stop',
          district: lat > 33.4 ? '제주시' : '서귀포시',
          address: '',
        });
      }

      if (newLocations.length === 0) {
        alert('임포트할 데이터가 없습니다. (중복 또는 제주 범위 밖)');
        return;
      }

      const confirmed = confirm(`${newLocations.length}개 위치를 추가합니다. (기본 타입: 스탑)\n계속하시겠습니까?`);
      if (confirmed) {
        setCustomLocations(prev => [...prev, ...newLocations]);
        alert(`${newLocations.length}개 위치가 추가되었습니다.`);
      }
    };
    input.click();
  };

  // IITC-POGO JSON import
  const handleIITCImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);

        const newLocations: JejuLocation[] = [];
        const existingCoords = new Set(allLocations.map(l => `${l.lat.toFixed(5)},${l.lng.toFixed(5)}`));
        const existingNames = new Set(allLocations.map(l => l.name.trim().toLowerCase()));
        let dupeCount = 0;

        const processEntries = (entries: Record<string, { lat: number; lng: number; name: string }>, type: JejuLocation['type']) => {
          Object.values(entries).forEach(item => {
            if (!item.name || !item.lat || !item.lng) return;
            // Skip outside Jeju
            if (item.lat < 33.0 || item.lat > 34.0 || item.lng < 126.0 || item.lng > 127.0) return;
            // Skip coordinate duplicates
            const coordKey = `${item.lat.toFixed(5)},${item.lng.toFixed(5)}`;
            if (existingCoords.has(coordKey)) { dupeCount++; return; }
            // Skip name duplicates
            if (existingNames.has(item.name.trim().toLowerCase())) { dupeCount++; return; }
            existingCoords.add(coordKey);
            existingNames.add(item.name.trim().toLowerCase());

            newLocations.push({
              lat: item.lat,
              lng: item.lng,
              name: item.name,
              type,
              district: item.lat > 33.4 ? '제주시' : '서귀포시',
              address: '',
            });
          });
        };

        // gyms → gym, pokestops → stop (notpogo 제외)
        if (json.gyms) processEntries(json.gyms, 'gym');
        if (json.pokestops) processEntries(json.pokestops, 'stop');

        if (newLocations.length === 0) {
          alert(`임포트할 새 데이터가 없습니다.\n(중복 ${dupeCount}건 제외됨)`);
          return;
        }

        const gymCount = newLocations.filter(l => l.type === 'gym').length;
        const stopCount = newLocations.filter(l => l.type === 'stop').length;
        const confirmed = confirm(
          `IITC 데이터 임포트\n\n` +
          `체육관: ${gymCount}개\n스탑: ${stopCount}개\n합계: ${newLocations.length}개 추가\n` +
          `(중복 ${dupeCount}건 자동 제외)\n\n계속하시겠습니까?`
        );
        if (confirmed) {
          setCustomLocations(prev => [...prev, ...newLocations]);
          alert(`${newLocations.length}개 위치가 추가되었습니다.`);
        }
      } catch {
        alert('JSON 파일을 파싱할 수 없습니다. IITC-POGO 형식인지 확인해주세요.');
      }
    };
    input.click();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">제주 포켓몬고 지도</h1>

      {/* Search */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="스탑/체육관 이름 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 md:w-80 md:flex-none px-3 py-1.5 bg-muted border border-border rounded-lg text-sm"
        />
        <button onClick={handleSearch} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">검색</button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="bg-card border border-border rounded-xl mb-3 max-h-48 overflow-y-auto">
          <div className="p-2 text-xs text-muted-foreground border-b border-border">검색 결과: {searchResults.length}건</div>
          {searchResults.slice(0, 20).map((loc, i) => (
            <button
              key={i}
              onClick={() => goToLocation(loc)}
              className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border last:border-0 flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[loc.type] || 'bg-gray-400'}`} />
              <span className="text-sm font-medium truncate">{loc.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{TYPE_LABELS[loc.type]} · {loc.district}</span>
            </button>
          ))}
          {searchResults.length > 20 && (
            <p className="p-2 text-xs text-muted-foreground text-center">상위 20건만 표시</p>
          )}
        </div>
      )}

      {/* Type filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-2 py-1 rounded text-xs ${!typeFilter ? 'bg-accent text-white' : 'bg-muted'}`}
        >
          전체 ({allLocations.length})
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${typeFilter === key ? 'bg-accent text-white' : 'bg-muted'}`}
          >
            <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[key]}`} />
            {label} ({typeCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <select
          value={districtFilter}
          onChange={e => setDistrictFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm bg-muted border border-border"
        >
          <option value="">전체 행정구역</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={() => { setAddMode(!addMode); if (addMode) setShowAddForm(false); }}
          className={`px-3 py-1.5 rounded-lg text-sm ${addMode ? 'bg-green-500 text-white' : 'bg-muted'}`}
        >
          {addMode ? '추가모드 ON' : '+ 위치 추가'}
        </button>
        <button
          onClick={handleCSVImport}
          className="px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-muted/80"
        >
          CSV 임포트
        </button>
        <button
          onClick={handleIITCImport}
          className="px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-muted/80"
        >
          IITC 임포트
        </button>
        <span className="text-xs text-muted-foreground">
          {filtered.length}개 위치 (커스텀 {customLocations.length}개 · 삭제 {deletedSeeds.length}개)
        </span>
      </div>

      {/* Add form - shown ABOVE map when addMode is ON */}
      {addMode && (
        <div className="bg-card border-2 border-green-500 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-green-600">📍 새 위치 추가 — 지도를 클릭하면 좌표가 자동 입력됩니다</h3>
            <button
              onClick={() => { setAddMode(false); setShowAddForm(false); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕ 닫기
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">위도</label>
              <input value={addForm.lat || ''} onChange={e => setAddForm(p => ({ ...p, lat: parseFloat(e.target.value) || 0 }))} placeholder="지도 클릭 또는 직접 입력" className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">경도</label>
              <input value={addForm.lng || ''} onChange={e => setAddForm(p => ({ ...p, lng: parseFloat(e.target.value) || 0 }))} placeholder="지도 클릭 또는 직접 입력" className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">이름 *</label>
              <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} placeholder="스탑/체육관 이름" className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">타입</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="addType" checked={addForm.type === k} onChange={() => setAddForm(p => ({ ...p, type: k as JejuLocation['type'] }))} />
                    <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[k]}`} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">행정구역</label>
              <input value={addForm.district} onChange={e => setAddForm(p => ({ ...p, district: e.target.value }))} className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">주소</label>
              <input value={addForm.address} onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))} className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={saveNewLocation} className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium">추가 저장</button>
            <button onClick={() => setAddForm({ lat: 0, lng: 0, name: '', type: 'stop', district: '제주시', address: '' })} className="px-3 py-1.5 bg-muted rounded-lg text-sm">초기화</button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: addMode ? '50vh' : '70vh' }}>
        <JejuMapView
          locations={filtered}
          onChangeType={handleChangeType}
          onDelete={handleDelete}
          onEditCoords={handleEditCoords}
          onAddLocation={handleMapClick}
          addMode={addMode}
          flyTo={flyTo}
          highlightIndex={highlightIndex}
        />
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        <p>마커 팝업에서 타입 변경/삭제 가능. 변경사항은 브라우저에 자동 저장됩니다.</p>
        <p>CSV 형식: <code className="bg-muted px-1 rounded">이름,위도,경도</code> 또는 <code className="bg-muted px-1 rounded">위도,경도,이름</code> (IITC Portal Export 호환)</p>
      </div>
    </div>
  );
}
