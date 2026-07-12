import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue, useGlobalSearch } from "../../api/hooks/useGlobalSearch";
import { usePermissions } from "../../hooks/usePermissions";
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
import { searchPortalPages } from "../../config/searchPortalPages";

type FlatHit = {
  key: string;
  type: (typeof ACTIVE_SEARCH_TYPES)[number];
  title: string;
  subtitle?: string;
  href: string;
  external?: boolean;
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const { me } = usePermissions();
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebouncedValue(query, 250);
  const search = useGlobalSearch(debounced, {
    limit: 5,
    types: ACTIVE_SEARCH_TYPES.filter((t) => t !== "pages"),
    enabled: open,
  });

  const pages = useMemo(
    () => (debounced.trim().length >= 2 ? searchPortalPages(debounced, me, 5) : []),
    [debounced, me],
  );

  const hits = useMemo((): FlatHit[] => {
    const data = search.data;
    const next: FlatHit[] = [];

    for (const page of pages) {
      next.push({
        key: `page:${page.id}`,
        type: "pages",
        title: page.label,
        subtitle: page.path,
        href: page.path,
      });
    }
    for (const person of data?.people ?? []) {
      next.push({
        key: `person:${person.id}`,
        type: "people",
        title: person.name,
        subtitle: [person.title, person.departmentName].filter(Boolean).join(" · ") || undefined,
        href: personHref(person.slug),
      });
    }
    for (const group of data?.groups ?? []) {
      next.push({
        key: `group:${group.id}`,
        type: "groups",
        title: group.name,
        subtitle: group.description ?? undefined,
        href: groupHref(group.id),
      });
    }
    for (const item of data?.comunicados ?? []) {
      next.push({
        key: `comunicado:${item.id}`,
        type: "comunicados",
        title: item.title,
        subtitle: item.excerpt ?? undefined,
        href: comunicadoHref(item.id),
      });
    }
    for (const doc of data?.documents ?? []) {
      const href = documentHref(doc.sharePointUrl);
      next.push({
        key: `doc:${doc.id}`,
        type: "documents",
        title: doc.title,
        subtitle: doc.category,
        href,
        external: /^https?:\/\//i.test(href),
      });
    }
    for (const system of data?.systems ?? []) {
      next.push({
        key: `system:${system.id}`,
        type: "systems",
        title: system.name,
        subtitle: system.category,
        href: systemHref(system.slug),
      });
    }
    for (const post of data?.feedPosts ?? []) {
      next.push({
        key: `feed:${post.id}`,
        type: "feed",
        title: post.contentPreview,
        subtitle: post.authorName ?? undefined,
        href: feedPostHref(post.id),
      });
    }
    for (const course of data?.uniLioCourses ?? data?.unilioCourses ?? []) {
      next.push({
        key: `unilio:${course.id}`,
        type: "unilio",
        title: course.title,
        subtitle: course.area,
        href: unilioCourseHref(course.id),
      });
    }
    for (const ramal of data?.ramais ?? []) {
      next.push({
        key: `ramal:${ramal.id}`,
        type: "ramais",
        title: `${ramal.name} · ${ramal.extension}`,
        subtitle: ramal.department,
        href: ramalHref(),
      });
    }
    for (const article of data?.knowledge ?? []) {
      next.push({
        key: `knowledge:${article.id}`,
        type: "knowledge",
        title: article.title,
        subtitle: article.category,
        href: knowledgeHref(article.url),
        external: /^https?:\/\//i.test(article.url),
      });
    }
    for (const event of data?.calendarEvents ?? []) {
      next.push({
        key: `cal:${event.id}`,
        type: "calendar",
        title: event.title,
        subtitle: event.location ?? undefined,
        href: calendarHref(),
      });
    }
    for (const bookmark of data?.bookmarks ?? []) {
      const href = bookmarkHref(bookmark.href);
      next.push({
        key: `bookmark:${bookmark.id}`,
        type: "bookmarks",
        title: bookmark.title,
        subtitle: bookmark.excerpt || bookmark.kind,
        href,
        external: /^https?:\/\//i.test(href),
      });
    }

    return next;
  }, [pages, search.data]);

  const grouped = useMemo(() => {
    const map = new Map<FlatHit["type"], FlatHit[]>();
    for (const hit of hits) {
      const list = map.get(hit.type) ?? [];
      list.push(hit);
      map.set(hit.type, list);
    }
    return ACTIVE_SEARCH_TYPES.map((type) => ({
      type,
      label: SEARCH_TYPE_LABELS[type],
      items: map.get(type) ?? [],
    })).filter((section) => section.items.length > 0);
  }, [hits]);

  useEffect(() => {
    setActiveIndex(0);
  }, [hits]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        return;
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const goToHit = (hit: FlatHit) => {
    setOpen(false);
    if (hit.external) {
      window.open(hit.href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(hit.href);
  };

  const showAll = () => {
    setOpen(false);
    navigate(buildBuscaPath(query));
  };

  const onKeyDownInput = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (hits[activeIndex]) {
        goToHit(hits[activeIndex]);
      } else if (query.trim().length >= 2) {
        showAll();
      }
    }
  };

  const termReady = query.trim().length >= 2;
  const showPanel = open && termReady;

  return (
    <div className="search global-search" ref={rootRef}>
      <label className="search__field" htmlFor={inputId}>
        <span className="search__icon" aria-hidden="true">
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          className="search__input"
          placeholder="Buscar no portal..."
          aria-label="Busca global do portal"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDownInput}
          data-testid="global-search-input"
        />
        <kbd className="search__shortcut" aria-hidden="true">
          Ctrl K
        </kbd>
      </label>

      {showPanel ? (
        <div className="global-search__panel" role="listbox" id={listId} data-testid="global-search-panel">
          {search.isFetching && hits.length === 0 ? (
            <p className="global-search__empty">Buscando…</p>
          ) : hits.length === 0 ? (
            <p className="global-search__empty">Nenhum resultado para “{query.trim()}”.</p>
          ) : (
            grouped.map((section) => (
              <section key={section.type} className="global-search__section">
                <h3 className="global-search__section-title">{section.label}</h3>
                <ul className="global-search__list">
                  {section.items.map((hit) => {
                    const flatIndex = hits.findIndex((h) => h.key === hit.key);
                    const active = flatIndex === activeIndex;
                    return (
                      <li key={hit.key}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`global-search__option${active ? " is-active" : ""}`}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => goToHit(hit)}
                        >
                          <span className="global-search__option-title">{hit.title}</span>
                          {hit.subtitle ? (
                            <span className="global-search__option-sub">{hit.subtitle}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}

          <div className="global-search__footer">
            <button
              type="button"
              className="global-search__show-all"
              onClick={showAll}
              data-testid="global-search-show-all"
            >
              Mostrar todos os resultados
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

