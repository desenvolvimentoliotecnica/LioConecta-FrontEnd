import { Link } from "react-router-dom";

type RbacDeprecatedNoticeProps = {
  permissionKey: string;
  moduleLabel?: string;
};

export function RbacDeprecatedNotice({ permissionKey, moduleLabel }: RbacDeprecatedNoticeProps) {
  return (
    <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
      <p>
        {moduleLabel ? (
          <>
            O acesso a <strong>{moduleLabel}</strong> agora é gerenciado pelo RBAC centralizado
          </>
        ) : (
          <>As permissões de acesso agora são gerenciadas pelo RBAC centralizado</>
        )}{" "}
        — não use mais listas de perfis ou e-mails nesta tela.
      </p>
      <p>
        Atribua a permissão <code>{permissionKey}</code> às regras em{" "}
        <Link to="/admin/controle-acesso">Controle de acesso</Link>.
      </p>
    </div>
  );
}
