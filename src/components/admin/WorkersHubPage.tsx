import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { usePortalConfirm } from "../../hooks/usePortalConfirm";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import {
  useTriggerWorker,
  useWorkerDefinitions,
  useWorkerRuns,
  useWorkersConnectivity,
} from "../../api/hooks/useWorkers";
import type {
  WorkerConnectivityComponentDto,
  WorkerDefinitionDto,
  WorkerRunDto,
} from "../../api/types";
import { WorkerHistoryModal } from "./WorkerHistoryModal";
import {
  formatDateTime,
  formatDuration,
  isFailedStatus,
  isSuccessStatus,
  isWorkerRunningStatus,
  statusLabel,
  statusTone,
  triggerLabel,
  triggerTone,
} from "./workerUi";
import "../../styles/workers-hub-page.css";

const CONNECTIVITY_LINKS: Record<string, { href: string; label: string }> = {
  api: { href: "/admin/observabilidade", label: "Observabilidade" },
  postgres: { href: "/admin/configuracoes-backend?category=database", label: "Portal DB" },
  redis: { href: "/admin/configuracoes-backend?category=redis", label: "Redis" },
  "totvs-rm": { href: "/admin/totvs-rm", label: "TOTVS RM" },
};

const DEPENDENCY_LABELS: Record<string, string> = {
  api: "API",
  postgres: "Portal DB",
  redis: "Redis",
  "totvs-rm": "TOTVS RM",
};

const CONNECTIVITY_ICONS: Record<string, string> = {
  api: "fa-server",
  postgres: "fa-database",
  redis: "fa-bolt",
  "totvs-rm": "fa-building",
};

function isWorkerOverdue(
  worker: WorkerDefinitionDto,
  runs: WorkerRunDto[] | undefined,
): boolean {
  const interval = worker.defaultIntervalMinutes;
  if (interval == null || interval <= 0) return false;

  const lastScheduled = runs?.find((run) => run.triggerSource === "scheduled");
  if (!lastScheduled) return false;
  if (isWorkerRunningStatus(lastScheduled.status)) return false;

  const reference = lastScheduled.finishedAtUtc ?? lastScheduled.startedAtUtc;
  const ageMs = Date.now() - new Date(reference).getTime();
  return ageMs > interval * 2 * 60_000;
}

function unresolvedDependencies(
  worker: WorkerDefinitionDto,
  components: WorkerConnectivityComponentDto[] | undefined,
): string[] {
  if (!components?.length) return [];
  const byId = new Map(components.map((c) => [c.id, c]));
  return (worker.dependsOn ?? []).filter((id) => {
    const component = byId.get(id);
    return !component || !component.healthy;
  });
}

