import { useMemo, useState } from "react";
import type { DataScope, PermissionCatalogItemDto, RolePermissionDto } from "../../../api/types";
import { scopeLabel } from "./rbacUi";

type Props = {
  catalog: PermissionCatalogItemDto[];
  permissions: RolePermissionDto[];
  onChange: (permissions: RolePermissionDto[]) => void;
  disabled?: boolean;
};

function normalizeScopeOptions(scopes: DataScope[]): DataScope[] {
  const unique = new Map<string, DataScope>();
  for (const scope of scopes) {
    unique.set(scopeLabel(scope), scope);
  }
  return [...unique.values()];
}

function defaultScopeForItem(item: PermissionCatalogItemDto): DataScope {
  return item.allowedScopes[0] ?? "Global";
}

export function RbacPermissionEditor({ catalog, permissions, onChange, disabled }: Props) {
  const [search, setSearch] = useState("");
  const catalogByKey = useMemo(
    () => new Map(catalog.map((item) => [item.key, item])),
    [catalog],
  );
  const assignedKeys = useMemo(() => new Set(permissions.map((item) => item.permissionKey)), [permissions]);

  const available = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog
      .filter((item) => !assignedKeys.has(item.key))
      .filter((item) => {
        if (!term) return true;
        return (
          item.key.toLowerCase().includes(term) ||
          item.label.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.module.toLowerCase().includes(term)
        );
      });
  }, [assignedKeys, catalog, search]);

  const updateScope = (permissionKey: string, dataScope: DataScope) => {
    if (disabled) return;
    onChange(
      permissions.map((item) =>
        item.permissionKey === permissionKey ? { ...item, dataScope } : item,
      ),
    );
  };

  const removePermission = (permissionKey: string) => {
    if (disabled) return;
    onChange(permissions.filter((item) => item.permissionKey !== permissionKey));
  };

  const addPermission = (item: PermissionCatalogItemDto) => {
    if (disabled || assignedKeys.has(item.key)) return;
    onChange([
      ...permissions,
      { permissionKey: item.key, dataScope: defaultScopeForItem(item) },
    ]);
    setSearch("");
  };

  return (
    <div className="controle-acesso__permission-editor">
      <div className="controle-acesso__permission-editor-section">
        <span className="controle-acesso__field-label">Permissões atribuídas</span>
        {permissions.length === 0 ? (
          <p className="controle-acesso__status">Nenhuma permissão atribuída.</p>
        ) : (
          <div className="controle-acesso__table-wrap controle-acesso__permission-editor-assigned">
            <table className="controle-acesso__table">
              <thead>
                <tr>
                  <th>Permissão</th>
                  <th>Escopo</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => {
                  const catalogItem = catalogByKey.get(permission.permissionKey);
                  const scopeOptions = normalizeScopeOptions(
                    catalogItem?.allowedScopes?.length
                      ? catalogItem.allowedScopes
                      : ["Self", "Team", "Department", "Global"],
                  );
                  return (
                    <tr key={permission.permissionKey}>
                      <td>
                        <div className="controle-acesso__permission-key">{permission.permissionKey}</div>
                        {catalogItem?.label ? (
                          <div className="controle-acesso__permission-desc">{catalogItem.label}</div>
                        ) : null}
                      </td>
                      <td>
                        <select
                          className="controle-acesso__permission-editor-scope"
                          value={scopeLabel(permission.dataScope)}
                          disabled={disabled}
                          onChange={(event) => {
                            const nextScope = scopeOptions.find(
                              (scope) => scopeLabel(scope) === event.target.value,
                            );
                            if (nextScope !== undefined) {
                              updateScope(permission.permissionKey, nextScope);
                            }
                          }}
                        >
                          {scopeOptions.map((scope) => (
                            <option key={scopeLabel(scope)} value={scopeLabel(scope)}>
                              {scopeLabel(scope)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="controle-acesso-btn controle-acesso-btn--danger"
                          disabled={disabled}
                          onClick={() => removePermission(permission.permissionKey)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="controle-acesso__permission-editor-section">
        <span className="controle-acesso__field-label">Adicionar permissão</span>
        <input
          className="controle-acesso__search controle-acesso__permission-editor-search"
          type="search"
          placeholder="Buscar no catálogo…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar permissão no catálogo"
          disabled={disabled}
        />
        <div className="controle-acesso__role-picker-list controle-acesso__permission-editor-catalog">
          {available.length === 0 ? (
            <p className="controle-acesso__status">Nenhuma permissão disponível para adicionar.</p>
          ) : (
            available.slice(0, 40).map((item) => (
              <div key={item.key} className="controle-acesso__permission-editor-catalog-item">
                <div className="controle-acesso__role-picker-copy">
                  <strong>{item.label}</strong>
                  <span className="controle-acesso__permission-key">{item.key}</span>
                  {item.description ? (
                    <span className="controle-acesso__permission-desc">{item.description}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="controle-acesso-btn controle-acesso-btn--ghost"
                  disabled={disabled}
                  onClick={() => addPermission(item)}
                >
                  Adicionar
                </button>
              </div>
            ))
          )}
        </div>
        {available.length > 40 ? (
          <p className="controle-acesso__status">
            Exibindo 40 de {available.length} resultados — refine a busca para localizar outras permissões.
          </p>
        ) : null}
      </div>
    </div>
  );
}
