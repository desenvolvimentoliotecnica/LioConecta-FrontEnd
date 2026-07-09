import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

export function SystemsSettingsSection() {
  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do hub de sistemas">
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.systems.manage} moduleLabel="Hub de Sistemas" />
      <p className="org-governance__intro-text">
        Use <strong>Controle de acesso</strong> para atribuir <code>{PERMISSIONS.systems.manage}</code> às regras
        autorizadas a criar, editar e desativar sistemas no hub.
      </p>
    </section>
  );
}
