import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { FeedComposer } from "../feed/FeedComposer";
import { FeedPosts } from "../feed/FeedPosts";
import { MoodCheckCard } from "../feed/MoodCheckCard";
import { FEED_PAGE_ID, injectFeedPageStyles, splitFeedHtml } from "../../config/feed";
import { getPageHeadSection, sectionMainClass, usesSectionPageHead } from "../../config/page-head";
import { getPageByRoute } from "../../config/routes";
import { pageAssets } from "../../generated/pagesIndex";
import { injectScopedPageStyle } from "../../utils/pageInjectedStyles";
import { useFeedComments, useFeedHashScroll, usePageScript, useQuickAccessScroll } from "../../hooks/usePageScript";
import type { PageEntry } from "../../types/pages";
import perfilCss from "../../styles/pessoas-perfil.css?inline";
import orgModalCss from "../../styles/org-profile-modal.css?inline";
import orgEditDrawerCss from "../../styles/org-edit-drawer.css?inline";
import sectionPageHeadCss from "../../styles/section-page-head.css?inline";

function injectPageStyles(pageId: string): (() => void) | undefined {
  if (pageId === FEED_PAGE_ID) {
    return injectFeedPageStyles("default");
  }

  const assets = pageAssets[pageId];
  let combined = assets?.styles ?? "";
  if (pageId === "pessoas-perfil") combined += "\n" + perfilCss;
  if (pageId === "pessoas-organograma" || pageId === "pessoas-diretorio") combined += "\n" + orgModalCss;
  if (pageId === "pessoas-organograma") combined += "\n" + orgEditDrawerCss;
  if (usesSectionPageHead(pageId)) combined += "\n" + sectionPageHeadCss;
  if (!combined) return undefined;
  return injectScopedPageStyle(pageId, combined);
}

function legacyMainClass(pageId: string): string {
  const section = getPageHeadSection(pageId);
  return section ? sectionMainClass(section) : "main";
}

/** Injeta HTML legacy só quando contentKey muda — evita reset em re-renders do React. */
function useLegacyMainHtml(
  mainRef: RefObject<HTMLElement | null>,
  contentKey: string,
  html: string,
  enabled = true,
) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const el = mainRef.current;
    if (!el) return;
    el.innerHTML = html;
  }, [contentKey, html, mainRef, enabled]);
}

export function LegacyPage() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const contentKey = `${location.pathname}${location.search}${location.hash}`;
  const html = page ? (pageAssets[page.id]?.content ?? "") : "";
  const isFeedPage = page?.id === FEED_PAGE_ID;

  useLegacyMainHtml(mainRef, contentKey, html, !isFeedPage);
  usePageScript(page, contentKey);
  useQuickAccessScroll(mainRef);
  useFeedHashScroll(mainRef, page?.id === "feed", location.hash);
  useFeedComments(page?.id === "feed" ? mainRef : ({ current: null } as RefObject<HTMLElement | null>));

  useEffect(() => {
    if (!page) return;
    return injectPageStyles(page.id);
  }, [page]);

  if (!page) {
    return (
      <main className="main">
        <h1>Página não encontrada</h1>
        <p>Rota: {location.pathname}</p>
      </main>
    );
  }

  const feedParts = page.id === FEED_PAGE_ID ? splitFeedHtml(html) : null;
  if (feedParts) {
    return (
      <main className="main main--feed-scroll" ref={mainRef}>
        <div dangerouslySetInnerHTML={{ __html: feedParts.beforeFeedGrid }} />
        <FeedComposer />
        <MoodCheckCard />
        <FeedPosts />
        <div dangerouslySetInnerHTML={{ __html: feedParts.feedGridAndAfter }} />
      </main>
    );
  }

  return <main key={contentKey} className={legacyMainClass(page.id)} ref={mainRef} />;
}

export function LegacyPageById({ page }: { page: PageEntry }) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const contentKey = `${page.id}:${location.search}${location.hash}`;
  const html = pageAssets[page.id]?.content ?? "";
  const isFeedPage = page.id === FEED_PAGE_ID;

  useLegacyMainHtml(mainRef, contentKey, html, !isFeedPage);
  usePageScript(page, contentKey);
  useQuickAccessScroll(mainRef);
  useFeedHashScroll(mainRef, page.id === "feed", location.hash);
  useFeedComments(page.id === "feed" ? mainRef : ({ current: null } as RefObject<HTMLElement | null>));

  useEffect(() => {
    return injectPageStyles(page.id);
  }, [page.id]);

  const feedParts = page.id === FEED_PAGE_ID ? splitFeedHtml(html) : null;
  if (feedParts) {
    return (
      <main className="main main--feed-scroll" ref={mainRef}>
        <div dangerouslySetInnerHTML={{ __html: feedParts.beforeFeedGrid }} />
        <FeedComposer />
        <MoodCheckCard />
        <FeedPosts />
        <div dangerouslySetInnerHTML={{ __html: feedParts.feedGridAndAfter }} />
      </main>
    );
  }

  return <main key={contentKey} className={legacyMainClass(page.id)} ref={mainRef} />;
}
