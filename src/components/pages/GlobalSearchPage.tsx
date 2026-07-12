import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue, useGlobalSearch } from "../../api/hooks/useGlobalSearch";
import type { GlobalSearchContentType, GlobalSearchResultDto } from "../../api/types";
import {
  ACTIVE_SEARCH_TYPES,
  bookmarkHref,
  buildBuscaPath,
  calendarHref,
  comunicadoHref,
  documentHref,
  feedPostHref,
  groupHref,
  knowledgeHref,
  personHref,
  ramalHref,
  SEARCH_TYPE_LABELS,
  systemHref,
  unilioCourseHref,
} from "../../config/globalSearch";
import { searchPortalPages, type PortalPageHit } from "../../config/searchPortalPages";
import { usePermissions } from "../../hooks/usePermissions";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/contracheque-page.css";
import "../../styles/global-search-page.css";

type ActiveType = (typeof ACTIVE_SEARCH_TYPES)[number];

function parseTypesParam(raw: string | null): ActiveType[] {
  if (!raw) return [...ACTIVE_SEARCH_TYPES];
  const allowed = new Set<string>(ACTIVE_SEARCH_TYPES);
  const parsed = raw
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is ActiveType => allowed.has(t));
  return parsed.length > 0 ? parsed : [...ACTIVE_SEARCH_TYPES];
}

function countForType(
  type: ActiveType,
  data: GlobalSearchResultDto | undefined,
  pages: PortalPageHit[],
): number {
  switch (type) {
    case "pages":
      return pages.length;
    case "people":
      return data?.people?.length ?? 0;
    case "groups":
      return data?.groups?.length ?? 0;
    case "comunicados":
      return data?.comunicados?.length ?? 0;
    case "documents":
      return data?.documents?.length ?? 0;
    case "systems":
      return data?.systems?.length ?? 0;
    case "feed":
      return data?.feedPosts?.length ?? 0;
    case "unilio":
      return data?.uniLioCourses?.length ?? data?.unilioCourses?.length ?? 0;
    case "ramais":
      return data?.ramais?.length ?? 0;
    case "knowledge":
      return data?.knowledge?.length ?? 0;
    case "calendar":
      return data?.calendarEvents?.length ?? 0;
    case "bookmarks":
      return data?.bookmarks?.length ?? 0;
    default:
      return 0;
  }
}

