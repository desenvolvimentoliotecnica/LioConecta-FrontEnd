import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5174";
const RH_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const RH_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EMPLOYEE_EMAIL =
  process.env.LIO_E2E_EMPLOYEE_EMAIL ?? "e2e.atestado.colaborador@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_E2E_EMPLOYEE_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_DIR = path.join("e2e", "evidence", "atestado-rh-anexos");
const FIXTURES_DIR = path.join("e2e", "fixtures", "atestado");

type LoginResponse = { accessToken: string };
type LeaveAttachmentMeta = {
  fileName: string;
  storageFileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
};
type LeaveManagementDetail = {
  id: string;
  employeeName: string;
  title: string;
  notes?: string | null;
  approvalNote: string;
  attachments?: LeaveAttachmentMeta[];
};
type LeaveManagementItem = {
  id: string;
  employeeName: string;
  title: string;
  createdAt: string;
};
type NotificationDto = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  isRead: boolean;
};
type PagedNotifications = { items: NotificationDto[] };
type TestUserDto = { id: string; email: string };

function minimalPdf(label: string): Buffer {
  const content = `BT /F1 12 Tf 40 750 Td (${label}) Tj ET`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefPos = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

function ensureFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const pdfPath = path.join(FIXTURES_DIR, "atestado-rh-sample.pdf");
  const pngPath = path.join(FIXTURES_DIR, "atestado-rh-sample.png");
  fs.writeFileSync(pdfPath, minimalPdf("Atestado RH E2E"));
  fs.writeFileSync(
    pngPath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
      "base64",
    ),
  );
  return { pdfPath, pngPath };
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
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await context.addInitScript(
    ({ tokenKey, value }) => {
      sessionStorage.setItem(tokenKey, value);
    },
    { tokenKey: "lioconecta.auth.token", value: token },
  );
  const page = await context.newPage();
  return { context, page };
}

async function ensureEmployeeTestUser(request: APIRequestContext, rhToken: string) {
  const listResponse = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
    headers: { Authorization: `Bearer ${rhToken}` },
  });
  expect(listResponse.ok(), `list test-users failed: ${listResponse.status()}`).toBeTruthy();
  const users = (await listResponse.json()) as TestUserDto[];
  const existing = users.find((u) => u.email.toLowerCase() === EMPLOYEE_EMAIL.toLowerCase());
  if (existing) {
    const reset = await request.post(
      `${API_BASE_URL}/api/v1/admin/rbac/test-users/${existing.id}/reset-password`,
      {
        headers: { Authorization: `Bearer ${rhToken}` },
        data: { password: EMPLOYEE_PASSWORD },
      },
    );
    expect(reset.ok(), `reset password failed: ${reset.status()}`).toBeTruthy();
    return existing;
  }

  const create = await request.post(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
    headers: { Authorization: `Bearer ${rhToken}` },
    data: {
      email: EMPLOYEE_EMAIL,
      password: EMPLOYEE_PASSWORD,
      displayName: "E2E Atestado Colaborador",
      businessArea: 0,
      optionalPersonId: null,
      expiresAt: null,
      notes: "Usuário E2E para fluxo atestado → RH",
      templateRoleId: null,
    },
  });
  expect(
    create.ok(),
    `create test-user failed: ${create.status()} ${await create.text()}`,
  ).toBeTruthy();
  return (await create.json()) as TestUserDto;
}

type RoleDto = { id: string; slug: string; name: string };
type AssignmentDto = {
  subjectType: number;
  subjectId: string;
  subjectLabel: string;
  roleId: string;
  roleName: string;
};

