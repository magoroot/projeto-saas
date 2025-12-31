'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type Setup = {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
};

type Indicator = {
  id: string;
  code: string;
  name: string;
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
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const [setupsResponse, me] = await Promise.all([
        apiFetch<Setup[]>('/setups'),
        apiFetch<MeResponse>('/auth/me'),
      ]);
      setSetups(setupsResponse);
      setAvailableIndicators(me.subscription?.indicators ?? []);
    };
    load();
  }, []);

  useEffect(() => {
    const setup = setups.find((item) => item.id === selectedSetupId);
    if (setup) {
      setSymbol(setup.symbol);
      setTimeframe(setup.timeframe);
      setActiveIndicators(setup.indicators);
    }
  }, [selectedSetupId, setups]);

  const toggleIndicator = (code: string) => {
    setActiveIndicators((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  };

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
      </section>

      <section className="card">
        <h3>Indicadores ativos</h3>
        <div className="chip-grid">
          {availableIndicators.map((indicator) => (
            <label key={indicator.id} className="chip">
              <input
                type="checkbox"
                checked={activeIndicators.includes(indicator.code)}
                onChange={() => toggleIndicator(indicator.code)}
              />
              {indicator.code} · {indicator.name}
            </label>
          ))}
        </div>
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
          Indicadores habilitados: {activeIndicators.join(', ') || '---'}
        </p>
        <div className="notice">
          Esta mesa é apenas para análise técnica. Nenhuma ordem é executada.
        </div>
      </section>
    </main>
  );
}
