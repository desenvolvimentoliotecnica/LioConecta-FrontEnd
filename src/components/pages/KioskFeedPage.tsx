import { useEffect, useRef } from "react";
import {
  getFeedHtml,
  injectFeedPageStyles,
  isKioskAllowedLink,
  rewriteFeedLinksForKiosk,
  splitFeedHtml,
} from "../../config/feed";
import { getPageById } from "../../config/routes";
import { usePageScript, useQuickAccessScroll } from "../../hooks/usePageScript";
import { FeedAnnouncementCarousel } from "../feed/FeedAnnouncementCarousel";

export function KioskFeedPage() {
  const mainRef = useRef<HTMLElement>(null);
  const feedPage = getPageById("feed");
  const contentKey = "kiosk-feed";

  usePageScript(feedPage, contentKey);
  useQuickAccessScroll(mainRef);

  useEffect(() => {
    return injectFeedPageStyles("kiosk");
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest("a");
      if (!anchor || !root.contains(anchor)) return;

      const href = anchor.getAttribute("href") ?? "";
      if (isKioskAllowedLink(href)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    root.addEventListener("click", handleClick, true);
    return () => root.removeEventListener("click", handleClick, true);
  }, []);

  const rawHtml = getFeedHtml();
  const html = rewriteFeedLinksForKiosk(rawHtml);
  const parts = splitFeedHtml(html);

  if (!parts) {
    return (
      <main className="kiosk-feed" ref={mainRef}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    );
  }

  return (
    <main className="kiosk-feed" ref={mainRef}>
      <FeedAnnouncementCarousel variant="kiosk" />
      <div dangerouslySetInnerHTML={{ __html: parts.beforeFeedGrid }} />
      <div dangerouslySetInnerHTML={{ __html: parts.feedGridAndAfter }} />
    </main>
  );
}
