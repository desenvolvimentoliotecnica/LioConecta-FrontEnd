import { expect, test } from "@playwright/test";

const AUTH_TOKEN_KEY = "lioconecta.auth.token";
const E2E_TOKEN = "e2e-systems-access-token";

const ME = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "TI",
  roles: ["Admin"],
};

const SYSTEM = {
  id: "sys-erp-001",
  name: "ERP Corporativo",
  slug: "erp-corporativo",
  description: "ERP financeiro e estoque",
  category: "ERP",
  destinationType: "External",
  urlDev: "https://erp.dev.example",
  urlHml: "https://erp.hml.example",
  urlPrd: "https://erp.example",
  launchUrl: "https://erp.example",
  iconKind: "FontAwesome",
  iconFaClass: "fa-building",
  iconAssetUrl: null,
  isActive: true,
  accessNotes: "Solicitar perfil leitura ou edição conforme área.",
  clickCount: 0,
  sortOrder: 1,
};

const AREAS = [{ id: "1", name: "Root entity", icon: "folder", serviceCount: 2, entityId: 1 }];

const CATEGORIES = [
  {
    id: 9,
    name: "Identidade e Acessos",
    fullName: "Identidade e Acessos",
    parentId: null,
    hasChildren: true,
    entityId: 1,
  },
  {
    id: 509,
    name: "Acesso a sistemas",
    fullName: "Identidade e Acessos > Acesso a sistemas",
    parentId: 9,
    hasChildren: false,
    entityId: 1,
  },
  {
    id: 17,
    name: "Sistemas Corporativos",
    fullName: "Sistemas Corporativos",
    parentId: null,
    hasChildren: true,
    entityId: 1,
  },
  {
    id: 517,
    name: "Solicitação",
    fullName: "Sistemas Corporativos > Solicitação",
    parentId: 17,
    hasChildren: false,
    entityId: 1,
  },
];

async function seedAuth(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ tokenKey, token }) => {
      sessionStorage.setItem(tokenKey, token);
    },
    { tokenKey: AUTH_TOKEN_KEY, token: E2E_TOKEN },
  );
}

async function mockSystemsAccessApi(page: import("@playwright/test").Page) {
  await seedAuth(page);

  await page.route("**/health", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "Healthy" }),
    });
  });

  await page.route("**/api/v1/me**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME) });
  });

  await page.route("**/api/v1/me/preferences**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ bookmarks: [] }),
    });
  });

  await page.route("**/api/v1/notifications**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.route("**/api/v1/admin/app-settings**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/systems/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        canManage: false,
        environment: "prd",
        total: 1,
        categories: ["ERP"],
      }),
    });
  });

  await page.route(/\/api\/v1\/systems(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([SYSTEM]),
    });
  });

  await page.route("**/api/v1/ti/help-desk/areas", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(AREAS),
    });
  });

  await page.route("**/api/v1/ti/help-desk/categories**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CATEGORIES),
    });
  });

  await page.route("**/api/v1/ti/help-desk/tickets", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const body = route.request().postDataJSON() as {
      subject?: string;
      categoryId?: number;
      description?: string;
    };
    expect(body.subject).toContain("ERP Corporativo");
    expect(body.categoryId).toBe(509);
    expect(body.description).toContain("Ambiente solicitado: PRD");
    expect(body.description).toContain("Justificativa");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        requestId: "req-access-001",
        status: "Open",
        message: "Chamado registrado com sucesso no GLPI.",
        externalRef: "4521",
        externalUrl: "https://glpi.example/front/ticket.form.php?id=4521",
      }),
    });
  });
}

test.describe("Solicitar acesso a sistemas (GLPI)", () => {
  test.setTimeout(60_000);

  test("abre modal, envia solicitação e exibe protocolo GLPI", async ({ page }) => {
    await mockSystemsAccessApi(page);
    await page.goto("/servicos/acesso-sistemas");

    await expect(page.getByRole("heading", { name: "Acesso a Sistemas" })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Solicitar acesso" }).first().click();

    const dialog = page.getByRole("dialog", { name: "Solicitar acesso" });
    await expect(dialog).toBeVisible();

    await dialog.locator("select").nth(0).selectOption(SYSTEM.id);
    await expect(dialog.getByRole("note")).toContainText("perfil leitura");
    await expect(dialog.locator("select").nth(2)).toHaveValue("509");

    await dialog.locator("textarea").fill("Preciso de acesso de leitura para fechamento mensal.");
    await dialog.getByRole("button", { name: "Enviar solicitação" }).click();

    const result = page.getByRole("dialog", { name: "Chamado registrado" });
    await expect(result).toBeVisible({ timeout: 10_000 });
    await expect(result.getByText("Protocolo GLPI: 4521")).toBeVisible();
    await expect(result.getByRole("link", { name: "Ver no GLPI" })).toHaveAttribute(
      "href",
      "https://glpi.example/front/ticket.form.php?id=4521",
    );
    await expect(result.getByRole("button", { name: "Acompanhar meus chamados" })).toBeVisible();
  });

  test("card pré-seleciona o sistema no modal", async ({ page }) => {
    await mockSystemsAccessApi(page);
    await page.goto("/servicos/acesso-sistemas");

    await expect(page.getByRole("heading", { name: "ERP Corporativo" })).toBeVisible({
      timeout: 15_000,
    });

    await page
      .getByRole("article")
      .filter({ hasText: "ERP Corporativo" })
      .getByRole("button", { name: "Solicitar acesso" })
      .click();

    const dialog = page.getByRole("dialog", { name: "Solicitar acesso" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("select").first()).toHaveValue(SYSTEM.id);
  });
});
