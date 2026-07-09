import { useMemo, useState } from "react";
import type { RoleDto } from "../../../api/types";
import { businessAreaLabel } from "./rbacUi";

type Props = {
  roles: RoleDto[];
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  disabled?: boolean;
};

export function RbacRolePicker({ roles, selectedRoleIds, onChange, disabled }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(term) ||
        role.slug.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term),
    );
  }, [roles, search]);

  const toggleRole = (roleId: string) => {
    if (disabled) return;
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter((id) => id !== roleId));
      return;
    }
    onChange([...selectedRoleIds, roleId]);
  };

  return (
    <div className="controle-acesso__role-picker">
      <input
        className="controle-acesso__search controle-acesso__role-picker-search"
        type="search"
        placeholder="Buscar regra…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Buscar regra"
        disabled={disabled}
      />
      <div className="controle-acesso__role-picker-list" role="listbox" aria-multiselectable="true">
        {filtered.length === 0 ? (
          <p className="controle-acesso__status">Nenhuma regra encontrada.</p>
        ) : (
          filtered.map((role) => {
            const checked = selectedRoleIds.includes(role.id);
            return (
              <label key={role.id} className={`controle-acesso__role-picker-item${checked ? " is-selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleRole(role.id)}
                />
                <span className="controle-acesso__role-picker-copy">
                  <strong>{role.name}</strong>
                  <span className="controle-acesso__permission-desc">
                    {role.slug}
                    {role.businessArea ? ` · ${businessAreaLabel(role.businessArea)}` : ""}
                  </span>
                </span>
              </label>
            );
          })
        )}
      </div>
      <p className="controle-acesso__status">{selectedRoleIds.length} regra(s) selecionada(s)</p>
    </div>
  );
}
