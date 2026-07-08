import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  COMPASS_API_MOCK_META,
  buildMockAggregates,
  buildMockDashboard,
  buildMockYtdPage,
} from "../src/config/compass/apiMockData";

const evidenceDir = path.join(process.cwd(), "e2e/evidence/compass");
const AUTH_TOKEN_KEY = "lioconecta.auth.token";
const E2E_TOKEN = "e2e-compass-test-token";

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

function buildCompassCategory(settings: Record<string, string>) {
  const rows: SettingRow[] = [
    {
      key: "compass.enabled",
      value: settings["compass.enabled"] ?? "true",
      label: "Compass — módulo habilitado",
      description: "Quando false, o módulo Compass IBP fica indisponível no portal.",
      valueType: "boolean",
      isSecret: false,
      sortOrder: 1,
    },
    {
      key: "compass.allowed_roles",
      value: settings["compass.allowed_roles"] ?? '["Manager","Admin","AnalyticsViewer"]',
      label: "Compass — perfis com acesso",
      description: "JSON array de roles autorizadas a visualizar o módulo Compass.",
      valueType: "json",
      isSecret: false,
      sortOrder: 2,
    },
    {
      key: "compass.allowed_emails",
      value: settings["compass.allowed_emails"] ?? "[]",
      label: "Compass — e-mails adicionais com acesso",
      description: "JSON array de e-mails autorizados além dos perfis configurados.",
      valueType: "json",
      isSecret: false,
      sortOrder: 3,
    },
  ];

  return {
    id: "compass",
    label: "Compass IBP",
    description: "Permissões do módulo Compass",
    settings: rows,
  };
}

function bootstrapFromSettings(settings: Record<string, string>) {
  return {
    enabled: settings["compass.enabled"] !== "false",
    allowedRoles: JSON.parse(settings["compass.allowed_roles"] ?? '["Manager","Admin","AnalyticsViewer"]'),
    allowedEmails: JSON.parse(settings["compass.allowed_emails"] ?? "[]"),
  };
}

