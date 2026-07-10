import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { usePortalConfirm } from "../../hooks/usePortalConfirm";
import { PERMISSIONS } from "../../config/rbac/permissions";
import {
  useTriggerWorker,
  useWorkerDefinitions,
  useWorkerRunDetail,
  useWorkerRuns,
  useWorkersConnectivity,
} from "../../api/hooks/useWorkers";
import type {
  WorkerConnectivityComponentDto,
  WorkerDefinitionDto,
  WorkerRunDto,
} from "../../api/types";
import "../../styles/workers-hub-page.css";

const CONNECTIVITY_LINKS: Record<string, { href: string; label: string }> = {
  api: { href: "/admin/observabilidade", label: "Observabilidade" },
  postgres: { href: "/admin/configuracoes-backend?category=database", label: "Config. Portal DB" },
  redis: { href: "/admin/configuracoes-backend?category=redis", label: "Config. Redis" },
  "totvs-rm": { href: "/admin/totvs-rm", label: "Configurar RM" },
};

const DEPENDENCY_LABELS: Record<string, string> = {
  api: "API",
  postgres: "Portal DB",
  redis: "Redis",
  "totvs-rm": "TOTVS RM",
};

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function statusTone(status: string): string {
  switch (status) {
    case "Success":
      return "workers-status--success";
    case "Running":
      return "workers-status--running";
    case "PartialFailure":
      return "workers-status--warning";
    case "Failed":
      return "workers-status--danger";
    default:
      return "workers-status--neutral";
  }
}

