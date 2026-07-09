import { useMemo, useState } from "react";
import type { SubjectRoleAssignmentDto } from "../../../api/types";
import {
  useBulkUpdateRbacAssignments,
  useRbacAssignments,
  useRbacRoles,
  useUpdateRbacAssignments,
} from "../../../api/hooks/useRbacAdmin";
import type { AssignmentModalMode } from "./RbacAssignmentModal";
import { buildAssignmentPayload, RbacAssignmentModal } from "./RbacAssignmentModal";
import { apiErrorMessage, subjectTypeLabel, type AssignmentGroup } from "./rbacUi";

function groupAssignments(items: SubjectRoleAssignmentDto[]): AssignmentGroup[] {
  const map = new Map<string, AssignmentGroup>();

  for (const item of items) {
    const key = `${item.subjectType}:${item.subjectId}`;
    const existing = map.get(key);
    if (existing) {
      existing.roles.push({ id: item.roleId, name: item.roleName });
      continue;
    }

    map.set(key, {
      key,
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      label: item.subjectLabel,
      typeLabel: subjectTypeLabel(item.subjectType),
      roles: [{ id: item.roleId, name: item.roleName }],
    });
  }

  return [...map.values()];
}

export function AssignmentsTab() {
  const [subjectType, setSubjectType] = useState("");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [modalMode, setModalMode] = useState<AssignmentModalMode | null>(null);
  const [modalSubjects, setModalSubjects] = useState<AssignmentGroup[]>([]);

  const assignmentsQuery = useRbacAssignments({
    subjectType: subjectType || undefined,
    query: query || undefined,
  });
  const rolesQuery = useRbacRoles();
  const updateAssignments = useUpdateRbacAssignments();
  const bulkUpdateAssignments = useBulkUpdateRbacAssignments();

  const grouped = useMemo(
    () => groupAssignments(assignmentsQuery.data ?? []),
    [assignmentsQuery.data],
  );

  const selectedGroups = grouped.filter((row) => selectedKeys.has(row.key));
  const pending = updateAssignments.isPending || bulkUpdateAssignments.isPending;

  const toggleRow = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedKeys((prev) => {
      if (prev.size === grouped.length) return new Set();
      return new Set(grouped.map((row) => row.key));
    });
  };

  const openModal = (mode: AssignmentModalMode, subjects: AssignmentGroup[]) => {
    setModalMode(mode);
    setModalSubjects(subjects);
  };

  const closeModal = () => {
    if (pending) return;
    setModalMode(null);
    setModalSubjects([]);
  };

  const handleSave = async ({
    subjects,
    roleIds,
    bulkMode,
  }: {
    subjects: { subjectType: AssignmentGroup["subjectType"]; subjectId: string; label: string }[];
    roleIds: string[];
    bulkMode?: "replace" | "add" | "remove";
  }) => {
    try {
      const targetGroups =
        modalMode === "create"
          ? subjects.map((subject) => ({
              key: `${subject.subjectType}:${subject.subjectId}`,
              subjectType: subject.subjectType,
              subjectId: subject.subjectId,
              label: subject.label,
              typeLabel: subjectTypeLabel(subject.subjectType),
              roles: [] as { id: string; name: string }[],
            }))
          : modalSubjects;

      const items = buildAssignmentPayload(targetGroups, roleIds, bulkMode);

      if (items.length === 1) {
        await updateAssignments.mutateAsync(items[0]!);
      } else {
        await bulkUpdateAssignments.mutateAsync({ items });
      }

      setFeedback(
        items.length === 1
          ? "Atribuição atualizada com sucesso."
          : `${items.length} atribuições atualizadas com sucesso.`,
      );
      setSelectedKeys(new Set());
      closeModal();
    } catch (error) {
      setFeedback(apiErrorMessage(error));
    }
  };

  const initialRoleIds =
    modalMode === "edit" && modalSubjects.length === 1
      ? modalSubjects[0]!.roles.map((role) => role.id)
      : [];

  return (
    <section className="controle-acesso__panel">
      <div className="controle-acesso__intro">
        <div className="controle-acesso__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-link" />
        </div>
        <div>
          <div className="controle-acesso__intro-title">Atribuições de regras</div>
          <p className="controle-acesso__intro-text">
            Atribua regras a colaboradores do diretório, usuários de teste ou PortalUsers. Use a edição
            individual ou em massa para ajustar permissões de acesso.
          </p>
        </div>
      </div>

      <div className="controle-acesso__toolbar">
        <select
          className="controle-acesso__select"
          value={subjectType}
          onChange={(event) => setSubjectType(event.target.value)}
          aria-label="Filtrar por tipo de sujeito"
        >
          <option value="">Todos os tipos</option>
          <option value="PortalUser">PortalUser</option>
          <option value="Person">Person</option>
          <option value="TestUser">TestUser</option>
        </select>
        <input
          className="controle-acesso__search"
          type="search"
          placeholder="Buscar por nome ou e-mail…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar atribuições"
        />
        <div className="controle-acesso__toolbar-end">
          {selectedKeys.size > 0 ? (
            <span className="controle-acesso__status">{selectedKeys.size} selecionado(s)</span>
          ) : null}
          <button
            type="button"
            className="controle-acesso-btn controle-acesso-btn--ghost"
            disabled={selectedKeys.size === 0 || pending}
            onClick={() => openModal("bulk", selectedGroups)}
          >
            <i className="fa-solid fa-users-gear" aria-hidden="true" />
            Editar em massa
          </button>
          <button
            type="button"
            className="controle-acesso-btn controle-acesso-btn--primary"
            disabled={pending}
            onClick={() => openModal("create", [])}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            Nova atribuição
          </button>
        </div>
      </div>

      {feedback ? <p className="controle-acesso__status">{feedback}</p> : null}
      {assignmentsQuery.isLoading ? <p className="controle-acesso__status">Carregando atribuições…</p> : null}
      {assignmentsQuery.isError ? (
        <p className="controle-acesso__status controle-acesso__status--error">
          Não foi possível carregar atribuições.
        </p>
      ) : null}

      {!assignmentsQuery.isLoading && grouped.length === 0 ? (
        <p className="controle-acesso__empty">Nenhuma atribuição encontrada.</p>
      ) : (
        <div className="controle-acesso__table-wrap">
          <table className="controle-acesso__table">
            <thead>
              <tr>
                <th className="controle-acesso__table-check">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos"
                    checked={grouped.length > 0 && selectedKeys.size === grouped.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Sujeito</th>
                <th>Tipo</th>
                <th>Regras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.key} className={selectedKeys.has(row.key) ? "is-selected" : undefined}>
                  <td className="controle-acesso__table-check">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar ${row.label}`}
                      checked={selectedKeys.has(row.key)}
                      onChange={() => toggleRow(row.key)}
                    />
                  </td>
                  <td>{row.label}</td>
                  <td>{row.typeLabel}</td>
                  <td>
                    <div className="controle-acesso__role-tags">
                      {row.roles.map((role) => (
                        <span key={role.id} className="controle-acesso__badge">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="controle-acesso-btn controle-acesso-btn--ghost"
                      disabled={pending}
                      onClick={() => openModal("edit", [row])}
                    >
                      Editar regras
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalMode ? (
        <RbacAssignmentModal
          mode={modalMode}
          open
          roles={rolesQuery.data ?? []}
          subjects={modalSubjects}
          initialRoleIds={initialRoleIds}
          pending={pending}
          onClose={closeModal}
          onSave={handleSave}
        />
      ) : null}
    </section>
  );
}
