import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useApproveGroup,
  useApproveOwnershipTransfer,
  useExpiredGroups,
  usePendingForMeGroups,
  usePendingOwnershipTransfers,
  useRejectGroup,
  useRejectOwnershipTransfer,
} from "../../api/hooks/useGroups";
import { useMe } from "../../api/hooks/useMe";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import {
  GROUP_STATUS_EXPIRED,
  type GroupDto,
  type GroupOwnershipTransferDto,
} from "../../api/types";
import {
  groupStatusBadgeClass,
  groupStatusLabel,
  groupTypeLabel,
  injectGroupCreatePageStyles,
} from "../../config/groups";
import { UserAvatar } from "../ui/UserAvatar";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/comunicados-oficiais-page.css";
import "../../styles/group-status-badges.css";
import "../../styles/group-approvals-page.css";

type ApprovalsTab = "para-mim" | "expirados" | "transferencias";

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

function expiryLabel(group: GroupDto): string {
  if (!group.expiresAt) return "";
  const prefix = group.status === GROUP_STATUS_EXPIRED ? "Expirou em" : "Expira em";
  return ` · ${prefix} ${formatDate(group.expiresAt)}`;
}

function PendingGroupsList({
  groups,
  isLoading,
  isError,
  emptyMessage,
  showActions,
}: {
  groups: GroupDto[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  showActions: boolean;
}) {
  const approveGroup = useApproveGroup();
  const rejectGroup = useRejectGroup();
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      await approveGroup.mutateAsync(id);
      showToast("Grupo aprovado e ativado com sucesso.");
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
    } catch {
      showToast("Não foi possível rejeitar o grupo.");
    } finally {
      setActionId(null);
    }
  }

  if (isLoading) {
    return <p className="page-empty-note">Carregando grupos...</p>;
  }
  if (isError) {
    return <p className="page-empty-note">Não foi possível carregar a lista de grupos.</p>;
  }
  if (groups.length === 0) {
    return <p className="page-empty-note">{emptyMessage}</p>;
  }

  return (
    <>
      {toast ? (
        <p className="page-empty-note" style={{ color: "#15803d", marginBottom: 16 }} role="status">
          {toast}
        </p>
      ) : null}
      <section className="group-approvals-list" aria-label="Grupos">
        {groups.map((group) => {
          const busy = actionId === group.id;
          return (
            <article
              key={group.id}
              className={`group-approval-card${showActions ? "" : " group-approval-card--no-actions"}`}
            >
              <div className="group-approval-card__body">
                <div className="group-approval-card__main">
                  <div className="group-approval-card__meta">
                    <span className={groupStatusBadgeClass(group.status)}>
                      {groupStatusLabel(group.status)}
                    </span>
                    <span className="group-approval-card__date">
                      {formatDate(group.submittedAt ?? group.createdAt)}
                    </span>
                    <div className="group-approval-card__author">
                      <UserAvatar className="avatar" photoUrl={group.owner.photoUrl} />
                      {group.owner.name}
                    </div>
                  </div>
                  <h2 className="group-approval-card__title">
                    <i className={`fa-solid ${group.icon}`} aria-hidden="true" />
                    <span>{group.name}</span>
                  </h2>
                  {group.description ? (
                    <p className="group-approval-card__excerpt">{group.description}</p>
                  ) : null}
                  <p className="group-approval-card__info">
                    {groupTypeLabel(group.type)}
                    {expiryLabel(group)}
                  </p>
                </div>
                {showActions ? (
                  <div className="group-approval-card__actions">
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
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
      <p className="group-approvals-footer">
        {groups.length === 1 ? "Exibindo 1 grupo" : `Exibindo ${groups.length} grupos`}
      </p>
    </>
  );
}

function OwnershipTransfersList({
  transfers,
  isLoading,
  isError,
}: {
  transfers: GroupOwnershipTransferDto[];
  isLoading: boolean;
  isError: boolean;
}) {
  const approveTransfer = useApproveOwnershipTransfer();
  const rejectTransfer = useRejectOwnershipTransfer();
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      await approveTransfer.mutateAsync(id);
      showToast("Transferência de propriedade aprovada.");
    } catch {
      showToast("Não foi possível aprovar a transferência.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setActionId(id);
    try {
      await rejectTransfer.mutateAsync(id);
      showToast("Transferência de propriedade rejeitada.");
    } catch {
      showToast("Não foi possível rejeitar a transferência.");
    } finally {
      setActionId(null);
    }
  }

  if (isLoading) {
    return <p className="page-empty-note">Carregando transferências...</p>;
  }
  if (isError) {
    return <p className="page-empty-note">Não foi possível carregar as transferências pendentes.</p>;
  }
  if (transfers.length === 0) {
    return <p className="page-empty-note">Nenhuma transferência de propriedade pendente para você.</p>;
  }

  return (
    <>
      {toast ? (
        <p className="page-empty-note" style={{ color: "#15803d", marginBottom: 16 }} role="status">
          {toast}
        </p>
      ) : null}
      <section className="group-approvals-list" aria-label="Transferências de propriedade pendentes">
        {transfers.map((transfer) => {
          const busy = actionId === transfer.id;
          return (
            <article key={transfer.id} className="group-approval-card">
              <div className="group-approval-card__body">
                <div className="group-approval-card__main">
                  <div className="group-approval-card__meta">
                    <span className="group-status-badge group-status-badge--pending">Pendente</span>
                    <span className="group-approval-card__date">{formatDate(transfer.createdAt)}</span>
                  </div>
                  <h2 className="group-approval-card__title">
                    <i className={`fa-solid ${transfer.groupIcon ?? "fa-users"}`} aria-hidden="true" />
                    <span>{transfer.groupName}</span>
                  </h2>
                  <div className="group-approval-card__author">
                    <UserAvatar className="avatar" photoUrl={transfer.fromPerson.photoUrl} />
                    <span>
                      <strong>{transfer.fromPerson.name}</strong> quer transferir a propriedade deste grupo
                      para você.
                    </span>
                  </div>
                </div>
                <div className="group-approval-card__actions">
                  <button
                    className="btn-primary"
                    type="button"
                    disabled={busy}
                    onClick={() => void handleApprove(transfer.id)}
                  >
                    {busy ? "Processando..." : "Aceitar"}
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReject(transfer.id)}
                  >
                    Recusar
                  </button>
                  <Link className="btn-secondary" to={`/grupos/${transfer.groupId}`}>
                    Ver grupo
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export function GroupApprovalsPage() {
  const { isLoading: meLoading } = useMe();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.groups.approve);

  const [tab, setTab] = useState<ApprovalsTab>("para-mim");

  const pendingForMe = usePendingForMeGroups();
  const expiredGroups = useExpiredGroups(canApprove);
  const pendingTransfers = usePendingOwnershipTransfers();

  useEffect(() => injectGroupCreatePageStyles(), []);

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title="Aprovação de Grupos"
        current="Aprovações"
        description="Revise solicitações de criação de grupos, grupos expirados e transferências de propriedade pendentes."
        toolbar={
          <div className="page-filters" role="tablist" aria-label="Abas de aprovações">
            <button
              className={`filter-chip${tab === "para-mim" ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={tab === "para-mim"}
              onClick={() => setTab("para-mim")}
            >
              Para mim
            </button>
            {canApprove ? (
              <button
                className={`filter-chip${tab === "expirados" ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={tab === "expirados"}
                onClick={() => setTab("expirados")}
              >
                Expirados
              </button>
            ) : null}
            <button
              className={`filter-chip${tab === "transferencias" ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={tab === "transferencias"}
              onClick={() => setTab("transferencias")}
            >
              Transferências de propriedade
              {pendingTransfers.data && pendingTransfers.data.length > 0
                ? ` (${pendingTransfers.data.length})`
                : ""}
            </button>
          </div>
        }
      />

      {meLoading ? (
        <p className="page-empty-note">Carregando...</p>
      ) : tab === "para-mim" ? (
        <PendingGroupsList
          groups={pendingForMe.data ?? []}
          isLoading={pendingForMe.isLoading}
          isError={pendingForMe.isError}
          emptyMessage="Nenhum grupo aguardando sua aprovação no momento."
          showActions
        />
      ) : tab === "expirados" ? (
        <PendingGroupsList
          groups={expiredGroups.data ?? []}
          isLoading={expiredGroups.isLoading}
          isError={expiredGroups.isError}
          emptyMessage="Nenhum grupo expirado no momento."
          showActions={false}
        />
      ) : (
        <OwnershipTransfersList
          transfers={pendingTransfers.data ?? []}
          isLoading={pendingTransfers.isLoading}
          isError={pendingTransfers.isError}
        />
      )}
    </main>
  );
}
