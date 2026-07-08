import { useState } from "react";
import { useCompassYtd } from "../../../api/hooks/useCompassYtd";
import {
  formatCompassCurrency,
  formatCompassPercent,
} from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassInfoButton } from "../help/CompassInfoButton";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassAnaliseYtdPage() {
  const { filters } = useCompassFilters();
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading, isFallback } = useCompassYtd(filters, { page, pageSize });

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando análise YTD…</p></main>;
  }

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Análise YTD</h1>
        <p className="compass-page__desc">
          Detalhamento linha a linha do cubo IBP Hyperion — IBP Atual vs Anterior com Variação (R$) e Variação (%).
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />

      <CompassPanel
        title="Tabela YTD — 11 colunas"
        infoId="ytd-table"
        desc={`${data.totalItems} linha(s) · página ${data.page} de ${data.totalPages}`}
      >
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Diretoria</th>
                <th>Unidade</th>
                <th>Família</th>
                <th>Tipo</th>
                <th>Matriz</th>
                <th>Conta</th>
                <th>
                  IBP Atual <CompassInfoButton infoId="ytd-col-ibp-atual" />
                </th>
                <th>
                  IBP Anterior <CompassInfoButton infoId="ytd-col-ibp-anterior" />
                </th>
                <th>
                  Variação <CompassInfoButton infoId="ytd-col-variacao" />
                </th>
                <th>Var. %</th>
                <th>Moeda</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>{row.diretoria}</td>
                  <td>{row.unidade}</td>
                  <td>{row.familia}</td>
                  <td>{row.tipo}</td>
                  <td>{row.matriz}</td>
                  <td>{row.conta}</td>
                  <td>{formatCompassCurrency(row.ibpAtual, row.moeda)}</td>
                  <td>{formatCompassCurrency(row.ibpAnterior, row.moeda)}</td>
                  <td className={row.variacao < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassCurrency(row.variacao, row.moeda)}
                  </td>
                  <td className={row.variacaoPct < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassPercent(row.variacaoPct)}
                  </td>
                  <td>{row.moeda}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}><strong>Totais filtrados</strong></td>
                <td>{formatCompassCurrency(data.totals.ibpAtual)}</td>
                <td>{formatCompassCurrency(data.totals.ibpAnterior)}</td>
                <td className={data.totals.variacao < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                  {formatCompassCurrency(data.totals.variacao)}
                </td>
                <td>{formatCompassPercent(data.totals.variacaoPct)}</td>
                <td>BRL</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="compass-ytd-pagination">
          <span className="compass-ytd-pagination__info">
            Exibindo {(data.page - 1) * data.pageSize + 1}–
            {Math.min(data.page * data.pageSize, data.totalItems)} de {data.totalItems}
          </span>
          <div className="compass-ytd-pagination__actions">
            <button
              type="button"
              className="compass-shell__reset"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className="compass-shell__reset"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </CompassPanel>

      <footer className="compass-page__footer">
        Variação = IBP Atual − IBP Anterior · origem Oracle Hyperion EPBCS
      </footer>
    </main>
  );
}
