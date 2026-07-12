import { useState } from "react";
import { Link } from "react-router-dom";
import { useNews } from "../../api/hooks/useF3";
import { useCreateTypedPost, usePinPost } from "../../api/hooks/useFeed";
import type { NewsItemDto } from "../../api/types";
import { POST_TYPE_NEWS } from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { UserAvatar } from "../ui/UserAvatar";
import { NovaNoticiaModal } from "./NovaNoticiaModal";
import "../../styles/documents-hub-page.css";
import "../../styles/comunicados-oficiais-page.css";
import "../../styles/noticias-hub-page.css";

function formatNewsDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildExcerpt(content: string, maxLength = 240): string {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function NewsCard({
  item,
  canPin,
  pinning,
  onTogglePin,
}: {
  item: NewsItemDto;
  canPin: boolean;
  pinning: boolean;
  onTogglePin: (item: NewsItemDto) => void;
}) {
  const hero = item.heroImageUrl || "/bg-news.png";
  const dateLabel = formatNewsDate(item.publishedAt);

  return (
    <article className="noticias-hub__card">
      <div className="noticias-hub__card-media">
        <img src={hero} alt="" />
      </div>
      <div className="noticias-hub__card-body">
        <div className="noticias-hub__card-meta">
          {item.isPinned ? <span className="noticias-hub__tag">Fixada</span> : null}
          {dateLabel ? <span className="noticias-hub__date">{dateLabel}</span> : null}
          {item.author?.name ? (
            <div className="noticias-hub__author">
              <UserAvatar className="avatar" photoUrl={item.author.photoUrl} />
              {item.author.name}
            </div>
          ) : null}
        </div>
        <h2 className="noticias-hub__card-title">{item.title || "Notícia"}</h2>
        {item.excerpt ? <p className="noticias-hub__card-excerpt">{item.excerpt}</p> : null}
        <div className="noticias-hub__card-actions">
          {item.href ? (
            <a className="noticias-hub__footer-link" href={item.href}>
              Ler notícia
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
          ) : null}
          {canPin ? (
            <button
              type="button"
              className={`noticias-hub__pin-btn${item.isPinned ? " is-pinned" : ""}`}
              onClick={() => onTogglePin(item)}
              disabled={pinning}
            >
              <i className="fa-solid fa-thumbtack" aria-hidden="true" />
              {item.isPinned ? "Desafixar" : "Fixar"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function NoticiasHubPage() {
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const news = useNews();
  const createNews = useCreateTypedPost(POST_TYPE_NEWS);
  const pin = usePinPost();
  const { hasPermission } = usePermissions();
  const canManageNews = hasPermission(PERMISSIONS.news.manage);
  const canPin = hasPermission(PERMISSIONS.feed.manage);

  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const items = (news.data ?? []).filter((item) => {
    if (!normalizedQuery) return true;
    const haystack = `${item.title} ${item.excerpt} ${item.author?.name ?? ""}`.toLocaleLowerCase("pt-BR");
    return haystack.includes(normalizedQuery);
  });

  async function handlePublish(payload: {
    title: string;
    content: string;
    scheduledAt?: string | null;
  }) {
    setComposeError(null);
    try {
      await createNews.mutateAsync({
        content: payload.content,
        scheduledAt: payload.scheduledAt ?? null,
        metadata: {
          title: payload.title,
          excerpt: buildExcerpt(payload.content),
        },
      });
      setComposeOpen(false);
    } catch (error) {
      setComposeError(error instanceof Error ? error.message : "Não foi possível publicar a notícia.");
    }
  }

  return (
    <main className={`${sectionMainClass("comunicados")} noticias-hub`}>
      <SectionPageHead
        section="comunicados"
        title="Notícias"
        current="Notícias"
        description="Acompanhe as notícias publicadas para toda a empresa."
        actions={
          canManageNews ? (
            <button
              type="button"
              className="comunicados-oficiais__create-btn"
              onClick={() => {
                setComposeError(null);
                setComposeOpen(true);
              }}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Nova notícia
            </button>
          ) : undefined
        }
        toolbar={
          <div className="page-toolbar" aria-label="Busca de notícias">
            <div className="page-toolbar__filters" aria-hidden="true" />
            <label className="page-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                className="page-search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar notícias..."
                aria-label="Buscar notícias"
              />
            </label>
          </div>
        }
      />

      <section className="noticias-hub__banner" aria-live="polite">
        <div className="noticias-hub__banner-icon" aria-hidden="true">
          <i className="fa-solid fa-newspaper" />
        </div>
        <div>
          <h2 className="noticias-hub__banner-title">Hub de Notícias</h2>
          <p className="noticias-hub__banner-text">
            {news.isLoading
              ? "Carregando notícias..."
              : items.length === 0
                ? "Nenhuma notícia encontrada."
                : `${items.length} notícia${items.length === 1 ? "" : "s"} no hub.`}
          </p>
        </div>
      </section>

      {news.isLoading ? <p className="page-empty-note">Carregando notícias...</p> : null}

      {!news.isLoading && items.length > 0 ? (
        <section className="noticias-hub__list" aria-label="Notícias">
          {items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              canPin={canPin}
              pinning={pin.isPending}
              onTogglePin={(newsItem) =>
                void pin.mutateAsync({ id: newsItem.id, isPinned: !newsItem.isPinned })
              }
            />
          ))}
        </section>
      ) : null}

      {!news.isLoading && items.length === 0 ? (
        <div className="docs-hub__empty">
          <i className="fa-regular fa-newspaper" aria-hidden="true" />
          <p>Nenhuma notícia encontrada.</p>
        </div>
      ) : null}

      <p className="noticias-hub__footer">
        <Link to="/comunicados" className="noticias-hub__footer-link">
          Ver comunicados
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </p>

      {canManageNews ? (
        <NovaNoticiaModal
          open={composeOpen}
          pending={createNews.isPending}
          errorMessage={composeError}
          onClose={() => {
            if (!createNews.isPending) setComposeOpen(false);
          }}
          onPublish={(payload) => void handlePublish(payload)}
        />
      ) : null}
    </main>
  );
}