export function GlobalSearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { me } = usePermissions();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [types, setTypes] = useState<ActiveType[]>(() => parseTypesParam(params.get("types")));
  const debounced = useDebouncedValue(query, 250);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
    setTypes(parseTypesParam(params.get("types")));
  }, [params]);

  useEffect(() => {
    const next = buildBuscaPath(debounced, types);
    const current = `${window.location.pathname}${window.location.search}`;
    if (next !== current) {
      navigate(next, { replace: true });
    }
  }, [debounced, types, navigate]);

  const apiTypes = types.filter((t) => t !== "pages") as GlobalSearchContentType[];
  const search = useGlobalSearch(debounced, {
    limit: 40,
    types: apiTypes,
    enabled: debounced.trim().length >= 2 && apiTypes.length > 0,
  });

  const pages = useMemo(() => {
    if (!types.includes("pages") || debounced.trim().length < 2) return [];
    return searchPortalPages(debounced, me, 40);
  }, [debounced, me, types]);

  const toggleType = (type: ActiveType) => {
    setTypes((prev) => {
      if (prev.includes(type)) {
        const next = prev.filter((t) => t !== type);
        return next.length > 0 ? next : prev;
      }
      return [...prev, type];
    });
  };

  const total = types.reduce(
    (sum, type) => sum + countForType(type, search.data, pages),
    0,
  );

  const termReady = debounced.trim().length >= 2;
  const data = search.data;

  return (
    <main className={`${sectionMainClass("busca")} global-search-page`} data-testid="global-search-page">
      <SectionPageHead
        section="busca"
        title="Busca global"
        description="Encontre pessoas, grupos, comunicados, documentos, sistemas, cursos e mais. Refine pelos tipos de conteúdo."
        toolbar={
          <div className="global-search-page__toolbar" aria-label="Busca e filtros">
            <label className="pay-search page-search global-search-page__query">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                className="page-search__input"
                placeholder="Digite ao menos 2 caracteres..."
                aria-label="Termo de busca"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                data-testid="global-search-page-input"
              />
            </label>
            <div className="page-filters global-search-page__filters" role="group" aria-label="Refinar por tipo">
              {ACTIVE_SEARCH_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip${types.includes(type) ? " is-active" : ""}`}
                  aria-pressed={types.includes(type)}
                  onClick={() => toggleType(type)}
                  data-testid={`search-filter-${type}`}
                >
                  {SEARCH_TYPE_LABELS[type]}
                  {termReady ? (
                    <span className="global-search-page__count">
                      {countForType(type, data, pages)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {!termReady ? (
        <p className="global-search-page__hint">Digite pelo menos 2 caracteres para buscar.</p>
      ) : search.isFetching && total === 0 ? (
        <p className="global-search-page__hint">Buscando…</p>
      ) : search.isError ? (
        <p className="global-search-page__hint">Não foi possível carregar os resultados. Tente novamente.</p>
      ) : total === 0 ? (
        <p className="global-search-page__hint" data-testid="global-search-empty">
          Nenhum resultado para “{debounced.trim()}”.
        </p>
      ) : (
        <div className="global-search-page__results">
          <p className="global-search-page__summary">
            {total} resultado{total === 1 ? "" : "s"} para “{debounced.trim()}”
          </p>

          {types.includes("pages") && pages.length > 0 ? (
            <ResultSection title="Páginas" testId="section-pages">
              {pages.map((page) => (
                <ResultLink key={page.id} to={page.path} title={page.label} subtitle={page.path} />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("people") && (data?.people?.length ?? 0) > 0 ? (
            <ResultSection title="Pessoas" testId="section-people">
              {(data?.people ?? []).map((person) => (
                <ResultLink
                  key={person.id}
                  to={personHref(person.slug)}
                  title={person.name}
                  subtitle={[person.title, person.departmentName].filter(Boolean).join(" · ")}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("groups") && (data?.groups?.length ?? 0) > 0 ? (
            <ResultSection title="Grupos" testId="section-groups">
              {(data?.groups ?? []).map((group) => (
                <ResultLink
                  key={group.id}
                  to={groupHref(group.id)}
                  title={group.name}
                  subtitle={group.description ?? undefined}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("comunicados") && (data?.comunicados?.length ?? 0) > 0 ? (
            <ResultSection title="Comunicados" testId="section-comunicados">
              {(data?.comunicados ?? []).map((item) => (
                <ResultLink
                  key={item.id}
                  to={comunicadoHref(item.id)}
                  title={item.title}
                  subtitle={item.excerpt ?? undefined}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("documents") && (data?.documents?.length ?? 0) > 0 ? (
            <ResultSection title="Documentos" testId="section-documents">
              {(data?.documents ?? []).map((doc) => {
                const href = documentHref(doc.sharePointUrl);
                return (
                  <ResultLink
                    key={doc.id}
                    to={href}
                    title={doc.title}
                    subtitle={doc.category}
                    external={/^https?:\/\//i.test(href)}
                  />
                );
              })}
            </ResultSection>
          ) : null}

          {types.includes("systems") && (data?.systems?.length ?? 0) > 0 ? (
            <ResultSection title="Sistemas" testId="section-systems">
              {(data?.systems ?? []).map((system) => (
                <ResultLink
                  key={system.id}
                  to={systemHref(system.slug)}
                  title={system.name}
                  subtitle={system.category}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("feed") && (data?.feedPosts?.length ?? 0) > 0 ? (
            <ResultSection title="Feed" testId="section-feed">
              {(data?.feedPosts ?? []).map((post) => (
                <ResultLink
                  key={post.id}
                  to={feedPostHref(post.id)}
                  title={post.contentPreview}
                  subtitle={post.authorName ?? undefined}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("unilio") &&
          ((data?.uniLioCourses?.length ?? 0) > 0 || (data?.unilioCourses?.length ?? 0) > 0) ? (
            <ResultSection title="UniLio" testId="section-unilio">
              {(data?.uniLioCourses ?? data?.unilioCourses ?? []).map((course) => (
                <ResultLink
                  key={course.id}
                  to={unilioCourseHref(course.id)}
                  title={course.title}
                  subtitle={course.area}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("ramais") && (data?.ramais?.length ?? 0) > 0 ? (
            <ResultSection title="Ramais" testId="section-ramais">
              {(data?.ramais ?? []).map((ramal) => (
                <ResultLink
                  key={ramal.id}
                  to={ramalHref()}
                  title={`${ramal.name} · ${ramal.extension}`}
                  subtitle={ramal.department}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("knowledge") && (data?.knowledge?.length ?? 0) > 0 ? (
            <ResultSection title="Base de conhecimento" testId="section-knowledge">
              {(data?.knowledge ?? []).map((article) => (
                <ResultLink
                  key={article.id}
                  to={knowledgeHref(article.url)}
                  title={article.title}
                  subtitle={article.category}
                  external={/^https?:\/\//i.test(article.url)}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("calendar") && (data?.calendarEvents?.length ?? 0) > 0 ? (
            <ResultSection title="Calendário" testId="section-calendar">
              {(data?.calendarEvents ?? []).map((event) => (
                <ResultLink
                  key={event.id}
                  to={calendarHref()}
                  title={event.title}
                  subtitle={event.location ?? undefined}
                />
              ))}
            </ResultSection>
          ) : null}

          {types.includes("bookmarks") && (data?.bookmarks?.length ?? 0) > 0 ? (
            <ResultSection title="Bookmarks" testId="section-bookmarks">
              {(data?.bookmarks ?? []).map((bookmark) => {
                const href = bookmarkHref(bookmark.href);
                return (
                  <ResultLink
                    key={bookmark.id}
                    to={href}
                    title={bookmark.title}
                    subtitle={bookmark.excerpt || bookmark.kind}
                    external={/^https?:\/\//i.test(href)}
                  />
                );
              })}
            </ResultSection>
          ) : null}
        </div>
      )}
    </main>
  );
}

function ResultSection({
  title,
  testId,
  children,
}: {
  title: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <section className="global-search-page__section" data-testid={testId}>
      <h2>{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

function ResultLink({
  to,
  title,
  subtitle,
  external,
}: {
  to: string;
  title: string;
  subtitle?: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <li>
        <a className="global-search-page__hit" href={to} target="_blank" rel="noopener noreferrer">
          <span className="global-search-page__hit-title">{title}</span>
          {subtitle ? <span className="global-search-page__hit-sub">{subtitle}</span> : null}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link className="global-search-page__hit" to={to}>
        <span className="global-search-page__hit-title">{title}</span>
        {subtitle ? <span className="global-search-page__hit-sub">{subtitle}</span> : null}
      </Link>
    </li>
  );
}
