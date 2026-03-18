'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const tabs = [
  { href: '/search-builder', label: '검색어', icon: '🔍' },
  // { href: '/manhole-map', label: '맨홀지도', icon: '🗾' },
  // { href: '/jeju-map', label: '제주지도', icon: '🗺️' },
  // { href: '/events', label: '이벤트', icon: '📅' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-primary">Pokemon GO</h1>
          <p className="text-xs text-muted-foreground">ENA</p>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex overflow-x-auto scrollbar-hide">
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[56px] px-2 py-2 text-[10px] shrink-0 flex-1 ${
                active ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function ThemeToggle() {
  return (
    <button
      className="m-2 p-2 rounded-lg hover:bg-muted text-sm flex items-center gap-2"
      onClick={() => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem(
          'theme',
          document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        );
      }}
    >
      🌓 다크모드 전환
    </button>
  );
}
