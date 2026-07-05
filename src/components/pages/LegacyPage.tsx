import { useEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { FeedComposer } from "../feed/FeedComposer";
import { FeedPosts } from "../feed/FeedPosts";
import { MoodCheckCard } from "../feed/MoodCheckCard";
import { FEED_PAGE_ID, injectFeedPageStyles, splitFeedHtml } from "../../config/feed";
import { getPageByRoute } from "../../config/routes";
import { pageAssets } from "../../generated/pagesIndex";
import { useFeedComments, useFeedHashScroll, usePageScript, useQuickAccessScroll } from "../../hooks/usePageScript";
import type { PageEntry } from "../../types/pages";
import perfilCss from "../../styles/pessoas-perfil.css?inline";
import orgModalCss from "../../styles/org-profile-modal.css?inline";

function injectPageStyles(pageId: string): (() => void) | undefined {
  if (pageId === FEED_PAGE_ID) {
    return injectFeedPageStyles("default");
  }

  const assets = pageAssets[pageId];
  const attr = `data-page-style="${pageId}"`;
  document.querySelector(`style[${attr}]`)?.remove();
  const el = document.createElement("style");
  el.setAttribute("data-page-style", pageId);
  let combined = assets?.styles ?? "";
  if (pageId === "pessoas-perfil") combined += "\n" + perfilCss;
  if (pageId === "pessoas-organograma") combined += "\n" + orgModalCss;
  if (!combined) return undefined;
  el.textContent = combined;
  document.head.appendChild(el);

  return () => {
    document.querySelector(`style[${attr}]`)?.remove();
  };
}

export function LegacyPage() {
  const location = useLocation();
  const page = getPageByRoute(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const contentKey = `${location.pathname}${location.search}${location.hash}`;

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

  const html = pageAssets[page.id]?.content ?? "";

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
  const contentKey = `${page.id}:${location.search}${location.hash}`;

  usePageScript(page, contentKey);
  useQuickAccessScroll(mainRef);
  useFeedHashScroll(mainRef, page.id === "feed", location.hash);
  useFeedComments(page.id === "feed" ? mainRef : ({ current: null } as RefObject<HTMLElement | null>));

  useEffect(() => {
    return injectPageStyles(page.id);
  }, [page.id]);

  const html = pageAssets[page.id]?.content ?? "";

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

  return (
    <main
      key={contentKey}
      className="main"
      ref={mainRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
