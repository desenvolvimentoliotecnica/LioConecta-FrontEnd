import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

export function BeneficiosSettingsSection() {
  return (
    <section className="org-governance__panel loop-settings" aria-label="Permissões de benefícios">
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.benefits.manage} moduleLabel="Gestão de benefícios" />
      <p className="org-governance__intro-text">
        Use <strong>Controle de acesso</strong> para atribuir <code>{PERMISSIONS.benefits.manage}</code> às regras
        autorizadas a gerir catálogo e atribuições de benefícios.
      </p>
    </section>
  );
}
