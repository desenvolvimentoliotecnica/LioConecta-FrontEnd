import { expect, test } from "@playwright/test";

const USER_ME = {
  id: "00000000-0000-0000-0000-000000000088",
  slug: "colaborador-e2e",
  name: "Colaborador E2E",
  email: "colaborador.e2e@liotecnica.com.br",
  title: "Analista",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "Facilities",
  roles: ["Employee"],
};

const SAMPLE_DAY_MENU = {
  date: "2026-07-07",
  dayStatus: "normal",
  dayStatusLabel: null,
  meals: [
    {
      mealType: "lunch",
      sections: [
        { key: "entrada", label: "Entrada (Sopas)", value: "Creme de tomate" },
        { key: "main_1", label: "Prato principal 1", value: "Frango grelhado" },
      ],
    },
  ],
  notes: null,
  published: true,
};

async function mockCardapioApi(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER_ME) });
  });

  await page.route("**/api/v1/calendar/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        enabled: false,
        delegatedScopes: [],
        defaultView: "dayGridMonth",
        showBirthdays: true,
        showCafeteriaMenu: true,
        msalClientId: "",
        msalTenantId: "",
        msalAuthority: "",
      }),
    });
  });

  await page.route("**/api/v1/calendar/menu/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SAMPLE_DAY_MENU),
    });
  });

  await page.route("**/api/v1/facilities/menu/week**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        weekStart: "2026-07-06",
        days: [SAMPLE_DAY_MENU],
      }),
    });
  });

  await page.route("**/api/v1/admin/app-settings", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }
    await route.continue();
  });
}

test.describe("Cardápio Facilities", () => {
  test("exibe grade semanal em /servicos/cardapio", async ({ page }) => {
    await mockCardapioApi(page);
    await page.goto("/servicos/cardapio");
    await expect(page.getByRole("heading", { name: /Gestão de cardápio/i })).toBeVisible();
    await expect(page.getByText(/Cardápio Semanal/i)).toBeVisible();
    await expect(page.getByRole("rowheader", { name: /Entrada \(Sopas\)/i })).toBeVisible();
  });

  test("mostra cardápio do dia no calendário sem Outlook", async ({ page }) => {
    await mockCardapioApi(page);
    await page.goto("/calendario");
    await expect(page.getByRole("region", { name: /Cardápio do dia/i })).toBeVisible();
    await expect(page.getByText("Creme de tomate")).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver semana/i })).toHaveAttribute("href", "/servicos/cardapio");
  });
});
