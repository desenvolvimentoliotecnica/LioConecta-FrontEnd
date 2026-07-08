import { CompassInfoButton } from "../help/CompassInfoButton";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassReportsPage() {
  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Relatórios
          <CompassInfoButton infoId="nav-relatorios" />
        </h1>
        <p className="compass-page__desc">
          Exportações executivas do ciclo IBP e dados Oracle Hyperion EPBCS (YTD, agregações, bridges).
        </p>
      </div>

      <div className="compass-reports-grid">
        <article className="compass-report-card compass-report-card--disabled">
          <i className="fa-solid fa-file-pdf" aria-hidden="true" />
          <h2>Relatório executivo YTD</h2>
          <p>PDF com KPIs Hyperion, matriz Diretoria×Tipo e decisões do ciclo.</p>
          <span className="compass-report-card__badge">Em breve</span>
        </article>
        <article className="compass-report-card compass-report-card--disabled">
          <i className="fa-solid fa-file-excel" aria-hidden="true" />
          <h2>Exportação YTD completa</h2>
          <p>Planilha 11 colunas via /compass/ytd com filtros aplicados.</p>
          <span className="compass-report-card__badge">Em breve</span>
        </article>
        <article className="compass-report-card compass-report-card--disabled">
          <i className="fa-solid fa-chart-line" aria-hidden="true" />
          <h2>Bridge de variância P&L</h2>
          <p>Decomposição IBP Anterior → IBP Atual (receita).</p>
          <span className="compass-report-card__badge">Em breve</span>
        </article>
      </div>

      <footer className="compass-page__footer">Relatórios IBP · Oracle Hyperion EPBCS</footer>
    </main>
  );
}
