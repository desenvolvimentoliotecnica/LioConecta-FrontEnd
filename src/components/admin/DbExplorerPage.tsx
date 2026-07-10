import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { hasRole } from "../../api/auth";
import { ApiError } from "../../api/client";
import {
  exportDbQueryCsv,
  useDbColumns,
  useDbConnections,
  useDbQueryHistory,
  useDbRows,
  useDbSavedQueries,
  useDeleteDbSavedQuery,
  useExecuteDbQuery,
  usePromoteHistoryToSaved,
  useSaveDbQuery,
  useUpdateDbSavedQuery,
  type DbQueryHistoryEntryDto,
} from "../../api/hooks/useDbExplorer";
import { useMe } from "../../api/hooks/useMe";
import type { DbSavedQueryDto, ExecuteQueryResponse } from "../../api/types/dbExplorer";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { DbSchemaTree } from "./dbExplorer/DbSchemaTree";
import { DbSqlEditor, DbSqlEditorFallback } from "./dbExplorer/DbSqlEditor";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import "../../styles/list-page.css";
import "../../styles/audit-trail-page.css";
import "../../styles/workers-hub-page.css";
import "../../styles/db-explorer-page.css";

const DbDerTab = lazy(() =>
  import("./dbExplorer/DbDerTab").then((m) => ({ default: m.DbDerTab })),
);

type ExplorerTab = "explorer" | "der";

type PanelState = { tree: boolean; meta: boolean };

const PANELS_KEY = "db-explorer.panels";

function loadPanels(): PanelState {
  try {
    const raw = sessionStorage.getItem(PANELS_KEY);
    if (raw) return JSON.parse(raw) as PanelState;
  } catch {
    /* ignore */
  }
  return { tree: true, meta: true };
}

