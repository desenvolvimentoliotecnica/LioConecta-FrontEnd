import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { canAccessAdminArea } from "../../api/auth";
import {
  useTriggerWorker,
  useWorkerDefinitions,
  useWorkerRunDetail,
  useWorkerRuns,
} from "../../api/hooks/useWorkers";
import { useMe } from "../../api/hooks/useMe";
import type { WorkerDefinitionDto, WorkerRunDto } from "../../api/types";
import "../../styles/workers-hub-page.css";

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

function WorkerCard({
  worker,
  selected,
  onSelect,
  onTrigger,
  triggering,
}: {
  worker: WorkerDefinitionDto;
  selected: boolean;
  onSelect: () => void;
  onTrigger: () => void;
  triggering: boolean;
}) {
  const runsQuery = useWorkerRuns(worker.key, 1);
  const lastRun = runsQuery.data?.[0];

  return (
    <article className={`workers-card${selected ? " is-selected" : ""}`}>
      <div className="workers-card__head">
        <div>
          <h2 className="workers-card__title">{worker.label}</h2>
          <p className="workers-card__desc">{worker.description}</p>
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
        {worker.key === "totvs-timesheet-sync" ? (
          <Link className="workers-btn workers-btn--ghost" to="/admin/totvs-rm">
            Configurar RM
          </Link>
        ) : null}
        <button type="button" className="workers-btn workers-btn--ghost" onClick={onSelect}>
          Ver histórico
        </button>
        <button
          type="button"
          className="workers-btn workers-btn--primary"
          onClick={onTrigger}
          disabled={triggering || lastRun?.status === "Running"}
        >
          {triggering ? "Disparando…" : "Executar agora"}
        </button>
      </div>
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
  const meQuery = useMe();
  const definitionsQuery = useWorkerDefinitions();
  const triggerMutation = useTriggerWorker();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);

  const runsQuery = useWorkerRuns(selectedKey ?? "", 20, Boolean(selectedKey));

  useEffect(() => {
    if (!selectedKey || !historyRef.current) return;
    historyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedKey, runsQuery.isFetching]);

  const workers = definitionsQuery.data ?? [];

  const handleTrigger = async (workerKey: string) => {
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

  const sortedRuns = useMemo(
    () => (runsQuery.data ?? []).slice(),
    [runsQuery.data],
  );

  if (meQuery.isLoading) {
    return (
      <main className="main">
        <p className="workers-empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!canAccessAdminArea(meQuery.data)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
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
              Acompanhe execuções, logs e dispare sincronizações manualmente.
            </p>
          </div>
        </div>
      </header>

      <section className="workers-hub__intro" aria-label="Resumo">
        <div className="workers-hub__intro-head">
          <div className="workers-hub__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-gears" />
          </div>
          <div>
            <div className="workers-hub__intro-title">Jobs em background</div>
            <p className="workers-hub__intro-text">
              Sincronizações TOTVS RM, Microsoft Graph, encerramento de enquetes e espelho de ponto.
              Cada worker registra execuções e logs para auditoria operacional.
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
              onSelect={() => {
                setSelectedKey(worker.key);
                setSelectedRunId(null);
              }}
              onTrigger={() => void handleTrigger(worker.key)}
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
