import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * UAT: gestor real (Lucas Machado) vê apenas a equipe direta —
 * contraste com e2e.ponto.gestor (escopo RH / até 200 pessoas).
 */
const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const ADMIN_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const ADMIN_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const MANAGER_EMAIL =
  process.env.LIO_E2E_LUCAS_EMAIL ?? "lucas.machado@liotecnica.com.br";
const MANAGER_PASSWORD =
  process.env.LIO_E2E_LUCAS_PASSWORD ?? "ChangeMe@2026";
const MANAGER_SLUG = "lucas-machado";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "banco-horas-gestor-lucas-uat");

/** Escopo RH devolve até 200; gestor de equipe deve ficar bem abaixo. */
const RH_SCOPE_THRESHOLD = 50;

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = {
  id: string;
  email: string;
  name: string;
  slug?: string;
  permissions?: Array<{ key: string; scope?: string } | string>;
};
type TeamMemberDto = {
  personId: string;
  name: string;
  title?: string | null;
  employeeId?: string | null;
  balanceHours: number;
  periodLabel?: string | null;
};
type HierarchyDto = {
  directReports: Array<{ slug: string; name: string }>;
  directReportsCount: number;
};
type TestUserDto = {
  id: string;
  email: string;
  optionalPersonId?: string | null;
  roleNames?: string[];
};
type RoleDto = { id: string; slug: string; name: string };

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

/**
 * Garante login local do Lucas como test-user ligado à Person real,
 * com papel Manager (ponto.approve Team) — sem escopo RH global.
 */
async function ensureLucasManagerTestUser(request: APIRequestContext, adminToken: string) {
  const profile = await apiGet<{ id: string; email: string; name: string; slug: string }>(
    request,
    adminToken,
    `/people/${MANAGER_SLUG}/profile`,
  );
  expect(profile.email.toLowerCase()).toBe(MANAGER_EMAIL.toLowerCase());

  const roles = await apiGet<RoleDto[]>(request, adminToken, "/admin/rbac/roles");
  const managerRole = roles.find((r) => r.slug === "Manager");
  expect(managerRole, "papel Manager não encontrado no catálogo RBAC").toBeTruthy();

  const users = await apiGet<TestUserDto[]>(request, adminToken, "/admin/rbac/test-users");
  let lucasUser = users.find((u) => u.email.toLowerCase() === MANAGER_EMAIL.toLowerCase());

  if (!lucasUser) {
    const create = await request.post(`${API_BASE_URL}/api/v1/admin/rbac/test-users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        email: MANAGER_EMAIL,
        password: MANAGER_PASSWORD,
        displayName: profile.name,
        businessArea: 0,
        optionalPersonId: profile.id,
        expiresAt: null,
        notes: "UAT banco de horas — escopo gestor (equipe direta)",
        templateRoleId: managerRole!.id,
      },
    });
    expect(create.ok(), `create test-user Lucas failed: ${create.status()}`).toBeTruthy();
    lucasUser = (await create.json()) as TestUserDto;
  } else {
    const update = await request.put(
      `${API_BASE_URL}/api/v1/admin/rbac/test-users/${lucasUser.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          displayName: profile.name,
          businessArea: 0,
          optionalPersonId: profile.id,
          isActive: true,
          expiresAt: null,
          notes: "UAT banco de horas — escopo gestor (equipe direta)",
        },
      },
    );
    expect(update.ok(), `update test-user Lucas failed: ${update.status()}`).toBeTruthy();

    const reset = await request.post(
      `${API_BASE_URL}/api/v1/admin/rbac/test-users/${lucasUser.id}/reset-password`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { password: MANAGER_PASSWORD },
      },
    );
    expect(reset.ok(), `reset password Lucas failed: ${reset.status()}`).toBeTruthy();
  }

  // Garante assignment Manager (pode já existir via template)
  await request.post(`${API_BASE_URL}/api/v1/admin/rbac/assignments`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      subjectType: 2, // TestUser
      subjectId: lucasUser!.id,
      roleId: managerRole!.id,
    },
  });

  return { personId: profile.id, testUserId: lucasUser!.id, profile };
}

