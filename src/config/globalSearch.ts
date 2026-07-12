/** Destinos canônicos e labels da busca global. */

export const SEARCH_TYPE_LABELS = {
  pages: "Páginas",
  people: "Pessoas",
  groups: "Grupos",
  comunicados: "Comunicados",
  documents: "Documentos",
  systems: "Sistemas",
  feed: "Feed",
  unilio: "UniLio",
  ramais: "Ramais",
  knowledge: "Base de conhecimento",
  calendar: "Calendário",
  bookmarks: "Bookmarks",
} as const;

export const PHASE1_SEARCH_TYPES = [
  "pages",
  "people",
  "groups",
  "comunicados",
  "documents",
] as const;

export const PHASE2_SEARCH_TYPES = [
  ...PHASE1_SEARCH_TYPES,
  "systems",
  "feed",
  "unilio",
  "ramais",
] as const;

export const PHASE3_SEARCH_TYPES = [
  ...PHASE2_SEARCH_TYPES,
  "knowledge",
  "calendar",
  "bookmarks",
] as const;

/** Tipos ativos na UI (todas as fases implementadas). */
export const ACTIVE_SEARCH_TYPES = PHASE3_SEARCH_TYPES;

export function personHref(slug: string): string {
  return `/pessoas/perfil?id=${encodeURIComponent(slug)}`;
}

export function groupHref(id: string): string {
  return `/grupos/${id}`;
}

export function comunicadoHref(id: string): string {
  return `/comunicados/leitura?id=${encodeURIComponent(id)}`;
}

export function documentHref(sharePointUrl: string | null | undefined): string {
  if (sharePointUrl && /^https?:\/\//i.test(sharePointUrl)) return sharePointUrl;
  return "/documentos/biblioteca";
}

export function feedPostHref(id: string): string {
  return `/?post=${encodeURIComponent(id)}`;
}

export function systemHref(slug: string): string {
  return `/servicos/acesso-sistemas?q=${encodeURIComponent(slug)}`;
}

export function unilioCourseHref(id: string): string {
  return `/unilio/curso/${id}`;
}

export function ramalHref(): string {
  return "/pessoas/ramais";
}

export function knowledgeHref(url: string): string {
  return url || "/servicos/help-desk";
}

export function calendarHref(): string {
  return "/calendario";
}

export function bookmarkHref(href: string): string {
  return href || "/bookmarks";
}

export function buildBuscaPath(q: string, types?: readonly string[]): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (types && types.length > 0) params.set("types", types.join(","));
  const qs = params.toString();
  return qs ? `/busca?${qs}` : "/busca";
}

