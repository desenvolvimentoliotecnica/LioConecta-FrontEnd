import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ModuleAccessDeniedProps = {
  moduleName: string;
  permissionKey: string;
  breadcrumb?: ReactNode;
};

export function ModuleAccessDenied({ moduleName, permissionKey, breadcrumb }: ModuleAccessDeniedProps) {
  return (
    <main className="main">
      <header className="page-header">
        {breadcrumb}
        <h1 className="page-header__title">Acesso restrito</h1>
        <p className="page-header__desc">
          O módulo {moduleName} não está disponível para seu perfil. Solicite a permissão{" "}
          <code>{permissionKey}</code> ao administrador ou configure o acesso em{" "}
          <Link to="/admin/controle-acesso">Controle de acesso</Link>.
        </p>
      </header>
    </main>
  );
}
