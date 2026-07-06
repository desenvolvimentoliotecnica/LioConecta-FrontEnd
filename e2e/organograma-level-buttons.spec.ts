import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidenceDir = path.join("e2e", "evidence", "organograma-level-buttons");

type LevelButtonMetrics = {
  ok: boolean;
  reason?: string;
  buttonCount?: number;
  overlayExists?: boolean;
  inViewportCount?: number;
  visibleNodeCount?: number;
  debug?: unknown;
};

async function readLevelButtonMetrics(page: import("@playwright/test").Page): Promise<LevelButtonMetrics> {
  return page.evaluate(() => {
    const chart = (window as Window & { __lioOrgChart?: { visibleNodeIds?: unknown[] } }).__lioOrgChart;
    const tree = document.querySelector("#org-tree");
    const overlay = tree?.querySelector("#lio-org-level-actions-overlay");
    const buttons = Array.from(tree?.querySelectorAll("#lio-org-level-actions-overlay .lio-level-add-btn") ?? []);
    const treeRect = tree?.getBoundingClientRect();

    if (!chart || !tree || !treeRect) {
      return { ok: false, reason: "chart-or-tree-missing" };
    }

    const visibleIds = Array.isArray(chart.visibleNodeIds) ? chart.visibleNodeIds : [];

    const inViewportCount = buttons.filter((btn) => {
      const rect = btn.getBoundingClientRect();
      return (
        rect.width > 10 &&
        rect.height > 10 &&
        rect.left >= treeRect.left - 2 &&
        rect.right <= treeRect.right + 2 &&
        rect.top >= treeRect.top - 2 &&
        rect.bottom <= treeRect.bottom + 2
      );
    }).length;

    const debug = (window as Window & { __lioOrgLevelButtonsDebug?: () => unknown }).__lioOrgLevelButtonsDebug;

    return {
      ok: true,
      buttonCount: buttons.length,
      overlayExists: Boolean(overlay),
      inViewportCount,
      visibleNodeCount: visibleIds.length,
      debug: typeof debug === "function" ? debug() : null,
    };
  });
}

async function waitForOrganogram(page: import("@playwright/test").Page, options?: { fitAll?: boolean }) {
  await expect(page.getByRole("heading", { name: "Organograma" })).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => {
    const svg = document.querySelector("#org-tree [data-boc-content] svg");
    return Boolean(svg && svg.querySelector("text"));
  }, { timeout: 45_000 });
  await page.waitForFunction(() => {
    const ready = (window as Window & { __lioOrgFocusReady?: { slug?: string; mode?: string } }).__lioOrgFocusReady;
    return Boolean(ready?.slug || ready?.mode === "fit-all");
  }, { timeout: 30_000 });

  if (options?.fitAll) {
    await page.evaluate(() => {
      const chart = (window as Window & { __lioOrgChart?: { fit?: () => unknown } }).__lioOrgChart;
      chart?.fit?.();
    });
    await page.waitForTimeout(500);
  }
  await page.waitForFunction(() => {
    const chart = (window as Window & { __lioOrgChart?: { visibleNodeIds?: unknown[] } }).__lioOrgChart;
    return Boolean(chart?.visibleNodeIds && chart.visibleNodeIds.length > 1);
  }, { timeout: 30_000 });
  await page.waitForFunction(() => {
    const refresh = (window as Window & { __lioRefreshOrgLevelButtons?: () => void }).__lioRefreshOrgLevelButtons;
    refresh?.();
    const count = document.querySelectorAll("#org-tree #lio-org-level-actions-overlay .lio-level-add-btn").length;
    return count >= 1;
  }, { timeout: 20_000 });
  await page.waitForTimeout(400);
}

