import { useEffect, useState } from "react";
import type { RolePermissionDto } from "../../../api/types";
import {
  useRbacPermissions,
  useRbacRoleDetail,
  useUpdateRbacRolePermissions,
} from "../../../api/hooks/useRbacAdmin";
import { ContrachequeModal } from "../../contracheque/ContrachequeModal";
import { RbacPermissionEditor } from "./RbacPermissionEditor";
import { apiErrorMessage, isRolePermissionsEditable, scopeLabel, toDataScopeApiValue } from "./rbacUi";

type Props = {
  roleId: string;
  roleName?: string;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

export function RoleDetailModal({ roleId, roleName, onClose, onSaved }: Props) {
  const detailQuery = useRbacRoleDetail(roleId);
  const permissionsQuery = useRbacPermissions();
  const updatePermissions = useUpdateRbacRolePermissions();
  const [editing, setEditing] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionDto[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const role = detailQuery.data;
  const editable = role ? isRolePermissionsEditable(role) : false;
  const title = role?.name ?? roleName ?? "Detalhes da regra";
  const pending = updatePermissions.isPending;

  useEffect(() => {
    if (!editing || !role) return;
    setDraftPermissions(role.permissions);
  }, [editing, role]);

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const startEditing = () => {
    if (!role || !editable) return;
    setDraftPermissions(role.permissions);
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    if (pending) return;
    setEditing(false);
    setSaveError(null);
    setDraftPermissions([]);
  };

  const handleSave = async () => {
    if (!role) return;
    setSaveError(null);
    try {
      await updatePermissions.mutateAsync({
        id: role.id,
        body: {
          permissions: draftPermissions.map((permission) => ({
            permissionKey: permission.permissionKey,
            dataScope: toDataScopeApiValue(permission.dataScope),
          })),
        },
      });
      setEditing(false);
      onSaved?.(`Permissões da regra "${role.name}" atualizadas.`);
    } catch (error) {
      setSaveError(apiErrorMessage(error));
    }
  };

  return (
    <ContrachequeModal
      open
      title={title}
      wide
      stacked
      onClose={handleClose}
      footer={
        editing ? (
          <>
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost"
              onClick={cancelEditing}
              disabled={pending}
            >
              Cancelar
            </button>
            <button type="button" className="pay-modal__btn" disabled={pending} onClick={() => void handleSave()}>
              {pending ? "Salvando…" : "Salvar permissões"}
            </button>
          </>
        ) : (
          <>
            {editable ? (
              <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={startEditing}>
                Editar permissões
              </button>
            ) : null}
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
              Fechar
            </button>
          </>
        )
      }
    >
      {detailQuery.isLoading ? <p className="controle-acesso__status">Carregando detalhes…</p> : null}
      {detailQuery.isError ? (
        <p className="controle-acesso__status controle-acesso__status--error">Falha ao carregar detalhes.</p>
      ) : null}

      {role ? (
        <div className="controle-acesso__detail-modal">
          {role.description ? <p className="controle-acesso__permission-desc">{role.description}</p> : null}

          {!editable ? (
            <p className="controle-acesso__readonly-note">
              <i className="fa-solid fa-lock" aria-hidden="true" />
              {role.isSystem
                ? "Regras de sistema têm permissões fixas e não podem ser alteradas."
                : "Templates de key user são somente leitura."}
            </p>
          ) : null}

          {editing ? (
            <>
              {permissionsQuery.isLoading ? (
                <p className="controle-acesso__status">Carregando catálogo de permissões…</p>
              ) : null}
              {permissionsQuery.isError ? (
                <p className="controle-acesso__status controle-acesso__status--error">
                  Não foi possível carregar o catálogo de permissões.
                </p>
              ) : null}
              {permissionsQuery.data ? (
                <RbacPermissionEditor
                  catalog={permissionsQuery.data}
                  permissions={draftPermissions}
                  onChange={setDraftPermissions}
                  disabled={pending}
                />
              ) : null}
              {saveError ? (
                <p className="controle-acesso__status controle-acesso__status--error">{saveError}</p>
              ) : null}
              <p className="controle-acesso__readonly-note">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                Alterações em regras podem exigir novo login para refletir permissões no portal.
              </p>
            </>
          ) : (
            <>
              <p className="controle-acesso__intro-text">
                {role.permissions.length} permissões efetivas na matriz.
              </p>
              <div className="controle-acesso__table-wrap controle-acesso__detail-modal-table">
                <table className="controle-acesso__table">
                  <thead>
                    <tr>
                      <th>Permissão</th>
                      <th>Escopo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {role.permissions.map((permission) => (
                      <tr key={`${permission.permissionKey}-${scopeLabel(permission.dataScope)}`}>
                        <td className="controle-acesso__permission-key">{permission.permissionKey}</td>
                        <td>
                          <span className="controle-acesso__badge controle-acesso__badge--scope">
                            {scopeLabel(permission.dataScope)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}
    </ContrachequeModal>
  );
}
