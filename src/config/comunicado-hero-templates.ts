export type ComunicadoHeroTemplate = {
  id: string;
  label: string;
  url: string;
  category?: string;
};

/** Fallback local quando a API não estiver disponível. */
export const COMUNICADO_HERO_TEMPLATES: ComunicadoHeroTemplate[] = [
  { id: "announcement", label: "Comunicado geral", url: "/bg-announcement.png", category: "Geral" },
  { id: "security", label: "Segurança", url: "/bg-comunicado-security.png", category: "Compliance" },
  { id: "benefits", label: "Benefícios", url: "/bg-benefits.png", category: "RH" },
  { id: "news", label: "Notícias", url: "/bg-news.png", category: "Institucional" },
  { id: "news-innovation", label: "Inovação", url: "/bg-news-innovation.png", category: "Institucional" },
  { id: "marketing-event", label: "Evento", url: "/bg-marketing-event.png", category: "Marketing" },
  { id: "celebration", label: "Celebração", url: "/bg-celebration.png", category: "Cultura" },
  {
    id: "celebration-promotion",
    label: "Promoção",
    url: "/bg-celebration-promotion.png",
    category: "RH",
  },
  { id: "social-coffee", label: "Confraternização", url: "/bg-social-coffee.png", category: "Cultura" },
  { id: "poll", label: "Enquete", url: "/bg-poll.png", category: "Engajamento" },
  { id: "poll-remote", label: "Trabalho remoto", url: "/bg-poll-remote.png", category: "Engajamento" },
];