function parseFilters(url: URL) {
  return {
    diretoria: url.searchParams.get("diretoria") ?? undefined,
    unidade: url.searchParams.get("unidade") ?? undefined,
    familia: url.searchParams.get("familia") ?? undefined,
    tipo: url.searchParams.get("tipo") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
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

async function mockCompassApi(
  page: import("@playwright/test").Page,
  options?: { compassSettings?: Record<string, string>; me?: typeof ADMIN_ME },
) {
  let compassSettings: Record<string, string> = {
    "compass.enabled": "true",
    "compass.allowed_roles": '["Manager","Admin","AnalyticsViewer"]',
    "compass.allowed_emails": "[]",
    ...options?.compassSettings,
  };

  const me = options?.me ?? ADMIN_ME;

  await seedAuthSession(page);

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) });
  });

  await page.route("**/api/v1/compass/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bootstrapFromSettings(compassSettings)),
    });
  });

  await page.route("**/api/v1/compass/meta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(COMPASS_API_MOCK_META),
    });
  });

  await page.route("**/api/v1/compass/dashboard**", async (route) => {
    const url = new URL(route.request().url());
    const filters = parseFilters(url);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockDashboard(filters)),
    });
  });

  await page.route("**/api/v1/compass/ytd**", async (route) => {
    const url = new URL(route.request().url());
    const filters = parseFilters(url);
    const pageNum = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "25");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockYtdPage(pageNum, pageSize, filters)),
    });
  });

  await page.route("**/api/v1/compass/aggregates**", async (route) => {
    const url = new URL(route.request().url());
    const filters = parseFilters(url);
    const groupBy = (url.searchParams.get("groupBy") ?? "diretoria") as
      | "diretoria"
      | "familia"
      | "tipo"
      | "unidade"
      | "matriz";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildMockAggregates(groupBy, filters)),
    });
  });

  await page.route("**/api/v1/admin/app-settings", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([buildCompassCategory(compassSettings)]),
      });
      return;
    }

    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() as { settings: { key: string; value: string }[] };
      for (const item of body.settings) {
        if (item.key.startsWith("compass.")) {
          compassSettings[item.key] = item.value;
        }
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: [buildCompassCategory(compassSettings)],
          requiresRestart: false,
          message: "Configurações salvas com sucesso.",
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Compass IBP", () => {
  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("dashboard exibe ciclo IBP e KPIs Hyperion", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/compass");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Hyperion|IBP/i).first()).toBeVisible();
    await expect(page.getByText(/IBP Atual/i).first()).toBeVisible();
    await expect(page.getByLabel("Filtrar por diretoria")).toContainText("Industrial");

    await page.screenshot({
      path: path.join(evidenceDir, "01-compass-dashboard.png"),
      fullPage: true,
    });
  });

  test("navega por sub-rotas principais", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/compass");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });

    for (const route of ["analise-ytd", "ciclo", "volume", "canais", "financeiro", "reconciliacao"] as const) {
      await page.goto(`/compass/${route}`);
      await expect(page.locator("h1.compass-page__title")).toBeVisible({ timeout: 10_000 });
    }

    await page.screenshot({
      path: path.join(evidenceDir, "02-compass-navigation.png"),
      fullPage: true,
    });
  });

  test("análise YTD exibe grid paginado com colunas Hyperion", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/compass/analise-ytd");

    await expect(page.getByRole("heading", { name: /Análise YTD/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("columnheader", { name: /IBP Atual/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /IBP Anterior/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Variação/i })).toBeVisible();
    await expect(page.getByText(/Exibindo \d+–\d+ de \d+/)).toBeVisible();
  });

  test("modal informativo (i) exibe conteúdo Hyperion", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/compass");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });

    const infoButton = page.locator(".compass-panel .compass-info-btn").first();
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    const modal = page.locator(".pay-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Hyperion|EPBCS/i).first()).toBeVisible();
    await expect(modal.getByRole("heading", { name: /Origem Hyperion/i })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "07-compass-help-modal.png"),
      fullPage: true,
    });
  });

  test("admin configura permissões Compass", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/admin/configuracoes-backend?category=compass");

    await expect(page.getByRole("heading", { name: /Compass IBP — acesso e permissões/i })).toBeVisible({
      timeout: 15_000,
    });

    const employeeCheckbox = page.getByRole("checkbox", { name: "Employee" });
    await employeeCheckbox.check();
    await page.getByLabel(/E-mails adicionais com acesso/i).fill("gestor.teste@liotecnica.com.br");

    await page.screenshot({
      path: path.join(evidenceDir, "03-compass-settings.png"),
      fullPage: true,
    });
  });

  test("colaborador acessa via e-mail na lista", async ({ page }) => {
    const employeeMe = {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "lucas-machado",
      name: "Lucas Muniz Machado",
      email: "lucas.machado@liotecnica.com.br",
      title: "Coordenador TI",
      photoUrl: null,
      departmentName: "TI",
      roles: ["Employee"],
    };

    await mockCompassApi(page, {
      me: employeeMe,
      compassSettings: {
        "compass.enabled": "true",
        "compass.allowed_roles": '["Manager","Admin"]',
        "compass.allowed_emails": '["lucas.machado@liotecnica.com.br"]',
      },
    });

    await page.goto("/compass");
    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Acesso restrito")).not.toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "04-compass-access-by-email.png"),
      fullPage: true,
    });
  });

  test("filtros Hyperion funcionam", async ({ page }) => {
    await mockCompassApi(page);
    await page.goto("/compass");

    await expect(page.getByRole("heading", { name: /Visão Geral/i })).toBeVisible({ timeout: 15_000 });

    await page.getByLabel("Filtrar por diretoria").selectOption({ label: "Industrial" });
    await page.getByLabel("Filtrar por unidade").selectOption({ label: "São Paulo" });
    await expect(page.getByLabel("Filtrar por diretoria")).toHaveValue("Industrial");
    await expect(page.getByLabel("Filtrar por unidade")).toHaveValue("São Paulo");

    await page.screenshot({
      path: path.join(evidenceDir, "05-compass-filters.png"),
      fullPage: true,
    });
  });

  test("acesso negado sem permissão", async ({ page }) => {
    const employeeMe = {
      id: "00000000-0000-0000-0000-000000000002",
      slug: "colaborador-sem-acesso",
      name: "Colaborador Sem Acesso",
      email: "sem.acesso@liotecnica.com.br",
      title: "Analista",
      photoUrl: null,
      departmentName: "RH",
      roles: ["Employee"],
    };

    await mockCompassApi(page, {
      me: employeeMe,
      compassSettings: {
        "compass.enabled": "false",
        "compass.allowed_roles": '["Manager","Admin"]',
        "compass.allowed_emails": "[]",
      },
    });

    await page.goto("/compass");
    await expect(page.getByRole("heading", { name: "Acesso restrito" })).toBeVisible({ timeout: 15_000 });

    await page.screenshot({
      path: path.join(evidenceDir, "06-compass-access-denied.png"),
      fullPage: true,
    });
  });
});
