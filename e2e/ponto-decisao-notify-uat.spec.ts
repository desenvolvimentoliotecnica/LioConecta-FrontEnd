import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * UAT E2E — Avisar colaborador nas decisões de ajuste de ponto (DEV remoto).
 * Fluxo: colaborador solicita → gestor recebe aviso → gestor aprova → colaborador
 * recebe notificação in-app + deep-link abre detalhe.
 *
 * Env (DEV 10.0.0.79:8092):
 *   LIO_API_BASE_URL / LIO_PAGE_BASE_URL / LIO_DEV_BASE_URL
 */
const DEV_ORIGIN = process.env.LIO_DEV_BASE_URL ?? "http://10.0.0.79:8092";
const API_BASE_URL = process.env.LIO_API_BASE_URL ?? DEV_ORIGIN;
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? DEV_ORIGIN;
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const MANAGER_EMAIL =
  process.env.LIO_E2E_PONTO_MANAGER_EMAIL ?? "e2e.ponto.gestor@liotecnica.com.br";
const MANAGER_PASSWORD = process.env.LIO_E2E_PONTO_MANAGER_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "ponto-decisao-notify-uat");
const FIXTURES_DIR = path.join("e2e", "fixtures", "ponto-ajuste");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string };
type NotificationDto = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  isRead: boolean;
};
type PagedNotifications = { items: NotificationDto[] };
type TestUserDto = { id: string; email: string };
type RoleDto = { id: string; slug: string; name: string };
type AssignmentDto = {
  subjectType: number;
  subjectId: string;
  subjectLabel: string;
  roleId: string;
  roleName: string;
};
type PontoAdjustmentItem = {
  id: string;
  title: string;
  status: string;
  dayCount: number;
  reason: string;
  createdAt: string;
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

function ensureFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const pngPath = path.join(FIXTURES_DIR, "comprovante-ponto.png");
  if (!fs.existsSync(pngPath)) {
    fs.writeFileSync(
      pngPath,
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
        "base64",
      ),
    );
  }
  return { pngPath };
}

function createEvidenceRun() {
  const stamp = formatRunStamp();
  const runDir = path.join(EVIDENCE_ROOT, stamp);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE_ROOT, "latest.txt"), `${stamp}\n`, "utf8");
  evidenceRunDir = runDir;
  return { stamp, runDir, pngPath: ensureFixtures().pngPath };
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

async function ensureManagerTestUser(request: APIRequestContext, adminToken: string) {
  const listResponse = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(listResponse.ok(), `list test-users failed: ${listResponse.status()}`).toBeTruthy();
  const users = (await listResponse.json()) as TestUserDto[];
  const existing = users.find((u) => u.email.toLowerCase() === MANAGER_EMAIL.toLowerCase());
  if (existing) {
    const reset = await request.post(
      `${API_BASE_URL}/api/v1/admin/rbac/test-users/${existing.id}/reset-password`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { password: MANAGER_PASSWORD },
      },
    );
    expect(reset.ok(), `reset password failed: ${reset.status()}`).toBeTruthy();
    return existing;
  }

  const create = await request.post(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      email: MANAGER_EMAIL,
      password: MANAGER_PASSWORD,
      displayName: "E2E Ponto Gestor",
      businessArea: 0,
      optionalPersonId: null,
      expiresAt: null,
      notes: "Usuário E2E para decisão de ajuste de ponto",
      templateRoleId: null,
    },
  });
  expect(
    create.ok(),
    `create test-user failed: ${create.status()} ${await create.text()}`,
  ).toBeTruthy();
  return (await create.json()) as TestUserDto;
}

