export type ShortcutItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  mod: string;
};

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: "sc-feed",
    label: "Feed",
    description: "Timeline corporativa e publicações",
    href: "/",
    icon: "fa-rss",
    mod: "feed",
  },
  {
    id: "sc-contracheque",
    label: "Contracheque",
    description: "Consulta de holerite mensal",
    href: "/servicos/contracheque",
    icon: "fa-money-check-dollar",
    mod: "servico",
  },
  {
    id: "sc-ferias",
    label: "Férias e ausências",
    description: "Solicitar e acompanhar férias",
    href: "/servicos/ferias-ausencias",
    icon: "fa-umbrella-beach",
    mod: "servico",
  },
  {
    id: "sc-help-desk",
    label: "Help Desk",
    description: "Abrir chamado de TI",
    href: "/servicos/help-desk",
    icon: "fa-headset",
    mod: "ti",
  },
  {
    id: "sc-diretorio",
    label: "Diretório",
    description: "Buscar colegas e áreas",
    href: "/pessoas/diretorio",
    icon: "fa-users",
    mod: "pessoas",
  },
  {
    id: "sc-comunicados",
    label: "Comunicados oficiais",
    description: "Avisos institucionais",
    href: "/comunicados/oficiais",
    icon: "fa-bullhorn",
    mod: "comunicado",
  },
  {
    id: "sc-reserva-sala",
    label: "Reservar sala",
    description: "Agendar salas de reunião",
    href: "/servicos/reservas-salas",
    icon: "fa-door-open",
    mod: "facilities",
  },
  {
    id: "sc-notificacoes",
    label: "Notificações",
    description: "Avisos e pendências",
    href: "/notificacoes",
    icon: "fa-bell",
    mod: "conta",
  },
];

export const SHORTCUT_SUGGESTIONS: { label: string; href: string; icon: string }[] = [
  { label: "Organograma", href: "/pessoas/organograma", icon: "fa-sitemap" },
  { label: "Meus grupos", href: "/grupos/meus-grupos", icon: "fa-people-group" },
  { label: "Políticas internas", href: "/documentos/politicas-internas", icon: "fa-shield-halved" },
  { label: "Analytics", href: "/analytics", icon: "fa-chart-pie" },
  { label: "Central de Ajuda", href: "/ajuda", icon: "fa-life-ring" },
  { label: "Benefícios", href: "/servicos/beneficios", icon: "fa-gift" },
];
