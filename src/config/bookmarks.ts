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

export function normalizeBookmarkKind(kind: string): BookmarkKind {
  if (kind === "comunicado" || kind === "feed" || kind === "documento" || kind === "servico") {
    return kind;
  }
  return "servico";
}
