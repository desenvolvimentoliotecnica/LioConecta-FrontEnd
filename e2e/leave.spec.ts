import { test, expect } from "@playwright/test";

test.describe("Férias — validação de saldo", () => {
  test("página férias carrega painel de solicitações", async ({ page }) => {
    await page.goto("/servicos/ferias-ausencias");
    await expect(page.getByRole("heading", { name: /Férias e Ausências/i })).toBeVisible();
    await expect(page.getByLabel(/Minhas solicitações de férias/i)).toBeVisible();
  });
});
