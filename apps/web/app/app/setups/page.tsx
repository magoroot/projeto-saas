'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type Setup = {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  indicators: { code: string; enabled?: boolean; params?: Record<string, unknown> }[];
  isDefault: boolean;
};

type SetupFormState = {
  id?: string;
  name: string;
  symbol: string;
  timeframe: string;
  indicators: string;
  isDefault: boolean;
};

const defaultFormState: SetupFormState = {
  name: '',
  symbol: '',
  timeframe: '',
  indicators: '',
  isDefault: false,
};

export default function SetupsPage() {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [formState, setFormState] = useState<SetupFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSetups = async () => {
    const response = await apiFetch<Setup[]>('/setups');
    setSetups(response);
  };

  useEffect(() => {
    loadSetups().catch((err) =>
      setError(err instanceof Error ? err.message : 'Erro ao carregar setups'),
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name: formState.name,
      symbol: formState.symbol,
      timeframe: formState.timeframe,
      indicators: formState.indicators
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((code) => ({ code, enabled: true, params: {} })),
      isDefault: formState.isDefault,
    };

    try {
      if (formState.id) {
        await apiFetch(`/setups/${formState.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/setups', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setFormState(defaultFormState);
      await loadSetups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar setup');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setup: Setup) => {
    setFormState({
      id: setup.id,
      name: setup.name,
      symbol: setup.symbol,
      timeframe: setup.timeframe,
      indicators: setup.indicators.map((item) => item.code).join(', '),
      isDefault: setup.isDefault,
    });
  };

  const handleDelete = async (setupId: string) => {
    setError(null);
    try {
      await apiFetch(`/setups/${setupId}`, { method: 'DELETE' });
      await loadSetups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover setup');
    }
  };

  return (
    <main className="content">
      <header className="page-header">
        <div>
          <h1>Meus Setups</h1>
          <p>Crie e organize seus setups de indicadores.</p>
        </div>
      </header>

      <section className="card">
        <h3>{formState.id ? 'Editar setup' : 'Novo setup'}</h3>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label>
              Nome
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Ativo
              <input
                value={formState.symbol}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    symbol: event.target.value,
                  }))
                }
                placeholder="BTCUSDT"
                required
              />
            </label>
            <label>
              Timeframe
              <input
                value={formState.timeframe}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    timeframe: event.target.value,
                  }))
                }
                placeholder="1h"
                required
              />
            </label>
          </div>
          <label>
            Indicadores (separados por vírgula)
            <input
              value={formState.indicators}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  indicators: event.target.value,
                }))
              }
              placeholder="MA, RSI"
              required
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={formState.isDefault}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  isDefault: event.target.checked,
                }))
              }
            />
            Definir como setup padrão
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading
                ? 'Salvando...'
                : formState.id
                ? 'Atualizar'
                : 'Criar'}
            </button>
            {formState.id ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setFormState(defaultFormState)}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card">
        <h3>Setups cadastrados</h3>
        <div className="table">
          <div className="table-row table-header">
            <span>Nome</span>
            <span>Ativo</span>
            <span>Timeframe</span>
            <span>Indicadores</span>
            <span>Ações</span>
          </div>
          {setups.map((setup) => (
            <div className="table-row" key={setup.id}>
              <span>{setup.name}</span>
              <span>{setup.symbol}</span>
              <span>{setup.timeframe}</span>
              <span>{setup.indicators.map((item) => item.code).join(', ')}</span>
              <span className="table-actions">
                <button
                  className="link-button"
                  type="button"
                  onClick={() => handleEdit(setup)}
                >
                  Editar
                </button>
                <button
                  className="link-button danger"
                  type="button"
                  onClick={() => handleDelete(setup.id)}
                >
                  Remover
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
