'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Toast } from '../../components/Toast';

type Indicator = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  maxIndicatorsActive: number;
  allowedMarkets: string[];
  planIndicators?: { indicator: Indicator }[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  subscriptions: { plan: Plan }[];
};

type AuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: { name: string; email: string };
};

export default function AdminPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [indicatorForm, setIndicatorForm] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
  });

  const loadAll = async () => {
    const [plansResponse, indicatorsResponse, usersResponse, auditsResponse] =
      await Promise.all([
        apiFetch<Plan[]>('/plans?includeIndicators=true'),
        apiFetch<Indicator[]>('/indicators'),
        apiFetch<User[]>('/users'),
        apiFetch<AuditLog[]>('/admin/audit'),
      ]);
    setPlans(plansResponse);
    setIndicators(indicatorsResponse);
    setUsers(usersResponse);
    setAudits(auditsResponse);
  };

  useEffect(() => {
    loadAll()
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar admin'),
      )
      .finally(() => setPageLoading(false));
  }, []);

  const indicatorOptions = useMemo(
    () =>
      indicators.map((indicator) => ({
        value: indicator.id,
        label: `${indicator.code} · ${indicator.name}`,
      })),
    [indicators],
  );

  const handleIndicatorSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch('/indicators', {
        method: 'POST',
        body: JSON.stringify({
          ...indicatorForm,
          isPremium: false,
          isActive: true,
          defaultParams: {},
          userParamsEditable: true,
        }),
      });
      setIndicatorForm({ code: '', name: '', description: '', category: '' });
      await loadAll();
      setToast('Indicador criado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar indicador');
    }
  };

  const handlePlanIndicators = async (planId: string, indicatorIds: string[]) => {
    setError(null);
    try {
      await apiFetch(`/plans/${planId}/indicators`, {
        method: 'POST',
        body: JSON.stringify({ indicatorIds }),
      });
      await loadAll();
      setToast('Plano atualizado com sucesso.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar plano',
      );
    }
  };

  const handleUserStatus = async (userId: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadAll();
      setToast('Status do usuário atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  const handleUserPlan = async (userId: string, planId: string) => {
    setError(null);
    try {
      await apiFetch(`/users/${userId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ planId }),
      });
      await loadAll();
      setToast('Plano do usuário atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao trocar plano');
    }
  };

  if (pageLoading) {
    return (
      <main className="content">
        <h1>Admin</h1>
        <p>Carregando painel administrativo...</p>
      </main>
    );
  }

  return (
    <main className="content">
      <header className="page-header">
        <div>
          <h1>Admin</h1>
          <p>Gestão de planos, indicadores, usuários e auditoria.</p>
        </div>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="card">
        <h3>Planos</h3>
        <div className="stack">
          {plans.map((plan) => {
            const selectedIds =
              plan.planIndicators?.map((item) => item.indicator.id) ?? [];
            return (
              <div key={plan.id} className="panel">
                <div className="panel-header">
                  <div>
                    <strong>{plan.name}</strong>
                    <p>{plan.description}</p>
                  </div>
                  <span className="badge">
                    {plan.maxIndicatorsActive} indicadores
                  </span>
                </div>
                <div className="chip-grid">
                  {indicatorOptions.map((option) => (
                    <label key={option.value} className="chip">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(option.value)}
                        onChange={(event) => {
                          const updated = event.target.checked
                            ? [...selectedIds, option.value]
                            : selectedIds.filter((id) => id !== option.value);
                          handlePlanIndicators(plan.id, updated);
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Novo indicador</h3>
        <form onSubmit={handleIndicatorSubmit} className="form">
          <div className="form-grid">
            <label>
              Código
              <input
                value={indicatorForm.code}
                onChange={(event) =>
                  setIndicatorForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Nome
              <input
                value={indicatorForm.name}
                onChange={(event) =>
                  setIndicatorForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Categoria
              <input
                value={indicatorForm.category}
                onChange={(event) =>
                  setIndicatorForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                required
              />
            </label>
          </div>
          <label>
            Descrição
            <input
              value={indicatorForm.description}
              onChange={(event) =>
                setIndicatorForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              required
            />
          </label>
          <button className="button" type="submit">
            Criar indicador
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Usuários</h3>
        <div className="table">
          <div className="table-row table-header">
            <span>Nome</span>
            <span>Email</span>
            <span>Status</span>
            <span>Plano</span>
            <span>Ações</span>
          </div>
          {users.map((user) => {
            const planId = user.subscriptions[0]?.plan?.id ?? '';
            return (
              <div className="table-row" key={user.id}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>{user.status}</span>
                <span>{user.subscriptions[0]?.plan?.name ?? '---'}</span>
                <span className="table-actions">
                  <select
                    value={planId}
                    onChange={(event) =>
                      handleUserPlan(user.id, event.target.value)
                    }
                  >
                    <option value="">Selecione plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() =>
                      handleUserStatus(
                        user.id,
                        user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                      )
                    }
                  >
                    {user.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Auditoria</h3>
        <div className="table">
          <div className="table-row table-header row-4">
            <span>Ação</span>
            <span>Alvo</span>
            <span>Ator</span>
            <span>Data</span>
          </div>
          {audits.map((audit) => (
            <div className="table-row row-4" key={audit.id}>
              <span>{audit.action}</span>
              <span>
                {audit.targetType} · {audit.targetId}
              </span>
              <span>{audit.actor?.name ?? 'N/A'}</span>
              <span>{new Date(audit.createdAt).toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </main>
  );
}
