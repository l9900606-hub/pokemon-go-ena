'use client';
import { useState, useEffect, useMemo } from 'react';
import type { EventData, CommunityDay } from '@/types';

type SortOption = 'newest' | 'oldest' | 'year-group';
type TabType = 'schedule' | 'field' | 'community' | 'collections' | 'specials';

interface FieldEvent {
  year: number;
  date: string;
  name: string;
  type: string;
  location: string;
  details: string;
}

interface RecentEvent {
  year: number;
  date: string;
  name: string;
  type: string;
  details: string;
}

interface EventHistory {
  fieldEvents: FieldEvent[];
  recentEvents: RecentEvent[];
}

// Generate official link - Google site-search for the specific event
function getOfficialLink(event: { name: string; type: string; year: number }): string {
  const q = encodeURIComponent(`site:pokemongolive.com ${event.name}`);
  return `https://www.google.com/search?q=${q}`;
}

// Generate official link for schedule items
function getScheduleLink(content: string, year: number): string {
  const q = encodeURIComponent(`site:pokemongolive.com ${content} ${year}`);
  return `https://www.google.com/search?q=${q}`;
}

const TYPE_COLORS: Record<string, string> = {
  'Go Fest': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  'Go Tour': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  'Safari Zone': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  'City Safari': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
  'Wild Area': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  'Community Day': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  'Community Day Classic': 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
};

