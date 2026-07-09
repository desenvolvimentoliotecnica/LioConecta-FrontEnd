import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

export function RamaisSettingsSection() {
  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações da lista de ramais">
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.ramais.manage} moduleLabel="Lista de Ramais" />
      <p className="org-governance__intro-text">
        Use <strong>Controle de acesso</strong> para atribuir <code>{PERMISSIONS.ramais.manage}</code> às regras
        autorizadas a gerir a lista de ramais.
      </p>
    </section>
  );
}
