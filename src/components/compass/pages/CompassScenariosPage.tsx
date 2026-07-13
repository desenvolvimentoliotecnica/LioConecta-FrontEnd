import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  SCENARIO_PERIODS,
  SCENARIO_YEARS,
  hasActiveRowFilters,
  useCompassScenarioRows,
  useCompassScenarios,
  type CompassScenarioSortBy,
  type CompassScenarioSortDir,
} from "../../../api/hooks/useCompassScenarios";
import type { CompassScenarioItemDto } from "../../../api/types";
import { CompassInfoButton } from "../help/CompassInfoButton";
import { CompassPanel } from "../help/CompassPanel";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

const PAGE_SIZE = 25;
const INFINITE_PAGE_SIZE = 50;

const SCENARIO_ICONS: Record<string, string> = {
  "volume-toneladas": "fa-weight-hanging",
  "volume-qtde-vendas": "fa-boxes-stacked",
  "peso-financeiro": "fa-scale-balanced",
  "mock-mix-produtos": "fa-layer-group",
  "mock-margem-bruta": "fa-percent",
  "mock-receita-liquida": "fa-coins",
  "mock-custo-variavel": "fa-tags",
  "mock-forecast-orcado": "fa-chart-line",
};

/** Placeholders locais — sem detalhe/API até o Datalake expor o cenário. */
const MOCK_SCENARIO_CARDS: CompassScenarioItemDto[] = [
  {
    id: "mock-mix-produtos",
    account: "Mix_Produtos",
    name: "Mix de produtos",
    description: "Participação por família e SKU no mix de vendas.",
    rowCount: 0,
    totalAmount: 0,
    status: "em-breve",
  },
  {
    id: "mock-margem-bruta",
    account: "Margem_Bruta",
    name: "Margem bruta",
    description: "Margem bruta por canal, cliente e unidade de negócio.",
    rowCount: 0,
    totalAmount: 0,
    status: "em-breve",
  },
  {
    id: "mock-receita-liquida",
    account: "Receita_Liquida",
    name: "Receita líquida",
    description: "Receita líquida consolidada do ciclo IBP orçado.",
    rowCount: 0,
    totalAmount: 0,
    status: "em-breve",
  },
  {
    id: "mock-custo-variavel",
    account: "Custo_Variavel",
    name: "Custo variável",
    description: "Custos variáveis por SKU e estrutura de contribuição.",
    rowCount: 0,
    totalAmount: 0,
    status: "em-breve",
  },
  {
    id: "mock-forecast-orcado",
    account: "Forecast_vs_Orcado",
    name: "Forecast × Orçado",
    description: "Comparativo de previsão versus orçado no período.",
    rowCount: 0,
    totalAmount: 0,
    status: "em-breve",
  },
];

function isScenarioInteractive(scenario: CompassScenarioItemDto): boolean {
  return scenario.status !== "em-breve" && !scenario.id.startsWith("mock-");
}

type ColumnFilters = {
  sku: string;
  skuDescription: string;
  cliente: string;
  ungLabel: string;
  entity: string;
};