export default function EventsPage() {
  const [data, setData] = useState<EventData>({ collections: [], specials: [], schedule: [] });
  const [communityDays, setCommunityDays] = useState<CommunityDay[]>([]);
  const [history, setHistory] = useState<EventHistory>({ fieldEvents: [], recentEvents: [] });
  const [tab, setTab] = useState<TabType>('schedule');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [fieldTypeFilter, setFieldTypeFilter] = useState<string>('');

  useEffect(() => {
    fetch('/data/events.json').then(r => r.json()).then(setData);
    fetch('/data/community-days.json').then(r => r.json()).then(setCommunityDays);
    fetch('/data/event-history.json').then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  // Schedule
  const years = useMemo(() => {
    const set = new Set([
      ...data.schedule.map(s => s.year).filter(Boolean),
      ...history.recentEvents.map(e => e.year),
    ]);
    return Array.from(set).sort((a, b) => b - a);
  }, [data.schedule, history.recentEvents]);

  const allSchedule = useMemo(() => {
    // Merge original schedule + recentEvents (dedup by year+date+content)
    const existing = new Set(data.schedule.map(s => `${s.year}-${s.date}-${s.content}`));
    const merged = [...data.schedule];
    history.recentEvents.forEach(e => {
      const key = `${e.year}-${e.date}-${e.name}`;
      if (!existing.has(key)) {
        merged.push({
          year: e.year,
          date: e.date,
          content: e.name,
          location: '',
          details: e.details,
          eventPokemon: '',
          link: '',
        });
      }
    });
    return merged;
  }, [data.schedule, history.recentEvents]);

  const filteredSchedule = useMemo(() => {
    let list = yearFilter ? allSchedule.filter(s => s.year === yearFilter) : [...allSchedule];
    if (sortBy === 'newest') {
      list.sort((a, b) => b.year !== a.year ? b.year - a.year : b.date.localeCompare(a.date));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => a.year !== b.year ? a.year - b.year : a.date.localeCompare(b.date));
    }
    return list;
  }, [allSchedule, yearFilter, sortBy]);

  // Field events
  const fieldTypes = useMemo(() => {
    const set = new Set(history.fieldEvents.map(e => e.type));
    return Array.from(set).sort();
  }, [history.fieldEvents]);

  const filteredFieldEvents = useMemo(() => {
    let list = [...history.fieldEvents];
    if (yearFilter) list = list.filter(e => e.year === yearFilter);
    if (fieldTypeFilter) list = list.filter(e => e.type === fieldTypeFilter);
    return list.sort((a, b) => b.year !== a.year ? b.year - a.year : b.date.localeCompare(a.date));
  }, [history.fieldEvents, yearFilter, fieldTypeFilter]);

  const fieldYears = useMemo(() => {
    const set = new Set(history.fieldEvents.map(e => e.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [history.fieldEvents]);

  // Community
  const communityYears = useMemo(() => {
    const set = new Set(communityDays.map(c => c.year).filter(Boolean));
    return Array.from(set).sort((a, b) => b - a);
  }, [communityDays]);
  const [cdYearFilter, setCdYearFilter] = useState<number | null>(null);
  const filteredCD = useMemo(() => {
    if (!cdYearFilter) return communityDays;
    return communityDays.filter(c => c.year === cdYearFilter);
  }, [communityDays, cdYearFilter]);

  const tabItems: { key: TabType; label: string }[] = [
    { key: 'schedule', label: `일정 (${allSchedule.length})` },
    { key: 'field', label: `현장이벤트 (${history.fieldEvents.length})` },
    { key: 'community', label: `커뮤니티데이 (${communityDays.length})` },
    { key: 'collections', label: `컬렉션 (${data.collections.length})` },
    { key: 'specials', label: `특별이벤트 (${data.specials.length})` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">이벤트 히스토리</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabItems.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setYearFilter(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== 일정 ===== */}
      {tab === 'schedule' && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap items-center">
            <span className="text-xs text-muted-foreground">정렬:</span>
            {([['newest', '최신순'], ['oldest', '오래된순'], ['year-group', '연도별']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key as SortOption)}
                className={`px-2 py-1 rounded text-xs ${sortBy === key ? 'bg-accent text-white' : 'bg-muted'}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button onClick={() => setYearFilter(null)} className={`px-2 py-1 rounded text-xs ${!yearFilter ? 'bg-accent text-white' : 'bg-muted'}`}>전체</button>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)} className={`px-2 py-1 rounded text-xs ${yearFilter === y ? 'bg-accent text-white' : 'bg-muted'}`}>{y}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredSchedule.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.year}</span>
                    <span className="text-sm font-mono">{item.date}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.content}</p>
                    {item.eventPokemon && <p className="text-xs text-muted-foreground mt-1"><span className="text-yellow-600 dark:text-yellow-400">★</span> {item.eventPokemon}</p>}
                    {item.location && <p className="text-xs mt-1"><span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">📍 {item.location}</span></p>}
                    {item.details && <p className="text-xs text-muted-foreground mt-1">{item.details}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">링크</a>}
                    <a href={getScheduleLink(item.content, item.year)} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-accent">🔗공식</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== 현장이벤트 ===== */}
      {tab === 'field' && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={() => setFieldTypeFilter('')} className={`px-2 py-1 rounded text-xs ${!fieldTypeFilter ? 'bg-accent text-white' : 'bg-muted'}`}>전체</button>
            {fieldTypes.map(t => (
              <button key={t} onClick={() => setFieldTypeFilter(fieldTypeFilter === t ? '' : t)}
                className={`px-2 py-1 rounded text-xs ${fieldTypeFilter === t ? 'bg-accent text-white' : 'bg-muted'}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button onClick={() => setYearFilter(null)} className={`px-2 py-1 rounded text-xs ${!yearFilter ? 'bg-accent text-white' : 'bg-muted'}`}>전체</button>
            {fieldYears.map(y => (
              <button key={y} onClick={() => setYearFilter(y)} className={`px-2 py-1 rounded text-xs ${yearFilter === y ? 'bg-accent text-white' : 'bg-muted'}`}>{y}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredFieldEvents.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{item.year}</span>
                      <span className="text-xs font-mono text-muted-foreground">{item.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type] || 'bg-muted'}`}>{item.type}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mt-2">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">📍 장소</p>
                  <p className="text-sm">{item.location}</p>
                </div>
                {item.details && <p className="text-xs text-muted-foreground mt-2">{item.details}</p>}
                <a
                  href={getOfficialLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-accent hover:underline"
                >
                  🔗 공식 사이트 보기
                </a>
              </div>
            ))}
            {filteredFieldEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">해당 조건의 현장이벤트가 없습니다.</p>}
          </div>
        </>
      )}

      {/* ===== 커뮤니티데이 ===== */}
      {tab === 'community' && (
        <>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button onClick={() => setCdYearFilter(null)} className={`px-2 py-1 rounded text-xs ${!cdYearFilter ? 'bg-accent text-white' : 'bg-muted'}`}>전체</button>
            {communityYears.map(y => (
              <button key={y} onClick={() => setCdYearFilter(y)} className={`px-2 py-1 rounded text-xs ${cdYearFilter === y ? 'bg-accent text-white' : 'bg-muted'}`}>{y}</button>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left">연도</th>
                  <th className="px-3 py-2 text-left">월/일</th>
                  <th className="px-3 py-2 text-left">포켓몬</th>
                  <th className="px-3 py-2 text-left">특별 기술</th>
                  <th className="px-3 py-2 text-left">공식</th>
                </tr>
              </thead>
              <tbody>
                {filteredCD.map((cd, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{cd.year}</td>
                    <td className="px-3 py-2 font-mono text-xs">{cd.month}/{cd.day}</td>
                    <td className="px-3 py-2 font-medium">{cd.pokemon}</td>
                    <td className="px-3 py-2 text-xs">{cd.move || '-'}</td>
                    <td className="px-3 py-2">
                      <a href={`https://www.google.com/search?q=${encodeURIComponent(`site:pokemongolive.com community day ${cd.pokemon} ${cd.year}`)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">🔗공식</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== 컬렉션 ===== */}
      {tab === 'collections' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50"><th className="px-3 py-2 text-left w-12">NO</th><th className="px-3 py-2 text-left">제목</th><th className="px-3 py-2 text-left w-32">날짜</th></tr></thead>
            <tbody>
              {data.collections.map(c => (
                <tr key={c.no} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground">{c.no}</td><td className="px-3 py-2">{c.title}</td><td className="px-3 py-2 text-xs text-muted-foreground">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== 특별이벤트 ===== */}
      {tab === 'specials' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50"><th className="px-3 py-2 text-left w-12">NO</th><th className="px-3 py-2 text-left">제목</th><th className="px-3 py-2 text-left">범위</th><th className="px-3 py-2 text-left">날짜</th></tr></thead>
            <tbody>
              {data.specials.map(s => (
                <tr key={s.no} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground">{s.no}</td><td className="px-3 py-2">{s.title}</td><td className="px-3 py-2 text-xs">{s.scope}</td><td className="px-3 py-2 text-xs text-muted-foreground">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