test.describe("Organograma level add buttons", () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("exibe botoes (+) nas laterais da fileira de diretores", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const metrics = await readLevelButtonMetrics(page);
    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-level-buttons.png"),
    });

    expect(metrics.ok, JSON.stringify(metrics)).toBe(true);
    expect(metrics.overlayExists, JSON.stringify(metrics)).toBe(true);
    expect(metrics.visibleNodeCount ?? 0, JSON.stringify(metrics)).toBeGreaterThan(1);
    expect(metrics.buttonCount ?? 0, JSON.stringify(metrics)).toBeGreaterThanOrEqual(1);
    expect(metrics.inViewportCount ?? 0, JSON.stringify(metrics)).toBeGreaterThanOrEqual(1);

    const stuckAtEdge = await page.evaluate(() => {
      const tree = document.querySelector("#org-tree");
      const treeRect = tree?.getBoundingClientRect();
      const rightBtns = Array.from(
        tree?.querySelectorAll('#lio-org-level-actions-overlay [data-org-level-side="right"]') ?? [],
      );
      const leftBtns = Array.from(
        tree?.querySelectorAll('#lio-org-level-actions-overlay [data-org-level-side="left"]') ?? [],
      );
      const stuckRight = rightBtns.filter((btn) => {
        const rect = btn.getBoundingClientRect();
        return Boolean(treeRect && rect.right >= treeRect.right - 10);
      }).length;
      const stuckLeft = leftBtns.filter((btn) => {
        const rect = btn.getBoundingClientRect();
        return Boolean(treeRect && rect.left <= treeRect.left + 10);
      }).length;
      return stuckRight + stuckLeft;
    });
    expect(stuckAtEdge).toBe(0);

    const firstBtn = page.locator("#lio-org-level-actions-overlay .lio-level-add-btn").first();
    await expect(firstBtn).toBeVisible();
    const box = await firstBtn.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(20);
    expect(box?.height ?? 0).toBeGreaterThan(20);
  });

  test("clique no botao (+) abre modal Nova posicao", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const btn = page.locator("#lio-org-level-actions-overlay .lio-level-add-btn").first();
    await expect(btn).toBeVisible({ timeout: 15_000 });
    await btn.click();

    const modal = page.locator("#org-position-request-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nova posição" })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "organograma-level-buttons-modal.png"),
    });
  });

  test("botoes (+) acompanham zoom do organograma", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const before = await page.evaluate(() => {
      const tree = document.querySelector("#org-tree");
      const btn = tree?.querySelector("#lio-org-level-actions-overlay .lio-level-add-btn");
      const card = tree?.querySelector("[data-n-id]");
      if (!btn || !card) return { ok: false, reason: "btn-or-card-missing" };
      const btnRect = btn.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        ok: true,
        btnWidth: btnRect.width,
        cardWidth: cardRect.width,
        ratio: btnRect.width / cardRect.width,
      };
    });
    expect(before.ok, JSON.stringify(before)).toBe(true);

    const tree = page.locator("#org-tree [data-boc-content]");
    await tree.hover();
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(900);

    const after = await page.evaluate(() => {
      const refresh = (window as Window & { __lioRefreshOrgLevelButtons?: () => void }).__lioRefreshOrgLevelButtons;
      refresh?.();
      const treeEl = document.querySelector("#org-tree");
      const btn = treeEl?.querySelector("#lio-org-level-actions-overlay .lio-level-add-btn");
      const card = treeEl?.querySelector("[data-n-id]");
      if (!btn || !card) return { ok: false, reason: "btn-or-card-missing-after-zoom" };
      const btnRect = btn.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        ok: true,
        btnWidth: btnRect.width,
        cardWidth: cardRect.width,
        ratio: btnRect.width / cardRect.width,
      };
    });
    expect(after.ok, JSON.stringify(after)).toBe(true);

    const beforeBtn = (before as { btnWidth?: number }).btnWidth ?? 0;
    const afterBtn = (after as { btnWidth?: number }).btnWidth ?? 0;
    const beforeCard = (before as { cardWidth?: number }).cardWidth ?? 0;
    const afterCard = (after as { cardWidth?: number }).cardWidth ?? 0;

    expect(afterCard).not.toBe(beforeCard);
    expect(afterBtn).not.toBe(beforeBtn);
    expect(afterBtn).toBeGreaterThan(20);

    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-level-buttons-zoomed.png"),
    });
  });

  test("oculta botao (+) da direita quando ultimo card sai da visao", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const content = page.locator("#org-tree [data-boc-content]");
    const box = await content.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width * 0.55, box!.y + box!.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.15, box!.y + box!.height * 0.45, { steps: 24 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      (window as Window & { __lioRefreshOrgLevelButtons?: () => void }).__lioRefreshOrgLevelButtons?.();
    });

    const metrics = await page.evaluate(() => {
      const tree = document.querySelector("#org-tree");
      const treeRect = tree?.getBoundingClientRect();
      const rightBtns = Array.from(
        tree?.querySelectorAll('#lio-org-level-actions-overlay [data-org-level-side="right"]') ?? [],
      );
      const stuckAtEdge = rightBtns.filter((btn) => {
        const rect = btn.getBoundingClientRect();
        return Boolean(treeRect && rect.right >= treeRect.right - 10);
      }).length;
      return { rightCount: rightBtns.length, stuckAtEdge };
    });

    expect(metrics.stuckAtEdge, JSON.stringify(metrics)).toBe(0);

    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-level-buttons-panned-right.png"),
    });
  });

  test("oculta botao (+) da esquerda quando primeiro card sai da visao", async ({ page }) => {
    await page.goto("/pessoas/organograma?view=full&focus=julio");
    await waitForOrganogram(page);

    const content = page.locator("#org-tree [data-boc-content]");
    const box = await content.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width * 0.35, box!.y + box!.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.85, box!.y + box!.height * 0.45, { steps: 24 });
    await page.mouse.up();
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      (window as Window & { __lioRefreshOrgLevelButtons?: () => void }).__lioRefreshOrgLevelButtons?.();
    });

    const metrics = await page.evaluate(() => {
      const tree = document.querySelector("#org-tree");
      const treeRect = tree?.getBoundingClientRect();
      const leftBtns = Array.from(
        tree?.querySelectorAll('#lio-org-level-actions-overlay [data-org-level-side="left"]') ?? [],
      );
      const stuckAtEdge = leftBtns.filter((btn) => {
        const rect = btn.getBoundingClientRect();
        return Boolean(treeRect && rect.left <= treeRect.left + 10);
      }).length;
      return { leftCount: leftBtns.length, stuckAtEdge };
    });

    expect(metrics.stuckAtEdge, JSON.stringify(metrics)).toBe(0);

    await page.locator("#org-tree").screenshot({
      path: path.join(evidenceDir, "organograma-level-buttons-panned-left.png"),
    });
  });
});
