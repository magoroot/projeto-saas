'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setCookie } from '../lib/api';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setCookie('saas_access_token', response.accessToken, 1);
      setCookie('saas_refresh_token', response.refreshToken, 30);
      setCookie('saas_user_role', response.user.role, 7);
      setCookie('saas_user_id', response.user.id, 7);
      setCookie('saas_user_name', response.user.name, 7);
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1>Entrar na mesa</h1>
        <p>Use seu e-mail e senha para acessar sua área.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => router.push('/register')}
        >
          Criar conta
        </button>
      </div>
    </main>
  );
}
