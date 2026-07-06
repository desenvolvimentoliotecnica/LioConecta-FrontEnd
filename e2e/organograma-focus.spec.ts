import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidenceDir = path.join("e2e", "evidence", "organograma-focus");

type FocusMetrics = {
  ok: boolean;
  reason?: string;
  textWidth?: number;
  textHeight?: number;
  centerOffset?: number;
  inViewport?: boolean;
  viewBox?: string | null;
  focusZoom?: number;
  roots?: unknown;
  treeWidth?: number;
};

async function readJulioFocusMetrics(page: import("@playwright/test").Page): Promise<FocusMetrics> {
  return page.evaluate(() => {
    const tree = document.querySelector("#org-tree");
    const treeRect = tree?.getBoundingClientRect();
    const texts = Array.from(document.querySelectorAll("#org-tree text"));
    const julio = texts.find((node) => {
      const content = (node.textContent || "").toUpperCase();
      return content.includes("JULIO") && content.includes("SCHWARTZMAN");
    });

    if (!julio || !treeRect) {
      return { ok: false, reason: "julio-not-found" };
    }

    const rect = julio.getBoundingClientRect();
    const treeCenterX = treeRect.left + treeRect.width / 2;
    const nodeCenterX = rect.left + rect.width / 2;

    return {
      ok: true,
      textWidth: rect.width,
      textHeight: rect.height,
      centerOffset: Math.abs(nodeCenterX - treeCenterX),
      inViewport:
        rect.top >= treeRect.top - 4 &&
        rect.bottom <= treeRect.bottom + 4 &&
        rect.left >= treeRect.left - 4 &&
        rect.right <= treeRect.right + 4,
      viewBox: document.querySelector("#org-tree svg")?.getAttribute("viewBox") ?? null,
      focusZoom: (window as Window & { __lioOrgFocusReady?: { zoom?: number } }).__lioOrgFocusReady?.zoom,
      roots: (window as Window & { __lioOrgChart?: { config?: { roots?: unknown } } }).__lioOrgChart
        ?.config?.roots,
      treeWidth: treeRect.width,
    };
  });
}

async function waitForOrganogram(page: import("@playwright/test").Page) {
  await expect(page.getByRole("heading", { name: "Organograma" })).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => {
    const svg = document.querySelector("#org-tree [data-boc-content] svg");
    return Boolean(svg && svg.querySelector("text"));
  }, { timeout: 45_000 });
  await page.waitForFunction(() => {
    const ready = (window as Window & { __lioOrgFocusReady?: { slug?: string } }).__lioOrgFocusReady;
    return Boolean(ready?.slug);
  }, { timeout: 30_000 });
  await page.waitForTimeout(600);
}

test.describe("Organograma focus", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("foca JULIO SCHWARTZMAN com ?focus=julio", async ({ page }) => {
    await page.goto("/pessoas/organograma?focus=julio");
    await waitForOrganogram(page);

    const metrics = await readJulioFocusMetrics(page);
    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-focus-julio.png"),
    });

    expect(metrics.ok, JSON.stringify(metrics)).toBe(true);
    expect(metrics.focusZoom).toBe(0.65);
    expect(metrics.textWidth ?? 0).toBeGreaterThan(60);
    expect(metrics.inViewport).toBe(true);
  });

  test("foco padrao sem query param", async ({ page }) => {
    await page.goto("/pessoas/organograma");
    await waitForOrganogram(page);

    const metrics = await readJulioFocusMetrics(page);
    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-focus-default.png"),
    });

    expect(metrics.ok, JSON.stringify(metrics)).toBe(true);
    expect(metrics.focusZoom).toBe(0.65);
    expect(metrics.textWidth ?? 0).toBeGreaterThan(60);
    expect(metrics.inViewport).toBe(true);
  });
});
