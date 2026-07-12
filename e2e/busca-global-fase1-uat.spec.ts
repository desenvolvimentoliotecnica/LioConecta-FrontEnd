import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "busca-global-fase1-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type SearchResult = {
  people: { id: string; name: string; slug: string }[];
  documents: { id: string; title: string }[];
  comunicados: { id: string; title: string }[];
  groups: { id: string; name: string }[];
};

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

test.describe("UAT Busca global Fase 1", () => {
  test.setTimeout(240_000);

  test("omnibar + /busca com refinamento e evidências", async ({ browser, request }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-BUSCA-F1-${stamp}`;
    let passed = false;
    let errorMessage = "";

    try {
      const token = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const meRes = await request.get(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(meRes.ok()).toBeTruthy();
      writeEvidence("00-me.json", await meRes.json());

      const searchRes = await request.get(
        `${API_BASE_URL}/api/v1/search?q=${encodeURIComponent("leo")}&limit=8`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(searchRes.ok(), `search API ${searchRes.status()}`).toBeTruthy();
      const searchJson = (await searchRes.json()) as SearchResult;
      expect(searchJson).toHaveProperty("people");
      expect(searchJson).toHaveProperty("groups");
      expect(searchJson).toHaveProperty("documents");
      expect(searchJson).toHaveProperty("comunicados");
      writeEvidence("00-search-api-leo.json", searchJson);

      const { context, page } = await openAuthedPage(browser, token);
      try {
        await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("01-colaborador-feed-topbar.png"), fullPage: true });

        const input = page.getByTestId("global-search-input");
        await expect(input).toBeVisible();
        await page.keyboard.press("Control+K");
        await expect(input).toBeFocused();
        await page.screenshot({ path: evidencePath("02-colaborador-ctrlk-foco.png"), fullPage: true });

        await input.fill("leo");
        await expect(page.getByTestId("global-search-panel")).toBeVisible({ timeout: 15_000 });
        await page.screenshot({ path: evidencePath("03-colaborador-painel-resultados.png"), fullPage: true });

        await page.getByTestId("global-search-show-all").click();
        await expect(page).toHaveURL(/\/busca\?q=leo/);
        await expect(page.getByTestId("global-search-page")).toBeVisible();
        await page.screenshot({ path: evidencePath("04-colaborador-pagina-busca.png"), fullPage: true });

        await page.getByTestId("search-filter-people").click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: evidencePath("05-colaborador-refinar-tipos.png"), fullPage: true });

        const filteredRes = await request.get(
          `${API_BASE_URL}/api/v1/search?q=leo&limit=40&types=people,groups`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        writeEvidence("05-search-api-filtered.json", await filteredRes.json());

        await page.getByTestId("global-search-page-input").fill("zzzznaoexiste999");
        await expect(page.getByTestId("global-search-empty")).toBeVisible({ timeout: 15_000 });
        await page.screenshot({ path: evidencePath("06-colaborador-empty-state.png"), fullPage: true });

        passed = true;
      } finally {
        await context.close();
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      writeEvidence("99-uat-summary.md", [
        `# UAT Busca global Fase 1 — evidências`,
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
        `1. Topbar / foco Ctrl+K`,
        `2. Digitar termo → painel com seções`,
        `3. Mostrar todos os resultados → /busca`,
        `4. Refinar por tipo + dump API`,
        `5. Empty state`,
        ``,
      ].join("\n"));
    }
  });
});
