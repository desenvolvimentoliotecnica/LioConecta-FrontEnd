import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  UNILIO_API_MOCK_META,
  buildMockAssessments,
  buildMockCatalog,
  buildMockCertificates,
  buildMockCommunity,
  buildMockCompliance,
  buildMockDashboard,
  buildMockEvents,
  buildMockInstructorCourses,
  buildMockManagerTeam,
  buildMockPaths,
  buildMockRecommendations,
  buildMockReports,
  buildMockSkills,
  COURSE_IDS,
} from "../src/config/unilio/apiMockData";

const evidenceDir = path.join(process.cwd(), "e2e/evidence/unilio");
const AUTH_TOKEN_KEY = "lioconecta.auth.token";
const E2E_TOKEN = "e2e-unilio-test-token";

const ADMIN_ME = {
  id: "00000000-0000-0000-0000-000000000099",
  slug: "admin-e2e",
  name: "Admin E2E",
  email: "admin.e2e@liotecnica.com.br",
  title: "Administrador",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "TI",
  roles: ["Admin"],
};

type SettingRow = {
  key: string;
  value: string;
  label: string;
  description: string;
  valueType: string;
  isSecret: boolean;
  sortOrder: number;
};

function buildUniLioCategory(settings: Record<string, string>) {
  const rows: SettingRow[] = [
    {
      key: "unilio.enabled",
      value: settings["unilio.enabled"] ?? "true",
      label: "UniLio — módulo habilitado",
      description: "Quando false, o módulo UniLio fica indisponível no portal.",
      valueType: "boolean",
      isSecret: false,
      sortOrder: 1,
    },
    {
      key: "unilio.allowed_roles",
      value: settings["unilio.allowed_roles"] ?? '["Employee","Manager","HR","Admin"]',
      label: "UniLio — perfis com acesso",
      description: "JSON array de roles autorizadas a visualizar o módulo UniLio.",
      valueType: "json",
      isSecret: false,
      sortOrder: 2,
    },
    {
      key: "unilio.allowed_emails",
      value: settings["unilio.allowed_emails"] ?? "[]",
      label: "UniLio — e-mails adicionais com acesso",
      description: "JSON array de e-mails autorizados além dos perfis configurados.",
      valueType: "json",
      isSecret: false,
      sortOrder: 3,
    },
  ];

  return {
    id: "unilio",
    label: "UniLio",
    description: "Permissões do módulo UniLio",
    settings: rows,
  };
}

function bootstrapFromSettings(settings: Record<string, string>) {
  return {
    enabled: settings["unilio.enabled"] !== "false",
    allowedRoles: JSON.parse(settings["unilio.allowed_roles"] ?? '["Employee","Manager","HR","Admin"]'),
    allowedEmails: JSON.parse(settings["unilio.allowed_emails"] ?? "[]"),
  };
}

function parseFilters(url: URL) {
  return {
    area: url.searchParams.get("area") ?? undefined,
    department: url.searchParams.get("department") ?? undefined,
    contentType: url.searchParams.get("contentType") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    period: url.searchParams.get("period") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1"),
    pageSize: Number(url.searchParams.get("pageSize") ?? "20"),
  };
}

async function seedAuthSession(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ tokenKey, token }) => {
      sessionStorage.setItem(tokenKey, token);
    },
    { tokenKey: AUTH_TOKEN_KEY, token: E2E_TOKEN },
  );
}

