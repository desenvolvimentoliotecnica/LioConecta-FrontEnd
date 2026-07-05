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
  {
    id: "bm-contracheque-visualizar",
    kind: "servico",
    title: "Visualizar Contracheque",
    excerpt: "Acesse o holerite da última competência com proventos, descontos e valor líquido.",
    href: "/servicos/contracheque",
    icon: "fa-file-invoice-dollar",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-download-pdf",
    kind: "servico",
    title: "Download em PDF",
    excerpt: "Baixe o contracheque do mês selecionado em PDF para arquivamento pessoal.",
    href: "/servicos/contracheque",
    icon: "fa-file-invoice-dollar",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-historico",
    kind: "servico",
    title: "Histórico de Holerites",
    excerpt: "Consulte contracheques dos últimos 24 meses com busca por competência.",
    href: "/servicos/contracheque",
    icon: "fa-clock-rotate-left",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-comparativo",
    kind: "servico",
    title: "Comparativo Salarial",
    excerpt: "Compare proventos, descontos e líquido entre dois meses.",
    href: "/servicos/contracheque",
    icon: "fa-circle-question",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-demonstrativo",
    kind: "servico",
    title: "Demonstrativo Detalhado",
    excerpt: "Visualize rubricas, bases de cálculo e descontos linha a linha.",
    href: "/servicos/contracheque",
    icon: "fa-file-invoice-dollar",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-informe-rendimentos",
    kind: "servico",
    title: "Informe de Rendimentos",
    excerpt: "Emita o informe anual para declaração de Imposto de Renda.",
    href: "/servicos/contracheque",
    icon: "fa-receipt",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-comprovante",
    kind: "servico",
    title: "Comprovante de Rendimentos",
    excerpt: "Documento simplificado para comprovação de renda.",
    href: "/servicos/contracheque",
    icon: "fa-receipt",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-carta-consignacao",
    kind: "servico",
    title: "Carta de Consignação",
    excerpt: "Consulte margem consignável e emita carta para empréstimos.",
    href: "/servicos/contracheque",
    icon: "fa-file-lines",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-fgts",
    kind: "servico",
    title: "FGTS e Encargos",
    excerpt: "Resumo de depósitos de FGTS e encargos vinculados ao contrato.",
    href: "/servicos/contracheque",
    icon: "fa-circle-question",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-descontos",
    kind: "servico",
    title: "Descontos em Folha",
    excerpt: "Detalhamento de plano de saúde, VT, consignados e outros descontos.",
    href: "/servicos/contracheque",
    icon: "fa-circle-question",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-segunda-via",
    kind: "servico",
    title: "Solicitar 2ª Via",
    excerpt: "Peça reemissão de holerite de competências anteriores.",
    href: "/servicos/contracheque",
    icon: "fa-file-lines",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
  {
    id: "bm-contracheque-duvidas-rubricas",
    kind: "servico",
    title: "Dúvidas sobre Rubricas",
    excerpt: "Orientações sobre códigos, siglas e regras de cálculo na folha.",
    href: "/servicos/contracheque",
    icon: "fa-circle-question",
    savedAt: "05 jul 2026",
    savedDateTime: "2026-07-05T09:00:00",
    source: "Serviços · RH",
  },
];

export const DEFAULT_BOOKMARK_IDS = BOOKMARKS.filter(
  (item) => !item.id.startsWith("bm-contracheque-"),
).map((item) => item.id);

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
