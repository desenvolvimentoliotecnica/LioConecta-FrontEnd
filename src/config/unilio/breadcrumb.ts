export type UniLioBreadcrumbItem = {
  label: string;
  to?: string;
};

export function resolveUniLioBreadcrumbs(pathname: string): UniLioBreadcrumbItem[] {
  const normalized = pathname.replace(/\/+$/, "") || "/unilio";

  const crumbs: UniLioBreadcrumbItem[] = [{ label: "UniLio", to: "/unilio" }];

  if (normalized === "/unilio") {
    return [...crumbs, { label: "Início" }];
  }

  if (normalized.startsWith("/unilio/catalogo")) {
    return [...crumbs, { label: "Catálogo" }];
  }

  if (normalized.startsWith("/unilio/instrutor/duvidas")) {
    return [
      ...crumbs,
      { label: "Painel do instrutor", to: "/unilio/instrutor" },
      { label: "Caixa de dúvidas" },
    ];
  }

  if (normalized.startsWith("/unilio/instrutor/curso")) {
    return [
      ...crumbs,
      { label: "Painel do instrutor", to: "/unilio/instrutor" },
      { label: "Editar curso" },
    ];
  }

  if (normalized.startsWith("/unilio/instrutor")) {
    return [...crumbs, { label: "Painel do instrutor" }];
  }

  if (normalized.startsWith("/unilio/minhas-duvidas")) {
    return [...crumbs, { label: "Minhas dúvidas" }];
  }

  if (normalized.startsWith("/unilio/admin/aprovacoes")) {
    const isReview = normalized !== "/unilio/admin/aprovacoes";
    return [
      ...crumbs,
      { label: "Aprovações", to: isReview ? "/unilio/admin/aprovacoes" : undefined },
      ...(isReview ? [{ label: "Revisão" }] : []),
    ];
  }

  if (normalized.startsWith("/unilio/trilhas")) {
    return [...crumbs, { label: "Trilhas" }];
  }

  if (normalized.startsWith("/unilio/curso/")) {
    return [...crumbs, { label: "Curso" }];
  }

  if (normalized.startsWith("/unilio/gestor")) {
    return [...crumbs, { label: "Painel do gestor" }];
  }

  if (normalized.startsWith("/unilio/relatorios")) {
    return [...crumbs, { label: "Relatórios" }];
  }

  return crumbs;
}