function WorkerRowStatus({
  worker,
  components,
  selected,
  onSelect,
  onRequestTrigger,
  triggering,
}: {
  worker: WorkerDefinitionDto;
  components: WorkerConnectivityComponentDto[] | undefined;
  selected: boolean;
  onSelect: () => void;
  onRequestTrigger: () => void;
  triggering: boolean;
}) {
  const runsQuery = useWorkerRuns(worker.key, 10, true, true);
  const lastRun = runsQuery.data?.[0];
  const overdue = isWorkerOverdue(worker, runsQuery.data);
  const blockedDeps = unresolvedDependencies(worker, components);
  const blocked = blockedDeps.length > 0;
  const running = Boolean(runsQuery.data?.some((run) => isWorkerRunningStatus(run.status)));
  const triggerDisabled = triggering || running || blocked;
  const blockReason = blocked
    ? `Dependência indisponível: ${blockedDeps.map((id) => DEPENDENCY_LABELS[id] ?? id).join(", ")}`
    : running
      ? "Execução em andamento"
      : undefined;

  return (
    <tr className={selected ? "is-selected" : undefined}>
      <td className="workers-col--worker">
        <div className="workers-row__worker">
          <button type="button" className="workers-row__name" onClick={onSelect} title={worker.key}>
            <span className="workers-row__title">{worker.label}</span>
          </button>
          <div className="workers-row__flags">
            <span
              className={`workers-status ${
                worker.hostedInWorkersProcess ? "workers-status--success" : "workers-status--neutral"
              }`}
            >
              {worker.hostedInWorkersProcess ? "Host Workers" : "Só Dev"}
            </span>
            {overdue ? <span className="workers-status workers-status--warning">Atrasado</span> : null}
          </div>
        </div>
      </td>
      <td>
        {lastRun ? (
          <span className={`workers-status ${statusTone(lastRun.status)}`}>
            {statusLabel(lastRun.status)}
          </span>
        ) : (
          <span className="workers-status workers-status--neutral">Sem runs</span>
        )}
      </td>
      <td>{worker.defaultIntervalMinutes != null ? `${worker.defaultIntervalMinutes} min` : "—"}</td>
      <td>{formatDateTime(lastRun?.finishedAtUtc ?? lastRun?.startedAtUtc)}</td>
      <td>{formatDuration(lastRun?.startedAtUtc, lastRun?.finishedAtUtc)}</td>
      <td>
        {lastRun?.triggerSource ? (
          <span className={`workers-status ${triggerTone(lastRun.triggerSource)}`}>
            {triggerLabel(lastRun.triggerSource)}
          </span>
        ) : (
          <span className="workers-status workers-status--neutral">—</span>
        )}
      </td>
      <td className="workers-col--actions">
        <div className="workers-row__actions">
          <button
            type="button"
            className="workers-icon-btn"
            onClick={onSelect}
            title="Ver histórico"
            aria-label="Ver histórico"
          >
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="workers-icon-btn workers-icon-btn--primary"
            onClick={onRequestTrigger}
            disabled={triggerDisabled}
            title={blockReason ?? "Executar agora"}
            aria-label={running ? "Em execução" : "Executar agora"}
            aria-disabled={triggerDisabled}
          >
            <i
              className={`fa-solid ${
                triggering ? "fa-spinner fa-spin" : running ? "fa-hourglass-half" : "fa-play"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </td>
    </tr>
  );
}

type WorkerRowMeta = {
  running: boolean;
  overdue: boolean;
  failed: boolean;
  statusRank: number;
  lastAtMs: number;
  durationMs: number;
  trigger: string;
  interval: number;
  label: string;
};

function statusSortRank(status?: string | null): number {
  if (isWorkerRunningStatus(status)) return 0;
  if (isFailedStatus(status)) return 1;
  if (isSuccessStatus(status)) return 3;
  return 2;
}

/** Finished-run duration only — avoids Date.now() so probe snapshots stay render-stable. */
function durationMs(startedAtUtc?: string | null, finishedAtUtc?: string | null): number {
  if (!startedAtUtc || !finishedAtUtc) return -1;
  const start = new Date(startedAtUtc).getTime();
  const end = new Date(finishedAtUtc).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return -1;
  return end - start;
}

/** Collects last-run snapshot for KPI strip and sorting. */
function WorkerRowProbe({
  worker,
  onSnapshot,
}: {
  worker: WorkerDefinitionDto;
  onSnapshot: (key: string, snapshot: WorkerRowMeta) => void;
}) {
  const runsQuery = useWorkerRuns(worker.key, 10, true, true);
  const lastRun = runsQuery.data?.[0];
  const running = Boolean(runsQuery.data?.some((run) => isWorkerRunningStatus(run.status)));
  const overdue = isWorkerOverdue(worker, runsQuery.data);
  const failed = isFailedStatus(lastRun?.status);
  const lastAtRaw = lastRun?.finishedAtUtc ?? lastRun?.startedAtUtc;
  const lastAtMs = lastAtRaw ? new Date(lastAtRaw).getTime() : 0;
  // Snapshot duration must stay stable across renders — never use Date.now() here
  // (live duration is only for display via formatDuration in WorkerRowStatus).
  const snapshotDurationMs = durationMs(lastRun?.startedAtUtc, lastRun?.finishedAtUtc);
  const statusRank = statusSortRank(lastRun?.status);
  const lastAtMsSafe = Number.isNaN(lastAtMs) ? 0 : lastAtMs;
  const trigger = (lastRun?.triggerSource ?? "").toLowerCase();
  const interval = worker.defaultIntervalMinutes ?? -1;
  const label = worker.label;

  useEffect(() => {
    onSnapshot(worker.key, {
      running,
      overdue,
      failed,
      statusRank,
      lastAtMs: lastAtMsSafe,
      durationMs: snapshotDurationMs,
      trigger,
      interval,
      label,
    });
  }, [
    worker.key,
    running,
    overdue,
    failed,
    statusRank,
    lastAtMsSafe,
    snapshotDurationMs,
    trigger,
    interval,
    label,
    onSnapshot,
  ]);

  return null;
}

type SortKey = "label" | "status" | "interval" | "lastAt" | "duration" | "trigger";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  align = "center",
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (column: SortKey) => void;
  align?: "left" | "center";
}) {
  const active = sortKey === column;
  return (
    <th className={align === "left" ? "workers-col--worker" : undefined} aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={`workers-sort${active ? " is-active" : ""}`} onClick={() => onSort(column)}>
        <span>{label}</span>
        <i
          className={`fa-solid ${
            active ? (sortDir === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"
          }`}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

export function WorkersHubPage() {
  const { hasPermission, isLoading: meLoading } = usePermissions();
  const { ask, confirmModal } = usePortalConfirm();
  const definitionsQuery = useWorkerDefinitions();
  const connectivityQuery = useWorkersConnectivity();
  const triggerMutation = useTriggerWorker();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rowMeta, setRowMeta] = useState<Record<string, WorkerRowMeta>>({});
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const workers = definitionsQuery.data ?? [];
  const components = connectivityQuery.data?.components ?? [];
  const selectedWorker = workers.find((worker) => worker.key === selectedKey) ?? null;

  const handleRowSnapshot = useCallback((key: string, snapshot: WorkerRowMeta) => {
    setRowMeta((prev) => {
      const current = prev[key];
      if (
        current &&
        current.running === snapshot.running &&
        current.overdue === snapshot.overdue &&
        current.failed === snapshot.failed &&
        current.statusRank === snapshot.statusRank &&
        current.lastAtMs === snapshot.lastAtMs &&
        current.durationMs === snapshot.durationMs &&
        current.trigger === snapshot.trigger &&
        current.interval === snapshot.interval &&
        current.label === snapshot.label
      ) {
        return prev;
      }
      return { ...prev, [key]: snapshot };
    });
  }, []);

  const handleSort = (column: SortKey) => {
    if (sortKey === column) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDir(column === "label" || column === "trigger" ? "asc" : "desc");
  };

  const sortedWorkers = useMemo(() => {
    const list = [...workers];
    const factor = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const ma = rowMeta[a.key];
      const mb = rowMeta[b.key];
      let cmp = 0;
      switch (sortKey) {
        case "label":
          cmp = a.label.localeCompare(b.label, "pt-BR");
          break;
        case "status":
          cmp = (ma?.statusRank ?? 9) - (mb?.statusRank ?? 9);
          if (cmp === 0) cmp = Number(mb?.overdue ?? false) - Number(ma?.overdue ?? false);
          break;
        case "interval":
          cmp = (ma?.interval ?? -1) - (mb?.interval ?? -1);
          break;
        case "lastAt":
          cmp = (ma?.lastAtMs ?? 0) - (mb?.lastAtMs ?? 0);
          break;
        case "duration":
          cmp = (ma?.durationMs ?? -1) - (mb?.durationMs ?? -1);
          break;
        case "trigger":
          cmp = (ma?.trigger ?? "").localeCompare(mb?.trigger ?? "", "pt-BR");
          break;
        default:
          cmp = 0;
      }
      if (cmp === 0) cmp = a.label.localeCompare(b.label, "pt-BR");
      return cmp * factor;
    });
    return list;
  }, [workers, rowMeta, sortKey, sortDir]);

  const kpis = useMemo(() => {
    const values = Object.values(rowMeta);
    return {
      total: workers.length,
      running: values.filter((v) => v.running).length,
      overdue: values.filter((v) => v.overdue).length,
      failed: values.filter((v) => v.failed).length,
      infraUp: components.filter((c) => c.healthy).length,
      infraTotal: components.length,
    };
  }, [rowMeta, workers.length, components]);

  const closeHistory = () => {
    setSelectedKey(null);
    setSelectedRunId(null);
  };

  const executeTrigger = async (workerKey: string) => {
    setFeedback(null);
    try {
      const result = await triggerMutation.mutateAsync(workerKey);
      setSelectedKey(workerKey);
      setSelectedRunId(result.runId);
      setFeedback(`Worker ${workerKey} disparado (${result.status}).`);
    } catch {
      setFeedback("Não foi possível disparar o worker.");
    }
  };

  const requestTrigger = async (worker: WorkerDefinitionDto) => {
    const confirmed = await ask({
      title: "Executar worker agora?",
      message: (
        <>
          Confirma a execução manual de <strong>{worker.label}</strong> (
          <code>{worker.key}</code>)? Isso dispara o job imediatamente, fora do agendamento.
        </>
      ),
      confirmLabel: "Executar agora",
      cancelLabel: "Cancelar",
      variant: "warning",
    });
    if (!confirmed) return;
    await executeTrigger(worker.key);
  };

  if (meLoading) {
    return (
      <main className={sectionMainClass("plataforma")}>
        <p className="workers-empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasPermission(PERMISSIONS.admin.workersManage)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={`${sectionMainClass("plataforma")} workers-dash`}>
      {confirmModal}
      {workers.map((worker) => (
        <WorkerRowProbe key={`kpi-${worker.key}`} worker={worker} onSnapshot={handleRowSnapshot} />
      ))}

      <SectionPageHead
        section="plataforma"
        title="Workers"
        current="Workers"
        description="Monitoramento operacional de jobs, conectividade e disparo manual."
        syncMeta={
          connectivityQuery.data?.checkedAtUtc
            ? `Infra verificada às ${formatDateTime(connectivityQuery.data.checkedAtUtc)}`
            : undefined
        }
        actions={
          <div className="workers-dash__header-actions">
            <Link className="workers-head-action" to="/admin/totvs-rm">
              <i className="fa-solid fa-building" aria-hidden="true" />
              TOTVS RM
            </Link>
            <Link
              className="workers-head-action"
              to="/admin/configuracoes-backend?category=workers"
            >
              <i className="fa-solid fa-sliders" aria-hidden="true" />
              Intervalos
            </Link>
            <button
              type="button"
              className="workers-icon-btn"
              onClick={() => void connectivityQuery.refetch()}
              disabled={connectivityQuery.isFetching}
              title="Atualizar infraestrutura"
              aria-label="Atualizar infraestrutura"
            >
              <i
                className={`fa-solid ${connectivityQuery.isFetching ? "fa-spinner fa-spin" : "fa-arrows-rotate"}`}
                aria-hidden="true"
              />
            </button>
          </div>
        }
      />

      <section className="workers-kpi" aria-label="Resumo operacional">
        <article className="workers-kpi__card workers-kpi__card--total">
          <div className="workers-kpi__head">
            <span className="workers-kpi__icon" aria-hidden="true">
              <i className="fa-solid fa-gears" />
            </span>
            <span className="workers-kpi__hint">Catálogo</span>
          </div>
          <div className="workers-kpi__value">{kpis.total}</div>
          <div className="workers-kpi__label">Workers</div>
        </article>
        <article className="workers-kpi__card workers-kpi__card--running">
          <div className="workers-kpi__head">
            <span className="workers-kpi__icon" aria-hidden="true">
              <i className="fa-solid fa-play" />
            </span>
            <span className="workers-kpi__hint">Agora</span>
          </div>
          <div className="workers-kpi__value">{kpis.running}</div>
          <div className="workers-kpi__label">Em execução</div>
        </article>
        <article className="workers-kpi__card workers-kpi__card--overdue">
          <div className="workers-kpi__head">
            <span className="workers-kpi__icon" aria-hidden="true">
              <i className="fa-solid fa-clock" />
            </span>
            <span className="workers-kpi__hint">Alerta</span>
          </div>
          <div className="workers-kpi__value">{kpis.overdue}</div>
          <div className="workers-kpi__label">Atrasados</div>
        </article>
        <article className="workers-kpi__card workers-kpi__card--failed">
          <div className="workers-kpi__head">
            <span className="workers-kpi__icon" aria-hidden="true">
              <i className="fa-solid fa-triangle-exclamation" />
            </span>
            <span className="workers-kpi__hint">Última run</span>
          </div>
          <div className="workers-kpi__value">{kpis.failed}</div>
          <div className="workers-kpi__label">Com falha</div>
        </article>
        <article className="workers-kpi__card workers-kpi__card--infra">
          <div className="workers-kpi__head">
            <span className="workers-kpi__icon" aria-hidden="true">
              <i className="fa-solid fa-heart-pulse" />
            </span>
            <span className="workers-kpi__hint">Health</span>
          </div>
          <div className="workers-kpi__value">
            {kpis.infraUp}/{kpis.infraTotal || 4}
          </div>
          <div className="workers-kpi__label">Infra OK</div>
        </article>
      </section>

      <section className="workers-infra" aria-label="Conectividade">
        <div className="workers-infra__head">
          <h2>Conectividade</h2>
        </div>
        {connectivityQuery.isError ? (
          <p className="workers-empty workers-empty--error" role="alert">
            Não foi possível carregar o status de conectividade
            {connectivityQuery.error instanceof Error && connectivityQuery.error.message
              ? ` (${connectivityQuery.error.message})`
              : ""}
            . Se a API local estiver antiga, reinicie o processo{" "}
            <code>LioConecta.Api</code> para carregar o endpoint{" "}
            <code>/admin/workers/connectivity</code>.
          </p>
        ) : (
          <div className="workers-infra__strip">
            {(components.length
              ? components
              : [
                  { id: "api", label: "API", healthy: false, latencyMs: null, message: "…" },
                  { id: "postgres", label: "Portal DB", healthy: false, latencyMs: null, message: "…" },
                  { id: "redis", label: "Redis", healthy: false, latencyMs: null, message: "…" },
                  { id: "totvs-rm", label: "TOTVS RM", healthy: false, latencyMs: null, message: "…" },
                ]
            ).map((component) => {
              const link = CONNECTIVITY_LINKS[component.id];
              const content = (
                <>
                  <span className="workers-infra__icon" aria-hidden="true">
                    <i className={`fa-solid ${CONNECTIVITY_ICONS[component.id] ?? "fa-circle"}`} />
                  </span>
                  <span className="workers-infra__meta">
                    <span className="workers-infra__name">{component.label}</span>
                    <span className="workers-infra__latency">
                      {component.latencyMs != null ? `${component.latencyMs} ms` : "—"}
                      {component.message && !component.healthy ? ` · ${component.message}` : ""}
                    </span>
                  </span>
                  <span
                    className={`workers-infra__dot${component.healthy ? " is-up" : " is-down"}`}
                    title={component.healthy ? "Saudável" : "Indisponível"}
                  />
                </>
              );
              return link ? (
                <Link
                  key={component.id}
                  className={`workers-infra__chip${component.healthy ? " is-up" : " is-down"}`}
                  to={link.href}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={component.id}
                  className={`workers-infra__chip${component.healthy ? " is-up" : " is-down"}`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {feedback ? <p className="workers-feedback">{feedback}</p> : null}

      <section className="workers-board" aria-label="Lista de workers">
        <div className="workers-board__head">
          <h2>Jobs</h2>
          <p>Abra o histórico pelo ícone de relógio para ver execuções e logs.</p>
        </div>
        {definitionsQuery.isError ? (
          <p className="workers-empty">Não foi possível carregar os workers.</p>
        ) : (
          <div className="workers-board__table-wrap">
            <table className="workers-board__table">
              <thead>
                <tr>
                  <SortHeader
                    label="Worker"
                    column="label"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="left"
                  />
                  <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader
                    label="Intervalo"
                    column="interval"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Última execução"
                    column="lastAt"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Tempo última execução"
                    column="duration"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Trigger"
                    column="trigger"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th className="workers-col--actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedWorkers.map((worker) => (
                  <WorkerRowStatus
                    key={worker.key}
                    worker={worker}
                    components={components}
                    selected={selectedKey === worker.key}
                    onSelect={() => {
                      setSelectedKey(worker.key);
                      setSelectedRunId(null);
                    }}
                    onRequestTrigger={() => void requestTrigger(worker)}
                    triggering={
                      triggerMutation.isPending && triggerMutation.variables === worker.key
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedWorker ? (
        <WorkerHistoryModal
          open
          workerKey={selectedWorker.key}
          workerLabel={selectedWorker.label}
          selectedRunId={selectedRunId}
          onSelectRun={setSelectedRunId}
          onClose={closeHistory}
        />
      ) : null}
    </main>
  );
}
