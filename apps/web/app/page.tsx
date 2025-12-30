export default function HomePage() {
  return (
    <main>
      <header>
        <div>
          <div className="badge">MVP · Análise Técnica</div>
          <h1>Mesa diária do trader em um só lugar</h1>
          <p>
            Plataforma SaaS dedicada à análise técnica. Dados agregados, indicadores clássicos e
            proprietários e setups persistidos para o seu fluxo de mercado.
          </p>
        </div>
      </header>

      <section className="hero">
        <div className="card">
          <h3>Gráficos fiéis ao mercado</h3>
          <p>
            Infraestrutura preparada para dados agregados e múltiplos mercados (Forex, Índices e
            Cripto) com foco em clareza e velocidade.
          </p>
        </div>
        <div className="card">
          <h3>Indicadores sob medida</h3>
          <p>
            Combine indicadores clássicos e proprietários. Cada plano controla a quantidade de
            indicadores ativos e o acesso aos premium.
          </p>
        </div>
        <div className="card">
          <h3>Setups persistidos</h3>
          <p>
            Salve combinações de símbolo, timeframe e indicadores para abrir sua mesa de análise
            pronta todos os dias.
          </p>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Planos do MVP</h2>
          <span className="badge">Starter · Pro · Prime</span>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3>Starter</h3>
            <p>Até 3 indicadores ativos, mercados essenciais e setups básicos.</p>
          </div>
          <div className="card">
            <h3>Pro</h3>
            <p>Indicadores premium, mais mercados e prioridade em novas features.</p>
          </div>
          <div className="card">
            <h3>Prime</h3>
            <p>Acesso completo a indicadores proprietários e limites expandidos.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Escopo e segurança</h2>
        </div>
        <div className="notice">
          Esta plataforma é exclusivamente para análise técnica. Não executamos ordens, não
          integramos corretoras e não solicitamos credenciais de trading.
        </div>
        <ul className="list">
          <li>Autenticação segura de usuários e controle de papéis.</li>
          <li>Área administrativa com auditoria básica de ações.</li>
          <li>Setups persistidos por usuário e gestão de indicadores por plano.</li>
        </ul>
      </section>
    </main>
  );
}
