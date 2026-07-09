import { useEffect, useState } from "react";
import type { RoleDto } from "../../../api/types";
import { ContrachequeModal } from "../../contracheque/ContrachequeModal";
import { RbacRolePicker } from "./RbacRolePicker";
import { RbacSubjectPicker } from "./RbacSubjectPicker";
import type { AssignmentGroup, AssignmentSubject, BulkAssignmentMode } from "./rbacUi";
import { computeBulkRoleIds, toRbacSubjectTypeApiValue } from "./rbacUi";

export type AssignmentModalMode = "create" | "edit" | "bulk";

type Props = {
  mode: AssignmentModalMode;
  open: boolean;
  roles: RoleDto[];
  subjects: AssignmentGroup[];
  initialRoleIds?: string[];
  pending?: boolean;
  onClose: () => void;
  onSave: (payload: {
    subjects: AssignmentSubject[];
    roleIds: string[];
    bulkMode?: BulkAssignmentMode;
  }) => Promise<void>;
};

const BULK_MODES: { id: BulkAssignmentMode; label: string; description: string }[] = [
  {
    id: "replace",
    label: "Substituir",
    description: "Define exatamente as regras marcadas para cada sujeito.",
  },
  {
    id: "add",
    label: "Adicionar",
    description: "Mantém as regras atuais e inclui as selecionadas.",
  },
  {
    id: "remove",
    label: "Remover",
    description: "Remove apenas as regras selecionadas dos sujeitos.",
  },
];

export function RbacAssignmentModal({
  mode,
  open,
  roles,
  subjects,
  initialRoleIds = [],
  pending = false,
  onClose,
  onSave,
}: Props) {
  const [selectedSubjects, setSelectedSubjects] = useState<AssignmentSubject[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<BulkAssignmentMode>("replace");

  useEffect(() => {
    if (!open) return;
    setSelectedSubjects(
      mode === "create"
        ? []
        : subjects.map((subject) => ({
            subjectType: subject.subjectType,
            subjectId: subject.subjectId,
            label: subject.label,
          })),
    );
    setSelectedRoleIds(initialRoleIds);
    setBulkMode("replace");
  }, [open, mode, subjects, initialRoleIds]);

  const title =
    mode === "create"
      ? "Nova atribuição"
      : mode === "edit"
        ? "Editar regras do sujeito"
        : `Editar em massa (${subjects.length})`;

  const handleSave = async () => {
    if (mode === "bulk") {
      await onSave({ subjects: selectedSubjects, roleIds: selectedRoleIds, bulkMode });
      return;
    }
    await onSave({ subjects: selectedSubjects, roleIds: selectedRoleIds });
  };

  const canSave =
    selectedSubjects.length > 0 &&
    (mode === "bulk" ? selectedRoleIds.length > 0 || bulkMode === "remove" : true);

  return (
    <ContrachequeModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={pending || !canSave}
            onClick={() => void handleSave()}
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <div className="controle-acesso__modal-form">
        {mode === "create" ? (
          <RbacSubjectPicker selected={selectedSubjects} onChange={setSelectedSubjects} disabled={pending} />
        ) : (
          <div className="controle-acesso__field">
            <span className="controle-acesso__field-label">Sujeito(s)</span>
            <ul className="controle-acesso__assignment-targets">
              {subjects.map((subject) => (
                <li key={subject.key}>
                  <strong>{subject.label}</strong>
                  <span className="controle-acesso__permission-desc">
                    {subject.typeLabel} · {subject.roles.map((role) => role.name).join(", ") || "sem regras"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mode === "bulk" ? (
          <div className="controle-acesso__field">
            <span className="controle-acesso__field-label">Modo de edição</span>
            <div className="page-filters" role="radiogroup" aria-label="Modo de edição em massa">
              {BULK_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip${bulkMode === item.id ? " is-active" : ""}`}
                  disabled={pending}
                  onClick={() => setBulkMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="controle-acesso__permission-desc">
              {BULK_MODES.find((item) => item.id === bulkMode)?.description}
            </p>
          </div>
        ) : null}

        <div className="controle-acesso__field">
          <span className="controle-acesso__field-label">
            {mode === "bulk" && bulkMode === "remove" ? "Regras a remover" : "Regras"}
          </span>
          <RbacRolePicker
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onChange={setSelectedRoleIds}
            disabled={pending}
          />
        </div>

        {mode !== "create" ? (
          <p className="controle-acesso__readonly-note">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Alterações em regras podem exigir novo login para refletir permissões no portal.
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}

export function buildAssignmentPayload(
  subjects: AssignmentGroup[],
  roleIds: string[],
  bulkMode?: BulkAssignmentMode,
) {
  return subjects.map((subject) => ({
    subjectType: toRbacSubjectTypeApiValue(subject.subjectType),
    subjectId: subject.subjectId,
    roleIds: bulkMode
      ? computeBulkRoleIds(
          bulkMode,
          subject.roles.map((role) => role.id),
          roleIds,
        )
      : roleIds,
  }));
}
