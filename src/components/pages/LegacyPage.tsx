import { useEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { FeedComposer } from "../feed/FeedComposer";
import { getPageByRoute } from "../../config/routes";
import { pageAssets } from "../../generated/pagesIndex";
import { useFeedComments, usePageScript, useQuickAccessScroll } from "../../hooks/usePageScript";
import type { PageEntry } from "../../types/pages";
import perfilCss from "../../styles/pessoas-perfil.css?inline";
import orgModalCss from "../../styles/org-profile-modal.css?inline";

const FEED_GRID_MARKER = '<div class="feed-grid">';

function injectPageStyles(pageId: string) {
  const assets = pageAssets[pageId];
  const attr = `data-page-style="${pageId}"`;
  document.querySelector(`style[${attr}]`)?.remove();
  const el = document.createElement("style");
  el.setAttribute("data-page-style", pageId);
  let combined = assets?.styles ?? "";
  if (pageId === "pessoas-perfil") combined += "\n" + perfilCss;
  if (pageId === "pessoas-organograma") combined += "\n" + orgModalCss;
  if (pageId === "feed") {
    combined += `
.main.main--feed-scroll {
  max-height: calc(100vh - var(--wf-topbar-h, 72px)) !important;
  overflow-y: auto !important;
  padding: 0 24px 40px !important;
}
.main.main--feed-scroll > :first-child {
  padding-top: 20px;
}
.feed-composer {
  position: sticky !important;
  top: 0 !important;
  z-index: 25 !important;
}
`;
  }
  if (!combined) return;
  el.textContent = combined;
  document.head.appendChild(el);
}

export function LegacyPage() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const contentKey = `${location.pathname}${location.search}`;

  usePageScript(page, contentKey);
  useQuickAccessScroll(mainRef);
  useFeedComments(page?.id === "feed" ? mainRef : ({ current: null } as RefObject<HTMLElement | null>));

  useEffect(() => {
    if (!page) return;
    injectPageStyles(page.id);
    return () => {
      document.querySelector(`style[data-page-style="${page.id}"]`)?.remove();
    };
  }, [page]);

  if (!page) {
    return (
      <main className="main">
        <h1>Página não encontrada</h1>
        <p>Rota: {location.pathname}</p>
      </main>
    );
  }

  const html = pageAssets[page.id]?.content ?? "";

  if (page.id === "feed" && html.includes(FEED_GRID_MARKER)) {
    const splitIndex = html.indexOf(FEED_GRID_MARKER);
    const beforeFeedGrid = html.slice(0, splitIndex);
    const feedGridAndAfter = html.slice(splitIndex);

    return (
      <main className="main main--feed-scroll" ref={mainRef}>
        <div dangerouslySetInnerHTML={{ __html: beforeFeedGrid }} />
        <FeedComposer />
        <div dangerouslySetInnerHTML={{ __html: feedGridAndAfter }} />
      </main>
    );
  }

  return (
    <main
      className="main"
      ref={mainRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function LegacyPageById({ page }: { page: PageEntry }) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const contentKey = `${page.id}:${location.search}`;

  usePageScript(page, contentKey);
  useQuickAccessScroll(mainRef);
  useFeedComments(page.id === "feed" ? mainRef : ({ current: null } as RefObject<HTMLElement | null>));

  useEffect(() => {
    injectPageStyles(page.id);
    return () => {
      document.querySelector(`style[data-page-style="${page.id}"]`)?.remove();
    };
  }, [page.id]);

  const html = pageAssets[page.id]?.content ?? "";

  if (page.id === "feed" && html.includes(FEED_GRID_MARKER)) {
    const splitIndex = html.indexOf(FEED_GRID_MARKER);
    const beforeFeedGrid = html.slice(0, splitIndex);
    const feedGridAndAfter = html.slice(splitIndex);

    return (
      <main className="main main--feed-scroll" ref={mainRef}>
        <div dangerouslySetInnerHTML={{ __html: beforeFeedGrid }} />
        <FeedComposer />
        <div dangerouslySetInnerHTML={{ __html: feedGridAndAfter }} />
      </main>
    );
  }

  return (
    <main
      className="main"
      ref={mainRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
