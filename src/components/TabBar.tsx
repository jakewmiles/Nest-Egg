'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Accounts' },
  { href: '/insights', label: 'Insights' },
  { href: '/update', label: 'Update' }
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm font-medium ${active ? 'text-accent' : 'text-muted'}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
