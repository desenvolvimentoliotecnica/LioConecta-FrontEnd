import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "busca-global-fase3-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };

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
  expect(loginResponse.ok(), `login failed for ${email}: ${loginResponse.status()}`).toBeTruthy();
  const login = (await loginResponse.json()) as LoginResponse;
  expect(login.accessToken).toBeTruthy();
  return login.accessToken;
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
  const page = await context.newPage();
  return { context, page };
}

test.describe("UAT Busca global Fase 3", () => {
  test.setTimeout(240_000);

  test("knowledge, calendário e bookmarks na busca", async ({ browser, request }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-BUSCA-F3-${stamp}`;
    let passed = false;
    let errorMessage = "";

    try {
      const token = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const searchRes = await request.get(
        `${API_BASE_URL}/api/v1/search?q=a&limit=10&types=knowledge,calendar,bookmarks`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(searchRes.ok()).toBeTruthy();
      const payload = await searchRes.json();
      writeEvidence("00-search-fase3-api.json", payload);
      expect(payload).toHaveProperty("knowledge");
      expect(payload).toHaveProperty("calendarEvents");
      expect(payload).toHaveProperty("bookmarks");

      const { context, page } = await openAuthedPage(browser, token);
      try {
        await page.goto(`${PAGE_BASE_URL}/busca?q=vpn`, { waitUntil: "networkidle" });
        await expect(page.getByTestId("global-search-page")).toBeVisible();
        await page.screenshot({ path: evidencePath("01-colaborador-busca-vpn.png"), fullPage: true });

        await expect(page.getByTestId("search-filter-knowledge")).toBeVisible();
        await expect(page.getByTestId("search-filter-calendar")).toBeVisible();
        await expect(page.getByTestId("search-filter-bookmarks")).toBeVisible();
        await page.screenshot({ path: evidencePath("02-colaborador-filtros-fase3.png"), fullPage: true });

        await page.getByTestId("search-filter-people").click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: evidencePath("03-colaborador-refinar-fase3.png"), fullPage: true });

        passed = true;
      } finally {
        await context.close();
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      writeEvidence("99-uat-summary.md", [
        `# UAT Busca global Fase 3 — evidências`,
        ``,
        `## Resultado: ${passed ? "PASSOU" : "FALHOU"}`,
        ``,
        `- **Run:** \`${stamp}\``,
        `- **Marker:** ${marker}`,
        `- **Pasta:** \`${runDir}\``,
        `- **Atores:** colaborador (${EMPLOYEE_EMAIL})`,
        passed ? `` : `- **Erro:** ${errorMessage}`,
        ``,
        `## Fluxo validado`,
        ``,
        `1. API retorna knowledge/calendar/bookmarks`,
        `2. Página /busca exibe filtros Fase 3`,
        `3. Refinamento por tipo`,
        ``,
      ].join("\n"));
    }
  });
});
