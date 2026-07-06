import { Navigate } from "react-router-dom";
import { isAdminUser } from "../../api/auth";
import { useApproveGroup, usePendingGroups, useRejectGroup } from "../../api/hooks/useGroups";
import { useMe } from "../../api/hooks/useMe";
import {
  groupAccessLabel,
  groupStatusLabel,
  groupTypeLabel,
  injectGroupCreatePageStyles,
} from "../../config/groups";
import { useEffect, useState } from "react";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/comunicados-oficiais-page.css";

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GroupApprovalsPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: pending = [], isLoading, isError, refetch } = usePendingGroups();
  const approveGroup = useApproveGroup();
  const rejectGroup = useRejectGroup();
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isAdmin = isAdminUser(me);

  useEffect(() => injectGroupCreatePageStyles(), []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      await approveGroup.mutateAsync(id);
      showToast("Grupo aprovado e ativado com sucesso.");
      await refetch();
    } catch {
      showToast("Não foi possível aprovar o grupo.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Motivo da rejeição (opcional):");
    if (reason === null) return;

    setActionId(id);
    try {
      await rejectGroup.mutateAsync({ id, reason: reason.trim() || null });
      showToast("Grupo rejeitado.");
      await refetch();
    } catch {
      showToast("Não foi possível rejeitar o grupo.");
    } finally {
      setActionId(null);
    }
  }

  if (!meLoading && !isAdmin) {
    return <Navigate to="/grupos" replace />;
  }

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title="Aprovação de Grupos"
        current="Aprovações"
        description="Revise solicitações de criação de grupos e libere ou rejeite antes de ficarem ativos na plataforma."
      />

      {toast ? (
        <p className="page-empty-note" style={{ color: "#15803d", marginBottom: 16 }} role="status">
          {toast}
        </p>
      ) : null}

      {isLoading || meLoading ? (
        <p className="page-empty-note">Carregando solicitações...</p>
      ) : isError ? (
        <p className="page-empty-note">Não foi possível carregar a fila de aprovação.</p>
      ) : pending.length === 0 ? (
        <p className="page-empty-note">Nenhum grupo aguardando aprovação no momento.</p>
      ) : (
        <section className="official-list" aria-label="Grupos pendentes">
          {pending.map((group) => {
            const busy = actionId === group.id;
            return (
              <article key={group.id} className="official-card">
                <div className="official-card__body">
                  <div className="official-card__meta">
                    <span className="tag tag--urgent">{groupStatusLabel(group.status)}</span>
                    <span className="official-card__date">{formatDate(group.createdAt)}</span>
                    <div className="official-card__author">
                      <img
                        className="avatar"
                        src={group.owner.photoUrl ?? "/avatar-maria-silva.png"}
                        alt=""
                      />
                      {group.owner.name}
                    </div>
                  </div>
                  <h2 className="official-card__title">
                    <i className={`fa-solid ${group.icon}`} aria-hidden="true" /> {group.name}
                  </h2>
                  {group.description ? (
                    <p className="official-card__excerpt">{group.description}</p>
                  ) : null}
                  <p className="page-empty-note" style={{ marginTop: 8 }}>
                    {groupTypeLabel(group.type)} · {groupAccessLabel(group.accessMode)}
                  </p>
                  <div className="form-actions" style={{ marginTop: 16, justifyContent: "flex-start" }}>
                    <button
                      className="btn-primary"
                      type="button"
                      disabled={busy}
                      onClick={() => void handleApprove(group.id)}
                    >
                      {busy ? "Processando..." : "Aprovar"}
                    </button>
                    <button
                      className="btn-secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => void handleReject(group.id)}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <p className="page-empty-note">
        {pending.length === 1
          ? "Exibindo 1 grupo aguardando aprovação"
          : `Exibindo ${pending.length} grupos aguardando aprovação`}
      </p>
    </main>
  );
}
