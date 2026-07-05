import { resolveBackendAssetUrl } from "../../api/assetUrl";

export function formatFeedTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function postTypeBadge(type: number): string {
  switch (type) {
    case 1:
      return "Comunicado";
    case 2:
      return "Enquete";
    case 3:
      return "Parabenização";
    case 4:
      return "Notícia";
    case 5:
      return "Bem-estar";
    default:
      return "Social";
  }
}

export function postTypeBadgeClass(type: number): string {
  switch (type) {
    case 1:
      return "badge--comunicado";
    case 2:
      return "badge--enquete";
    case 3:
      return "badge--parabenizacao";
    case 4:
      return "badge--noticia";
    case 5:
      return "badge--bemestar";
    default:
      return "badge--social";
  }
}

export function getPostMedia(post: { metadata: Record<string, unknown> }): {
  url: string;
  type: "image" | "video";
} | null {
  const rawUrl = post.metadata.mediaUrl;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return null;
  }

  const mediaType = post.metadata.mediaType;
  return {
    url: resolveBackendAssetUrl(rawUrl),
    type: mediaType === "video" ? "video" : "image",
  };
}
