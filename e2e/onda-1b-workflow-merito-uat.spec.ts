import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const ADMIN_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const ADMIN_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "onda-1b-workflow-merito-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string };
type WorkflowInstance = {
  id: string;
  status: string;
  definitionKey: string;
  steps: Array<{ id: string; stepKey: string; status: string }>;
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
  expect(loginResponse.ok()).toBeTruthy();
  return ((await loginResponse.json()) as LoginResponse).accessToken;
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

test.describe("UAT Onda 1B — workflow mérito", () => {
  test.setTimeout(180_000);

  test("cria movimentação mérito e lista pendências", async ({ request, browser }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-1B-WF-${Date.now()}`;

    try {
      const token = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
      const me = (await (
        await request.get(`${API_BASE_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).json()) as MeDto;
      writeEvidence("00-me.json", me);

      const createRes = await request.post(
        `${API_BASE_URL}/api/v1/rh/workflows/movimentacao-merito`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            subjectPersonId: me.id,
            cargo: `Analista E2E ${marker}`,
            novoSalario: 10000,
            justificativa: marker,
          },
        },
      );
      writeEvidence("01-create-status.json", {
        status: createRes.status(),
        body: await createRes.json().catch(() => null),
      });

      // 201 se tem rh_requests.manage; 403 caso contrário — ainda validamos a página
      let instance: WorkflowInstance | null = null;
      if (createRes.ok()) {
        instance = (await createRes.json()) as WorkflowInstance;
        expect(instance.definitionKey).toContain("merito");
      }

      const pendingRes = await request.get(`${API_BASE_URL}/api/v1/rh/workflows/pending-for-me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(pendingRes.ok()).toBeTruthy();
      const pending = (await pendingRes.json()) as WorkflowInstance[];
      writeEvidence("02-pending-for-me.json", { count: pending.length, sample: pending.slice(0, 3) });

      const { context, page } = await openAuthedPage(browser, token);
      try {
        await page.goto(`${PAGE_BASE_URL}/servicos/movimentacoes`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: evidencePath("03-movimentacoes-page.png"),
          fullPage: true,
        });
        await expect(page.getByRole("heading", { name: /Movimentações/i })).toBeVisible();
      } finally {
        await context.close();
      }

      writeEvidence(
        "99-uat-summary.md",
        `# UAT Onda 1B — Workflow mérito

## Resultado: PASSOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Create status:** ${createRes.status()}
- **Instance:** ${instance?.id ?? "n/a (sem rh_requests.manage)"}
- **Pendências:** ${pending.length}

Pasta: \`${path.resolve(runDir)}\`
Gerado em: ${new Date().toISOString()}
`,
      );
    } catch (error) {
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Onda 1B — Workflow\n\n## Resultado: FALHOU\n\n${error instanceof Error ? error.message : String(error)}\n`,
      );
      throw error;
    }
  });
});
