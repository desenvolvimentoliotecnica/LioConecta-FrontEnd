import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const MANAGER_EMAIL =
  process.env.LIO_E2E_PONTO_MANAGER_EMAIL ?? "e2e.ponto.gestor@liotecnica.com.br";
const MANAGER_PASSWORD = process.env.LIO_E2E_PONTO_MANAGER_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "banco-horas-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; employeeId?: string | null };
type BancoHorasDto = {
  balanceHours: number;
  entries: Array<{ date: string; description: string; hours: number; type: string }>;
  periodLabel?: string | null;
  availabilityStatus?: string | null;
  userMessage?: string | null;
  dataSource?: string | null;
};
type TeamMemberDto = {
  personId: string;
  name: string;
  balanceHours: number;
  employeeId?: string | null;
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

test.describe("UAT Banco de horas (RM real)", () => {
  test.setTimeout(240_000);

  test("colaborador vê saldo/extrato real e gestor consulta equipe", async ({
    request,
    browser,
  }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-BH-${Date.now()}`;
    let passed = false;
    let failure = "";

    try {
      const employeeToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const me = await apiGet<MeDto>(request, employeeToken, "/me");
      writeEvidence("00-colaborador-me.json", me);

      const bancoApi = await apiGet<BancoHorasDto>(
        request,
        employeeToken,
        "/rh/leave/banco-horas",
      );
      writeEvidence("00-banco-horas-api.json", bancoApi);

      expect(
        bancoApi.availabilityStatus === "available" || bancoApi.availabilityStatus == null,
        `banco horas indisponível: ${bancoApi.userMessage}`,
      ).toBeTruthy();
      expect(
        !bancoApi.entries.some((e) => e.description.includes("projeto Q3")),
        "extrato ainda parece mock hardcoded",
      ).toBeTruthy();

      const { context: empCtx, page: empPage } = await openAuthedPage(browser, employeeToken);
      try {
        await empPage.goto(`${PAGE_BASE_URL}/servicos/ferias-ausencias`, {
          waitUntil: "domcontentloaded",
        });
        await empPage.waitForTimeout(1500);
        await empPage.screenshot({
          path: evidencePath("01-colaborador-ferias-hub.png"),
          fullPage: true,
        });

        const bancoCard = empPage.locator(".leave-card").filter({
          hasText: /Banco de Horas/i,
        });
        await expect(bancoCard.first()).toBeVisible({ timeout: 15_000 });
        await bancoCard.first().locator(".leave-card__open").click();
        await empPage.waitForTimeout(2000);
        await empPage.screenshot({
          path: evidencePath("02-colaborador-modal-banco-horas.png"),
          fullPage: true,
        });

        await expect(empPage.getByText(/Saldo atual/i)).toBeVisible({ timeout: 15_000 });
        if (bancoApi.entries.length > 0) {
          await expect(empPage.locator(".pay-table tbody tr").first()).toBeVisible();
        }
      } finally {
        await empCtx.close();
      }

      const managerToken = await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);
      const team = await apiGet<TeamMemberDto[]>(
        request,
        managerToken,
        "/rh/ponto/banco-horas",
      );
      writeEvidence("03-gestor-team-api.json", { marker, count: team.length, sample: team.slice(0, 5) });
      expect(team.length).toBeGreaterThan(0);

      const { context: mgrCtx, page: mgrPage } = await openAuthedPage(browser, managerToken);
      try {
        await mgrPage.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico/gestao`, {
          waitUntil: "domcontentloaded",
        });
        await mgrPage.waitForTimeout(1500);
        await mgrPage.screenshot({
          path: evidencePath("04-gestor-gestao-ponto.png"),
          fullPage: true,
        });

        await mgrPage.getByRole("button", { name: /Banco de horas/i }).click();
        await mgrPage.waitForTimeout(1500);
        await mgrPage.screenshot({
          path: evidencePath("05-gestor-aba-banco-horas.png"),
          fullPage: true,
        });

        const firstMember = mgrPage.locator(".leave-requests-list__item").first();
        await expect(firstMember).toBeVisible({ timeout: 15_000 });
        await firstMember.click();
        await mgrPage.waitForTimeout(1200);
        await mgrPage.screenshot({
          path: evidencePath("06-gestor-detalhe-banco-horas.png"),
          fullPage: true,
        });
        await expect(mgrPage.getByText(/Saldo atual/i)).toBeVisible();
      } finally {
        await mgrCtx.close();
      }

      passed = true;
      writeEvidence("99-uat-summary.md", `# UAT Banco de horas — evidências

## Resultado: PASSOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Atores:** colaborador (${EMPLOYEE_EMAIL}), gestor (${MANAGER_EMAIL})
- **Saldo colaborador:** ${bancoApi.balanceHours}h
- **Período:** ${bancoApi.periodLabel ?? "—"}
- **Entradas extrato:** ${bancoApi.entries.length}
- **Equipe gestor:** ${team.length} colaborador(es)

## Fluxo validado

1. API self \`GET /rh/leave/banco-horas\` retorna dados RM (sem mock)
2. Modal Banco de Horas em Férias/Ausências
3. Gestor lista equipe em Gestão de ponto → aba Banco de horas
4. Detalhe do colaborador com saldo/extrato

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | \`01-colaborador-ferias-hub.png\` | Hub férias |
| 02 | \`02-colaborador-modal-banco-horas.png\` | Modal self |
| 04 | \`04-gestor-gestao-ponto.png\` | Gestão ponto |
| 05 | \`05-gestor-aba-banco-horas.png\` | Aba equipe |
| 06 | \`06-gestor-detalhe-banco-horas.png\` | Detalhe |

Gerado em: ${new Date().toISOString()}
Pasta: \`${path.resolve(runDir)}\`
`);
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Banco de horas — evidências

## Resultado: FALHOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Erro:** ${failure}

Gerado em: ${new Date().toISOString()}
`,
      );
      throw error;
    } finally {
      if (!passed) {
        // summary already written
      }
    }
  });
});
