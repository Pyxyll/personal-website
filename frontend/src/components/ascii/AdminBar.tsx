'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminBar() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const pathname = usePathname();

  // Don't show on admin pages (they have their own navigation)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Don't show while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-[var(--gradient-mid)]/10 border-b border-[var(--gradient-mid)]/30 py-2 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-[var(--gradient-mid)]">[admin]</span>
          <span className="text-muted-foreground">
            logged in as <span className="text-foreground">{user?.name}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors"
          >
            [dashboard]
          </Link>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors"
          >
            [logout]
          </button>
        </div>
      </div>
    </div>
  );
}
