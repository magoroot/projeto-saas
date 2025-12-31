'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Toast } from '../components/Toast';

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
  indicators: { code: string; enabled?: boolean; params?: Record<string, unknown> }[];
  updatedAt: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [me, setupsResponse, plansResponse] = await Promise.all([
          apiFetch<MeResponse>('/auth/me'),
          apiFetch<Setup[]>('/setups'),
          apiFetch<Plan[]>('/plans'),
        ]);
        setProfile(me);
        setSetups(setupsResponse);
        setPlans(plansResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePlanConfirm = async () => {
    if (!selectedPlanId) {
      setToast('Escolha um plano para continuar.');
      return;
    }
    try {
      await apiFetch('/subscriptions/select', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      const me = await apiFetch<MeResponse>('/auth/me');
      setProfile(me);
      setToast('Plano atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar plano');
    }
  };

  if (loading) {
    return (
      <main className="content">
        <h1>Dashboard</h1>
        <p>Carregando dados...</p>
      </main>
    );
  }

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

      {!profile?.subscription ? (
        <section className="card">
          <h3>Onboarding</h3>
          <p>Selecione um plano para liberar indicadores e setups.</p>
          <div className="form-grid">
            <label>
              Plano
              <select
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
              >
                <option value="">Selecione</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.description}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="button" type="button" onClick={handlePlanConfirm}>
            Confirmar plano
          </button>
        </section>
      ) : null}

      {profile?.subscription && setups.length === 0 ? (
        <section className="card">
          <h3>Onboarding rápido</h3>
          <p>Crie seu primeiro setup para começar a usar a mesa.</p>
          <div className="empty-state">
            Nenhum setup encontrado. Vá para “Meus Setups” e crie o primeiro.
          </div>
        </section>
      ) : null}

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
          {profile?.subscription?.indicators.length ? (
            <ul className="list">
              {profile?.subscription?.indicators.map((indicator) => (
                <li key={indicator.id}>
                  {indicator.code} · {indicator.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">Sem indicadores liberados.</div>
          )}
        </div>
        <div className="card">
          <h3>Meus setups</h3>
          <p>{setups.length} setups configurados</p>
          {setups.length ? (
            <ul className="list">
              {setups.slice(0, 4).map((setup) => (
                <li key={setup.id}>
                  {setup.name} · {setup.symbol} · {setup.timeframe}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">Nenhum setup criado ainda.</div>
          )}
        </div>
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </main>
  );
}
