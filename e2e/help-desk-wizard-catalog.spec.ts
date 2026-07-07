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
  { id: "ti", name: "Área TI", icon: "laptop", serviceCount: 21, entityId: 1 },
  { id: "custo", name: "Área CUSTO", icon: "money", serviceCount: 1, entityId: 1 },
  { id: "pricing", name: "Área PRINCING", icon: "clipboard", serviceCount: 6, entityId: 1 },
  { id: "financeira", name: "Área Financeira", icon: "money", serviceCount: 2, entityId: 1 },
];

const TI_ROOT_CATEGORIES = [
  "Armazenamento",
  "Backup e Recuperação",
  "Cloud e DevOps",
  "Compras e Licenças",
  "Comunicação e Colaboração",
  "Conformidade e Auditoria",
  "Documentação e Treinamento",
  "Equipamentos do Usuário",
  "Identidade e Acessos",
  "Impressão e Digitalização",
  "Incidentes",
  "Infraestrutura e Servidores",
  "ITSM / GLPI",
  "Mobilidade",
  "Projetos De Dados",
  "Projetos de Infraestrutura",
  "Projetos De Sistemas",
  "Projetos e Mudanças",
  "Rede e Conectividade",
  "Segurança da Informação",
  "Sistemas Corporativos",
].map((name, index) => ({
  id: index + 1,
  name,
  fullName: name,
  parentId: null,
  hasChildren: true,
  entityId: 1,
}));

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
      body: JSON.stringify({ openTickets: 0, avgResponseLabel: "2h" }),
    });
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
          helpText: "Abra um ticket no GLPI pelo assistente em três passos.",
          portalUrl: null,
        },
      ]),
    });
  });

  await page.route("**/api/v1/ti/help-desk/areas", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(AREAS) });
  });

  await page.route("**/api/v1/ti/help-desk/categories**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("areaId") !== "ti") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }
    const childCategories = TI_ROOT_CATEGORIES.flatMap((root) => [
      root,
      {
        id: root.id + 500,
        name: `${root.name} — Solicitação`,
        fullName: `${root.name} > Solicitação`,
        parentId: root.id,
        hasChildren: false,
        entityId: 1,
      },
    ]);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(childCategories),
    });
  });
}

test.describe("Help Desk wizard — catálogo Área TI", () => {
  test.setTimeout(60_000);

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test("exibe 21 serviços após selecionar Área TI", async ({ page }) => {
    await mockHelpDeskApi(page);
    await page.goto("/servicos/help-desk");
    await expect(page.getByRole("heading", { name: "Help Desk" })).toBeVisible({ timeout: 15_000 });

    const openTicketCard = page.getByRole("article").filter({ hasText: "Abrir chamado" });
    await openTicketCard.getByRole("button", { name: "Acessar" }).click();
    const wizard = page.getByRole("dialog", { name: "Abrir chamado" });
    await expect(wizard).toBeVisible();

    await wizard.getByRole("listitem").filter({ hasText: "Área TI" }).click();
    await expect(wizard.getByText("Área selecionada")).toBeVisible();
    await expect(wizard.getByText("Área TI").first()).toBeVisible();

    const catalogCards = wizard.locator(".hd-wizard__card");
    await expect(catalogCards).toHaveCount(21, { timeout: 10_000 });
    await expect(wizard.getByRole("listitem").filter({ hasText: "Armazenamento" })).toBeVisible();
    await expect(wizard.getByRole("listitem").filter({ hasText: "Sistemas Corporativos" })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, "01-area-ti-catalog-21-items.png"),
      fullPage: true,
    });

    await wizard.getByRole("listitem").filter({ hasText: "Incidentes" }).first().click();
    await expect(wizard.getByText("Catálogo").first()).toBeVisible();
    await expect(wizard.getByRole("listitem").filter({ hasText: /Incidentes — Solicitação/i })).toBeVisible();
    await page.screenshot({
      path: path.join(evidenceDir, "02-area-ti-drill-down.png"),
      fullPage: true,
    });
  });
});
