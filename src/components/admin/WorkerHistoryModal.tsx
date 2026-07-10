import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { useWorkerRunDetail, useWorkerRuns } from "../../api/hooks/useWorkers";
import type { WorkerRunDto } from "../../api/types";
import {
  formatDateTime,
  formatDuration,
  statusLabel,
  statusTone,
  triggerLabel,
  triggerTone,
} from "./workerUi";
import "../../styles/workers-hub-page.css";

type Props = {
  open: boolean;
  workerKey: string;
  workerLabel: string;
  selectedRunId: string | null;
  onSelectRun: (runId: string | null) => void;
  onClose: () => void;
};

function RunDetailStacked({
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
    <ContrachequeModal
      open
      stacked
      wide
      title={`Execução ${runId.slice(0, 8)}`}
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
          Fechar detalhe
        </button>
      }
    >
      {detailQuery.isLoading ? <p className="workers-empty">Carregando detalhe…</p> : null}
      {detailQuery.isError ? (
        <p className="workers-empty">Não foi possível carregar o detalhe da execução.</p>
      ) : null}
      {run ? (
        <div className="workers-modal__meta">
          <span className={`workers-status ${statusTone(run.status)}`}>{statusLabel(run.status)}</span>
          <span>
            {formatDateTime(run.startedAtUtc)} → {formatDateTime(run.finishedAtUtc)}
          </span>
          <span>{formatDuration(run.startedAtUtc, run.finishedAtUtc)}</span>
          <span className={`workers-status ${triggerTone(run.triggerSource)}`}>
            {triggerLabel(run.triggerSource)}
          </span>
        </div>
      ) : null}
      {run?.errorMessage ? <p className="workers-detail__error">{run.errorMessage}</p> : null}
      <div className="workers-logs">
        {logs.length === 0 && !detailQuery.isLoading ? (
          <p className="workers-empty">Nenhum log registrado.</p>
        ) : (
          <table className="workers-logs__table workers-modal__table">
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
    </ContrachequeModal>
  );
}

export function WorkerHistoryModal({
  open,
  workerKey,
  workerLabel,
  selectedRunId,
  onSelectRun,
  onClose,
}: Props) {
  const runsQuery = useWorkerRuns(workerKey, 50, open, true);
  const runs = runsQuery.data ?? [];

  return (
    <>
      <ContrachequeModal
        open={open}
        wide
        title={`Histórico — ${workerLabel}`}
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost"
              onClick={() => void runsQuery.refetch()}
              disabled={runsQuery.isFetching}
            >
              {runsQuery.isFetching ? "Atualizando…" : "Atualizar"}
            </button>
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
              Fechar
            </button>
          </>
        }
      >
        <p className="workers-modal__subtitle">
          Execuções recentes de <code>{workerKey}</code>. Clique no olho para ver os logs.
        </p>
        {runsQuery.isLoading ? <p className="workers-empty">Carregando execuções…</p> : null}
        {runsQuery.isError ? (
          <p className="workers-empty">Não foi possível carregar o histórico.</p>
        ) : null}
        {!runsQuery.isLoading && !runsQuery.isError && runs.length === 0 ? (
          <p className="workers-empty">Nenhuma execução registrada.</p>
        ) : null}
        {runs.length > 0 ? (
          <table className="workers-history__table workers-modal__table">
            <thead>
              <tr>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
                <th>Duração</th>
                <th>Trigger</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run: WorkerRunDto) => (
                <tr key={run.id} className={selectedRunId === run.id ? "is-selected" : undefined}>
                  <td>{formatDateTime(run.startedAtUtc)}</td>
                  <td>{formatDateTime(run.finishedAtUtc)}</td>
                  <td>
                    <span className={`workers-status ${statusTone(run.status)}`}>
                      {statusLabel(run.status)}
                    </span>
                  </td>
                  <td>{formatDuration(run.startedAtUtc, run.finishedAtUtc)}</td>
                  <td>
                    <span className={`workers-status ${triggerTone(run.triggerSource)}`}>
                      {triggerLabel(run.triggerSource)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="workers-icon-btn"
                      onClick={() => onSelectRun(run.id)}
                      title="Ver logs"
                      aria-label="Ver logs"
                    >
                      <i className="fa-solid fa-eye" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </ContrachequeModal>

      {open && selectedRunId ? (
        <RunDetailStacked
          workerKey={workerKey}
          runId={selectedRunId}
          onClose={() => onSelectRun(null)}
        />
      ) : null}
    </>
  );
}