/** Garante leave.manage no RH (Admin sozinho não libera gestão). */
async function ensureRhLeaveManage(request: APIRequestContext, rhToken: string, rhEmail: string) {
  const rolesResponse = await request.get(`${API_BASE_URL}/api/v1/admin/rbac/roles`, {
    headers: { Authorization: `Bearer ${rhToken}` },
  });
  expect(rolesResponse.ok()).toBeTruthy();
  const roles = (await rolesResponse.json()) as RoleDto[];
  const keyUserRh = roles.find((r) => r.slug === "KeyUser-RH");
  expect(keyUserRh, "Role KeyUser-RH não encontrada").toBeTruthy();

  const assignResponse = await request.get(
    `${API_BASE_URL}/api/v1/admin/rbac/assignments?query=${encodeURIComponent(rhEmail)}`,
    { headers: { Authorization: `Bearer ${rhToken}` } },
  );
  expect(assignResponse.ok()).toBeTruthy();
  const assignments = (await assignResponse.json()) as AssignmentDto[];
  const bySubject = new Map<string, { subjectType: number; subjectId: string; roleIds: Set<string> }>();
  for (const item of assignments) {
    if (!item.subjectLabel.toLowerCase().includes(rhEmail.toLowerCase())) continue;
    const key = `${item.subjectType}:${item.subjectId}`;
    const entry = bySubject.get(key) ?? {
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      roleIds: new Set<string>(),
    };
    entry.roleIds.add(item.roleId);
    bySubject.set(key, entry);
  }

  for (const entry of bySubject.values()) {
    if (entry.roleIds.has(keyUserRh!.id)) continue;
    entry.roleIds.add(keyUserRh!.id);
    const update = await request.put(`${API_BASE_URL}/api/v1/admin/rbac/assignments`, {
      headers: { Authorization: `Bearer ${rhToken}` },
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

async function findRecordIdForMarker(
  request: APIRequestContext,
  rhToken: string,
  marker: string,
): Promise<string> {
  const listResponse = await request.get(`${API_BASE_URL}/api/v1/rh/leave/management?limit=50`, {
    headers: { Authorization: `Bearer ${rhToken}` },
  });
  expect(
    listResponse.ok(),
    `management list failed: ${listResponse.status()} ${await listResponse.text()}`,
  ).toBeTruthy();
  const items = (await listResponse.json()) as LeaveManagementItem[];
  const candidates = items
    .filter((item) => /atestado/i.test(item.title))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  for (const item of candidates.slice(0, 12)) {
    const detailResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/leave/management/${item.id}`,
      { headers: { Authorization: `Bearer ${rhToken}` } },
    );
    if (!detailResponse.ok()) continue;
    const detail = (await detailResponse.json()) as LeaveManagementDetail;
    if ((detail.notes ?? "").includes(marker)) {
      return detail.id;
    }
  }

  throw new Error(`Não encontrou solicitação com marker ${marker}`);
}

test.describe("Atestado — RH vê notificação, detalhe e anexos", () => {
  test.use({ ignoreHTTPSErrors: true });

  test.beforeAll(() => {
    ensureFixtures();
  });

  test("fluxo colaborador → notificação RH → visualizar anexos", async ({ browser, request }) => {
    test.setTimeout(180_000);
    const { pdfPath, pngPath } = ensureFixtures();
    const marker = `E2E-RH-${Date.now()}`;

    const rhToken = await login(request, RH_EMAIL, RH_PASSWORD);
    await ensureRhLeaveManage(request, rhToken, RH_EMAIL);
    // Re-login para o JWT/bootstrap refletir leave.manage
    const rhTokenFresh = await login(request, RH_EMAIL, RH_PASSWORD);
    await ensureEmployeeTestUser(request, rhTokenFresh);
    const employeeToken = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    // 1) Colaborador registra atestado
    const employee = await openAuthedPage(browser, employeeToken);
    try {
      await employee.page.goto(`${PAGE_BASE_URL}/servicos/ferias-ausencias`);
      await expect(
        employee.page.getByRole("heading", { name: /Férias e Ausências/i }),
      ).toBeVisible({ timeout: 20_000 });

      const card = employee.page
        .locator(".leave-card")
        .filter({
          has: employee.page.getByRole("heading", {
            name: "Registrar Atestado Médico",
            exact: true,
          }),
        });
      await expect(card).toBeVisible({ timeout: 20_000 });
      await card.locator("button.leave-card__open").click();

      const modal = employee.page.locator(".pay-modal").filter({
        has: employee.page.locator("#pay-modal-title", { hasText: "Registrar Atestado Médico" }),
      });
      await expect(modal).toBeVisible();

      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 2);
      const end = endDate.toISOString().slice(0, 10);

      await modal.locator('input[type="date"]').nth(0).fill(start);
      await modal.locator('input[type="date"]').nth(1).fill(end);
      await modal.locator("textarea").fill(`${marker} — atestado com PDF e PNG`);
      await modal.locator(".leave-form__file-input").setInputFiles([pdfPath, pngPath]);
      await expect(modal.locator(".leave-form__file-item")).toHaveCount(2);

      await employee.page.screenshot({
        path: path.join(EVIDENCE_DIR, "01-colaborador-formulario-anexos.png"),
        fullPage: true,
      });

      await modal.getByRole("button", { name: /Enviar solicitação/i }).click();
      await expect(
        employee.page.getByRole("heading", { name: /Solicitação registrada/i }),
      ).toBeVisible({ timeout: 30_000 });
      await expect(employee.page.locator(".leave-result__protocol")).toBeVisible();

      await employee.page.screenshot({
        path: path.join(EVIDENCE_DIR, "02-colaborador-protocolo-sucesso.png"),
        fullPage: true,
      });
    } finally {
      await employee.context.close();
    }

    const recordId = await findRecordIdForMarker(request, rhTokenFresh, marker);
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, "03-record-id.txt"),
      `${recordId}\nmarker=${marker}\n`,
    );

    // 2) RH vê a notificação
    const notifResponse = await request.get(`${API_BASE_URL}/api/v1/notifications?limit=50`, {
      headers: { Authorization: `Bearer ${rhTokenFresh}` },
    });
    expect(notifResponse.ok()).toBeTruthy();
    const notifs = (await notifResponse.json()) as PagedNotifications;
    const atestadoNotif = notifs.items.find(
      (n) => /atestado/i.test(n.title) && (n.href?.includes(recordId) || /atestado/i.test(n.body)),
    );
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, "04-rh-notifications-api.json"),
      JSON.stringify(
        {
          recordId,
          found: Boolean(atestadoNotif),
          match: atestadoNotif ?? null,
          recentTitles: notifs.items.slice(0, 8).map((n) => n.title),
        },
        null,
        2,
      ),
    );
    expect(atestadoNotif, "RH deveria receber notificação de atestado").toBeTruthy();

    const rh = await openAuthedPage(browser, rhTokenFresh);
    try {
      await rh.page.goto(`${PAGE_BASE_URL}/notificacoes`);
      await expect(rh.page.getByRole("heading", { name: /Notificações/i })).toBeVisible({
        timeout: 20_000,
      });

      const notifCard = rh.page
        .locator("a.notifications-page__item")
        .filter({ hasText: /Novo atestado médico|atestado médico/i })
        .filter({ has: rh.page.locator(`text=${recordId}`).or(rh.page.locator("p")) })
        .first();

      // Prefer the notification that links to this record
      const linked = rh.page.locator(`a.notifications-page__item[href*="${recordId}"]`);
      const target = (await linked.count()) > 0 ? linked.first() : notifCard;
      await expect(target).toBeVisible({ timeout: 20_000 });

      await rh.page.screenshot({
        path: path.join(EVIDENCE_DIR, "05-rh-lista-notificacoes.png"),
        fullPage: true,
      });

      // 3) RH abre a notificação
      await target.click();
      await expect(rh.page).toHaveURL(new RegExp(`ferias-ausencias/gestao.*${recordId}`), {
        timeout: 20_000,
      });
      await expect(rh.page.getByRole("heading", { name: /Gestão de férias/i })).toBeVisible({
        timeout: 20_000,
      });

      await rh.page.screenshot({
        path: path.join(EVIDENCE_DIR, "06-rh-gestao-apos-notificacao.png"),
        fullPage: true,
      });

      // 4) Detalhe + anexos (sem aprovação no portal)
      await expect(rh.page.locator(".leave-gestao-detail")).toBeVisible({ timeout: 20_000 });
      await expect(rh.page.locator(".leave-detail__source")).toContainText(/RM Labore/i);
      await expect(rh.page.getByRole("heading", { name: /Documentos anexados/i })).toBeVisible({
        timeout: 20_000,
      });
      await expect(rh.page.locator(".leave-attachments__item")).toHaveCount(2, { timeout: 20_000 });
      await expect(rh.page.getByRole("button", { name: /Aprovar/i })).toHaveCount(0);
      await expect(rh.page.getByRole("button", { name: /Rejeitar/i })).toHaveCount(0);

      await rh.page.screenshot({
        path: path.join(EVIDENCE_DIR, "07-rh-detalhe-com-anexos.png"),
        fullPage: true,
      });

      await rh.page.getByTestId("leave-attachment-view").first().click();
      const viewer = rh.page.getByTestId("leave-attachment-viewer");
      await expect(viewer).toBeVisible({ timeout: 15_000 });
      await expect(
        viewer.locator("iframe.leave-attachment-viewer__pdf, img.leave-attachment-viewer__img"),
      ).toBeVisible({ timeout: 15_000 });

      await rh.page.screenshot({
        path: path.join(EVIDENCE_DIR, "08-rh-lightbox-anexo.png"),
        fullPage: true,
      });
    } finally {
      await rh.context.close();
    }

    // API evidence: detalhe + download autenticado
    const detailResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/leave/management/${recordId}`,
      { headers: { Authorization: `Bearer ${rhTokenFresh}` } },
    );
    expect(detailResponse.ok()).toBeTruthy();
    const detail = (await detailResponse.json()) as LeaveManagementDetail;
    expect(detail.attachments?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(detail.approvalNote.toLowerCase()).toContain("rm labore");

    const first = detail.attachments![0];
    const fileResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/leave/management/${recordId}/attachments/${first.storageFileName}`,
      { headers: { Authorization: `Bearer ${rhTokenFresh}` } },
    );
    expect(fileResponse.ok()).toBeTruthy();
    const bytes = await fileResponse.body();
    expect(bytes.byteLength).toBeGreaterThan(20);

    fs.writeFileSync(
      path.join(EVIDENCE_DIR, "09-rh-management-detail.json"),
      JSON.stringify(
        {
          id: detail.id,
          employeeName: detail.employeeName,
          title: detail.title,
          notes: detail.notes,
          approvalNote: detail.approvalNote,
          attachments: detail.attachments,
          downloadStatus: fileResponse.status(),
          downloadBytes: bytes.byteLength,
        },
        null,
        2,
      ),
    );
  });
});
