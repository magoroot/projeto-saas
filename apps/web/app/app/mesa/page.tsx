'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Toast } from '../../components/Toast';

type Setup = {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  indicators: SetupIndicator[];
  isDefault: boolean;
};

type Indicator = {
  id: string;
  code: string;
  name: string;
};

type SetupIndicator = {
  code: string;
  enabled?: boolean;
  params?: Record<string, unknown>;
};

type MeResponse = {
  subscription: {
    plan: {
      maxIndicatorsActive: number;
      name: string;
    };
    indicators: Indicator[];
  } | null;
};

export default function WorkspacePage() {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [selectedSetupId, setSelectedSetupId] = useState<string>('');
  const [setupName, setSetupName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [indicatorState, setIndicatorState] = useState<
    Record<string, SetupIndicator>
  >({});
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [planLimit, setPlanLimit] = useState<number>(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [setupsResponse, me] = await Promise.all([
        apiFetch<Setup[]>('/setups'),
        apiFetch<MeResponse>('/auth/me'),
      ]);
      setSetups(setupsResponse);
      setAvailableIndicators(me.subscription?.indicators ?? []);
      setPlanLimit(me.subscription?.plan.maxIndicatorsActive ?? 0);
    };
    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar mesa'),
      )
      .finally(() => setPageLoading(false));
  }, []);

  useEffect(() => {
    const setup =
      setups.find((item) => item.id === selectedSetupId) ??
      setups.find((item) => item.isDefault);
    if (setup) {
      setSelectedSetupId(setup.id);
      setSetupName(setup.name);
      setSymbol(setup.symbol);
      setTimeframe(setup.timeframe);
      setIsDefault(setup.isDefault);
      setIndicatorState(
        setup.indicators.reduce<Record<string, SetupIndicator>>(
          (acc, indicator) => {
            acc[indicator.code] = {
              code: indicator.code,
              enabled: indicator.enabled ?? true,
              params: indicator.params ?? {},
            };
            return acc;
          },
          {},
        ),
      );
    }
  }, [selectedSetupId, setups]);

  const toggles = useMemo(() => {
    const base: Record<string, SetupIndicator> = {};
    for (const indicator of availableIndicators) {
      base[indicator.code] = {
        code: indicator.code,
        enabled: indicatorState[indicator.code]?.enabled ?? false,
        params: indicatorState[indicator.code]?.params ?? {},
      };
    }
    return base;
  }, [availableIndicators, indicatorState]);

  const toggleIndicator = (code: string) => {
    setIndicatorState((prev) => ({
      ...prev,
      [code]: {
        code,
        enabled: !(prev[code]?.enabled ?? false),
        params: prev[code]?.params ?? {},
      },
    }));
  };

  const updateParams = (code: string, value: string) => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = value ? (JSON.parse(value) as Record<string, unknown>) : {};
    } catch (error) {
      setError('Parâmetros inválidos. Use JSON válido.');
      return;
    }
    setError(null);
    setIndicatorState((prev) => ({
      ...prev,
      [code]: {
        code,
        enabled: prev[code]?.enabled ?? true,
        params: parsed,
      },
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!setupName || !symbol || !timeframe) {
      setError('Preencha nome, ativo e timeframe antes de salvar.');
      return;
    }
    setSaving(true);
    const payload = {
      name: setupName,
      symbol,
      timeframe,
      indicators: Object.values(toggles),
      isDefault,
    };

    try {
      if (selectedSetupId) {
        await apiFetch(`/setups/${selectedSetupId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setToast('Setup atualizado na mesa.');
      } else {
        await apiFetch('/setups', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setToast('Setup criado na mesa.');
      }
      const setupsResponse = await apiFetch<Setup[]>('/setups');
      setSetups(setupsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar setup');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="content">
        <h1>Mesa</h1>
        <p>Carregando mesa...</p>
      </main>
    );
  }

  return (
    <main className="content">
      <header className="page-header">
        <div>
          <h1>Mesa</h1>
          <p>Selecione o ativo e carregue seu setup favorito.</p>
        </div>
      </header>

      <section className="card">
        <div className="form-grid">
          <label>
            Setup
            <select
              value={selectedSetupId}
              onChange={(event) => setSelectedSetupId(event.target.value)}
            >
              <option value="">Selecione</option>
              {setups.map((setup) => (
                <option key={setup.id} value={setup.id}>
                  {setup.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nome do setup
            <input
              value={setupName}
              onChange={(event) => setSetupName(event.target.value)}
              placeholder="Mesa padrão"
            />
          </label>
          <label>
            Ativo
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="BTCUSDT"
            />
          </label>
          <label>
            Timeframe
            <input
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
              placeholder="1h"
            />
          </label>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
          />
          Definir como setup padrão
        </label>
      </section>

      <section className="card">
        <div className="section-title">
          <h3>Indicadores ativos</h3>
          <span className="badge">
            Limite: {planLimit > 0 ? planLimit : '---'}
          </span>
        </div>
        <div className="stack">
          {availableIndicators.map((indicator) => {
            const isEnabled = toggles[indicator.code]?.enabled ?? false;
            return (
              <div className="panel" key={indicator.id}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleIndicator(indicator.code)}
                  />
                  {indicator.code} · {indicator.name}
                </label>
                {isEnabled ? (
                  <label>
                    Params (JSON)
                    <input
                      defaultValue={JSON.stringify(
                        toggles[indicator.code]?.params ?? {},
                      )}
                      onBlur={(event) =>
                        updateParams(indicator.code, event.target.value)
                      }
                    />
                  </label>
                ) : null}
              </div>
            );
          })}
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar setup'}
        </button>
      </section>

      <section className="card">
        <h3>Resumo do workspace</h3>
        <p>
          Ativo selecionado: <strong>{symbol || '---'}</strong>
        </p>
        <p>
          Timeframe: <strong>{timeframe || '---'}</strong>
        </p>
        <p>
          Indicadores habilitados:{' '}
          {Object.values(toggles)
            .filter((indicator) => indicator.enabled)
            .map((indicator) => indicator.code)
            .join(', ') || '---'}
        </p>
        <div className="notice">
          Esta mesa é apenas para análise técnica. Nenhuma ordem é executada.
        </div>
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </main>
  );
}
