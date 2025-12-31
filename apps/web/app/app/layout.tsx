'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiFetch<{
          user: { name: string; role: string };
        }>('/auth/me');
        setUserName(response.user.name);
        setUserRole(response.user.role);
      } catch (error) {
        setUserName(null);
        setUserRole(null);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } catch (error) {
      // ignore
    }
    router.push('/login');
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="badge">SaaS</span>
          <strong>Mesa Técnica</strong>
        </div>
        <nav className="nav">
          <Link className={pathname === '/app' ? 'active' : ''} href="/app">
            Dashboard
          </Link>
          <Link
            className={pathname === '/app/setups' ? 'active' : ''}
            href="/app/setups"
          >
            Meus Setups
          </Link>
          <Link
            className={pathname === '/app/mesa' ? 'active' : ''}
            href="/app/mesa"
          >
            Mesa
          </Link>
          {isAdmin ? (
            <Link
              className={pathname.startsWith('/app/admin') ? 'active' : ''}
              href="/app/admin"
            >
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="sidebar-footer">
          <p>{userName ?? 'Usuário'}</p>
          <button type="button" className="link-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}
