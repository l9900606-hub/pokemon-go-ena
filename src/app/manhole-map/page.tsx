'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ManholeMarker } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const ManholeMap = dynamic(() => import('@/components/maps/ManholeMapView'), { ssr: false });

export default function ManholeMapPage() {
  const [manholes, setManholes] = useState<ManholeMarker[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [visitFilter, setVisitFilter] = useState<'' | 'visited' | 'unvisited'>('');
  const [accounts, setAccounts] = useLocalStorage<string[]>('pgm-manhole-accounts', []);
  const [visitData, setVisitData] = useLocalStorage<Record<string, number[]>>('pgm-manhole-visits', {});
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [newAccountName, setNewAccountName] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    fetch('/data/manholes.json').then(r => r.json()).then(setManholes);
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) setSelectedAccount(accounts[0]);
  }, [accounts, selectedAccount]);

  const regions = useMemo(() => {
    const set = new Set(manholes.map(m => m.region));
    return Array.from(set).sort();
  }, [manholes]);

  const visitedIds = useMemo(() => {
    return new Set(selectedAccount ? (visitData[selectedAccount] || []) : []);
  }, [visitData, selectedAccount]);

  const filtered = useMemo(() => {
    return manholes.filter(m => {
      if (regionFilter && m.region !== regionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.pokemon.toLowerCase().includes(q) && !m.city.toLowerCase().includes(q)) return false;
      }
      if (visitFilter === 'visited' && !visitedIds.has(m.id)) return false;
      if (visitFilter === 'unvisited' && visitedIds.has(m.id)) return false;
      return true;
    });
  }, [manholes, regionFilter, search, visitFilter, visitedIds]);

  const addAccount = () => {
    const name = newAccountName.trim();
    if (!name || accounts.includes(name)) return;
    setAccounts(prev => [...prev, name]);
    setSelectedAccount(name);
    setNewAccountName('');
    setShowAddAccount(false);
  };

  const removeAccount = (name: string) => {
    if (!confirm(`"${name}" 계정을 삭제하시겠습니까?`)) return;
    setAccounts(prev => prev.filter(a => a !== name));
    setVisitData(prev => { const next = { ...prev }; delete next[name]; return next; });
    if (selectedAccount === name) setSelectedAccount(accounts[0] || '');
  };

  const toggleVisit = (id: number) => {
    if (!selectedAccount) return;
    setVisitData(prev => {
      const current = prev[selectedAccount] || [];
      const next = current.includes(id) ? current.filter(v => v !== id) : [...current, id];
      return { ...prev, [selectedAccount]: next };
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">일본 포켓몬 맨홀 지도</h1>

      {/* Account selector */}
      <div className="bg-card border border-border rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">계정:</span>
          {accounts.map(acc => (
            <div key={acc} className="flex items-center gap-0.5">
              <button
                onClick={() => setSelectedAccount(acc)}
                className={`px-3 py-1 rounded-lg text-sm ${selectedAccount === acc ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                {acc}
              </button>
              <button onClick={() => removeAccount(acc)} className="text-xs text-red-400 hover:text-red-600 px-1">×</button>
            </div>
          ))}
          {showAddAccount ? (
            <div className="flex items-center gap-1">
              <input
                value={newAccountName}
                onChange={e => setNewAccountName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAccount()}
                placeholder="계정 이름"
                className="px-2 py-1 text-sm bg-muted border border-border rounded w-28"
                autoFocus
              />
              <button onClick={addAccount} className="text-xs text-green-500">추가</button>
              <button onClick={() => setShowAddAccount(false)} className="text-xs text-muted-foreground">취소</button>
            </div>
          ) : (
            <button onClick={() => setShowAddAccount(true)} className="px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80">+ 계정</button>
          )}
        </div>
        {selectedAccount && (
          <div className="text-xs text-muted-foreground mt-1">
            방문: {visitedIds.size}/{manholes.length}개
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm bg-muted border border-border"
        >
          <option value="">전체 지역</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="포켓몬/도시 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm w-48"
        />
        {selectedAccount && (
          <select
            value={visitFilter}
            onChange={e => setVisitFilter(e.target.value as '' | 'visited' | 'unvisited')}
            className="px-3 py-1.5 rounded-lg text-sm bg-muted border border-border"
          >
            <option value="">전체</option>
            <option value="visited">방문완료</option>
            <option value="unvisited">미방문</option>
          </select>
        )}
        <span className="text-xs text-muted-foreground">{filtered.length}개 마커</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: '70vh' }}>
        <ManholeMap
          markers={filtered}
          visitedIds={visitedIds}
          onToggleVisit={selectedAccount ? toggleVisit : undefined}
        />
      </div>
    </div>
  );
}
