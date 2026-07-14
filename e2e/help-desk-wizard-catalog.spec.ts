import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidenceDir = path.join("e2e", "evidence", "help-desk");

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

const AREAS = [
  { id: "1", name: "TI", icon: "laptop", serviceCount: 123, entityId: 1 },
];

const FORM_CATEGORIES = [
  {
    id: 1,
    name: "Área TI",
    completeName: "Área TI",
    parentId: null,
    level: 1,
    formCount: 0,
  },
  {
    id: 2,
    name: "SOLICITAÇÕES",
    completeName: "Área TI > SOLICITAÇÕES",
    parentId: 1,
    level: 2,
    formCount: 1,
  },
  {
    id: 3,
    name: "INCIDENTES",
    completeName: "Área TI > INCIDENTES",
    parentId: 1,
    level: 2,
    formCount: 1,
  },
];

const FORMS = [
  {
    id: 20,
    name: "Suporte — Estação de trabalho",
    description: "Problemas em computador, impressora ou periféricos.",
    illustration: null,
    categoryId: 2,
  },
  {
    id: 21,
    name: "Incidente — Rede",
    description: "Quedas e lentidão de rede.",
    illustration: null,
    categoryId: 3,
  },
];

const FORM_SCHEMA = {
  id: 20,
  name: "Suporte — Estação de trabalho",
  description: null,
  categoryId: 2,
  sections: [
    {
      id: 1,
      name: "Detalhes",
      questions: [
        {
          id: 101,
          name: "Assunto",
          type: "Glpi\\Form\\QuestionType\\QuestionTypeShortText",
          fieldKind: "text",
          isMandatory: true,
          description: null,
          defaultValue: null,
          horizontalRank: null,
          options: [],
        },
        {
          id: 102,
          name: "Descrição",
          type: "Glpi\\Form\\QuestionType\\QuestionTypeLongText",
          fieldKind: "longtext",
          isMandatory: true,
          description: null,
          defaultValue: null,
          horizontalRank: null,
          options: [],
        },
      ],
    },
  ],
};

async function mockHelpDeskApi(page: import("@playwright/test").Page) {
  await page.route("**/health", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "Healthy" }) });
  });

  await page.route("**/api/v1/me**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME) });
  });

  await page.route("**/api/v1/me/preferences**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ bookmarks: [] }) });
  });

  await page.route("**/api/v1/notifications**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.route("**/api/v1/ti/help-desk/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ openTickets: 0, avgResponseLabel: "2h", canViewAllTickets: false }),
    });
  });

  await page.route("**/api/v1/ti/help-desk/tickets/mine**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/ti/help-desk/tickets/all**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/ti/help-desk/services", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "abrir-chamado",
          title: "Abrir chamado",
          desc: "Registre um novo incidente ou solicitação.",
          category: "incidente",
          provider: "Portal GLPI",
          status: "disponivel",
          featured: true,
          action: "modal",
          helpText: "Abra um ticket no GLPI pelo assistente com formulários nativos.",
          portalUrl: null,
        },
      ]),
    });
  });

  await page.route("**/api/v1/ti/help-desk/areas", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(AREAS) });
  });

  await page.route("**/api/v1/ti/help-desk/form-categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FORM_CATEGORIES),
    });
  });

  await page.route("**/api/v1/ti/help-desk/forms**", async (route) => {
    const url = new URL(route.request().url());
    const formIdMatch = url.pathname.match(/\/forms\/(\d+)$/);
    if (formIdMatch) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FORM_SCHEMA),
      });
      return;
    }

    const categoryId = Number(url.searchParams.get("categoryId") ?? "0");
    const filtered =
      categoryId > 0 ? FORMS.filter((item) => item.categoryId === categoryId) : FORMS;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(filtered),
    });
  });
}

test.describe("Help Desk wizard — formulários nativos GLPI", () => {
  test.setTimeout(60_000);

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("abre no catálogo com TI pré-selecionada e navega formulários", async ({ page, context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem("lioconecta.auth.token", "e2e-mock-token");
    });
    await mockHelpDeskApi(page);
    await page.goto("/servicos/help-desk");
    await expect(page.getByRole("heading", { name: "Help Desk" })).toBeVisible({ timeout: 15_000 });

    const openTicket =
      page.getByRole("button", { name: "Abrir chamado" }).first();
    if (await openTicket.isVisible().catch(() => false)) {
      await openTicket.click();
    } else {
      const openTicketCard = page.getByRole("article").filter({ hasText: "Abrir chamado" });
      await openTicketCard.getByRole("button", { name: "Acessar" }).click();
    }

    const wizard = page.getByRole("dialog", { name: "Abrir chamado" });
    await expect(wizard).toBeVisible();

    await expect(wizard.locator(".hd-wizard__step")).toHaveCount(3);
    await expect(wizard.locator(".hd-wizard__step-label").filter({ hasText: "Área" })).toHaveCount(0);
    await expect(wizard.locator(".hd-wizard__step.is-active .hd-wizard__step-label")).toHaveText("Catálogo");
    await expect(wizard.getByRole("listitem").filter({ hasText: "Área TI" })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "01-catalog-first-step.png"),
      fullPage: true,
    });

    await wizard.getByRole("listitem").filter({ hasText: "Área TI" }).click();
    await expect(wizard.getByRole("listitem").filter({ hasText: "SOLICITAÇÕES" })).toBeVisible();
    await expect(wizard.getByRole("listitem").filter({ hasText: "INCIDENTES" })).toBeVisible();

    await wizard.getByRole("listitem").filter({ hasText: "SOLICITAÇÕES" }).click();
    await expect(wizard.getByRole("listitem").filter({ hasText: "Suporte — Estação de trabalho" })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "02-area-ti-forms-list.png"),
      fullPage: true,
    });

    await wizard.getByRole("listitem").filter({ hasText: "Suporte — Estação de trabalho" }).click();
    await expect(wizard.getByText("Assunto")).toBeVisible();
    await expect(wizard.getByText("Descrição")).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "03-form-details.png"),
      fullPage: true,
    });
  });
});
