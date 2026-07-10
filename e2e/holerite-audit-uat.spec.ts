import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const RH_EMAIL = process.env.LIO_E2E_RH_EMAIL ?? process.env.LIO_E2E_PONTO_MANAGER_EMAIL ?? "e2e.ponto.gestor@liotecnica.com.br";
const RH_PASSWORD =
  process.env.LIO_E2E_RH_PASSWORD ?? process.env.LIO_E2E_PONTO_MANAGER_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "holerite-audit-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; permissions?: Array<{ key: string }> };
type PayslipListItem = { year: number; month: number; competenceLabel?: string };
type AccessLogPage = {
  items: Array<{
    id: string;
    action: string;
    competence?: string | null;
    actorEmail?: string | null;
    targetName?: string | null;
  }>;
  totalCount: number;
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

async function apiGet<T>(
  request: APIRequestContext,
  token: string,
  pathName: string,
): Promise<{ status: number; body: T | null }> {
  const response = await request.get(`${API_BASE_URL}/api/v1${pathName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok()) {
    return { status: response.status(), body: null };
  }
  return { status: response.status(), body: (await response.json()) as T };
}

test.describe("UAT Auditoria holerite", () => {
  test.setTimeout(240_000);

  test("view+download geram eventos e painel RH lista acessos", async ({ request, browser }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-PAY-AUDIT-${Date.now()}`;

    try {
      const employeeToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const meRes = await apiGet<MeDto>(request, employeeToken, "/me");
      expect(meRes.body).toBeTruthy();
      writeEvidence("00-colaborador-me.json", meRes.body!);

      const historyRes = await apiGet<PayslipListItem[]>(
        request,
        employeeToken,
        "/rh/payslips?limit=3",
      );
      expect(historyRes.status).toBe(200);
      expect(historyRes.body && historyRes.body.length > 0).toBeTruthy();
      const latest = historyRes.body![0];
      writeEvidence("00-payslips-history.json", historyRes.body);

      const detailRes = await apiGet<unknown>(
        request,
        employeeToken,
        `/rh/payslips/${latest.year}/${latest.month}`,
      );
      expect(detailRes.status).toBe(200);
      writeEvidence("01-payslip-detail-api.json", { year: latest.year, month: latest.month, status: detailRes.status });

      const pdfResponse = await request.get(
        `${API_BASE_URL}/api/v1/rh/payslips/${latest.year}/${latest.month}/pdf`,
        { headers: { Authorization: `Bearer ${employeeToken}` } },
      );
      expect(pdfResponse.ok(), `pdf status ${pdfResponse.status()}`).toBeTruthy();
      writeEvidence("02-payslip-pdf-meta.json", {
        status: pdfResponse.status(),
        contentType: pdfResponse.headers()["content-type"],
        bytes: (await pdfResponse.body()).byteLength,
      });

      const { context: empCtx, page: empPage } = await openAuthedPage(browser, employeeToken);
      try {
        await empPage.goto(`${PAGE_BASE_URL}/servicos/contracheque`, {
          waitUntil: "domcontentloaded",
        });
        await empPage.waitForTimeout(1500);
        await empPage.screenshot({
          path: evidencePath("03-colaborador-contracheque.png"),
          fullPage: true,
        });
      } finally {
        await empCtx.close();
      }

      // Ensure RH test user has payslips.audit via KeyUser-RH (same pattern as ponto UAT)
      const adminToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const rolesRes = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/roles`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (rolesRes.ok()) {
        const roles = (await rolesRes.json()) as Array<{ id: string; slug: string }>;
        const keyUserRh = roles.find((r) => r.slug === "KeyUser-RH" || r.slug === "HR");
        const testUsersRes = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (testUsersRes.ok() && keyUserRh) {
          const users = (await testUsersRes.json()) as Array<{ id: string; email: string }>;
          let rhUser = users.find((u) => u.email.toLowerCase() === RH_EMAIL.toLowerCase());
          if (!rhUser) {
            const createRes = await request.post(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
              headers: { Authorization: `Bearer ${adminToken}` },
              data: {
                email: RH_EMAIL,
                password: RH_PASSWORD,
                name: "E2E RH Auditor",
                displayName: "E2E RH Auditor",
              },
            });
            if (createRes.ok()) {
              rhUser = (await createRes.json()) as { id: string; email: string };
            }
          }
          if (rhUser) {
            await request.post(`${API_BASE_URL}/api/v1/admin/rbac/assignments`, {
              headers: { Authorization: `Bearer ${adminToken}` },
              data: {
                subjectType: 2,
                subjectId: rhUser.id,
                roleId: keyUserRh.id,
              },
            });
          }
        }
      }

      const rhToken = await login(request, RH_EMAIL, RH_PASSWORD);
      const rhMe = await apiGet<MeDto>(request, rhToken, "/me");
      writeEvidence("04-rh-me.json", rhMe.body);

      // Trigger RBAC seeder by hitting access-log; may need restart for new permission — try anyway
      const logRes = await apiGet<AccessLogPage>(
        request,
        rhToken,
        "/rh/payslips/access-log?page=1&pageSize=25",
      );
      writeEvidence("05-access-log-api.json", { status: logRes.status, body: logRes.body });

      if (logRes.status === 403) {
        // Fallback: assign via admin if permission missing after catalog update without restart
        writeEvidence("05b-access-log-forbidden.json", { note: "RH sem payslips.audit — verifique seed RBAC após restart da API" });
      }

      expect(logRes.status).toBe(200);
      expect(logRes.body).toBeTruthy();
      expect(logRes.body!.totalCount).toBeGreaterThan(0);
      const hasViewOrDownload = logRes.body!.items.some(
        (i) => i.action === "view" || i.action === "download",
      );
      expect(hasViewOrDownload).toBeTruthy();

      const { context: rhCtx, page: rhPage } = await openAuthedPage(browser, rhToken);
      try {
        await rhPage.goto(`${PAGE_BASE_URL}/servicos/contracheque/acessos`, {
          waitUntil: "domcontentloaded",
        });
        await rhPage.waitForTimeout(1500);
        await rhPage.screenshot({
          path: evidencePath("06-rh-painel-acessos.png"),
          fullPage: true,
        });
        await expect(rhPage.getByRole("heading", { name: /Acessos ao contracheque/i })).toBeVisible();
        await expect(rhPage.locator(".pay-table tbody tr").first()).toBeVisible({ timeout: 15_000 });
      } finally {
        await rhCtx.close();
      }

      writeEvidence("99-uat-summary.md", `# UAT Auditoria holerite — evidências

## Resultado: PASSOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Atores:** colaborador (${EMPLOYEE_EMAIL}), RH (${RH_EMAIL})
- **Competência acessada:** ${latest.year}-${pad2(latest.month)}
- **Eventos no access-log:** ${logRes.body!.totalCount}

## Fluxo validado

1. Colaborador visualiza holerite (API detail)
2. Colaborador baixa PDF
3. Eventos \`Payslip\` view/download gravados
4. Painel RH \`/servicos/contracheque/acessos\` lista acessos

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 03 | \`03-colaborador-contracheque.png\` | Hub contracheque |
| 06 | \`06-rh-painel-acessos.png\` | Painel RH |

Gerado em: ${new Date().toISOString()}
Pasta: \`${path.resolve(runDir)}\`
`);
    } catch (error) {
      const failure = error instanceof Error ? error.message : String(error);
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Auditoria holerite — evidências

## Resultado: FALHOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Erro:** ${failure}

Gerado em: ${new Date().toISOString()}
`,
      );
      throw error;
    }
  });
});
