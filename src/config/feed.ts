import { pageAssets } from "../generated/pagesIndex";
import { injectScopedPageStyle } from "../utils/pageInjectedStyles";

export const FEED_PAGE_ID = "feed";
export const FEED_GRID_MARKER = '<div class="feed-grid">';

const FEED_SCROLL_OVERRIDES = `
.main.main--feed-scroll {
  max-height: calc(100vh - var(--wf-topbar-h, 72px)) !important;
  overflow-y: auto !important;
  padding: 0 24px 40px !important;
}
.main.main--feed-scroll > .announcement--carousel {
  margin-top: 20px;
}
/* Hide only the legacy HTML feed — never .feed-api-posts (API masonry). */
.main.main--feed-scroll:has(.feed-api-posts .feed-grid) > .feed-grid,
.main.main--feed-scroll:has(.feed-api-posts .feed-grid) > div:not(.feed-api-posts):has(> .feed-grid) {
  display: none !important;
}
.feed-composer {
  position: sticky !important;
  top: 0 !important;
  z-index: 25 !important;
}
#feed-enquetes,
#feed-enquete-trabalho,
#feed-noticias,
#feed-parabenizacoes,
#feed-parabenizacao-promocao {
  scroll-margin-top: 88px;
}
`;

export function getFeedHtml(): string {
  return pageAssets[FEED_PAGE_ID]?.content ?? "";
}

export function splitFeedHtml(html: string): { beforeFeedGrid: string; feedGridAndAfter: string } | null {
  if (!html.includes(FEED_GRID_MARKER)) return null;
  const splitIndex = html.indexOf(FEED_GRID_MARKER);
  return {
    beforeFeedGrid: html.slice(0, splitIndex),
    feedGridAndAfter: html.slice(splitIndex),
  };
}

export function rewriteFeedLinksForKiosk(html: string): string {
  return html.replace(/href="\/comunicados\/leitura/g, 'href="/quiosque/comunicados/leitura');
}

export function injectFeedPageStyles(mode: "default" | "kiosk" = "default"): () => void {
  const styleId = `${FEED_PAGE_ID}${mode === "kiosk" ? "-kiosk" : ""}`;
  document.querySelector(`style[data-page-style="${styleId}"]`)?.remove();

  const assets = pageAssets[FEED_PAGE_ID];
  let combined = assets?.styles ?? "";
  if (mode === "default") {
    combined += FEED_SCROLL_OVERRIDES;
  }

  if (!combined) return () => undefined;

  return injectScopedPageStyle(styleId, combined);
}

export function isKioskAllowedLink(href: string): boolean {
  if (!href || href === "#") return false;
  if (href.startsWith("/quiosque/")) return true;
  return false;
}
