import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  SCENARIO_PERIODS,
  SCENARIO_YEARS,
  useCompassScenarioRows,
  useCompassScenarios,
} from "../../../api/hooks/useCompassScenarios";
import type { CompassScenarioItemDto } from "../../../api/types";
import { CompassInfoButton } from "../help/CompassInfoButton";
import { CompassPanel } from "../help/CompassPanel";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

const PAGE_SIZE = 25;

const SCENARIO_ICONS: Record<string, string> = {
  "volume-toneladas": "fa-weight-hanging",
  "volume-qtde-vendas": "fa-boxes-stacked",
  "peso-financeiro": "fa-scale-balanced",
};

function formatAmount(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function unitLabel(scenarioId: string): string {
  if (scenarioId === "volume-toneladas") return "toneladas";
  if (scenarioId === "volume-qtde-vendas") return "unidades";
  return "peso";
}

function exportRowsCsv(
  scenarioName: string,
  rows: {
    sku: string;
    skuDescription: string;
    cliente: string;
    ung: string;
    entity: string;
    amount: number;
  }[],
  includeClienteUng: boolean,
) {
  const header = includeClienteUng
    ? ["SKU", "Descricao", "Cliente", "UN", "Entity", "Valor"]
    : ["SKU", "Descricao", "Entity", "Valor"];
  const lines = [
    header.join(";"),
    ...rows.map((r) => {
      const amount = r.amount.toString().replace(".", ",");
      if (includeClienteUng) {
        return [r.sku, r.skuDescription || "", r.cliente, r.ung, r.entity, amount].join(";");
      }
      return [r.sku, r.skuDescription || "", r.entity, amount].join(";");
    }),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `compass-cenario-${scenarioName.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CompassScenariosPage() {
  const [years, setYears] = useState<string>("FY26");
  const [period, setPeriod] = useState<string>("Jan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const filters = useMemo(
    () => ({ years, period, version: "Oficial", scenario: "Orcado" }),
    [years, period],
  );

  const { data, isLoading, isFallback } = useCompassScenarios(filters);
  const scenarios = data?.scenarios ?? [];
  const configured = data?.configured ?? false;
  const message = data?.message;

  useEffect(() => {
    if (!scenarios.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !scenarios.some((s) => s.id === selectedId)) {
      setSelectedId(scenarios[0].id);
    }
  }, [scenarios, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [selectedId, years, period, search]);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const {
    data: rowsPage,
    isLoading: rowsLoading,
    isFallback: rowsFallback,
  } = useCompassScenarioRows(selectedId, { ...filters, search: search || undefined }, page, PAGE_SIZE);

  const selectedScenario: CompassScenarioItemDto | undefined = scenarios.find((s) => s.id === selectedId);
  const isPesoFinanceiro = selectedId === "peso-financeiro";
  const searchPlaceholder = isPesoFinanceiro
    ? "Ex.: OVOMALTINE ou 120501011"
    : "Ex.: SKU_12007 ou PENNACCHI";

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Cenários
          <CompassInfoButton infoId="nav-cenarios" />
        </h1>
        <p className="compass-page__desc">
          Selecione um cenário para ver as linhas no Datalake (SKU, cliente, UN e valor). Clique no card e
          explore a tabela abaixo.
        </p>
      </div>

      <CompassFallbackBanner show={isFallback || rowsFallback} />

      {!isLoading && !configured ? (
        <div className="compass-fallback-banner" role="status">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>
            {message ?? "Datalake não configurado."}{" "}
            <Link to="/admin/configuracoes-backend?category=compass">
              Abrir Admin → Compass IBP
            </Link>
          </span>
        </div>
      ) : null}

      <div className="compass-scenarios-toolbar" role="group" aria-label="Filtros do cenário">
        <label className="compass-scenarios-toolbar__field">
          <span>Ano</span>
          <select value={years} onChange={(e) => setYears(e.target.value)} disabled={isLoading}>
            {SCENARIO_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="compass-scenarios-toolbar__field">
          <span>Período</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} disabled={isLoading}>
            {SCENARIO_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <p className="compass-scenarios-toolbar__hint">
          Oficial · Orçado · {years} · {period}
        </p>
      </div>

      {isLoading ? <p className="compass-page__desc">Carregando cenários do Datalake…</p> : null}

      <div className="compass-scenarios-grid" role="listbox" aria-label="Cenários disponíveis">
        {scenarios.map((s) => {
          const selected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`compass-scenario-card compass-scenario-card--interactive${selected ? " compass-scenario-card--selected" : ""}`}
              onClick={() => setSelectedId(s.id)}
            >
              {selected ? <span className="compass-scenario-card__badge">Selecionado</span> : null}
              <div className="compass-scenario-card__icon" aria-hidden="true">
                <i className={`fa-solid ${SCENARIO_ICONS[s.id] ?? "fa-chart-simple"}`} />
              </div>
              <h2>{s.name}</h2>
              <p>{s.description}</p>
              <div className="compass-scenario-card__kpi">
                <span className="compass-scenario-card__kpi-label">Total ({unitLabel(s.id)})</span>
                <strong className="compass-scenario-card__kpi-value">{formatAmount(s.totalAmount)}</strong>
              </div>
              <div className="compass-scenario-card__meta">
                <span>{s.rowCount.toLocaleString("pt-BR")} linhas</span>
                <span className="compass-scenario-card__cta">
                  Ver linhas <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isLoading && configured && scenarios.length === 0 ? (
        <p className="compass-page__desc">Nenhum dado retornado para os filtros atuais.</p>
      ) : null}

      {selectedScenario && configured ? (
        <CompassPanel
          title={`${selectedScenario.name} — detalhe`}
          infoId="nav-cenarios"
          desc={
            rowsPage
              ? `${rowsPage.totalCount.toLocaleString("pt-BR")} linha(s) · total ${formatAmount(rowsPage.totalAmount)} · página ${rowsPage.page} de ${Math.max(rowsPage.totalPages, 1)}${isPesoFinanceiro ? " · consolidado por SKU (sem cliente/UN)" : ""}`
              : "Carregando detalhe…"
          }
        >
          <div className="compass-scenarios-detail-toolbar">
            <label className="compass-scenarios-toolbar__field compass-scenarios-toolbar__field--grow">
              <span>{isPesoFinanceiro ? "Buscar SKU ou descrição" : "Buscar SKU ou cliente"}</span>
              <input
                type="search"
                value={searchInput}
                placeholder={searchPlaceholder}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="compass-shell__reset"
              disabled={!rowsPage?.items.length}
              onClick={() => {
                if (rowsPage?.items.length) {
                  exportRowsCsv(selectedScenario.name, rowsPage.items, !isPesoFinanceiro);
                }
              }}
            >
              <i className="fa-solid fa-file-csv" aria-hidden="true" /> Exportar CSV (página)
            </button>
          </div>

          {rowsLoading ? (
            <p className="compass-page__desc">Carregando linhas…</p>
          ) : (
            <>
              <div className="compass-table-wrap">
                <table className="audit-trail-page__table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Descrição</th>
                      {!isPesoFinanceiro ? <th>Cliente</th> : null}
                      {!isPesoFinanceiro ? <th>UN</th> : null}
                      <th>Entity</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rowsPage?.items ?? []).map((row, index) => (
                      <tr key={`${row.sku}-${row.cliente}-${row.ung}-${index}`}>
                        <td>{row.sku.replace(/^SKU_/, "")}</td>
                        <td>{row.skuDescription?.trim() ? row.skuDescription : "—"}</td>
                        {!isPesoFinanceiro ? (
                          <td>{row.cliente === "NA_Cliente" ? "—" : row.cliente}</td>
                        ) : null}
                        {!isPesoFinanceiro ? (
                          <td>{row.ung === "NA_UNG" ? "—" : row.ung}</td>
                        ) : null}
                        <td>{row.entity}</td>
                        <td>{formatAmount(row.amount)}</td>
                      </tr>
                    ))}
                    {!rowsPage?.items.length ? (
                      <tr>
                        <td colSpan={isPesoFinanceiro ? 4 : 6}>Nenhuma linha encontrada para a busca/filtros.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {rowsPage && rowsPage.totalPages > 0 ? (
                <div className="compass-ytd-pagination">
                  <span className="compass-ytd-pagination__info">
                    Exibindo {(rowsPage.page - 1) * rowsPage.pageSize + 1}–
                    {Math.min(rowsPage.page * rowsPage.pageSize, rowsPage.totalCount)} de{" "}
                    {rowsPage.totalCount.toLocaleString("pt-BR")}
                  </span>
                  <div className="compass-ytd-pagination__actions">
                    <button
                      type="button"
                      className="compass-shell__reset"
                      disabled={rowsPage.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      className="compass-shell__reset"
                      disabled={rowsPage.page >= rowsPage.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CompassPanel>
      ) : null}

      <footer className="compass-page__footer">
        Cenários IBP · Datalake public.etl_hyperion
      </footer>
    </main>
  );
}
