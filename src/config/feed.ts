import { pageAssets } from "../generated/pagesIndex";
import { injectScopedPageStyle } from "../utils/pageInjectedStyles";

export const FEED_PAGE_ID = "feed";
/** Exact open tag used in legacy HTML; also accept extra attrs (e.g. aria-hidden). */
export const FEED_GRID_MARKER = '<div class="feed-grid">';
const FEED_GRID_OPEN_RE = /<div\s+class="feed-grid"(?:\s[^>]*)?>/;

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
/* Legacy feed styles.css still ships height:180px — force square preview on API posts. */
.feed-api-posts .post-media:not(.post-media--banner):not(.post-media--video) {
  display: block !important;
  position: relative !important;
  box-sizing: border-box !important;
  width: calc(100% - 32px) !important;
  height: auto !important;
  aspect-ratio: 1 / 1 !important;
  overflow: hidden !important;
}
.feed-api-posts .post-media:not(.post-media--banner):not(.post-media--video) .post-media__trigger {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
.feed-api-posts .post-media:not(.post-media--banner):not(.post-media--video) img {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  object-fit: cover !important;
}
`;

export function getFeedHtml(): string {
  return pageAssets[FEED_PAGE_ID]?.content ?? "";
}

export function splitFeedHtml(html: string): { beforeFeedGrid: string; feedGridAndAfter: string } | null {
  const match = FEED_GRID_OPEN_RE.exec(html);
  if (!match || match.index === undefined) return null;
  return {
    beforeFeedGrid: html.slice(0, match.index),
    feedGridAndAfter: html.slice(match.index),
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