async function mockUniLioApi(
  page: import("@playwright/test").Page,
  options?: { unilioSettings?: Record<string, string>; me?: typeof ADMIN_ME },
) {
  let unilioSettings: Record<string, string> = {
    "unilio.enabled": "true",
    "unilio.allowed_roles": '["Employee","Manager","HR","Admin"]',
    "unilio.allowed_emails": "[]",
    ...options?.unilioSettings,
  };

  const me = options?.me ?? ADMIN_ME;

  await seedAuthSession(page);

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) });
  });

  await page.route("**/api/v1/unilio/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bootstrapFromSettings(unilioSettings)),
    });
  });

  await page.route("**/api/v1/unilio/meta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(UNILIO_API_MOCK_META),
    });
  });

  await page.route("**/api/v1/unilio/dashboard**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockDashboard(parseFilters(url))),
    });
  });

  await page.route("**/api/v1/unilio/catalog**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockCatalog(parseFilters(url))),
    });
  });

  await page.route("**/api/v1/unilio/paths", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockPaths()),
    });
  });

  await page.route("**/api/v1/unilio/compliance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockCompliance()),
    });
  });

  await page.route("**/api/v1/unilio/assessments", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockAssessments()),
    });
  });

  await page.route("**/api/v1/unilio/certificates", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockCertificates()),
    });
  });

  await page.route("**/api/v1/unilio/community**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockCommunity(parseFilters(url))),
    });
  });

  await page.route("**/api/v1/unilio/recommendations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockRecommendations()),
    });
  });

  await page.route("**/api/v1/unilio/events", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockEvents()),
    });
  });

  await page.route("**/api/v1/unilio/skills", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockSkills()),
    });
  });

  await page.route("**/api/v1/unilio/manager/team", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockManagerTeam()),
    });
  });

  await page.route("**/api/v1/unilio/instructor/courses", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockInstructorCourses()),
    });
  });

  await page.route("**/api/v1/unilio/reports/summary**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockReports(parseFilters(url))),
    });
  });

  await page.route(`**/api/v1/unilio/courses/${COURSE_IDS.gestaoPessoas}`, async (route) => {
    const { buildMockCourse } = await import("../src/config/unilio/apiMockData");
    const course = buildMockCourse(COURSE_IDS.gestaoPessoas);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(course),
    });
  });

  await page.route("**/api/v1/admin/app-settings", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([buildUniLioCategory(unilioSettings)]),
      });
      return;
    }

    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() as { settings: { key: string; value: string }[] };
      for (const item of body.settings) {
        if (item.key.startsWith("unilio.")) {
          unilioSettings[item.key] = item.value;
        }
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: [buildUniLioCategory(unilioSettings)],
          requiresRestart: false,
          message: "Configurações salvas com sucesso.",
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("UniLio — Portal de Aprendizagem", () => {
  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("dashboard exibe KPIs e trilha ativa", async ({ page }) => {
    await mockUniLioApi(page);
    await page.goto("/unilio");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Cursos matriculados/i)).toBeVisible();
    await expect(page.getByText(/Trilha de Liderança/i)).toBeVisible();
    await expect(page.getByLabel("Filtrar por área")).toContainText("Gestão");

    await page.screenshot({
      path: path.join(evidenceDir, "01-unilio-dashboard.png"),
      fullPage: true,
    });
  });

  test("navega por sub-rotas principais", async ({ page }) => {
    await mockUniLioApi(page);
    await page.goto("/unilio");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });

    for (const route of [
      "catalogo",
      "trilhas",
      "avaliacoes",
      "certificados",
      "compliance",
      "comunidade",
      "recomendacoes",
      "eventos",
      "competencias",
    ] as const) {
      await page.goto(`/unilio/${route}`);
      await expect(page.locator("h1.unilio-page__title")).toBeVisible({ timeout: 10_000 });
    }

    await page.screenshot({
      path: path.join(evidenceDir, "02-unilio-navigation.png"),
      fullPage: true,
    });
  });

  test("catálogo exibe cards de cursos", async ({ page }) => {
    await mockUniLioApi(page);
    await page.goto("/unilio/catalogo");

    await expect(page.getByRole("heading", { name: /Catálogo/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Gestão de Pessoas/i)).toBeVisible();
  });

  test("admin configura permissões UniLio", async ({ page }) => {
    await mockUniLioApi(page);
    await page.goto("/admin/configuracoes-backend?category=unilio");

    await expect(page.getByRole("heading", { name: /UniLio — acesso e permissões/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByLabel(/Módulo UniLio habilitado/i)).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "03-unilio-settings.png"),
      fullPage: true,
    });
  });
});