const EMPTY_COLUMN_FILTERS: ColumnFilters = {
  sku: "",
  skuDescription: "",
  cliente: "",
  ungLabel: "",
  entity: "",
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

function formatCliente(row: { cliente: string; clienteNome?: string }): string {
  if (row.cliente === "NA_Cliente") return "—";
  return row.clienteNome?.trim() || row.cliente.replace(/^CLI_/, "") || "—";
}

function formatUng(row: { ung: string; ungNome?: string }): string {
  if (row.ung === "NA_UNG") return "—";
  return row.ungNome?.trim() || row.ung.replace(/^UN_/, "UN ") || "—";
}

function exportRowsCsv(
  scenarioName: string,
  rows: {
    sku: string;
    skuDescription: string;
    cliente: string;
    clienteNome: string;
    ung: string;
    ungNome: string;
    entity: string;
    amount: number;
  }[],
  includeClienteUng: boolean,
) {
  const header = includeClienteUng
    ? ["SKU", "Descricao", "Cliente", "ClienteCodigo", "UN", "UNCodigo", "Entity", "Valor"]
    : ["SKU", "Descricao", "Entity", "Valor"];
  const lines = [
    header.join(";"),
    ...rows.map((r) => {
      const amount = r.amount.toString().replace(".", ",");
      if (includeClienteUng) {
        return [
          r.sku,
          r.skuDescription || "",
          formatCliente(r),
          r.cliente,
          formatUng(r),
          r.ung,
          r.entity,
          amount,
        ].join(";");
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

const DESC_MAX_LEN = 45;

function truncateDescription(value: string): { display: string; title?: string } {
  const full = value.trim();
  if (!full) return { display: "—" };
  if (full.length <= DESC_MAX_LEN) return { display: full };
  return { display: `${full.slice(0, DESC_MAX_LEN)}…`, title: full };
}

function ScenarioSortFilterHeader({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  align = "left",
  autoFit = true,
}: {
  label: string;
  column: CompassScenarioSortBy;
  sortBy: CompassScenarioSortBy;
  sortDir: CompassScenarioSortDir;
  onSort: (column: CompassScenarioSortBy) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  align?: "left" | "center" | "right";
  autoFit?: boolean;
}) {
  const active = sortBy === column;
  const className = [
    "compass-col-head",
    autoFit ? "compass-col-head--autofit" : "compass-col-head--desc",
    align === "center" ? "compass-col-head--center" : "",
    align === "right" ? "compass-col-head--right" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <th className={className} aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={`compass-col-sort${active ? " is-active" : ""}`} onClick={() => onSort(column)}>
        <span>{label}</span>
        <i
          className={`fa-solid ${
            active ? (sortDir === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"
          }`}
          aria-hidden="true"
        />
      </button>
      {onFilterChange ? (
        <input
          type="search"
          className="compass-col-filter"
          value={filterValue ?? ""}
          placeholder={filterPlaceholder ?? "Filtrar…"}
          aria-label={`Filtrar ${label}`}
          onChange={(e) => onFilterChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
    </th>
  );
}

export function CompassScenariosPage() {
  const [years, setYears] = useState<string>("FY26");
  const [period, setPeriod] = useState<string>("Jan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [columnFiltersInput, setColumnFiltersInput] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS);
  const [sortBy, setSortBy] = useState<CompassScenarioSortBy>("amount");
  const [sortDir, setSortDir] = useState<CompassScenarioSortDir>("desc");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo(
    () => ({ years, period, version: "Oficial", scenario: "Orcado" }),
    [years, period],
  );

  const rowFilters = useMemo(
    () => ({
      ...filters,
      search: search || undefined,
      sku: columnFilters.sku || undefined,
      skuDescription: columnFilters.skuDescription || undefined,
      cliente: columnFilters.cliente || undefined,
      ungLabel: columnFilters.ungLabel || undefined,
      entity: columnFilters.entity || undefined,
      sortBy,
      sortDir,
    }),
    [filters, search, columnFilters, sortBy, sortDir],
  );

  const isFiltered = hasActiveRowFilters(rowFilters);
  const rowsMode = isFiltered ? "infinite" : "page";

  const { data, isLoading, isFallback } = useCompassScenarios(filters);
  const liveScenarios = data?.scenarios ?? [];
  const scenarios = useMemo(
    () => [...liveScenarios, ...MOCK_SCENARIO_CARDS],
    [liveScenarios],
  );
  const interactiveScenarios = useMemo(
    () => scenarios.filter(isScenarioInteractive),
    [scenarios],
  );
  const configured = data?.configured ?? false;
  const message = data?.message;
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateCarouselScrollState = () => {
    const track = carouselTrackRef.current;
    if (!track) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft < maxScroll - 4);
  };

  const scrollCarousel = (direction: -1 | 1) => {
    const track = carouselTrackRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.72, 280);
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const track = carouselTrackRef.current;
    if (!track) return;
    updateCarouselScrollState();
    const onScroll = () => updateCarouselScrollState();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scenarios.length, isLoading]);

  useEffect(() => {
    if (!interactiveScenarios.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !interactiveScenarios.some((s) => s.id === selectedId)) {
      setSelectedId(interactiveScenarios[0].id);
    }
  }, [interactiveScenarios, selectedId]);

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setColumnFiltersInput(EMPTY_COLUMN_FILTERS);
    setColumnFilters(EMPTY_COLUMN_FILTERS);
    setSortBy("amount");
    setSortDir("desc");
  }, [selectedId, years, period]);

  useEffect(() => {
    setPage(1);
  }, [search, columnFilters, sortBy, sortDir]);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const handle = window.setTimeout(
      () =>
        setColumnFilters({
          sku: columnFiltersInput.sku.trim(),
          skuDescription: columnFiltersInput.skuDescription.trim(),
          cliente: columnFiltersInput.cliente.trim(),
          ungLabel: columnFiltersInput.ungLabel.trim(),
          entity: columnFiltersInput.entity.trim(),
        }),
      300,
    );
    return () => window.clearTimeout(handle);
  }, [columnFiltersInput]);

  const {
    data: rowsPage,
    isLoading: rowsLoading,
    isFallback: rowsFallback,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCompassScenarioRows(selectedId, rowFilters, {
    mode: rowsMode,
    page,
    pageSize: isFiltered ? INFINITE_PAGE_SIZE : PAGE_SIZE,
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !isFiltered || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isFiltered, hasNextPage, isFetchingNextPage, fetchNextPage, rowsPage?.items.length]);

  const selectedScenario: CompassScenarioItemDto | undefined = interactiveScenarios.find(
    (s) => s.id === selectedId,
  );
  const isPesoFinanceiro = selectedId === "peso-financeiro";
  const searchPlaceholder = isPesoFinanceiro
    ? "Ex.: OVOMALTINE ou 120501011"
    : "Ex.: AB BR07, Food Service ou 120501";

  const toggleSort = (column: CompassScenarioSortBy) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir(column === "amount" ? "desc" : "asc");
  };

  const updateColumnFilter = (key: keyof ColumnFilters, value: string) => {
    setColumnFiltersInput((prev) => ({ ...prev, [key]: value }));
  };

  const loadedCount = rowsPage?.items.length ?? 0;
  const detailDesc = rowsPage
    ? isFiltered
      ? `${rowsPage.totalCount.toLocaleString("pt-BR")} linha(s) · total ${formatAmount(rowsPage.totalAmount)} · carregadas ${loadedCount.toLocaleString("pt-BR")}${isPesoFinanceiro ? " · consolidado por SKU (sem cliente/UN)" : ""}`
      : `${rowsPage.totalCount.toLocaleString("pt-BR")} linha(s) · total ${formatAmount(rowsPage.totalAmount)} · página ${rowsPage.page} de ${Math.max(rowsPage.totalPages, 1)}${isPesoFinanceiro ? " · consolidado por SKU (sem cliente/UN)" : ""}`
    : "Carregando detalhe…";

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

      <div className="compass-scenarios-carousel" aria-label="Cenários disponíveis">
        <button
          type="button"
          className="compass-scenarios-carousel__nav compass-scenarios-carousel__nav--prev"
          aria-label="Cenários anteriores"
          disabled={!canScrollPrev}
          onClick={() => scrollCarousel(-1)}
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
        <div
          ref={carouselTrackRef}
          className="compass-scenarios-carousel__track"
          role="listbox"
          aria-label="Lista de cenários"
        >
          {scenarios.map((s) => {
            const interactive = isScenarioInteractive(s);
            const selected = interactive && s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={!interactive}
                disabled={!interactive}
                title={interactive ? undefined : "Cenário em breve — mock sem detalhe"}
                className={[
                  "compass-scenario-card",
                  interactive ? "compass-scenario-card--interactive" : "compass-scenario-card--mock",
                  selected ? "compass-scenario-card--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (interactive) setSelectedId(s.id);
                }}
              >
                {selected ? <span className="compass-scenario-card__badge">Selecionado</span> : null}
                {!interactive ? (
                  <span className="compass-scenario-card__badge compass-scenario-card__badge--soon">
                    Em breve
                  </span>
                ) : null}
                <div className="compass-scenario-card__icon" aria-hidden="true">
                  <i className={`fa-solid ${SCENARIO_ICONS[s.id] ?? "fa-chart-simple"}`} />
                </div>
                <h2>{s.name}</h2>
                <p title={s.description}>{s.description}</p>
                <div className="compass-scenario-card__kpi">
                  <span className="compass-scenario-card__kpi-label">
                    Total ({interactive ? unitLabel(s.id) : "—"})
                  </span>
                  <strong className="compass-scenario-card__kpi-value">
                    {interactive ? formatAmount(s.totalAmount) : "—"}
                  </strong>
                </div>
                <div className="compass-scenario-card__meta">
                  <span>
                    {interactive
                      ? `${s.rowCount.toLocaleString("pt-BR")} linhas`
                      : "Mock · sem detalhe"}
                  </span>
                  <span className="compass-scenario-card__cta">
                    {interactive ? (
                      <>
                        Ver linhas <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </>
                    ) : (
                      "Indisponível"
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="compass-scenarios-carousel__nav compass-scenarios-carousel__nav--next"
          aria-label="Próximos cenários"
          disabled={!canScrollNext}
          onClick={() => scrollCarousel(1)}
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>

      {!isLoading && configured && liveScenarios.length === 0 ? (
        <p className="compass-page__desc">Nenhum dado retornado para os filtros atuais.</p>
      ) : null}

      {selectedScenario && configured ? (
        <CompassPanel title={`${selectedScenario.name} — detalhe`} infoId="nav-cenarios" desc={detailDesc}>
          <div className="compass-scenarios-detail-toolbar">
            <label className="compass-scenarios-toolbar__field compass-scenarios-toolbar__field--grow">
              <span>{isPesoFinanceiro ? "Buscar SKU ou descrição" : "Buscar SKU, cliente ou UN"}</span>
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
              <i className="fa-solid fa-file-csv" aria-hidden="true" />{" "}
              {isFiltered ? "Exportar CSV (carregados)" : "Exportar CSV (página)"}
            </button>
          </div>

          {rowsLoading ? (
            <p className="compass-page__desc">Carregando linhas…</p>
          ) : (
            <>
              <div className="compass-table-wrap">
                <table className="audit-trail-page__table compass-scenarios-table">
                  <thead>
                    <tr>
                      <ScenarioSortFilterHeader
                        label="SKU"
                        column="sku"
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        filterValue={columnFiltersInput.sku}
                        onFilterChange={(v) => updateColumnFilter("sku", v)}
                        filterPlaceholder="SKU…"
                        align="center"
                      />
                      <ScenarioSortFilterHeader
                        label="Descrição"
                        column="skuDescription"
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        filterValue={columnFiltersInput.skuDescription}
                        onFilterChange={(v) => updateColumnFilter("skuDescription", v)}
                        filterPlaceholder="Descrição…"
                        autoFit={false}
                      />
                      {!isPesoFinanceiro ? (
                        <ScenarioSortFilterHeader
                          label="Cliente"
                          column="cliente"
                          sortBy={sortBy}
                          sortDir={sortDir}
                          onSort={toggleSort}
                          filterValue={columnFiltersInput.cliente}
                          onFilterChange={(v) => updateColumnFilter("cliente", v)}
                          filterPlaceholder="Cliente…"
                        />
                      ) : null}
                      {!isPesoFinanceiro ? (
                        <ScenarioSortFilterHeader
                          label="UN"
                          column="ung"
                          sortBy={sortBy}
                          sortDir={sortDir}
                          onSort={toggleSort}
                          filterValue={columnFiltersInput.ungLabel}
                          onFilterChange={(v) => updateColumnFilter("ungLabel", v)}
                          filterPlaceholder="UN…"
                        />
                      ) : null}
                      <ScenarioSortFilterHeader
                        label="Entity"
                        column="entity"
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        filterValue={columnFiltersInput.entity}
                        onFilterChange={(v) => updateColumnFilter("entity", v)}
                        filterPlaceholder="Entity…"
                        align="center"
                      />
                      <ScenarioSortFilterHeader
                        label="Valor"
                        column="amount"
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        align="right"
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {(rowsPage?.items ?? []).map((row, index) => {
                      const desc = truncateDescription(row.skuDescription ?? "");
                      return (
                        <tr key={`${row.sku}-${row.cliente}-${row.ung}-${index}`}>
                          <td className="compass-scenarios-cell--sku">{row.sku.replace(/^SKU_/, "")}</td>
                          <td className="compass-scenarios-cell--desc" title={desc.title}>
                            {desc.display}
                          </td>
                          {!isPesoFinanceiro ? (
                            <td
                              className="compass-scenarios-cell--autofit"
                              title={row.cliente !== "NA_Cliente" ? row.cliente : undefined}
                            >
                              {formatCliente(row)}
                            </td>
                          ) : null}
                          {!isPesoFinanceiro ? (
                            <td
                              className="compass-scenarios-cell--autofit"
                              title={row.ung !== "NA_UNG" ? row.ung : undefined}
                            >
                              {formatUng(row)}
                            </td>
                          ) : null}
                          <td className="compass-scenarios-cell--entity">{row.entity}</td>
                          <td className="compass-scenarios-cell--valor">{formatAmount(row.amount)}</td>
                        </tr>
                      );
                    })}
                    {!rowsPage?.items.length ? (
                      <tr>
                        <td colSpan={isPesoFinanceiro ? 4 : 6}>Nenhuma linha encontrada para a busca/filtros.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {isFiltered ? (
                <div className="compass-ytd-pagination compass-scenarios-infinite">
                  <span className="compass-ytd-pagination__info">
                    {loadedCount.toLocaleString("pt-BR")} de {rowsPage?.totalCount.toLocaleString("pt-BR") ?? "0"}{" "}
                    carregadas
                    {hasNextPage ? " · role para carregar mais" : " · fim da lista"}
                  </span>
                  {hasNextPage ? <div ref={loadMoreRef} className="compass-scenarios-infinite__sentinel" aria-hidden="true" /> : null}
                  {isFetchingNextPage ? <p className="compass-page__desc">Carregando mais linhas…</p> : null}
                </div>
              ) : rowsPage && rowsPage.totalPages > 0 ? (
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
