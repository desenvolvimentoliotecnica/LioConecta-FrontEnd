import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const DEFAULT_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "leave-saldo-uat");

const ACTORS = [
  {
    key: "leonardo",
    email: process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br",
    password: DEFAULT_PASSWORD,
    expectAcquiring: true,
  },
  {
    key: "elton",
    email: "elton.costa@liotecnica.com.br",
    password: DEFAULT_PASSWORD,
    expectAcquiring: false,
  },
] as const;

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; employeeId?: string | null };
type LeaveBalanceDto = {
  availableDays: number;
  acquiringDays: number;
  acquiredDays: number;
  scheduledDays: number;
  expiredDays: number;
  nextLiberationAt?: string | null;
  periods: Array<{
    label: string;
    availableDays: number;
    status: string;
    liberatesAt?: string | null;
    expiresAt?: string | null;
    contextNote?: string | null;
  }>;
  notes: string[];
};
type LeaveSummaryDto = {
  availableDays: number;
  acquiringDays: number;
  nextLiberationAt?: string | null;
  pendingRequests: number;
  nextScheduledLabel?: string | null;
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

async function apiGet<T>(request: APIRequestContext, token: string, pathName: string): Promise<T> {
  const response = await request.get(`${API_BASE_URL}/api/v1${pathName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok(), `GET ${pathName} => ${response.status()}`).toBeTruthy();
  return (await response.json()) as T;
}

test.describe("UAT Saldo de férias — liberado vs em aquisição", () => {
  test.setTimeout(360_000);

  test("Leonardo e Elton veem saldo com labels claros e valores visíveis", async ({
    request,
    browser,
  }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-FERIAS-SALDO-CLARITY-${Date.now()}`;
    let passed = false;
    let failure = "";
    const actorSummaries: string[] = [];

    try {
      let step = 1;
      for (const actor of ACTORS) {
        const token = await login(request, actor.email, actor.password);
        const me = await apiGet<MeDto>(request, token, "/me");
        writeEvidence(`${String(step).padStart(2, "0")}-${actor.key}-me.json`, { marker, me });
        step += 1;

        const summary = await apiGet<LeaveSummaryDto>(request, token, "/rh/leave/summary");
        writeEvidence(`${String(step).padStart(2, "0")}-${actor.key}-summary-api.json`, summary);
        step += 1;

        const balance = await apiGet<LeaveBalanceDto>(request, token, "/rh/leave/balance");
        writeEvidence(`${String(step).padStart(2, "0")}-${actor.key}-balance-api.json`, balance);
        step += 1;

        expect(balance.periods.length, `${actor.key}: períodos`).toBeGreaterThan(0);
        expect(typeof balance.acquiringDays).toBe("number");
        expect(typeof balance.availableDays).toBe("number");

        if (actor.expectAcquiring) {
          expect(balance.acquiringDays, `${actor.key}: deve ter dias em aquisição`).toBeGreaterThan(0);
          expect(balance.availableDays, `${actor.key}: ainda sem liberados`).toBe(0);
          expect(balance.periods.some((p) => p.status === "em_aquisicao")).toBeTruthy();
          expect(balance.nextLiberationAt).toBeTruthy();
        }

        const total =
          balance.availableDays + balance.acquiringDays + balance.expiredDays + balance.scheduledDays;
        expect(total, `${actor.key}: algum saldo classificado`).toBeGreaterThan(0);

        actorSummaries.push(
          `${actor.email}: liberados=${balance.availableDays}, aquisição=${balance.acquiringDays}, vencidos=${balance.expiredDays}`,
        );

        const { context, page } = await openAuthedPage(browser, token);
        try {
          await page.goto(`${PAGE_BASE_URL}/servicos/ferias-ausencias`, {
            waitUntil: "domcontentloaded",
          });
          await expect(page.getByRole("heading", { name: /Férias e Ausências/i })).toBeVisible({
            timeout: 15_000,
          });

          await page.getByRole("button", { name: /Mostrar valores/i }).click();
          await expect(page.getByRole("button", { name: /Ocultar valores/i })).toBeVisible();
          await expect(page.getByText(/Dias liberados para gozo/i)).toBeVisible();
          await expect(page.getByText(/Em aquisição/i).first()).toBeVisible();

          await page.screenshot({
            path: evidencePath(`${String(step).padStart(2, "0")}-${actor.key}-hub.png`),
            fullPage: true,
          });
          step += 1;

          const saldoCard = page.locator(".leave-card").filter({
            hasText: /Consultar Saldo de Férias|Saldo de Férias/i,
          });
          await saldoCard.first().locator(".leave-card__open").click();
          await expect(page.getByText(/Liberados para gozo/i).first()).toBeVisible({
            timeout: 15_000,
          });
          await expect(page.locator(".pay-table tbody tr").first()).toBeVisible();

          if (actor.expectAcquiring) {
            await expect(page.getByText(/Em aquisição/i).first()).toBeVisible();
            await expect(
              page.getByText(/completa o período aquisitivo|ainda em aquisição/i).first(),
            ).toBeVisible();
          }

          await page.screenshot({
            path: evidencePath(`${String(step).padStart(2, "0")}-${actor.key}-modal-saldo.png`),
            fullPage: true,
          });
          step += 1;

          await page.locator(".pay-modal__btn--ghost", { hasText: "Fechar" }).click();

          const solicitarCard = page.locator(".leave-card").filter({ hasText: /Solicitar Férias/i });
          await solicitarCard.first().locator(".leave-card__open").click();
          await expect(page.locator(".leave-form__saldo")).toBeVisible({ timeout: 10_000 });
          await expect(page.locator(".leave-form__saldo")).toContainText(/Liberados para gozo/i);
          if (balance.availableDays <= 0) {
            await expect(
              page.getByText(/Não é possível solicitar férias sem dias liberados/i),
            ).toBeVisible();
          }
          await page.screenshot({
            path: evidencePath(`${String(step).padStart(2, "0")}-${actor.key}-modal-solicitar.png`),
            fullPage: true,
          });
          step += 1;
        } finally {
          await context.close();
        }
      }

      passed = true;
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: ${passed ? "PASSOU" : "FALHOU"}

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** \`${runDir}\`

### Saldos

${actorSummaries.map((line) => `- ${line}`).join("\n")}
${failure ? `\n## Erro\n\n\`\`\`\n${failure}\n\`\`\`\n` : ""}
## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: ${new Date().toISOString()}
`,
      );
    }
  });
});
