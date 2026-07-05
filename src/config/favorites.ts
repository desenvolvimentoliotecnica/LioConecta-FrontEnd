export type FavoriteKind = "all" | "pessoa" | "grupo" | "servico" | "documento";

export type FavoriteItem = {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  avatar?: string;
  lastAccess?: string;
};

export const FAVORITE_FILTERS: { id: FavoriteKind; label: string; icon: string }[] = [
  { id: "all", label: "Todos", icon: "fa-star" },
  { id: "pessoa", label: "Pessoas", icon: "fa-user" },
  { id: "grupo", label: "Grupos", icon: "fa-people-group" },
  { id: "servico", label: "Serviços", icon: "fa-briefcase" },
  { id: "documento", label: "Documentos", icon: "fa-file-lines" },
];

export const FAVORITES: FavoriteItem[] = [
  {
    id: "fav-julia",
    kind: "pessoa",
    title: "Julia Santos",
    subtitle: "Marketing · Analista de Comunicação",
    href: "/pessoas/perfil",
    icon: "fa-user",
    avatar: "/avatar-julia-santos.png",
    lastAccess: "Hoje",
  },
  {
    id: "fav-carlos",
    kind: "pessoa",
    title: "Carlos Mendes",
    subtitle: "TI · Coordenador de Infraestrutura",
    href: "/pessoas/diretorio",
    icon: "fa-user",
    avatar: "/avatar-carlos-mendes.png",
    lastAccess: "Ontem",
  },
  {
    id: "fav-data-analytics",
    kind: "grupo",
    title: "Data & Analytics",
    subtitle: "48 membros · 3 publicações novas",
    href: "/grupos/explorar",
    icon: "fa-people-group",
    lastAccess: "Hoje",
  },
  {
    id: "fav-rh-inovacao",
    kind: "grupo",
    title: "RH & Inovação",
    subtitle: "32 membros · Comunicados semanais",
    href: "/grupos/meus-grupos",
    icon: "fa-people-group",
    lastAccess: "02 jul",
  },
  {
    id: "fav-contracheque",
    kind: "servico",
    title: "Contracheque",
    subtitle: "RH & Pessoas · Consulta mensal",
    href: "/servicos/contracheque",
    icon: "fa-money-check-dollar",
    lastAccess: "28 jun",
  },
  {
    id: "fav-ferias",
    kind: "servico",
    title: "Férias e ausências",
    subtitle: "RH & Pessoas · Solicitações",
    href: "/servicos/ferias-ausencias",
    icon: "fa-umbrella-beach",
    lastAccess: "30 jun",
  },
  {
    id: "fav-help-desk",
    kind: "servico",
    title: "Help Desk",
    subtitle: "TI & Suporte · Chamados",
    href: "/servicos/help-desk",
    icon: "fa-headset",
    lastAccess: "01 jul",
  },
  {
    id: "fav-politica-viagens",
    kind: "documento",
    title: "Política de viagens e despesas",
    subtitle: "Biblioteca corporativa · Vigente",
    href: "/documentos/biblioteca",
    icon: "fa-file-lines",
    lastAccess: "03 jul",
  },
  {
    id: "fav-manual-onboarding",
    kind: "documento",
    title: "Manual de onboarding",
    subtitle: "Manuais e procedimentos",
    href: "/documentos/manuais-procedimentos",
    icon: "fa-file-lines",
    lastAccess: "25 jun",
  },
];

export function filterFavorites(items: FavoriteItem[], kind: FavoriteKind, query: string): FavoriteItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (!normalized) return true;
    return (
      item.title.toLowerCase().includes(normalized) ||
      item.subtitle.toLowerCase().includes(normalized)
    );
  });
}
