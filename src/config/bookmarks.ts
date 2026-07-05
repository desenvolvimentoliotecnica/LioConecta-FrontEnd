export type BookmarkKind = "all" | "comunicado" | "feed" | "documento" | "servico";

export type BookmarkItem = {
  id: string;
  kind: BookmarkKind;
  title: string;
  excerpt: string;
  href: string;
  icon: string;
  savedAt: string;
  savedDateTime: string;
  source: string;
};

export const BOOKMARK_FILTERS: { id: BookmarkKind; label: string; icon: string }[] = [
  { id: "all", label: "Todos", icon: "fa-bookmark" },
  { id: "comunicado", label: "Comunicados", icon: "fa-bullhorn" },
  { id: "feed", label: "Feed", icon: "fa-rss" },
  { id: "documento", label: "Documentos", icon: "fa-file-lines" },
  { id: "servico", label: "Serviços", icon: "fa-briefcase" },
];

export const BOOKMARKS: BookmarkItem[] = [
  {
    id: "bm-estrategia-2026",
    kind: "comunicado",
    title: "Atualização importante sobre nossa estratégia 2026",
    excerpt: "Diretrizes estratégicas, bem-estar e inovação para todos os colaboradores.",
    href: "/comunicados/leitura?id=estrategia-2026",
    icon: "fa-bullhorn",
    savedAt: "04 jul 2026",
    savedDateTime: "2026-07-04T10:00:00",
    source: "Comunicados · Oficiais",
  },
  {
    id: "bm-seguranca-info",
    kind: "comunicado",
    title: "Nova política de segurança da informação",
    excerpt: "Atualização de senhas e treinamento obrigatório de segurança.",
    href: "/comunicados/leitura?id=seguranca-informacao",
    icon: "fa-bullhorn",
    savedAt: "02 jul 2026",
    savedDateTime: "2026-07-02T14:30:00",
    source: "Comunicados · Urgentes",
  },
  {
    id: "bm-enquete-hibrido",
    kind: "feed",
    title: "Enquete: modelo de trabalho híbrido",
    excerpt: "Qual formato você prefere para a rotina da sua equipe?",
    href: "/",
    icon: "fa-square-poll-vertical",
    savedAt: "01 jul 2026",
    savedDateTime: "2026-07-01T09:15:00",
    source: "Feed · Enquete",
  },
  {
    id: "bm-promocao-maria",
    kind: "feed",
    title: "Parabenização: Maria Silva",
    excerpt: "Promoção a Gerente de Projetos — Comercial.",
    href: "/",
    icon: "fa-champagne-glasses",
    savedAt: "28 jun 2026",
    savedDateTime: "2026-06-28T16:00:00",
    source: "Feed · Celebração",
  },
  {
    id: "bm-politica-viagens",
    kind: "documento",
    title: "Política de viagens e despesas",
    excerpt: "Regras para solicitação de reembolso, adiantamento e prestação de contas.",
    href: "/documentos/biblioteca",
    icon: "fa-file-lines",
    savedAt: "27 jun 2026",
    savedDateTime: "2026-06-27T11:00:00",
    source: "Documentos · Biblioteca",
  },
  {
    id: "bm-form-ferias",
    kind: "documento",
    title: "Formulário de solicitação de férias",
    excerpt: "Modelo oficial para registro de férias e ausências programadas.",
    href: "/documentos/formularios",
    icon: "fa-file-lines",
    savedAt: "20 jun 2026",
    savedDateTime: "2026-06-20T08:45:00",
    source: "Documentos · Formulários",
  },
  {
    id: "bm-reembolso-rascunho",
    kind: "servico",
    title: "Reembolso de despesas — rascunho",
    excerpt: "Solicitação em andamento, viagem São Paulo (jun/2026).",
    href: "/servicos/reembolso-despesas",
    icon: "fa-receipt",
    savedAt: "18 jun 2026",
    savedDateTime: "2026-06-18T17:20:00",
    source: "Serviços · Financeiro",
  },
  {
    id: "bm-reserva-sala",
    kind: "servico",
    title: "Reserva Sala Orion — 08 jul",
    excerpt: "Reunião de alinhamento trimestral, 14h às 16h.",
    href: "/servicos/reservas-salas",
    icon: "fa-door-open",
    savedAt: "15 jun 2026",
    savedDateTime: "2026-06-15T10:30:00",
    source: "Serviços · Facilities",
  },
];

export function filterBookmarks(items: BookmarkItem[], kind: BookmarkKind, query: string): BookmarkItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (!normalized) return true;
    return (
      item.title.toLowerCase().includes(normalized) ||
      item.excerpt.toLowerCase().includes(normalized) ||
      item.source.toLowerCase().includes(normalized)
    );
  });
}
