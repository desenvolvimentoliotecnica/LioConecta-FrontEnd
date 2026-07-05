import { expect, test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const evidenceDir = "C:/Users/leonardo.mendes/Projects/LioConecta.Backend/docs/email-evidence";

test.describe("Email SMTP evidence", () => {
  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("captura tela de configuração SMTP", async ({ page }) => {
    await page.goto("/admin/email/config");
    await expect(page.getByRole("heading", { name: "Configuração SMTP" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[value="smtp.office365.com"]')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(evidenceDir, "04-email-config-page.png"),
      fullPage: true,
    });
  });

  test("captura hub de e-mail", async ({ page }) => {
    await page.goto("/admin/email");
    await expect(page.getByRole("heading", { name: /Fila de e-mail/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(evidenceDir, "06-email-hub-page.png"),
      fullPage: true,
    });
  });
});
