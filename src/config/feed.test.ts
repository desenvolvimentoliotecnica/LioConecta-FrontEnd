import { describe, expect, it } from "vitest";
import { FEED_GRID_MARKER, splitFeedHtml } from "./feed";

describe("splitFeedHtml", () => {
  it("splits on exact feed-grid marker", () => {
    const html = `<section>before</section>${FEED_GRID_MARKER}<p>after</p>`;
    const parts = splitFeedHtml(html);
    expect(parts).not.toBeNull();
    expect(parts!.beforeFeedGrid).toBe("<section>before</section>");
    expect(parts!.feedGridAndAfter.startsWith(FEED_GRID_MARKER)).toBe(true);
  });

  it("splits when feed-grid has extra attributes", () => {
    const html = `<div class="quick">x</div><div class="feed-grid" aria-hidden="true"></div>`;
    const parts = splitFeedHtml(html);
    expect(parts).not.toBeNull();
    expect(parts!.beforeFeedGrid).toBe('<div class="quick">x</div>');
    expect(parts!.feedGridAndAfter).toContain('class="feed-grid"');
  });

  it("returns null when marker is missing", () => {
    expect(splitFeedHtml("<main>sem grid</main>")).toBeNull();
  });
});
