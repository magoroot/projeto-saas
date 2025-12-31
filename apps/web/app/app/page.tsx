'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

type Indicator = {
  id: string;
  code: string;
  name: string;
  description: string;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  maxIndicatorsActive: number;
  allowedMarkets: string[];
};

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  subscription: {
    id: string;
    status: string;
    startedAt: string;
    plan: Plan;
    indicators: Indicator[];
  } | null;
};

type Setup = {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
  updatedAt: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, setupsResponse] = await Promise.all([
          apiFetch<MeResponse>('/auth/me'),
          apiFetch<Setup[]>('/setups'),
        ]);
        setProfile(me);
        setSetups(setupsResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      }
    };
    load();
  }, []);

  if (error) {
    return (
      <main className="content">
        <h1>Dashboard</h1>
        <p className="form-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="content">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumo do seu plano e setups configurados.</p>
        </div>
      </header>

      <section className="card-grid">
        <div className="card">
          <h3>Plano atual</h3>
          <p>
            {profile?.subscription?.plan.name ?? 'Sem plano ativo'}
            {profile?.subscription
              ? ` · ${profile.subscription.plan.description}`
              : ''}
          </p>
          {profile?.subscription ? (
            <ul className="list">
              <li>
                Indicadores ativos: até{' '}
                {profile.subscription.plan.maxIndicatorsActive}
              </li>
              <li>
                Mercados liberados:{' '}
                {profile.subscription.plan.allowedMarkets.join(', ')}
              </li>
            </ul>
          ) : null}
        </div>
        <div className="card">
          <h3>Indicadores liberados</h3>
          <p>
            {profile?.subscription?.indicators.length ?? 0} indicadores disponíveis
          </p>
          <ul className="list">
            {profile?.subscription?.indicators.map((indicator) => (
              <li key={indicator.id}>
                {indicator.code} · {indicator.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Meus setups</h3>
          <p>{setups.length} setups configurados</p>
          <ul className="list">
            {setups.slice(0, 4).map((setup) => (
              <li key={setup.id}>
                {setup.name} · {setup.symbol} · {setup.timeframe}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
