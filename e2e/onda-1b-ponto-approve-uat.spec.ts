import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const ADMIN_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const ADMIN_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "onda-1b-ponto-approve-uat");

let evidenceRunDir = EVIDENCE_ROOT;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatRunStamp(date = new Date()): string {
  return [
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    `${pad2(date.getHours())}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`,
  ].join("_");
}

function createEvidenceRun() {
  const stamp = formatRunStamp();
  const runDir = path.join(EVIDENCE_ROOT, stamp);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE_ROOT, "latest.txt"), `${stamp}\n`, "utf8");
  evidenceRunDir = runDir;
  return { stamp, runDir };
}

function writeEvidence(name: string, content: string | object) {
  const body = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(path.join(evidenceRunDir, name), body);
}

function evidencePath(name: string): string {
  return path.join(evidenceRunDir, name);
}

async function login(request: APIRequestContext, email: string, password: string) {
  const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { email, password },
  });
  expect(loginResponse.ok()).toBeTruthy();
  return ((await loginResponse.json()) as { accessToken: string }).accessToken;
}

async function openAuthedPage(browser: Browser, token: string) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 960 },
  });
  await context.addInitScript(
    ({ tokenKey, value }) => {
      sessionStorage.setItem(tokenKey, value);
    },
    { tokenKey: "lioconecta.auth.token", value: token },
  );
  return { context, page: await context.newPage() };
}

test.describe("UAT Onda 1B — aprovação ponto portal", () => {
  test.setTimeout(180_000);

  test("gestão de ponto lista ajustes e detalhe com ações", async ({ request, browser }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-1B-PONTO-${Date.now()}`;

    try {
      const token = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
      await request.put(`${API_BASE_URL}/api/v1/admin/app-settings`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { settings: [{ key: "ponto.rm.writeback.mode", value: "dry_run" }] },
      });

      const listRes = await request.get(
        `${API_BASE_URL}/api/v1/rh/ponto/adjustments/management?status=pending&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(listRes.ok()).toBeTruthy();
      const list = (await listRes.json()) as Array<{ id: string; status: string }>;
      writeEvidence("01-pending.json", { marker, count: list.length });

      const { context, page } = await openAuthedPage(browser, token);
      try {
        await page.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico/gestao`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: evidencePath("02-gestao-ponto.png"), fullPage: true });

        if (list.length > 0) {
          await page.locator(".leave-requests-list__item").first().click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: evidencePath("03-detalhe.png"), fullPage: true });
          await expect(page.getByTestId("ponto-gestao-approve")).toBeVisible({ timeout: 10_000 });
          await page.getByTestId("ponto-gestao-approve").click();
          await page.waitForTimeout(1200);
          await page.screenshot({ path: evidencePath("04-apos-aprovar.png"), fullPage: true });

          const detailRes = await request.get(
            `${API_BASE_URL}/api/v1/rh/ponto/adjustments/management/${list[0].id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const detail = await detailRes.json();
          writeEvidence("05-detail.json", detail);
          expect(String(detail.status).toLowerCase()).toBe("approved");
        }
      } finally {
        await context.close();
      }

      writeEvidence(
        "99-uat-summary.md",
        `# UAT Onda 1B — Aprovação ponto\n\n## Resultado: PASSOU\n\n- Run: \`${stamp}\`\n- Pendentes: ${list.length}\n- Mode: dry_run\n\nPasta: \`${path.resolve(runDir)}\`\n`,
      );
    } catch (error) {
      writeEvidence(
        "99-uat-summary.md",
        `# FALHOU\n\n${error instanceof Error ? error.message : String(error)}\n`,
      );
      throw error;
    }
  });
});
