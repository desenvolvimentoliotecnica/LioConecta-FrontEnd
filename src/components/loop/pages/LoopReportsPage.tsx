import "../../../styles/loop-dashboard.css";

export function LoopReportsPage() {
  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Relatórios</h1>
        <p className="loop-page__desc">Exportações e relatórios executivos do portfólio de projetos.</p>
      </div>

      <div className="loop-reports-grid">
        <article className="loop-report-card loop-report-card--disabled">
          <i className="fa-solid fa-file-pdf" aria-hidden="true" />
          <h2>Relatório executivo semanal</h2>
          <p>PDF com KPIs, alertas e status dos projetos.</p>
          <span className="loop-report-card__badge">Em breve</span>
        </article>
        <article className="loop-report-card loop-report-card--disabled">
          <i className="fa-solid fa-file-excel" aria-hidden="true" />
          <h2>Exportação de atividades</h2>
          <p>Planilha com todas as atividades filtradas.</p>
          <span className="loop-report-card__badge">Em breve</span>
        </article>
        <article className="loop-report-card loop-report-card--disabled">
          <i className="fa-solid fa-chart-line" aria-hidden="true" />
          <h2>Evolução de desempenho</h2>
          <p>Série histórica do índice de desempenho.</p>
          <span className="loop-report-card__badge">Em breve</span>
        </article>
      </div>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
