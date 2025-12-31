'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, clearCookie, getCookie } from '../lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedName = getCookie('saas_user_name');
    const storedRole = getCookie('saas_user_role');
    if (storedName) {
      setUserName(storedName);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleLogout = async () => {
    const refreshToken = getCookie('saas_refresh_token');
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // ignore
      }
    }
    clearCookie('saas_access_token');
    clearCookie('saas_refresh_token');
    clearCookie('saas_user_role');
    clearCookie('saas_user_id');
    clearCookie('saas_user_name');
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
            className={pathname === '/app/workspace' ? 'active' : ''}
            href="/app/workspace"
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
