import { expect, test } from "@playwright/test";

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

const SUMMARY = {
  errorsLast24h: 2,
  httpErrorRate: 0.05,
  p95LatencyMs: 180,
  requestsPerMinute: 42,
  dailyActiveUsers: 17,
  pageViews: 120,
  accessDenied: 3,
  authFailures: 1,
  topModule: "admin",
  topPage: "/admin/observabilidade",
  observabilityEvents: 8,
  accessEvents: 15,
};

async function mockObservabilityApi(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ADMIN_ME) });
  });

  await page.route("**/api/v1/admin/observability/summary**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUMMARY) });
  });

  await page.route("**/api/v1/admin/observability/errors**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            occurredAt: "2026-07-05T15:00:00Z",
            eventType: "Application",
            eventName: "Application.Error",
            severity: 4,
            userName: "Admin E2E",
            correlationId: "22222222-2222-2222-2222-222222222222",
            routeTemplate: "/analytics",
          },
        ],
        page: 1,
        pageSize: 25,
        totalCount: 1,
        totalPages: 1,
      }),
    });
  });

  await page.route("**/api/v1/admin/observability/access-events**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [], page: 1, pageSize: 25, totalCount: 0, totalPages: 0 }),
    });
  });

  await page.route("**/api/v1/admin/observability/page-views**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [], page: 1, pageSize: 25, totalCount: 0, totalPages: 0 }),
    });
  });

  await page.route("**/api/v1/admin/observability/investigate**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        correlationId: "22222222-2222-2222-2222-222222222222",
        items: [
          {
            occurredAt: "2026-07-05T15:00:00Z",
            source: "page_view",
            label: "ObservabilityHub",
            detail: "/admin/observabilidade",
            referenceId: "33333333-3333-3333-3333-333333333333",
          },
        ],
      }),
    });
  });
}

test.describe("Observability hub E2E", () => {
  test.beforeEach(async ({ page }) => {
    await mockObservabilityApi(page);
  });

  test("renders KPIs and errors tab for admin user", async ({ page }) => {
    await page.goto("/admin/observabilidade");

    await expect(page.getByRole("heading", { name: "Observabilidade" })).toBeVisible();
    await expect(page.getByText("Erros últimas 24h")).toBeVisible();
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("tab", { name: "Erros" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Application.Error")).toBeVisible();
  });

  test("investigate tab loads timeline for correlation id", async ({ page }) => {
    await page.goto("/admin/observabilidade");

    await page.getByRole("tab", { name: "Investigar" }).click();
    await page.locator("#obs-investigate-correlation").fill("22222222-2222-2222-2222-222222222222");
    await page.getByRole("button", { name: "Investigar" }).click();

    await expect(page.getByText("ObservabilityHub")).toBeVisible();
    await expect(page.getByText("22222222-2222-2222-2222-222222222222")).toBeVisible();
  });

  test("links tab exposes related admin destinations", async ({ page }) => {
    await page.goto("/admin/observabilidade");

    await page.getByRole("tab", { name: "Links" }).click();

    const linksSection = page.getByRole("region", { name: "Links relacionados" });
    await expect(linksSection.getByRole("link", { name: /Trilha de Auditoria/i })).toHaveAttribute(
      "href",
      "/admin/trilha-auditoria",
    );
    await expect(linksSection.getByRole("link", { name: /Configurações observabilidade/i })).toHaveAttribute(
      "href",
      "/admin/configuracoes-backend?category=observability",
    );
  });
});