function resolveTab(value: string | null): ExplorerTab {
  return value === "der" ? "der" : "explorer";
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function rowsToTsv(columns: string[], rows: unknown[][]): string {
  const header = columns.join("\t");
  const body = rows.map((row) => row.map(formatCell).join("\t")).join("\n");
  return `${header}\n${body}`;
}

function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string } | undefined;
    if (body?.message) return body.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function DbExplorerPage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));
  const connectionsQuery = useDbConnections();
  const [connectionId, setConnectionId] = useState("");
  const [schema, setSchema] = useState("");
  const [table, setTable] = useState("");
  const [sql, setSql] = useState("SELECT 1;");
  const [mode, setMode] = useState<"browse" | "query">("query");
  const [queryResult, setQueryResult] = useState<ExecuteQueryResponse | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [panels, setPanels] = useState<PanelState>(loadPanels);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"history" | "favorites">("history");
  const [historyPage, setHistoryPage] = useState(1);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [favoriteDesc, setFavoriteDesc] = useState("");
  const [editingFavorite, setEditingFavorite] = useState<DbSavedQueryDto | null>(null);
  const { message: clipboardMsg, copyText } = useClipboardFeedback();

  const executeQuery = useExecuteDbQuery();
  const saveQuery = useSaveDbQuery();
  const updateSaved = useUpdateDbSavedQuery();
  const deleteSaved = useDeleteDbSavedQuery();
  const promoteHistory = usePromoteHistoryToSaved();
  const historyQuery = useDbQueryHistory(historyPage, 25, drawerOpen && drawerTab === "history");
  const savedQuery = useDbSavedQueries(drawerOpen && drawerTab === "favorites");
  const columnsQuery = useDbColumns(connectionId, schema, table);
  const browseQuery = useDbRows(connectionId, schema, table, page, pageSize);

  useEffect(() => {
    sessionStorage.setItem(PANELS_KEY, JSON.stringify(panels));
  }, [panels]);

  useEffect(() => {
    const first = connectionsQuery.data?.find((c) => c.available);
    if (!connectionId && first) setConnectionId(first.id);
  }, [connectionId, connectionsQuery.data]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const setTab = (next: ExplorerTab) => {
    setSearchParams(next === "explorer" ? {} : { tab: next });
  };

  const activeConnection = useMemo(
    () => connectionsQuery.data?.find((c) => c.id === connectionId),
    [connectionId, connectionsQuery.data],
  );

  const gridColumns = mode === "browse" ? browseQuery.data?.columns ?? [] : queryResult?.columns ?? [];
  const gridRows = mode === "browse" ? browseQuery.data?.rows ?? [] : queryResult?.rows ?? [];
  const totalCount =
    mode === "browse" ? browseQuery.data?.totalCount ?? 0 : queryResult?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const runSql = useCallback(
    async (nextPage = 1) => {
      if (!connectionId || !sql.trim()) return;
      setMode("query");
      setQueryError(null);
      try {
        const result = await executeQuery.mutateAsync({
          connectionId,
          request: { sql, page: nextPage, pageSize },
        });
        setQueryResult(result);
        setPage(nextPage);
      } catch (err) {
        setQueryResult(null);
        setQueryError(formatApiError(err, "Falha ao executar SQL"));
      }
    },
    [connectionId, executeQuery, pageSize, sql],
  );

  const selectTable = (nextSchema: string, nextTable: string) => {
    setSchema(nextSchema);
    setTable(nextTable);
    setMode("browse");
    setPage(1);
    setQueryResult(null);
    setQueryError(null);
  };

  const browseTable = (nextSchema: string, nextTable: string) => {
    selectTable(nextSchema, nextTable);
    setSql(`SELECT * FROM "${nextSchema}"."${nextTable}" LIMIT 200;`);
    setTab("explorer");
  };

  const handleExportCsv = async () => {
    if (!connectionId) return;
    const blob = await exportDbQueryCsv(connectionId, { sql, page: 1, pageSize: 5000 });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `db-explorer-${connectionId}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadHistoryEntry = (entry: DbQueryHistoryEntryDto) => {
    setConnectionId(entry.connectionId);
    setSql(entry.sqlText);
    setDrawerOpen(false);
  };

  const loadFavorite = (fav: DbSavedQueryDto) => {
    setConnectionId(fav.connectionId);
    setSql(fav.sqlText);
    setDrawerOpen(false);
  };

  const handleSaveFavorite = async () => {
    if (!favoriteName.trim() || !connectionId) return;
    if (editingFavorite) {
      await updateSaved.mutateAsync({
        id: editingFavorite.id,
        request: {
          name: favoriteName.trim(),
          connectionId,
          sql,
          description: favoriteDesc.trim() || null,
        },
      });
    } else {
      await saveQuery.mutateAsync({
        name: favoriteName.trim(),
        connectionId,
        sql,
        description: favoriteDesc.trim() || null,
      });
    }
    setSaveModalOpen(false);
    setFavoriteName("");
    setFavoriteDesc("");
    setEditingFavorite(null);
  };

  if (meQuery.isLoading) {
    return (
      <main className="main">
        <p className="db-explorer-muted">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasRole(meQuery.data, "Admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main db-explorer-page">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">DB Explorer</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">
              <i className="fa-solid fa-database" aria-hidden="true" /> DB Explorer
            </h1>
            <p className="page-header__desc">
              Consulta somente leitura ao PostgreSQL da aplicação e ao TOTVS RM — uso exclusivo para diagnóstico.
            </p>
          </div>
          <div className="page-toolbar">
            <ModuleFocusButton />
          </div>
        </div>
      </header>

      <div className="db-explorer-page__tabs">
        <button
          type="button"
          className={`db-explorer-page__tab${tab === "explorer" ? " is-active" : ""}`}
          onClick={() => setTab("explorer")}
        >
          <i className="fa-solid fa-table" aria-hidden="true" /> Explorer
        </button>
        <button
          type="button"
          className={`db-explorer-page__tab${tab === "der" ? " is-active" : ""}`}
          onClick={() => setTab("der")}
        >
          <i className="fa-solid fa-diagram-project" aria-hidden="true" /> DER
        </button>
      </div>

      <div className="db-explorer-page__connections">
        {connectionsQuery.data?.map((conn) => (
          <button
            key={conn.id}
            type="button"
            className={`filter-chip${connectionId === conn.id ? " is-active" : ""}`}
            disabled={!conn.available}
            title={conn.statusMessage ?? conn.label}
            onClick={() => setConnectionId(conn.id)}
          >
            <i
              className={`fa-solid ${conn.engine.includes("postgres") ? "fa-server" : "fa-building"}`}
              aria-hidden="true"
            />
            {conn.label}
          </button>
        ))}
        {activeConnection && !activeConnection.available ? (
          <span className="db-explorer-error">{activeConnection.statusMessage ?? "Conexão indisponível"}</span>
        ) : null}
      </div>

      {clipboardMsg ? <p className="db-explorer-toast">{clipboardMsg}</p> : null}

      {tab === "der" ? (
        <Suspense fallback={<p className="db-explorer-muted">Carregando diagrama…</p>}>
          {connectionId ? <DbDerTab connectionId={connectionId} /> : null}
        </Suspense>
      ) : (
        <div
          className={`db-explorer-workspace${!panels.tree ? " db-explorer-workspace--no-tree" : ""}${
            !panels.meta ? " db-explorer-workspace--no-meta" : ""
          }`}
        >
          {panels.tree ? (
            <aside className="db-explorer-panel db-explorer-panel--tree" aria-label="Árvore de objetos">
              <div className="db-explorer-panel__head">
                <span>Objetos</span>
                <button
                  type="button"
                  className="db-explorer-icon-btn"
                  title="Ocultar árvore"
                  onClick={() => setPanels((p) => ({ ...p, tree: false }))}
                >
                  <i className="fa-solid fa-sidebar" aria-hidden="true" />
                </button>
              </div>
              {connectionId ? (
                <DbSchemaTree
                  connectionId={connectionId}
                  selectedSchema={schema}
                  selectedTable={table}
                  onSelectTable={selectTable}
                  onBrowseTable={browseTable}
                />
              ) : null}
            </aside>
          ) : (
            <button
              type="button"
              className="db-explorer-panel-toggle"
              title="Mostrar árvore"
              onClick={() => setPanels((p) => ({ ...p, tree: true }))}
            >
              <i className="fa-solid fa-sidebar" aria-hidden="true" />
            </button>
          )}

          <section className="db-explorer-center">
            <div className="db-explorer-toolbar">
              {!panels.tree ? (
                <button
                  type="button"
                  className="workers-btn workers-btn--ghost"
                  title="Árvore"
                  onClick={() => setPanels((p) => ({ ...p, tree: true }))}
                >
                  <i className="fa-solid fa-sidebar" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                className="workers-btn workers-btn--primary"
                disabled={executeQuery.isPending || !connectionId}
                onClick={() => void runSql(1)}
              >
                <i className="fa-solid fa-play" aria-hidden="true" /> Executar
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                disabled={!sql.trim()}
                onClick={() => void copyText(sql, "SQL copiado")}
              >
                <i className="fa-solid fa-copy" aria-hidden="true" /> Copiar SQL
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                disabled={!sql.trim() || !connectionId}
                onClick={() => void handleExportCsv()}
              >
                <i className="fa-solid fa-file-csv" aria-hidden="true" /> CSV
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                disabled={gridRows.length === 0}
                onClick={() =>
                  void copyText(
                    rowsToTsv(gridColumns, gridRows),
                    `${gridRows.length} linhas copiadas — evite compartilhar dados sensíveis`,
                  )
                }
              >
                <i className="fa-solid fa-copy" aria-hidden="true" /> Copiar dados
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                onClick={() => {
                  setDrawerTab("history");
                  setDrawerOpen(true);
                }}
              >
                <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> Histórico
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                onClick={() => {
                  setDrawerTab("favorites");
                  setDrawerOpen(true);
                }}
              >
                <i className="fa-solid fa-star" aria-hidden="true" /> Favoritas
              </button>
              <button
                type="button"
                className="workers-btn workers-btn--ghost"
                disabled={!sql.trim()}
                onClick={() => {
                  setEditingFavorite(null);
                  setFavoriteName("");
                  setFavoriteDesc("");
                  setSaveModalOpen(true);
                }}
              >
                <i className="fa-solid fa-bookmark" aria-hidden="true" /> Salvar
              </button>
              {!panels.meta ? (
                <button
                  type="button"
                  className="workers-btn workers-btn--ghost"
                  title="Metadados"
                  onClick={() => setPanels((p) => ({ ...p, meta: true }))}
                >
                  <i className="fa-solid fa-columns" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <Suspense fallback={<DbSqlEditorFallback />}>
              <DbSqlEditor value={sql} onChange={setSql} onRun={() => void runSql(1)} />
            </Suspense>

            {queryError ? (
              <p className="db-explorer-error">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {queryError}
              </p>
            ) : null}
            {executeQuery.isSuccess && mode === "query" && queryResult ? (
              <p className="db-explorer-muted">
                <i className="fa-solid fa-circle-check" aria-hidden="true" /> {queryResult.rows.length} linhas em{" "}
                {queryResult.durationMs} ms
              </p>
            ) : null}

            <div className="db-explorer-grid-wrap">
              {(mode === "browse" && browseQuery.isLoading) || executeQuery.isPending ? (
                <p className="db-explorer-muted">Carregando resultados…</p>
              ) : (
                <table className="audit-trail-page__table db-explorer-grid">
                  <thead>
                    <tr>
                      {gridColumns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridRows.length === 0 ? (
                      <tr>
                        <td colSpan={Math.max(gridColumns.length, 1)} className="db-explorer-muted">
                          Nenhum resultado
                        </td>
                      </tr>
                    ) : (
                      gridRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              title="Clique para copiar"
                              onClick={() => void copyText(formatCell(cell))}
                            >
                              {formatCell(cell)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totalCount > pageSize ? (
              <nav className="audit-trail-page__pagination" aria-label="Paginação">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    const next = page - 1;
                    setPage(next);
                    if (mode === "query") void runSql(next);
                  }}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {totalPages} ({totalCount} registros)
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    if (mode === "query") void runSql(next);
                  }}
                >
                  Próxima
                </button>
              </nav>
            ) : null}
          </section>

          {panels.meta ? (
            <aside className="db-explorer-panel db-explorer-panel--meta" aria-label="Metadados">
              <div className="db-explorer-panel__head">
                <span>Colunas</span>
                <button
                  type="button"
                  className="db-explorer-icon-btn"
                  title="Ocultar metadados"
                  onClick={() => setPanels((p) => ({ ...p, meta: false }))}
                >
                  <i className="fa-solid fa-columns" aria-hidden="true" />
                </button>
              </div>
              {schema && table ? (
                columnsQuery.isLoading ? (
                  <p className="db-explorer-muted">Carregando…</p>
                ) : (
                  <dl className="db-explorer-columns">
                    {columnsQuery.data?.map((col) => (
                      <div key={col.name} className="db-explorer-columns__item">
                        <dt>
                          {col.isPrimaryKey ? (
                            <i className="fa-solid fa-key" title="PK" aria-hidden="true" />
                          ) : null}
                          {col.isForeignKey ? (
                            <i className="fa-solid fa-link" title="FK" aria-hidden="true" />
                          ) : null}
                          {col.name}
                        </dt>
                        <dd>
                          {col.dataType}
                          {col.isNullable ? " · nullable" : ""}
                          {col.foreignKeyTable
                            ? ` → ${col.foreignKeyTable}.${col.foreignKeyColumn}`
                            : ""}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )
              ) : (
                <p className="db-explorer-muted">Selecione uma tabela na árvore.</p>
              )}
            </aside>
          ) : null}
        </div>
      )}

      {drawerOpen
        ? createPortal(
            <div className="db-explorer-drawer-root">
              <button
                type="button"
                className="db-explorer-drawer__backdrop"
                aria-label="Fechar painel"
                onClick={() => setDrawerOpen(false)}
              />
              <aside className="db-explorer-drawer" role="dialog" aria-modal="true" aria-label="Histórico e favoritas">
                <div className="db-explorer-drawer__head">
                  <div className="db-explorer-drawer__tabs">
                    <button
                      type="button"
                      className={drawerTab === "history" ? "is-active" : ""}
                      onClick={() => setDrawerTab("history")}
                    >
                      Histórico
                    </button>
                    <button
                      type="button"
                      className={drawerTab === "favorites" ? "is-active" : ""}
                      onClick={() => setDrawerTab("favorites")}
                    >
                      Favoritas
                    </button>
                  </div>
                  <button
                    type="button"
                    className="db-explorer-drawer__close"
                    title="Fechar"
                    aria-label="Fechar"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
                <div className="db-explorer-drawer__body">
                  {drawerTab === "history" ? (
                    historyQuery.isLoading ? (
                      <p className="db-explorer-drawer__empty">Carregando histórico…</p>
                    ) : historyQuery.isError ? (
                      <p className="db-explorer-drawer__empty">Não foi possível carregar o histórico.</p>
                    ) : !historyQuery.data?.items.length ? (
                      <p className="db-explorer-drawer__empty">Nenhuma consulta no histórico ainda.</p>
                    ) : (
                      <>
                        <ul className="db-explorer-list">
                          {historyQuery.data.items.map((entry) => (
                            <li key={entry.id}>
                              <button type="button" onClick={() => loadHistoryEntry(entry)}>
                                <span className="db-explorer-list__title">
                                  {entry.success ? (
                                    <i className="fa-solid fa-circle-check" aria-hidden="true" />
                                  ) : (
                                    <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                                  )}
                                  {entry.connectionId} · {entry.rowCount} linhas
                                </span>
                                <span className="db-explorer-list__sql">{entry.sqlText}</span>
                              </button>
                              <button
                                type="button"
                                className="db-explorer-icon-btn"
                                title="Salvar como favorita"
                                onClick={() =>
                                  void promoteHistory.mutateAsync({
                                    historyId: entry.id,
                                    name: `Query ${new Date(entry.executedAt).toLocaleString("pt-BR")}`,
                                  })
                                }
                              >
                                <i className="fa-solid fa-bookmark" aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {historyQuery.data.totalCount > historyQuery.data.pageSize ? (
                          <nav className="audit-trail-page__pagination">
                            <button
                              type="button"
                              disabled={historyPage <= 1}
                              onClick={() => setHistoryPage((p) => p - 1)}
                            >
                              Anterior
                            </button>
                            <span>Página {historyPage}</span>
                            <button type="button" onClick={() => setHistoryPage((p) => p + 1)}>
                              Próxima
                            </button>
                          </nav>
                        ) : null}
                      </>
                    )
                  ) : savedQuery.isLoading ? (
                    <p className="db-explorer-drawer__empty">Carregando favoritas…</p>
                  ) : savedQuery.isError ? (
                    <p className="db-explorer-drawer__empty">Não foi possível carregar as favoritas.</p>
                  ) : !savedQuery.data?.length ? (
                    <p className="db-explorer-drawer__empty">
                      Nenhuma favorita salva. Use <strong>Salvar</strong> na toolbar ou o ícone de bookmark no histórico.
                    </p>
                  ) : (
                    <ul className="db-explorer-list">
                      {savedQuery.data.map((fav) => (
                        <li key={fav.id}>
                          <button type="button" onClick={() => loadFavorite(fav)}>
                            <span className="db-explorer-list__title">
                              <i className="fa-solid fa-star" aria-hidden="true" /> {fav.name}
                            </span>
                            <span className="db-explorer-list__sql">{fav.sqlText}</span>
                          </button>
                          <button
                            type="button"
                            className="db-explorer-icon-btn"
                            title="Renomear"
                            onClick={() => {
                              setEditingFavorite(fav);
                              setFavoriteName(fav.name);
                              setFavoriteDesc(fav.description ?? "");
                              setSaveModalOpen(true);
                            }}
                          >
                            <i className="fa-solid fa-pen" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="db-explorer-icon-btn"
                            title="Excluir"
                            onClick={() => void deleteSaved.mutateAsync(fav.id)}
                          >
                            <i className="fa-solid fa-trash" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}

      {saveModalOpen
        ? createPortal(
            <div className="db-explorer-modal" role="dialog" aria-modal="true" aria-label="Salvar consulta favorita">
              <div className="db-explorer-modal__card">
                <h2>{editingFavorite ? "Editar favorita" : "Salvar consulta favorita"}</h2>
                <label>
                  Nome *
                  <input
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                    placeholder="Nome da consulta"
                  />
                </label>
                <label>
                  Descrição
                  <textarea
                    value={favoriteDesc}
                    onChange={(e) => setFavoriteDesc(e.target.value)}
                    rows={2}
                    placeholder="Opcional"
                  />
                </label>
                <div className="db-explorer-modal__actions">
                  <button
                    type="button"
                    className="workers-btn workers-btn--ghost"
                    onClick={() => setSaveModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="workers-btn workers-btn--primary"
                    disabled={!favoriteName.trim()}
                    onClick={() => void handleSaveFavorite()}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </main>
  );
}