function isWorkerOverdue(
  worker: WorkerDefinitionDto,
  runs: WorkerRunDto[] | undefined,
): boolean {
  const interval = worker.defaultIntervalMinutes;
  if (interval == null || interval <= 0) return false;

  const lastScheduled = runs?.find((run) => run.triggerSource === "scheduled");
  if (!lastScheduled) return false;
  if (lastScheduled.status === "Running") return false;

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

function ConnectivitySection({
  components,
  checkedAtUtc,
  isFetching,
  isError,
  onRefresh,
}: {
  components: WorkerConnectivityComponentDto[];
  checkedAtUtc?: string;
  isFetching: boolean;
  isError: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="workers-connectivity" aria-label="Infraestrutura">
      <div className="workers-connectivity__head">
        <div>
          <h2 className="workers-connectivity__title">Infraestrutura</h2>
          <p className="workers-connectivity__desc">
            Status de API, Portal DB, Redis e TOTVS RM
            {checkedAtUtc ? ` · verificado às ${formatDateTime(checkedAtUtc)}` : ""}.
          </p>
        </div>
        <button
          type="button"
          className="workers-btn workers-btn--ghost"
          onClick={onRefresh}
          disabled={isFetching}
        >
          {isFetching ? "Atualizando…" : "Atualizar"}
        </button>
      </div>
      {isError ? (
        <p className="workers-empty">Não foi possível carregar o status de conectividade.</p>
      ) : (
        <div className="workers-connectivity__grid">
          {components.map((component) => {
            const link = CONNECTIVITY_LINKS[component.id];
            return (
              <article
                key={component.id}
                className={`workers-connectivity-card${component.healthy ? " is-healthy" : " is-down"}`}
              >
                <div className="workers-connectivity-card__head">
                  <h3>{component.label}</h3>
                  <span
                    className={`workers-status ${
                      component.healthy ? "workers-status--success" : "workers-status--danger"
                    }`}
                  >
                    {component.healthy ? "Saudável" : "Indisponível"}
                  </span>
                </div>
                <dl className="workers-connectivity-card__meta">
                  <div>
                    <dt>Latência</dt>
                    <dd>{component.latencyMs != null ? `${component.latencyMs} ms` : "—"}</dd>
                  </div>
                  <div>
                    <dt>Detalhe</dt>
                    <dd>{component.message ?? (component.healthy ? "OK" : "—")}</dd>
                  </div>
                </dl>
                {link ? (
                  <Link className="workers-btn workers-btn--ghost" to={link.href}>
                    {link.label}
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function WorkerCard({
  worker,
  selected,
  onSelect,
  onRequestTrigger,
  triggering,
  components,
}: {
  worker: WorkerDefinitionDto;
  selected: boolean;
  onSelect: () => void;
  onRequestTrigger: () => void;
  triggering: boolean;
  components: WorkerConnectivityComponentDto[] | undefined;
}) {
  const runsQuery = useWorkerRuns(worker.key, 10, true, true);
  const lastRun = runsQuery.data?.[0];
  const overdue = isWorkerOverdue(worker, runsQuery.data);
  const blockedDeps = unresolvedDependencies(worker, components);
  const blocked = blockedDeps.length > 0;
  const running = Boolean(runsQuery.data?.some((run) => run.status === "Running"));
  const triggerDisabled = triggering || running || blocked;
  const blockReason = blocked
    ? `Dependência indisponível: ${blockedDeps.map((id) => DEPENDENCY_LABELS[id] ?? id).join(", ")}`
    : running
      ? "Execução em andamento"
      : undefined;

  return (
    <article className={`workers-card${selected ? " is-selected" : ""}`}>
      <div className="workers-card__head">
        <div>
          <h2 className="workers-card__title">{worker.label}</h2>
          <p className="workers-card__desc">{worker.description}</p>
          <div className="workers-card__badges">
            <span
              className={`workers-status ${
                worker.hostedInWorkersProcess
                  ? "workers-status--success"
                  : "workers-status--neutral"
              }`}
            >
              {worker.hostedInWorkersProcess ? "Agendado no Workers" : "Só Dev / manual"}
            </span>
            {overdue ? (
              <span className="workers-status workers-status--warning">Atrasado</span>
            ) : null}
            {running ? (
              <span className="workers-status workers-status--running">Em execução</span>
            ) : null}
          </div>
        </div>
        {lastRun ? (
          <span className={`workers-status ${statusTone(lastRun.status)}`}>{lastRun.status}</span>
        ) : (
          <span className="workers-status workers-status--neutral">Sem execuções</span>
        )}
      </div>
      <dl className="workers-card__meta">
        <div>
          <dt>Intervalo configurado</dt>
          <dd>{worker.defaultIntervalMinutes ?? "—"} min</dd>
        </div>
        <div>
          <dt>Última execução</dt>
          <dd>{formatDateTime(lastRun?.finishedAtUtc ?? lastRun?.startedAtUtc)}</dd>
        </div>
        <div>
          <dt>Trigger</dt>
          <dd>{lastRun?.triggerSource ?? "—"}</dd>
        </div>
      </dl>
      <div className="workers-card__actions">
        {worker.key === "totvs-timesheet-sync" ||
        worker.key === "totvs-payslip-sync" ||
        worker.key === "totvs-leave-sync" ||
        worker.key === "totvs-employee-sync" ||
        worker.key === "leave-writeback" ? (
          <Link className="workers-btn workers-btn--ghost" to="/admin/totvs-rm">
            Configurar RM
          </Link>
        ) : null}
        {worker.key === "graph-directory-sync" || worker.key === "graph-sync" ? (
          <Link
            className="workers-btn workers-btn--ghost"
            to="/admin/configuracoes-backend?category=graph"
          >
            Configurar Graph
          </Link>
        ) : null}
        <button type="button" className="workers-btn workers-btn--ghost" onClick={onSelect}>
          Ver histórico
        </button>
        <button
          type="button"
          className="workers-btn workers-btn--primary"
          onClick={onRequestTrigger}
          disabled={triggerDisabled}
          title={blockReason}
          aria-disabled={triggerDisabled}
        >
          {triggering ? "Disparando…" : running ? "Em execução…" : "Executar agora"}
        </button>
      </div>
      {triggerDisabled && blockReason ? (
        <p className="workers-card__hint">{blockReason}</p>
      ) : null}
    </article>
  );
}

function RunDetailPanel({
  workerKey,
  runId,
  onClose,
}: {
  workerKey: string;
  runId: string;
  onClose: () => void;
}) {
  const detailQuery = useWorkerRunDetail(workerKey, runId, true);
  const run = detailQuery.data?.run;
  const logs = detailQuery.data?.logs ?? [];

  return (
    <section className="workers-detail" aria-label="Detalhe da execução">
      <div className="workers-detail__head">
        <div>
          <h3>Execução {runId.slice(0, 8)}</h3>
          {run ? (
            <p>
              {formatDateTime(run.startedAtUtc)} → {formatDateTime(run.finishedAtUtc)} ·{" "}
              <span className={`workers-status ${statusTone(run.status)}`}>{run.status}</span>
            </p>
          ) : null}
        </div>
        <button type="button" className="workers-btn workers-btn--ghost" onClick={onClose}>
          Fechar
        </button>
      </div>
      {run?.errorMessage ? <p className="workers-detail__error">{run.errorMessage}</p> : null}
      <div className="workers-logs">
        {logs.length === 0 ? (
          <p className="workers-empty">Nenhum log registrado.</p>
        ) : (
          <table className="workers-logs__table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Nível</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.loggedAtUtc)}</td>
                  <td>{log.level}</td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
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
  const historyRef = useRef<HTMLElement | null>(null);

  const runsQuery = useWorkerRuns(selectedKey ?? "", 20, Boolean(selectedKey), true);

  useEffect(() => {
    if (!selectedKey || !historyRef.current) return;
    historyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedKey, runsQuery.isFetching]);

  const workers = definitionsQuery.data ?? [];
  const components = connectivityQuery.data?.components ?? [];

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

  const sortedRuns = useMemo(() => (runsQuery.data ?? []).slice(), [runsQuery.data]);

  if (meLoading) {
    return (
      <main className="main">
        <p className="workers-empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasPermission(PERMISSIONS.admin.workersManage)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
      {confirmModal}
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Workers</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Workers de integração</h1>
            <p className="page-header__desc">
              Acompanhe execuções, logs, conectividade e dispare sincronizações manualmente.
            </p>
          </div>
        </div>
      </header>

      <ConnectivitySection
        components={components}
        checkedAtUtc={connectivityQuery.data?.checkedAtUtc}
        isFetching={connectivityQuery.isFetching}
        isError={connectivityQuery.isError}
        onRefresh={() => void connectivityQuery.refetch()}
      />

      <section className="workers-hub__intro" aria-label="Resumo">
        <div className="workers-hub__intro-head">
          <div className="workers-hub__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-gears" />
          </div>
          <div>
            <div className="workers-hub__intro-title">Jobs em background</div>
            <p className="workers-hub__intro-text">
              Sincronizações TOTVS RM, Microsoft Graph, encerramento de enquetes, holerite, férias e
              e-mail. Cada worker registra execuções e logs para auditoria operacional.
            </p>
            <p className="workers-hub__intro-note">
              Em desenvolvimento, os workers agendados rodam junto com a API. Em produção, use o
              processo <code>LioConecta.Workers</code>.
            </p>
          </div>
        </div>
        <div className="workers-hub__intro-toolbar">
          <Link className="workers-btn workers-btn--ghost" to="/admin/totvs-rm">
            Configurar TOTVS RM
          </Link>
          <Link
            className="workers-btn workers-btn--ghost"
            to="/admin/configuracoes-backend?category=workers"
          >
            Configurar intervalos
          </Link>
        </div>
      </section>

      {feedback ? <p className="workers-feedback">{feedback}</p> : null}

      {definitionsQuery.isError ? (
        <p className="workers-empty">Não foi possível carregar os workers.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.key}
              worker={worker}
              selected={selectedKey === worker.key}
              components={components}
              onSelect={() => {
                setSelectedKey(worker.key);
                setSelectedRunId(null);
              }}
              onRequestTrigger={() => void requestTrigger(worker)}
              triggering={triggerMutation.isPending && triggerMutation.variables === worker.key}
            />
          ))}
        </div>
      )}

      {selectedKey ? (
        <section
          ref={historyRef}
          className="workers-history"
          aria-label="Histórico de execuções"
        >
          <h2>
            Histórico — {workers.find((worker) => worker.key === selectedKey)?.label ?? selectedKey}
          </h2>
          {runsQuery.isLoading ? (
            <p className="workers-empty">Carregando execuções…</p>
          ) : sortedRuns.length === 0 ? (
            <p className="workers-empty">Nenhuma execução registrada.</p>
          ) : (
            <table className="workers-history__table">
              <thead>
                <tr>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                  <th>Trigger</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedRuns.map((run: WorkerRunDto) => (
                  <tr key={run.id}>
                    <td>{formatDateTime(run.startedAtUtc)}</td>
                    <td>{formatDateTime(run.finishedAtUtc)}</td>
                    <td>
                      <span className={`workers-status ${statusTone(run.status)}`}>{run.status}</span>
                    </td>
                    <td>{run.triggerSource}</td>
                    <td>
                      <button
                        type="button"
                        className="workers-btn workers-btn--ghost"
                        onClick={() => setSelectedRunId(run.id)}
                      >
                        Detalhe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {selectedKey && selectedRunId ? (
        <RunDetailPanel
          workerKey={selectedKey}
          runId={selectedRunId}
          onClose={() => setSelectedRunId(null)}
        />
      ) : null}
    </main>
  );
}
