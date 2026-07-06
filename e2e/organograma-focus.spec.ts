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
  focusSlug?: string;
  visibleTextCount?: number;
  treeWidth?: number;
};

async function readPersonFocusMetrics(
  page: import("@playwright/test").Page,
  tokens: string[],
): Promise<FocusMetrics> {
  return page.evaluate((nameTokens) => {
    const tree = document.querySelector("#org-tree");
    const treeRect = tree?.getBoundingClientRect();
    const texts = Array.from(document.querySelectorAll("#org-tree text"));
    const match = texts.find((node) => {
      const content = (node.textContent || "").toUpperCase();
      return nameTokens.every((token) => content.includes(token.toUpperCase()));
    });

    if (!match || !treeRect) {
      return { ok: false, reason: "person-not-found", visibleTextCount: texts.length };
    }

    const rect = match.getBoundingClientRect();
    const treeCenterX = treeRect.left + treeRect.width / 2;
    const nodeCenterX = rect.left + rect.width / 2;
    const ready = (window as Window & { __lioOrgFocusReady?: { zoom?: number; slug?: string } }).__lioOrgFocusReady;

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
      focusZoom: ready?.zoom,
      focusSlug: ready?.slug,
      visibleTextCount: texts.length,
      treeWidth: treeRect.width,
    };
  }, tokens);
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

async function readVisibleOrgNames(page: import("@playwright/test").Page): Promise<string[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("#org-tree text"))
      .map((node) => (node.textContent || "").trim().toUpperCase())
      .filter(Boolean);
  });
}

test.describe("Organograma focus", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("foca JULIO SCHWARTZMAN com ?view=full&focus=julio", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const metrics = await readPersonFocusMetrics(page, ["JULIO", "SCHWARTZMAN"]);
    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-focus-julio.png"),
    });

    expect(metrics.ok, JSON.stringify(metrics)).toBe(true);
    expect(metrics.focusZoom).toBe(0.65);
    expect(metrics.textWidth ?? 0).toBeGreaterThan(60);
    expect(metrics.inViewport).toBe(true);
  });

  test("foco padrao sem query param centraliza usuario logado", async ({ page }) => {
    await page.goto("/pessoas/organograma");
    await waitForOrganogram(page);

    const metrics = await readPersonFocusMetrics(page, ["LEONARDO", "MENDES"]);
    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-focus-default.png"),
    });

    expect(metrics.ok, JSON.stringify(metrics)).toBe(true);
    expect(metrics.focusZoom).toBe(0.65);
    expect(metrics.inViewport).toBe(true);
    await expect(page.locator("#org-view-hint")).toContainText("Sua árvore hierárquica");
  });

  test("modo scoped oculta ramos paralelos fora da arvore do foco", async ({ page }) => {
    await page.goto("/pessoas/organograma?focus=leonardo-mendes");
    await waitForOrganogram(page);

    const names = await readVisibleOrgNames(page);
    const hasLeonardo = names.some((name) => name.includes("LEONARDO") && name.includes("MENDES"));
    const hasJulio = names.some((name) => name.includes("JULIO") && name.includes("SCHWARTZMAN"));

    expect(hasLeonardo).toBe(true);
    expect(hasJulio).toBe(true);
    expect(names.length).toBeLessThan(40);

    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-focus-scoped-leonardo.png"),
    });
  });

  test("busca de pessoa atualiza foco na URL", async ({ page }) => {
    await page.goto("/pessoas/organograma");
    await waitForOrganogram(page);

    const search = page.locator("#org-people-search");
    await search.fill("Lucas");
    await page.waitForTimeout(500);

    const firstResult = page.locator("#org-search-results .org-search-results__item").first();
    await expect(firstResult).toBeVisible({ timeout: 15_000 });
    await firstResult.click();

    await page.waitForFunction(() => {
      const ready = (window as Window & { __lioOrgFocusReady?: { slug?: string } }).__lioOrgFocusReady;
      return Boolean(ready?.slug && ready.slug.includes("lucas"));
    }, { timeout: 30_000 });

    expect(page.url()).toContain("focus=");
    expect(page.url()).toContain("lucas");
  });
});
