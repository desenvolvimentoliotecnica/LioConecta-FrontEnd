export type NotificationMod = "comunicado" | "rh" | "social" | "documento" | "servico" | "grupo";

export type NotificationFilter = "all" | NotificationMod;

export interface NotificationItem {
  id: string;
  icon: string;
  mod: NotificationMod;
  title: string;
  text: string;
  time: string;
  dateTime: string;
  href: string;
}

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "comunicado", label: "Comunicados" },
  { id: "rh", label: "RH" },
  { id: "social", label: "Pessoas" },
  { id: "documento", label: "Documentos" },
  { id: "servico", label: "Serviços" },
  { id: "grupo", label: "Grupos" },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "comunicado-estrategia-2026",
    icon: "fa-bullhorn",
    mod: "comunicado",
    title: "Novo comunicado oficial",
    text: "Atualização importante sobre a estratégia 2026.",
    time: "Há 2 horas",
    dateTime: "2026-07-04T19:00:00",
    href: "/comunicados/leitura?id=estrategia-2026",
  },
  {
    id: "rh-ferias-aprovada",
    icon: "fa-clipboard-check",
    mod: "rh",
    title: "Solicitação aprovada",
    text: "Sua solicitação de férias foi aprovada pelo RH.",
    time: "Há 5 horas",
    dateTime: "2026-07-04T16:00:00",
    href: "/servicos/ferias-ausencias",
  },
  {
    id: "social-aniversario-julia",
    icon: "fa-cake-candles",
    mod: "social",
    title: "Aniversariante do dia",
    text: "Julia Santos completa mais um ano na Liotécnica hoje.",
    time: "Hoje",
    dateTime: "2026-07-04T08:00:00",
    href: "/pessoas/aniversariantes",
  },
  {
    id: "documento-politica-viagens",
    icon: "fa-file-lines",
    mod: "documento",
    title: "Política atualizada",
    text: "A política de viagens corporativas foi revisada e publicada na biblioteca.",
    time: "Ontem",
    dateTime: "2026-07-03T14:30:00",
    href: "/documentos/politicas-internas",
  },
  {
    id: "servico-encomenda-chegou",
    icon: "fa-box",
    mod: "servico",
    title: "Encomenda disponível",
    text: "Há uma encomenda registrada na portaria aguardando retirada.",
    time: "Ontem",
    dateTime: "2026-07-03T11:15:00",
    href: "/servicos/encomendas-correios",
  },
  {
    id: "grupo-inovacao-post",
    icon: "fa-users",
    mod: "grupo",
    title: "Nova publicação no grupo",
    text: "O grupo Inovação & Produto compartilhou um resumo da sprint.",
    time: "Há 2 dias",
    dateTime: "2026-07-02T17:40:00",
    href: "/grupos/meus-grupos",
  },
  {
    id: "rh-contracheque",
    icon: "fa-money-check-dollar",
    mod: "rh",
    title: "Contracheque disponível",
    text: "Seu contracheque de junho/2026 já está disponível para consulta.",
    time: "Há 3 dias",
    dateTime: "2026-07-01T09:00:00",
    href: "/servicos/contracheque",
  },
  {
    id: "comunicado-seguranca",
    icon: "fa-bullhorn",
    mod: "comunicado",
    title: "Comunicado de segurança",
    text: "Campanha de conscientização sobre phishing e boas práticas digitais.",
    time: "Há 4 dias",
    dateTime: "2026-06-30T10:00:00",
    href: "/comunicados/leitura?id=seguranca-informacao",
  },
  {
    id: "social-novo-colaborador",
    icon: "fa-user-plus",
    mod: "social",
    title: "Novo colaborador",
    text: "Rafael Costa entrou no time de Facilities. Dê as boas-vindas!",
    time: "Há 5 dias",
    dateTime: "2026-06-29T08:30:00",
    href: "/pessoas/novos-colaboradores",
  },
  {
    id: "servico-reserva-sala",
    icon: "fa-door-open",
    mod: "servico",
    title: "Reserva confirmada",
    text: "Sala Orion reservada para amanhã, 09:00–10:30.",
    time: "Há 6 dias",
    dateTime: "2026-06-28T15:20:00",
    href: "/servicos/reservas-salas",
  },
];

export function getRecentNotifications(limit = 3): NotificationItem[] {
  return NOTIFICATIONS.slice(0, limit);
}
