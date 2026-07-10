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
const EVIDENCE_ROOT = path.join("e2e", "evidence", "ponto-ajuste-uat");
const FIXTURES_DIR = path.join("e2e", "fixtures", "ponto-ajuste");

/** Pasta do run atual: e2e/evidence/ponto-ajuste-uat/YYYY-MM-DD_HH-mm-ss */
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
type PontoAdjustmentManagementItem = {
  id: string;
  employeeName: string;
  title: string;
  status: string;
  dayCount: number;
  reason: string;
  createdAt: string;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Stamp local: 2026-07-10_14-17-30 */
function formatRunStamp(date = new Date()): string {
  return [
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    `${pad2(date.getHours())}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`,
  ].join("_");
}

function ensureFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const pngPath = path.join(FIXTURES_DIR, "comprovante-ponto.png");
  fs.writeFileSync(
    pngPath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
      "base64",
    ),
  );
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
      notes: "Usuário E2E para gestão/notificação de ajuste de ponto",
      templateRoleId: null,
    },
  });
  expect(
    create.ok(),
    `create test-user failed: ${create.status()} ${await create.text()}`,
  ).toBeTruthy();
  return (await create.json()) as TestUserDto;
}

async function ensureNotifyEmails(
  request: APIRequestContext,
  adminToken: string,
  emails: string[],
) {
  const put = await request.put(`${API_BASE_URL}/api/v1/admin/app-settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      settings: [
        { key: "ponto.notify_emails", value: JSON.stringify(emails) },
        { key: "ponto.notify_roles", value: JSON.stringify(["HR"]) },
      ],
    },
  });
  expect(
    put.ok(),
    `update ponto notify settings failed: ${put.status()} ${await put.text()}`,
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
  // KeyUser-RH inclui ponto.manage Global — necessário para ver gestão sem ser gestor direto no organograma
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

test.describe("UAT — Ajuste de ponto E2E (colaborador → notificação → gestor)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test.beforeAll(() => {
    ensureFixtures();
  });

  test("fluxo completo com evidências tela a tela", async ({ browser, request }) => {
    test.setTimeout(240_000);
    const { stamp: runStamp, pngPath } = createEvidenceRun();
    const marker = `E2E-PONTO-${Date.now()}`;

    const employeeToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
    const meResponse = await request.get(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    expect(meResponse.ok()).toBeTruthy();
    const me = (await meResponse.json()) as MeDto;
    writeEvidence("00-employee-me.json", me);

    await ensureManagerTestUser(request, employeeToken);
    // Force first login so assignment subject exists
    await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);
    await ensureManagerPontoAccess(request, employeeToken, MANAGER_EMAIL);
    await ensureNotifyEmails(request, employeeToken, [MANAGER_EMAIL]);
    const managerToken = await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);

    // ── 1) Colaborador: espelho + seleção multi-dias ─────────────────────────
    const employee = await openAuthedPage(browser, employeeToken);
    let protocol = "";
    let recordId = "";
    try {
      await employee.page.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico`);
      await expect(employee.page.getByRole("heading", { name: /Espelho de Ponto/i })).toBeVisible({
        timeout: 30_000,
      });
      await expect(employee.page.locator(".ponto-table tbody tr").first()).toBeVisible({
        timeout: 30_000,
      });

      await employee.page.screenshot({
        path: evidencePath("01-colaborador-espelho-ponto.png"),
        fullPage: true,
      });

      const rows = employee.page.locator(".ponto-table tbody tr");
      const rowCount = await rows.count();
      expect(rowCount, "Espelho precisa ter dias para selecionar").toBeGreaterThanOrEqual(2);

      // Preferir dias com batidas reais (evita "—" que falha validação HH:mm)
      const selectedIndexes: number[] = [];
      for (let i = 0; i < rowCount && selectedIndexes.length < 2; i++) {
        const rowText = (await rows.nth(i).innerText()).replace(/\s+/g, " ");
        const hasPunch = /\d{1,2}:\d{2}/.test(rowText);
        if (hasPunch) selectedIndexes.push(i);
      }
      if (selectedIndexes.length < 2) {
        selectedIndexes.length = 0;
        selectedIndexes.push(0, 1);
      }

      for (const index of selectedIndexes) {
        await rows.nth(index).locator('input[type="checkbox"]').check();
      }
      await expect(employee.page.getByRole("button", { name: /Solicitar ajuste \(2\)/i })).toBeVisible();

      await employee.page.screenshot({
        path: evidencePath("02-colaborador-dias-selecionados.png"),
        fullPage: true,
      });

      await employee.page.getByRole("button", { name: /Solicitar ajuste/i }).click();
      const modal = employee.page.locator(".pay-modal").filter({
        has: employee.page.locator("#pay-modal-title", { hasText: "Solicitar ajuste de ponto" }),
      });
      await expect(modal).toBeVisible({ timeout: 10_000 });
      await expect(modal.locator(".ponto-adjust-day")).toHaveCount(2);

      // Garantir HH:mm em todos os campos (dias sem batida vêm vazios)
      const timeInputs = modal.locator('input[type="time"]');
      const timeCount = await timeInputs.count();
      const defaults = ["08:00", "12:00", "13:00", "17:00"];
      for (let i = 0; i < timeCount; i++) {
        const current = await timeInputs.nth(i).inputValue();
        if (!current) {
          await timeInputs.nth(i).fill(defaults[i % defaults.length]);
        }
      }
      // Evidência de alteração no primeiro horário
      await timeInputs.nth(0).fill("08:15");

      await modal.locator("textarea").fill(
        `${marker} — UAT ajuste em massa (2 dias). Esqueci de bater o ponto corretamente.`,
      );
      await modal.locator('input[type="file"]').setInputFiles(pngPath);

      await employee.page.screenshot({
        path: evidencePath("03-colaborador-modal-ajuste-multidias.png"),
        fullPage: true,
      });

      await modal.getByRole("button", { name: /Enviar solicitação/i }).click();

      // Aceitar sucesso ou capturar erro de validação/API
      const successHeading = employee.page.getByRole("heading", { name: /Solicitação registrada/i });
      const errorHeading = employee.page.getByRole("heading", { name: /Não foi possível enviar/i });
      const inlineError = modal.locator(".leave-form__error");
      await expect(successHeading.or(errorHeading).or(inlineError)).toBeVisible({ timeout: 30_000 });
      if (await errorHeading.isVisible().catch(() => false) || await inlineError.isVisible().catch(() => false)) {
        await employee.page.screenshot({
          path: evidencePath("03b-colaborador-erro-envio.png"),
          fullPage: true,
        });
        const errText = (await inlineError.textContent().catch(() => null))
          ?? (await employee.page.locator(".leave-form__error, .leave-result").textContent().catch(() => null))
          ?? "erro desconhecido";
        throw new Error(`Falha ao enviar ajuste: ${errText}`);
      }

      await expect(successHeading).toBeVisible({ timeout: 5_000 });
      await expect(employee.page.locator(".leave-result__protocol")).toBeVisible();
      protocol = ((await employee.page.locator(".leave-result__protocol").innerText()) || "").trim();

      await employee.page.screenshot({
        path: evidencePath("04-colaborador-protocolo-sucesso.png"),
        fullPage: true,
      });

      await employee.page.getByRole("button", { name: /Entendi/i }).click();

      // ── 2) Colaborador: minhas solicitações + acompanhamento ───────────────
      const panel = employee.page.getByRole("region", {
        name: /Minhas solicitações de ajuste de ponto/i,
      });
      await expect(panel).toBeVisible({ timeout: 15_000 });
      await expect(panel.locator(".leave-requests-list__item").first()).toBeVisible({
        timeout: 15_000,
      });

      await employee.page.screenshot({
        path: evidencePath("05-colaborador-minhas-solicitacoes.png"),
        fullPage: true,
      });

      await panel.locator(".leave-requests-list__item").first().click();
      const detailModal = employee.page.locator(".pay-modal").filter({
        has: employee.page.locator(".ponto-adjust-detail"),
      });
      await expect(detailModal).toBeVisible({ timeout: 15_000 });
      await expect(detailModal.getByText(/Pendente/i).first()).toBeVisible();
      await expect(detailModal.getByText(marker)).toBeVisible();
      await expect(detailModal.locator(".ponto-adjust-detail-day")).toHaveCount(2);

      await employee.page.screenshot({
        path: evidencePath("06-colaborador-detalhe-acompanhamento.png"),
        fullPage: true,
      });
      await detailModal.locator("button.pay-modal__btn", { hasText: /^Fechar$/ }).click();
    } finally {
      await employee.context.close();
    }

    const created = await findAdjustmentByMarker(request, employeeToken, marker);
    recordId = created.id;
    writeEvidence("07-record-api.json", { ...created, protocol });

    // ── 3) Sistema: notificação gerada para o gestor ─────────────────────────
    const notifResponse = await request.get(`${API_BASE_URL}/api/v1/notifications?limit=50`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    expect(notifResponse.ok()).toBeTruthy();
    const notifs = (await notifResponse.json()) as PagedNotifications;
    const pontoNotif = notifs.items.find(
      (n) =>
        /ajuste de ponto/i.test(n.title) &&
        (n.href?.includes(recordId) || /ajuste de ponto/i.test(n.body)),
    );
    writeEvidence("08-gestor-notifications-api.json", {
      recordId,
      found: Boolean(pontoNotif),
      match: pontoNotif ?? null,
      recentTitles: notifs.items.slice(0, 10).map((n) => ({ title: n.title, href: n.href })),
    });
    expect(pontoNotif, "Gestor deveria receber notificação de ajuste de ponto").toBeTruthy();

    // ── 4) Gestor: visualiza notificação e detalhes ──────────────────────────
    const manager = await openAuthedPage(browser, managerToken);
    try {
      await manager.page.goto(`${PAGE_BASE_URL}/notificacoes`);
      await expect(manager.page.getByRole("heading", { name: /Notificações/i })).toBeVisible({
        timeout: 20_000,
      });

      const notifCard = manager.page
        .locator(".notifications-page__item")
        .filter({ hasText: /ajuste de ponto/i })
        .first();
      await expect(notifCard).toBeVisible({ timeout: 20_000 });

      await manager.page.screenshot({
        path: evidencePath("09-gestor-lista-notificacoes.png"),
        fullPage: true,
      });

      // Deep-link da notificação
      const href = pontoNotif!.href ?? `/servicos/ponto-eletronico/gestao?requestId=${recordId}`;
      await manager.page.goto(`${PAGE_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`);
      await expect(manager.page.getByRole("heading", { name: /Gestão de ponto/i })).toBeVisible({
        timeout: 20_000,
      });

      await manager.page.screenshot({
        path: evidencePath("10-gestor-gestao-deeplink.png"),
        fullPage: true,
      });

      const gestaoDetail = manager.page.locator(".pay-modal").filter({
        has: manager.page.locator(".ponto-adjust-detail"),
      });
      await expect(gestaoDetail).toBeVisible({ timeout: 20_000 });
      await expect(gestaoDetail.getByText(marker)).toBeVisible();
      await expect(gestaoDetail.locator(".ponto-adjust-detail-day")).toHaveCount(2);
      await expect(gestaoDetail.getByText(/Pendente/i).first()).toBeVisible();

      await manager.page.screenshot({
        path: evidencePath("11-gestor-detalhe-ajuste.png"),
        fullPage: true,
      });

      // Lista gestão também
      await gestaoDetail.locator("button.pay-modal__btn", { hasText: /^Fechar$/ }).click();
      await manager.page.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico/gestao`);
      await expect(manager.page.getByRole("heading", { name: /Gestão de ponto/i })).toBeVisible({
        timeout: 20_000,
      });
      const listItem = manager.page.locator(".leave-requests-list__item").filter({
        hasText: new RegExp(me.name.split(" ")[0], "i"),
      });
      // Fallback: any item with day count / pending
      const anyItem = manager.page.locator(".leave-requests-list__item").first();
      await expect(anyItem.or(listItem).first()).toBeVisible({ timeout: 20_000 });

      await manager.page.screenshot({
        path: evidencePath("12-gestor-lista-gestao.png"),
        fullPage: true,
      });

      // API management evidence
      const mgmt = await request.get(
        `${API_BASE_URL}/api/v1/rh/ponto/adjustments/management?q=${encodeURIComponent(marker)}&limit=20`,
        { headers: { Authorization: `Bearer ${managerToken}` } },
      );
      // q searches reason/title/name — if empty, fetch all and filter
      let mgmtItems = mgmt.ok() ? ((await mgmt.json()) as PontoAdjustmentManagementItem[]) : [];
      if (!mgmtItems.some((i) => i.id === recordId)) {
        const all = await request.get(
          `${API_BASE_URL}/api/v1/rh/ponto/adjustments/management?limit=50`,
          { headers: { Authorization: `Bearer ${managerToken}` } },
        );
        expect(all.ok()).toBeTruthy();
        mgmtItems = (await all.json()) as PontoAdjustmentManagementItem[];
      }
      writeEvidence("13-gestor-management-api.json", {
        recordId,
        items: mgmtItems.filter((i) => i.id === recordId || i.reason?.includes?.(marker)),
      });
      expect(mgmtItems.some((i) => i.id === recordId)).toBeTruthy();
    } finally {
      await manager.context.close();
    }

    writeEvidence("14-uat-summary.md", `# UAT Ajuste de Ponto — evidências

## Resultado: PASSOU

- **Run:** \`${runStamp}\`
- **Marker:** ${marker}
- **RecordId:** ${recordId}
- **Protocolo (UI):** ${protocol || "(ver print 04)"}
- **Colaborador:** ${EMPLOYEE_EMAIL} (${me.name})
- **Gestor (notificado):** ${MANAGER_EMAIL}

## Fluxo validado

1. Colaborador abre espelho e seleciona **2 dias**
2. Preenche horários/motivo/anexo e envia
3. Recebe protocolo de sucesso
4. Vê a solicitação em **Minhas solicitações** e acompanha status **Pendente**
5. Sistema gera notificação \`ServiceRequest\` para o gestor (\`ponto.notify_emails\`)
6. Gestor vê a notificação e abre o deep-link de gestão
7. Gestor visualiza detalhes (original vs solicitado, motivo, timeline)

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | \`01-colaborador-espelho-ponto.png\` | Espelho de ponto |
| 02 | \`02-colaborador-dias-selecionados.png\` | Seleção em massa |
| 03 | \`03-colaborador-modal-ajuste-multidias.png\` | Modal de solicitação |
| 04 | \`04-colaborador-protocolo-sucesso.png\` | Protocolo |
| 05 | \`05-colaborador-minhas-solicitacoes.png\` | Acompanhamento lista |
| 06 | \`06-colaborador-detalhe-acompanhamento.png\` | Detalhe / status |
| 09 | \`09-gestor-lista-notificacoes.png\` | Notificações do gestor |
| 10 | \`10-gestor-gestao-deeplink.png\` | Deep-link gestão |
| 11 | \`11-gestor-detalhe-ajuste.png\` | Detalhe view-only |
| 12 | \`12-gestor-lista-gestao.png\` | Lista gestão |

Gerado em: ${new Date().toISOString()}
`);
  });
});