async function ensurePontoNotifySettings(request: APIRequestContext, adminToken: string) {
  const put = await request.put(`${API_BASE_URL}/api/v1/admin/app-settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      settings: [
        { key: "ponto.notify_emails", value: JSON.stringify([MANAGER_EMAIL]) },
        { key: "ponto.notify_roles", value: JSON.stringify(["HR"]) },
        { key: "ponto.email.enabled", value: "true" },
        { key: "ponto.email.dev_override_enabled", value: "true" },
        { key: "ponto.email.dev_override_to", value: EMPLOYEE_EMAIL },
        { key: "ponto.rm.writeback.mode", value: "dry_run" },
      ],
    },
  });
  expect(
    put.ok(),
    `update ponto settings failed: ${put.status()} ${await put.text()}`,
  ).toBeTruthy();
}

async function ensureManagerPontoAccess(
  request: APIRequestContext,
  adminToken: string,
  managerEmail: string,
) {
  const rolesResponse = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/roles`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(rolesResponse.ok()).toBeTruthy();
  const roles = (await rolesResponse.json()) as RoleDto[];
  const keyUserRh = roles.find((r) => r.slug === "KeyUser-RH");
  expect(keyUserRh, "Role KeyUser-RH não encontrada").toBeTruthy();

  const assignResponse = await request.get(
    `${API_BASE_URL}/api/v1/admin/rbac/assignments?query=${encodeURIComponent(managerEmail)}`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
  );
  expect(assignResponse.ok()).toBeTruthy();
  const assignments = (await assignResponse.json()) as AssignmentDto[];
  const bySubject = new Map<
    string,
    { subjectType: number; subjectId: string; roleIds: Set<string> }
  >();
  for (const item of assignments) {
    if (!item.subjectLabel.toLowerCase().includes(managerEmail.toLowerCase())) continue;
    const key = `${item.subjectType}:${item.subjectId}`;
    const entry = bySubject.get(key) ?? {
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      roleIds: new Set<string>(),
    };
    entry.roleIds.add(item.roleId);
    bySubject.set(key, entry);
  }

  writeEvidence("00-manager-assignments.json", {
    managerEmail,
    subjectCount: bySubject.size,
    assignments: assignments.filter((a) =>
      a.subjectLabel.toLowerCase().includes(managerEmail.toLowerCase()),
    ),
  });

  for (const entry of bySubject.values()) {
    if (entry.roleIds.has(keyUserRh!.id)) continue;
    entry.roleIds.add(keyUserRh!.id);
    const update = await request.put(`${API_BASE_URL}/api/v1/admin/rbac/assignments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        subjectType: entry.subjectType,
        subjectId: entry.subjectId,
        roleIds: [...entry.roleIds],
      },
    });
    expect(
      update.ok(),
      `assign KeyUser-RH failed: ${update.status()} ${await update.text()}`,
    ).toBeTruthy();
  }
}

async function findAdjustmentByMarker(
  request: APIRequestContext,
  token: string,
  marker: string,
): Promise<PontoAdjustmentItem> {
  const listResponse = await request.get(`${API_BASE_URL}/api/v1/rh/ponto/adjustments?limit=30`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(listResponse.ok(), `my adjustments failed: ${listResponse.status()}`).toBeTruthy();
  const items = (await listResponse.json()) as PontoAdjustmentItem[];
  const match = items.find((item) => item.reason.includes(marker));
  expect(match, `Não encontrou ajuste com marker ${marker}`).toBeTruthy();
  return match!;
}

async function waitForNotification(
  request: APIRequestContext,
  token: string,
  predicate: (n: NotificationDto) => boolean,
  label: string,
  attempts = 12,
): Promise<NotificationDto> {
  let last: PagedNotifications | null = null;
  for (let i = 0; i < attempts; i++) {
    const res = await request.get(`${API_BASE_URL}/api/v1/notifications?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    last = (await res.json()) as PagedNotifications;
    const match = last.items.find(predicate);
    if (match) return match;
    await new Promise((r) => setTimeout(r, 1500));
  }
  writeEvidence(`99b-notif-timeout-${label}.json`, last);
  throw new Error(`Timeout aguardando notificação: ${label}`);
}

test.describe("UAT — Decisão de ajuste de ponto avisa colaborador (DEV remoto)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test.beforeAll(() => {
    ensureFixtures();
  });

  test("criar → gestor notificado → aprovar → colaborador notificado + deep-link", async ({
    browser,
    request,
  }) => {
    test.setTimeout(300_000);
    const { stamp: runStamp, pngPath, runDir } = createEvidenceRun();
    const marker = `E2E-PONTO-DEC-${Date.now()}`;
    let protocol = "";
    let recordId = "";
    let passed = false;
    let errorMessage = "";

    try {
      writeEvidence("00-env.json", {
        apiBaseUrl: API_BASE_URL,
        pageBaseUrl: PAGE_BASE_URL,
        marker,
        employee: EMPLOYEE_EMAIL,
        manager: MANAGER_EMAIL,
      });

      const employeeToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const meResponse = await request.get(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      expect(meResponse.ok()).toBeTruthy();
      const me = (await meResponse.json()) as MeDto;
      writeEvidence("00-employee-me.json", me);

      await ensureManagerTestUser(request, employeeToken);
      await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);
      await ensureManagerPontoAccess(request, employeeToken, MANAGER_EMAIL);
      await ensurePontoNotifySettings(request, employeeToken);
      const managerToken = await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);

      // ── 1) Colaborador solicita ajuste ─────────────────────────────────────
      const employee = await openAuthedPage(browser, employeeToken);
      try {
        await employee.page.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico`, {
          waitUntil: "domcontentloaded",
        });
        await expect(employee.page.getByRole("heading", { name: /Espelho de Ponto/i })).toBeVisible({
          timeout: 45_000,
        });
        await expect(employee.page.locator(".ponto-table tbody tr").first()).toBeVisible({
          timeout: 45_000,
        });
        await employee.page.screenshot({
          path: evidencePath("01-colaborador-espelho-ponto.png"),
          fullPage: true,
        });

        const rows = employee.page.locator(".ponto-table tbody tr");
        const rowCount = await rows.count();
        expect(rowCount, "Espelho precisa ter dias").toBeGreaterThanOrEqual(1);

        const selectedIndexes: number[] = [];
        for (let i = 0; i < rowCount && selectedIndexes.length < 2; i++) {
          const rowText = (await rows.nth(i).innerText()).replace(/\s+/g, " ");
          if (/\d{1,2}:\d{2}/.test(rowText)) selectedIndexes.push(i);
        }
        if (selectedIndexes.length === 0) selectedIndexes.push(0);
        if (selectedIndexes.length === 1 && rowCount > 1) selectedIndexes.push(1);

        for (const index of selectedIndexes) {
          await rows.nth(index).locator('input[type="checkbox"]').check();
        }
        await employee.page.screenshot({
          path: evidencePath("02-colaborador-dias-selecionados.png"),
          fullPage: true,
        });

        await employee.page.getByRole("button", { name: /Solicitar ajuste/i }).click();
        const modal = employee.page.locator(".pay-modal").filter({
          has: employee.page.locator("#pay-modal-title", { hasText: "Solicitar ajuste de ponto" }),
        });
        await expect(modal).toBeVisible({ timeout: 15_000 });

        const timeInputs = modal.locator('input[type="time"]');
        const timeCount = await timeInputs.count();
        const defaults = ["08:00", "12:00", "13:00", "17:00"];
        for (let i = 0; i < timeCount; i++) {
          const current = await timeInputs.nth(i).inputValue();
          if (!current) await timeInputs.nth(i).fill(defaults[i % defaults.length]);
        }
        await timeInputs.nth(0).fill("08:15");
        await modal.locator("textarea").fill(
          `${marker} — UAT decisão: colaborador deve ser avisado após aprovação.`,
        );
        await modal.locator('input[type="file"]').setInputFiles(pngPath);
        await employee.page.screenshot({
          path: evidencePath("03-colaborador-modal-envio.png"),
          fullPage: true,
        });

        await modal.getByRole("button", { name: /Enviar solicitação/i }).click();
        const successHeading = employee.page.getByRole("heading", {
          name: /Solicitação registrada/i,
        });
        const errorHeading = employee.page.getByRole("heading", {
          name: /Não foi possível enviar/i,
        });
        const inlineError = modal.locator(".leave-form__error");
        await expect(successHeading.or(errorHeading).or(inlineError)).toBeVisible({
          timeout: 45_000,
        });
        if (
          (await errorHeading.isVisible().catch(() => false)) ||
          (await inlineError.isVisible().catch(() => false))
        ) {
          await employee.page.screenshot({
            path: evidencePath("03b-colaborador-erro-envio.png"),
            fullPage: true,
          });
          throw new Error("Falha ao enviar ajuste de ponto");
        }

        protocol = (
          (await employee.page.locator(".leave-result__protocol").innerText().catch(() => "")) || ""
        ).trim();
        await employee.page.screenshot({
          path: evidencePath("04-colaborador-protocolo-sucesso.png"),
          fullPage: true,
        });
        await employee.page.getByRole("button", { name: /Entendi/i }).click();
      } finally {
        await employee.context.close();
      }

      const created = await findAdjustmentByMarker(request, employeeToken, marker);
      recordId = created.id;
      writeEvidence("05-record-api.json", { ...created, protocol });

      // ── 2) Gestor recebe notificação de criação ────────────────────────────
      const managerCreateNotif = await waitForNotification(
        request,
        managerToken,
        (n) =>
          /ajuste de ponto/i.test(n.title) &&
          (n.href?.includes(recordId) === true || /ajuste de ponto/i.test(n.body)),
        "gestor-create",
      );
      writeEvidence("06-gestor-notif-create-api.json", managerCreateNotif);

      const manager = await openAuthedPage(browser, managerToken);
      try {
        await manager.page.goto(`${PAGE_BASE_URL}/notificacoes`, {
          waitUntil: "domcontentloaded",
        });
        await expect(manager.page.getByRole("heading", { name: /Notificações/i })).toBeVisible({
          timeout: 30_000,
        });
        await manager.page.screenshot({
          path: evidencePath("07-gestor-lista-notificacoes.png"),
          fullPage: true,
        });

        const href =
          managerCreateNotif.href ?? `/servicos/ponto-eletronico/gestao?requestId=${recordId}`;
        await manager.page.goto(`${PAGE_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`, {
          waitUntil: "domcontentloaded",
        });
        await expect(manager.page.getByRole("heading", { name: /Gestão de ponto/i })).toBeVisible({
          timeout: 30_000,
        });
        await manager.page.screenshot({
          path: evidencePath("08-gestor-gestao-deeplink.png"),
          fullPage: true,
        });

        const gestaoDetail = manager.page.locator(".pay-modal").filter({
          has: manager.page.locator(".ponto-adjust-detail"),
        });
        await expect(gestaoDetail).toBeVisible({ timeout: 30_000 });
        await expect(gestaoDetail.getByText(marker)).toBeVisible();
        await manager.page.screenshot({
          path: evidencePath("09-gestor-detalhe-antes-aprovar.png"),
          fullPage: true,
        });

        // ── 3) Gestor aprova ─────────────────────────────────────────────────
        await expect(manager.page.getByTestId("ponto-gestao-approve")).toBeVisible({
          timeout: 15_000,
        });
        await manager.page.getByTestId("ponto-gestao-approve").click();
        await manager.page.waitForTimeout(2000);
        await manager.page.screenshot({
          path: evidencePath("10-gestor-apos-aprovar.png"),
          fullPage: true,
        });

        const detailRes = await request.get(
          `${API_BASE_URL}/api/v1/rh/ponto/adjustments/management/${recordId}`,
          { headers: { Authorization: `Bearer ${managerToken}` } },
        );
        expect(detailRes.ok()).toBeTruthy();
        const detail = await detailRes.json();
        writeEvidence("11-detail-approved-api.json", detail);
        expect(String(detail.status).toLowerCase()).toBe("approved");
      } finally {
        await manager.context.close();
      }

      // ── 4) Colaborador recebe notificação de decisão ───────────────────────
      const employeeDecisionNotif = await waitForNotification(
        request,
        employeeToken,
        (n) =>
          /aprovad/i.test(n.title) &&
          /ajuste de ponto/i.test(n.title + " " + n.body) &&
          (n.href?.includes(recordId) === true || /ajuste de ponto/i.test(n.body)),
        "colaborador-decision",
      );
      writeEvidence("12-colaborador-notif-decision-api.json", employeeDecisionNotif);

      const employeeAfter = await openAuthedPage(browser, employeeToken);
      try {
        await employeeAfter.page.goto(`${PAGE_BASE_URL}/notificacoes`, {
          waitUntil: "domcontentloaded",
        });
        await expect(
          employeeAfter.page.getByRole("heading", { name: /Notificações/i }),
        ).toBeVisible({ timeout: 30_000 });
        const decisionCard = employeeAfter.page
          .locator(".notifications-page__item")
          .filter({ hasText: /aprovad/i })
          .filter({ hasText: /ajuste de ponto/i })
          .first();
        await expect(decisionCard).toBeVisible({ timeout: 30_000 });
        await employeeAfter.page.screenshot({
          path: evidencePath("13-colaborador-lista-notificacoes.png"),
          fullPage: true,
        });

        const decisionHref =
          employeeDecisionNotif.href ?? `/servicos/ponto-eletronico?requestId=${recordId}`;
        await employeeAfter.page.goto(
          `${PAGE_BASE_URL}${decisionHref.startsWith("/") ? decisionHref : `/${decisionHref}`}`,
          { waitUntil: "domcontentloaded" },
        );
        await expect(
          employeeAfter.page.getByRole("heading", { name: /Espelho de Ponto/i }),
        ).toBeVisible({ timeout: 30_000 });
        await employeeAfter.page.screenshot({
          path: evidencePath("14-colaborador-deeplink-destino.png"),
          fullPage: true,
        });

        const detailModal = employeeAfter.page.locator(".pay-modal").filter({
          has: employeeAfter.page.locator(".ponto-adjust-detail"),
        });
        await expect(detailModal).toBeVisible({ timeout: 30_000 });
        await expect(detailModal.getByText(marker)).toBeVisible();
        await expect(detailModal.getByText(/Aprovado/i).first()).toBeVisible();
        await employeeAfter.page.screenshot({
          path: evidencePath("15-colaborador-detalhe-aprovado.png"),
          fullPage: true,
        });
      } finally {
        await employeeAfter.context.close();
      }

      passed = true;
      writeEvidence(
        "16-uat-summary.md",
        `# UAT Decisão de ajuste de ponto — evidências

## Resultado: PASSOU

- **Run:** \`${runStamp}\`
- **Ambiente:** \`${PAGE_BASE_URL}\` / API \`${API_BASE_URL}\`
- **Marker:** ${marker}
- **RecordId:** ${recordId}
- **Protocolo (UI):** ${protocol || "(ver print 04)"}
- **Colaborador:** ${EMPLOYEE_EMAIL} (${me.name})
- **Gestor:** ${MANAGER_EMAIL}

## Fluxo validado

1. Colaborador solicita ajuste de ponto (espelho → modal → protocolo)
2. Gestor recebe notificação de criação e abre deep-link de gestão
3. Gestor aprova a solicitação
4. Colaborador recebe notificação "Ajuste de ponto aprovado"
5. Deep-link \`/servicos/ponto-eletronico?requestId=\` abre o detalhe **Aprovado**

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | \`01-colaborador-espelho-ponto.png\` | Espelho |
| 02 | \`02-colaborador-dias-selecionados.png\` | Seleção |
| 03 | \`03-colaborador-modal-envio.png\` | Modal |
| 04 | \`04-colaborador-protocolo-sucesso.png\` | Protocolo |
| 07 | \`07-gestor-lista-notificacoes.png\` | Notificações gestor |
| 08 | \`08-gestor-gestao-deeplink.png\` | Deep-link gestão |
| 09 | \`09-gestor-detalhe-antes-aprovar.png\` | Antes de aprovar |
| 10 | \`10-gestor-apos-aprovar.png\` | Após aprovar |
| 13 | \`13-colaborador-lista-notificacoes.png\` | Notificação decisão |
| 14 | \`14-colaborador-deeplink-destino.png\` | Deep-link colaborador |
| 15 | \`15-colaborador-detalhe-aprovado.png\` | Detalhe aprovado |

Pasta: \`${path.resolve(runDir)}\`

Gerado em: ${new Date().toISOString()}
`,
      );
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      writeEvidence(
        "16-uat-summary.md",
        `# UAT Decisão de ajuste de ponto — evidências

## Resultado: FALHOU

- **Run:** \`${runStamp}\`
- **Ambiente:** \`${PAGE_BASE_URL}\` / API \`${API_BASE_URL}\`
- **Marker:** ${marker}
- **RecordId:** ${recordId || "(não criado)"}
- **Erro:** ${errorMessage}

Pasta: \`${path.resolve(runDir)}\`

Gerado em: ${new Date().toISOString()}
`,
      );
      throw error;
    } finally {
      expect(passed, errorMessage || "UAT não concluiu com sucesso").toBeTruthy();
    }
  });
});
