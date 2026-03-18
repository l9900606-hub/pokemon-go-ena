'use client';
import { useState, useCallback } from 'react';

// All pgm-* localStorage keys to sync
const SYNC_KEYS = [
  'pgm-record-accounts', 'pgm-record-fields', 'pgm-record-custom',
  'pgm-mega-accounts', 'pgm-mega-data', 'pgm-mega-promoted-za',
  'pgm-vivillon-accounts', 'pgm-vivillon-data',
  'pgm-manhole-accounts', 'pgm-manhole-visits',
  'pgm-medal-accounts', 'pgm-medal-records',
  'pgm-jeju-overrides', 'pgm-jeju-deleted', 'pgm-jeju-custom',
  'pgm-accounts', 'pgm-saved-searches',
];

function getAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try { data[key] = JSON.parse(val); } catch { data[key] = val; }
    }
  });
  return data;
}

function mergeData(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...local };

  Object.entries(remote).forEach(([key, remoteVal]) => {
    const localVal = local[key];

    if (!localVal) {
      // Local doesn't have it, use remote
      merged[key] = remoteVal;
    } else if (Array.isArray(localVal) && Array.isArray(remoteVal)) {
      if (key.includes('accounts')) {
        // Merge accounts: union
        const set = new Set([...(localVal as string[]), ...(remoteVal as string[])]);
        merged[key] = Array.from(set);
      } else if (key === 'pgm-record-custom') {
        // Merge records by date+accountName
        const map = new Map<string, unknown>();
        (localVal as { date: string; accountName: string }[]).forEach(r => map.set(`${r.accountName}|${r.date}`, r));
        (remoteVal as { date: string; accountName: string }[]).forEach(r => map.set(`${r.accountName}|${r.date}`, r));
        merged[key] = Array.from(map.values());
      } else if (key === 'pgm-medal-records') {
        const map = new Map<string, unknown>();
        (localVal as { accountName: string; medalKey: string }[]).forEach(r => map.set(`${r.accountName}|${r.medalKey}`, r));
        (remoteVal as { accountName: string; medalKey: string }[]).forEach(r => map.set(`${r.accountName}|${r.medalKey}`, r));
        merged[key] = Array.from(map.values());
      } else if (key === 'pgm-saved-searches') {
        const map = new Map<string, unknown>();
        (localVal as { name: string }[]).forEach(r => map.set(r.name, r));
        (remoteVal as { name: string }[]).forEach(r => map.set(r.name, r));
        merged[key] = Array.from(map.values());
      } else {
        // For other arrays (jeju-deleted, promoted-za, etc), union
        const set = new Set([...(localVal as number[]), ...(remoteVal as number[])]);
        merged[key] = Array.from(set);
      }
    } else if (typeof localVal === 'object' && typeof remoteVal === 'object' && !Array.isArray(localVal)) {
      // Merge objects (accountData, visitData, overrides, etc): remote wins per key
      merged[key] = { ...(localVal as Record<string, unknown>), ...(remoteVal as Record<string, unknown>) };
    } else {
      // Primitive or unknown: remote wins
      merged[key] = remoteVal;
    }
  });

  return merged;
}

export default function SyncButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [syncId, setSyncId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('pgm-sync-id') || '';
    return '';
  });
  const [syncing, setSyncing] = useState(false);

  const saveSyncId = (id: string) => {
    setSyncId(id);
    localStorage.setItem('pgm-sync-id', id);
  };

  const generateId = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    saveSyncId(id);
    return id;
  };

  const handleUpload = useCallback(async () => {
    const id = syncId || generateId();
    setSyncing(true);
    try {
      const data = getAllData();
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncId: id, data }),
      });
      if (!res.ok) throw new Error();
      alert(`업로드 완료!\n\n동기화 코드: ${id}\n다른 기기에서 이 코드로 불러오기 하세요.`);
    } catch {
      alert('업로드 실패');
    } finally {
      setSyncing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncId]);

  const handleDownload = useCallback(async () => {
    if (!syncId) { alert('동기화 코드를 입력하세요.'); return; }
    setSyncing(true);
    try {
      const res = await fetch(`/api/sync?id=${syncId}`);
      if (!res.ok) throw new Error();
      const { data: remoteData } = await res.json();

      const localData = getAllData();
      const merged = mergeData(localData, remoteData);

      // Write merged data to localStorage
      Object.entries(merged).forEach(([key, val]) => {
        localStorage.setItem(key, JSON.stringify(val));
      });

      alert('동기화 완료! 페이지를 새로고침합니다.');
      window.location.reload();
    } catch {
      alert('해당 코드의 데이터를 찾을 수 없습니다.');
    } finally {
      setSyncing(false);
    }
  }, [syncId]);

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted w-full"
        title="데이터 동기화"
      >
        <span>🔄</span>
        <span>동기화</span>
      </button>

      {showPanel && (
        <div className="mx-2 mb-2 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-[10px] text-muted-foreground mb-2">모든 데이터를 기기 간 동기화</p>
          <input
            value={syncId}
            onChange={e => saveSyncId(e.target.value.toUpperCase())}
            placeholder="동기화 코드"
            className="w-full px-2 py-1 text-xs bg-background border border-border rounded font-mono tracking-wider mb-2"
            maxLength={6}
          />
          <div className="flex gap-1.5">
            <button onClick={handleUpload} disabled={syncing}
              className="flex-1 px-2 py-1.5 text-[11px] bg-primary text-primary-foreground rounded disabled:opacity-50">
              {syncing ? '...' : '업로드'}
            </button>
            <button onClick={handleDownload} disabled={syncing || !syncId}
              className="flex-1 px-2 py-1.5 text-[11px] bg-background border border-border rounded disabled:opacity-50">
              {syncing ? '...' : '불러오기'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