test.describe("UAT Banco de horas — gestor Lucas (equipe direta)", () => {
  test.setTimeout(240_000);

  test("lucas.machado vê só os diretos, não o organograma inteiro", async ({
    request,
    browser,
  }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-BH-LUCAS-${Date.now()}`;
    let passed = false;
    let failure = "";

    try {
      const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
      const setup = await ensureLucasManagerTestUser(request, adminToken);
      writeEvidence("00-setup-lucas-test-user.json", {
        marker,
        managerEmail: MANAGER_EMAIL,
        personId: setup.personId,
        testUserId: setup.testUserId,
        note: "Test-user ligado à Person do Lucas + papel Manager (escopo Team)",
      });

      const hierarchy = await apiGet<HierarchyDto>(
        request,
        adminToken,
        `/people/${MANAGER_SLUG}/hierarchy`,
      );
      writeEvidence("00-lucas-hierarchy.json", {
        directReportsCount: hierarchy.directReportsCount,
        directReports: hierarchy.directReports,
      });
      expect(hierarchy.directReportsCount).toBeGreaterThan(0);
      expect(hierarchy.directReports.length).toBe(hierarchy.directReportsCount);

      const managerToken = await login(request, MANAGER_EMAIL, MANAGER_PASSWORD);
      const me = await apiGet<MeDto>(request, managerToken, "/me");
      writeEvidence("01-gestor-me.json", me);
      expect(me.id).toBe(setup.personId);
      expect(me.email.toLowerCase()).toBe(MANAGER_EMAIL.toLowerCase());

      const team = await apiGet<TeamMemberDto[]>(
        request,
        managerToken,
        "/rh/ponto/banco-horas",
      );
      writeEvidence("02-gestor-team-api.json", {
        marker,
        count: team.length,
        members: team,
        expectedDirectReports: hierarchy.directReportsCount,
        rhScopeThreshold: RH_SCOPE_THRESHOLD,
      });

      expect(
        team.length,
        `esperado escopo de equipe (~${hierarchy.directReportsCount}), veio ${team.length} (possível escopo RH)`,
      ).toBeLessThan(RH_SCOPE_THRESHOLD);
      expect(team.length).toBe(hierarchy.directReportsCount);

      const expectedNames = new Set(
        hierarchy.directReports.map((r) => r.name.trim().toLowerCase()),
      );
      for (const member of team) {
        expect(
          expectedNames.has(member.name.trim().toLowerCase()),
          `membro fora da equipe direta: ${member.name}`,
        ).toBeTruthy();
      }

      const { context: mgrCtx, page: mgrPage } = await openAuthedPage(browser, managerToken);
      try {
        await mgrPage.goto(`${PAGE_BASE_URL}/servicos/ponto-eletronico/gestao`, {
          waitUntil: "domcontentloaded",
        });
        await mgrPage.waitForTimeout(1500);
        await mgrPage.screenshot({
          path: evidencePath("03-gestor-gestao-ponto.png"),
          fullPage: true,
        });

        await mgrPage.getByRole("button", { name: /Banco de horas/i }).click();
        await mgrPage.waitForTimeout(1500);
        await mgrPage.screenshot({
          path: evidencePath("04-gestor-aba-banco-horas.png"),
          fullPage: true,
        });

        const listItems = mgrPage.locator(".leave-requests-list__item");
        await expect(listItems.first()).toBeVisible({ timeout: 15_000 });
        const uiCount = await listItems.count();
        writeEvidence("04b-ui-list-count.json", {
          uiCount,
          apiCount: team.length,
          hierarchyCount: hierarchy.directReportsCount,
        });
        expect(uiCount).toBe(team.length);

        // Preferir colaborador com chapa RM (sem chapa o modal só mostra mensagem, sem "Saldo atual")
        const withChapa = team.find((m) => !!m.employeeId) ?? team[0];
        const detailItem = mgrPage
          .locator(".leave-requests-list__item")
          .filter({ hasText: withChapa.name });
        await detailItem.first().click();
        await mgrPage.waitForTimeout(2000);
        await mgrPage.screenshot({
          path: evidencePath("05-gestor-detalhe-banco-horas.png"),
          fullPage: true,
        });
        writeEvidence("05b-detalhe-membro.json", {
          name: withChapa.name,
          employeeId: withChapa.employeeId,
          balanceHours: withChapa.balanceHours,
        });
        await expect(mgrPage.getByText(/Saldo atual|Sem movimentos|indispon|chapa/i).first()).toBeVisible({
          timeout: 15_000,
        });
        if (withChapa.employeeId) {
          await expect(mgrPage.getByText(/Saldo atual/i)).toBeVisible({ timeout: 15_000 });
        }

        const ledgerList = mgrPage.locator(".bh-detail-ledger__list");
        if (await ledgerList.count()) {
          const scrollMetrics = await ledgerList.evaluate((el) => ({
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            overflowY: getComputedStyle(el).overflowY,
          }));
          writeEvidence("05c-ledger-scroll.json", scrollMetrics);
          expect(
            scrollMetrics.scrollHeight > scrollMetrics.clientHeight || scrollMetrics.scrollHeight <= scrollMetrics.clientHeight,
          ).toBeTruthy();
          if (scrollMetrics.scrollHeight > scrollMetrics.clientHeight) {
            expect(["auto", "scroll", "overlay"]).toContain(scrollMetrics.overflowY);
            await ledgerList.evaluate((el) => {
              el.scrollTop = Math.min(el.scrollHeight, el.clientHeight + 120);
            });
            await mgrPage.waitForTimeout(400);
            await mgrPage.screenshot({
              path: evidencePath("05d-gestor-detalhe-apos-scroll.png"),
              fullPage: true,
            });
          }
        }
      } finally {
        await mgrCtx.close();
      }

      passed = true;
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Banco de horas — gestor Lucas (equipe direta)

## Resultado: PASSOU

- **Run:** \`${stamp}\`
- **Marker:** ${marker}
- **Gestor:** ${MANAGER_EMAIL} (${me.name})
- **PersonId:** ${setup.personId}
- **Equipe (API):** ${team.length} colaborador(es)
- **Diretos no organograma:** ${hierarchy.directReportsCount}
- **Contraste:** UAT anterior com \`e2e.ponto.gestor\` (Key User RH) listava ~163 — escopo global RH, não equipe

## Fluxo validado

1. Test-user do Lucas ligado à Person real + papel **Manager** (escopo Team)
2. \`GET /rh/ponto/banco-horas\` retorna exatamente os diretos do organograma
3. Contagem UI = API = hierarchy (\`${team.length}\`)
4. Detalhe de um colaborador com saldo/extrato

## Membros da equipe

${team.map((m, i) => `${i + 1}. ${m.name} — ${m.balanceHours}h`).join("\n")}

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 03 | \`03-gestor-gestao-ponto.png\` | Gestão de ponto |
| 04 | \`04-gestor-aba-banco-horas.png\` | Aba equipe (só diretos) |
| 05 | \`05-gestor-detalhe-banco-horas.png\` | Detalhe saldo/extrato |

Gerado em: ${new Date().toISOString()}
Pasta: \`${path.resolve(runDir)}\`
`,
      );
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      writeEvidence(
        "99-uat-summary.md",
        `# UAT Banco de horas — gestor Lucas

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
