import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { hasPermission } from "../../api/auth";
import {
  useApproveWorkflowStep,
  useCreateMovimentacaoMerito,
  useRejectWorkflowStep,
  useWorkflowPendingForMe,
  type WorkflowInstanceDto,
} from "../../api/hooks/useWorkflows";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Rejeitado";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
}

function pendingStep(instance: WorkflowInstanceDto) {
  return instance.steps.find((s) => s.status.toLowerCase() === "pending") ?? null;
}

export function MovimentacoesPage() {
  const meQuery = useMe();
  const canCreate = hasPermission(meQuery.data, "rh_requests.manage");
  const pendingQuery = useWorkflowPendingForMe(meQuery.isSuccess);
  const createMutation = useCreateMovimentacaoMerito();
  const approveMutation = useApproveWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const [subjectPersonId, setSubjectPersonId] = useState("");
  const [cargo, setCargo] = useState("");
  const [novoSalario, setNovoSalario] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  const items = useMemo(() => pendingQuery.data ?? [], [pendingQuery.data]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormOk(null);
    if (!subjectPersonId.trim()) {
      setFormError("Informe o PersonId do colaborador (GUID).");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        subjectPersonId: subjectPersonId.trim(),
        cargo: cargo.trim() || null,
        novoSalario: novoSalario ? Number(novoSalario) : null,
        justificativa: justificativa.trim() || null,
      });
      setFormOk(`Solicitação criada: ${created.id}`);
      setSubjectPersonId("");
      setCargo("");
      setNovoSalario("");
      setJustificativa("");
    } catch {
      setFormError("Não foi possível criar a movimentação de mérito.");
    }
  };

  const handleStep = async (
    instance: WorkflowInstanceDto,
    action: "approve" | "reject",
  ) => {
    const step = pendingStep(instance);
    if (!step) return;
    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({ instanceId: instance.id, stepId: step.id });
      } else {
        await rejectMutation.mutateAsync({ instanceId: instance.id, stepId: step.id });
      }
    } catch {
      // surface via list refresh; keep UI simple
    }
  };

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Movimentações"
        current="Movimentações"
        description="MVP do motor de workflow (mérito): gestor → RH. Sem write-back RM nesta onda."
        actions={
          <Link className="leave-btn leave-btn--ghost" to="/servicos/rh">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Hub RH
          </Link>
        }
      />

      {canCreate ? (
        <section className="leave-requests-panel" aria-label="Nova movimentação de mérito">
          <h2 className="leave-requests-panel__title">Nova solicitação — Mérito</h2>
          <form className="leave-form" onSubmit={(e) => void handleCreate(e)}>
            <label className="leave-form__field">
              <span>PersonId do colaborador</span>
              <input
                value={subjectPersonId}
                onChange={(e) => setSubjectPersonId(e.target.value)}
                placeholder="GUID da pessoa"
                required
              />
            </label>
            <label className="leave-form__field">
              <span>Novo cargo (opcional)</span>
              <input value={cargo} onChange={(e) => setCargo(e.target.value)} />
            </label>
            <label className="leave-form__field">
              <span>Novo salário (opcional)</span>
              <input
                type="number"
                step="0.01"
                value={novoSalario}
                onChange={(e) => setNovoSalario(e.target.value)}
              />
            </label>
            <label className="leave-form__field">
              <span>Justificativa</span>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={3}
              />
            </label>
            {formError ? (
              <p className="leave-form__error" role="alert">
                {formError}
              </p>
            ) : null}
            {formOk ? <p className="leave-form__hint">{formOk}</p> : null}
            <button
              type="submit"
              className="leave-btn leave-btn--primary"
              disabled={createMutation.isPending}
              data-testid="movimentacao-merito-submit"
            >
              Enviar para aprovação
            </button>
          </form>
          <p className="leave-detail__source" role="note">
            Requer permissão <code>rh_requests.manage</code>. Fluxo: gestor → RH.
          </p>
        </section>
      ) : (
        <p className="leave-requests-panel__empty">
          Sem permissão para criar movimentações (<code>rh_requests.manage</code>).
          Você ainda pode aprovar etapas pendentes atribuídas a você.
        </p>
      )}

      <section className="leave-requests-panel" aria-label="Pendências para mim">
        <h2 className="leave-requests-panel__title">Pendências para mim</h2>
        {pendingQuery.isLoading ? <p>Carregando…</p> : null}
        {!pendingQuery.isLoading && items.length === 0 ? (
          <p className="leave-requests-panel__empty">Nenhuma pendência no momento.</p>
        ) : null}
        <ul className="leave-requests-list">
          {items.map((item) => {
            const step = pendingStep(item);
            return (
              <li key={item.id}>
                <div className="leave-requests-list__item" style={{ cursor: "default" }}>
                  <span className="leave-requests-list__body">
                    <span className="leave-requests-list__head">
                      <span className="leave-requests-list__title">
                        {item.definitionName} — {item.subjectName ?? item.subjectId}
                      </span>
                      <span className={`leave-badge leave-badge--${item.status.toLowerCase()}`}>
                        {statusLabel(item.status)}
                      </span>
                    </span>
                    <span className="leave-requests-list__meta">
                      <span>Etapa: {step?.stepKey ?? "—"}</span>
                      <span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                    </span>
                  </span>
                  {step ? (
                    <span style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        type="button"
                        className="leave-btn leave-btn--primary"
                        data-testid="workflow-approve"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        onClick={() => void handleStep(item, "approve")}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="leave-btn leave-btn--ghost"
                        data-testid="workflow-reject"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        onClick={() => void handleStep(item, "reject")}
                      >
                        Rejeitar
                      </button>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
