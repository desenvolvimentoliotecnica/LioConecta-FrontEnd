import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidenceDir = path.join(process.cwd(), "e2e/evidence/loop-settings");

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

type SettingRow = { key: string; value: string; label: string; description: string; valueType: string; isSecret: boolean; sortOrder: number };

function buildLoopCategory(settings: Record<string, string>) {
  const rows: SettingRow[] = [
    {
      key: "loop.enabled",
      value: settings["loop.enabled"] ?? "true",
      label: "Loop — módulo habilitado",
      description: "Quando false, o módulo Loop de Projetos fica indisponível no portal.",
      valueType: "boolean",
      isSecret: false,
      sortOrder: 1,
    },
    {
      key: "loop.allowed_roles",
      value: settings["loop.allowed_roles"] ?? '["Manager","Admin","AnalyticsViewer"]',
      label: "Loop — perfis com acesso",
      description: "JSON array de roles autorizadas a visualizar o módulo Loop.",
      valueType: "json",
      isSecret: false,
      sortOrder: 2,
    },
    {
      key: "loop.allowed_emails",
      value: settings["loop.allowed_emails"] ?? "[]",
      label: "Loop — e-mails adicionais com acesso",
      description: "JSON array de e-mails autorizados além dos perfis configurados.",
      valueType: "json",
      isSecret: false,
      sortOrder: 3,
    },
  ];

  return {
    id: "loop",
    label: "Loop de Projetos",
    description: "Permissões do módulo Loop",
    settings: rows,
  };
}

function bootstrapFromSettings(settings: Record<string, string>) {
  return {
    enabled: settings["loop.enabled"] !== "false",
    allowedRoles: JSON.parse(settings["loop.allowed_roles"] ?? '["Manager","Admin","AnalyticsViewer"]'),
    allowedEmails: JSON.parse(settings["loop.allowed_emails"] ?? "[]"),
  };
}

async function mockLoopSettingsApi(page: import("@playwright/test").Page) {
  let loopSettings: Record<string, string> = {
    "loop.enabled": "true",
    "loop.allowed_roles": '["Manager","Admin","AnalyticsViewer"]',
    "loop.allowed_emails": "[]",
  };

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ADMIN_ME) });
  });

  await page.route("**/api/v1/loop/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bootstrapFromSettings(loopSettings)),
    });
  });

  await page.route("**/api/v1/admin/app-settings", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([buildLoopCategory(loopSettings)]),
      });
      return;
    }

    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() as { settings: { key: string; value: string }[] };
      for (const item of body.settings) {
        if (item.key.startsWith("loop.")) {
          loopSettings[item.key] = item.value;
        }
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: [buildLoopCategory(loopSettings)],
          requiresRestart: false,
          message: "Configurações salvas com sucesso.",
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Loop settings admin", () => {
  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("permite editar checkboxes e textarea", async ({ page }) => {
    await mockLoopSettingsApi(page);
    await page.goto("/admin/configuracoes-backend?category=loop");

    await expect(page.getByRole("heading", { name: /Loop de Projetos — acesso e permissões/i })).toBeVisible({
      timeout: 15_000,
    });

    const employeeCheckbox = page.getByRole("checkbox", { name: "Employee" });
    await expect(employeeCheckbox).not.toBeChecked();
    await employeeCheckbox.check();
    await expect(employeeCheckbox).toBeChecked();

    const emailField = page.getByLabel(/E-mails adicionais com acesso/i);
    await emailField.fill("gestor.teste@liotecnica.com.br\nanalista.teste@liotecnica.com.br");
    await expect(emailField).toHaveValue("gestor.teste@liotecnica.com.br\nanalista.teste@liotecnica.com.br");

    await page.screenshot({
      path: path.join(evidenceDir, "01-loop-settings-edited.png"),
      fullPage: true,
    });
  });

  test("mantém valores quando API não retorna chaves loop", async ({ page }) => {
    await page.route("**/api/v1/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ADMIN_ME) });
    });

    await page.route("**/api/v1/loop/bootstrap", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          enabled: true,
          allowedRoles: ["Manager", "Admin", "AnalyticsViewer"],
          allowedEmails: [],
        }),
      });
    });

    await page.route("**/api/v1/admin/app-settings", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([{ id: "database", label: "Database", description: "", settings: [] }]),
        });
        return;
      }

      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            categories: [],
            requiresRestart: false,
            message: "Configurações salvas com sucesso.",
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto("/admin/configuracoes-backend?category=loop");
    await expect(page.getByText("Loop de Projetos e Equipes")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("checkbox", { name: "HR" }).check();
    await page.getByLabel(/E-mails adicionais com acesso/i).fill("local.only@liotecnica.com.br");
    await page.getByRole("button", { name: "Salvar configurações" }).click();

    await expect(page.getByText(/guardadas neste navegador/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("checkbox", { name: "HR" })).toBeChecked();
    await expect(page.getByLabel(/E-mails adicionais com acesso/i)).toHaveValue("local.only@liotecnica.com.br");

    await page.screenshot({
      path: path.join(evidenceDir, "04-loop-settings-local-fallback.png"),
      fullPage: true,
    });
  });

  test("salva configurações via API e mantém valores após reload", async ({ page }) => {
    await mockLoopSettingsApi(page);
    await page.goto("/admin/configuracoes-backend?category=loop");

    await expect(page.getByText("Loop de Projetos e Equipes")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("checkbox", { name: "HR" }).check();
    await page.getByLabel(/E-mails adicionais com acesso/i).fill("lucas.machado@liotecnica.com.br");

    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByText("Configurações do Loop salvas no servidor.")).toBeVisible({ timeout: 10_000 });

    await page.screenshot({
      path: path.join(evidenceDir, "02-loop-settings-saved.png"),
      fullPage: true,
    });

    await page.reload();
    await expect(page.getByLabel(/E-mails adicionais com acesso/i)).toHaveValue("lucas.machado@liotecnica.com.br");
    await expect(page.getByRole("checkbox", { name: "HR" })).toBeChecked();

    await page.screenshot({
      path: path.join(evidenceDir, "03-loop-settings-after-reload.png"),
      fullPage: true,
    });
  });

  test("colaborador não-admin acessa Loop quando e-mail está na lista", async ({ page }) => {
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

    await page.route("**/api/v1/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(employeeMe) });
    });

    await page.route("**/api/v1/loop/bootstrap", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          enabled: true,
          allowedRoles: ["Manager", "Admin"],
          allowedEmails: ["lucas.machado@liotecnica.com.br"],
        }),
      });
    });

    await page.route("**/api/v1/admin/app-settings", async (route) => {
      await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Forbidden" }) });
    });

    await page.goto("/loop");
    await expect(page.getByRole("heading", { name: /Visão geral|Dashboard|Loop/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Acesso restrito")).not.toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "05-loop-access-by-email.png"),
      fullPage: true,
    });
  });
});
