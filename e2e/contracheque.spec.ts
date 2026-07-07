import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://localhost:5148";
const PAGE_BASE_URL =
  process.env.LIO_PAGE_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5174";
const DEV_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const DEV_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_DIR = path.join("e2e", "evidence", "contracheque");

type LoginResponse = {
  accessToken: string;
};

type PayslipSummary = {
  latestCompetence: string;
  syncedAt?: string | null;
  dataSource?: string | null;
};

type PayslipListItem = {
  year: number;
  month: number;
  competence: string;
  grossAmount: number;
  netAmount: number;
};

type IncomeStatement = {
  year: number;
  totalPaid: number;
  totalWithheld: number;
  lines: Array<{ month: number; paid: number; withheld: number }>;
};

async function loginAndSeedSession(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
) {
  const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { email: DEV_EMAIL, password: DEV_PASSWORD },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const login = (await loginResponse.json()) as LoginResponse;
  expect(login.accessToken).toBeTruthy();

  await page.addInitScript(
    ({ tokenKey, token }) => {
      sessionStorage.setItem(tokenKey, token);
    },
    { tokenKey: "lioconecta.auth.token", token: login.accessToken },
  );

  return login.accessToken;
}

async function openServiceCard(page: import("@playwright/test").Page, title: string) {
  const card = page.locator(".pay-card").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await expect(card).toBeVisible({ timeout: 20_000 });
  await card.locator(".pay-card__open").click();
}

async function closeModal(page: import("@playwright/test").Page) {
  await page.locator(".pay-modal__close").click();
}

test.describe("Contracheque — dados reais (API + RM)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test.beforeAll(() => {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  });

  test("summary, histórico, comparativo e consultas", async ({ page, request }) => {
    test.setTimeout(120_000);
    const token = await loginAndSeedSession(page, request);
    const authHeaders = { Authorization: `Bearer ${token}` };

    const summaryResponse = await request.get(`${API_BASE_URL}/api/v1/rh/payslips/summary`, {
      headers: authHeaders,
    });
    expect(summaryResponse.ok()).toBeTruthy();
    const summary = (await summaryResponse.json()) as PayslipSummary;
    expect(summary.syncedAt).toBeTruthy();
    expect(summary.dataSource).toBeTruthy();

    const historyResponse = await request.get(`${API_BASE_URL}/api/v1/rh/payslips?limit=12`, {
      headers: authHeaders,
    });
    expect(historyResponse.ok()).toBeTruthy();
    const history = (await historyResponse.json()) as PayslipListItem[];
    expect(history.length).toBeGreaterThan(0);

    const latest = history[0];
    const previous = history[1] ?? history[0];
    const comparativoResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/payslips/comparativo?fromYear=${previous.year}&fromMonth=${previous.month}&toYear=${latest.year}&toMonth=${latest.month}`,
      { headers: authHeaders },
    );
    expect(comparativoResponse.ok()).toBeTruthy();

    await page.goto(`${PAGE_BASE_URL}/servicos/contracheque`);
    await expect(page.getByRole("heading", { name: "Contracheque" })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".page-header__sync-meta")).toContainText("Atualizado em", {
      timeout: 30_000,
    });

    await openServiceCard(page, "Histórico de Holerites");
    await expect(page.locator(".pay-modal").getByRole("heading", { name: "Histórico de holerites" })).toBeVisible();
    await closeModal(page);

    await openServiceCard(page, "Comparativo Salarial");
    await expect(page.locator(".pay-modal").getByRole("heading", { name: /Comparativo/i })).toBeVisible();
    await closeModal(page);

    for (const title of ["FGTS e Encargos", "Descontos em Folha", "Dúvidas sobre Rubricas"]) {
      await openServiceCard(page, title);
      await expect(page.locator(".pay-modal")).toBeVisible();
      await closeModal(page);
    }

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "01-contracheque-page.png"),
      fullPage: true,
    });
  });

  test("PDF download e informe IR", async ({ page, request }) => {
    test.setTimeout(120_000);
    const token = await loginAndSeedSession(page, request);
    const authHeaders = { Authorization: `Bearer ${token}` };

    const historyResponse = await request.get(`${API_BASE_URL}/api/v1/rh/payslips?limit=1`, {
      headers: authHeaders,
    });
    const history = (await historyResponse.json()) as PayslipListItem[];
    expect(history.length).toBeGreaterThan(0);
    const latest = history[0];

    const pdfResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/payslips/${latest.year}/${latest.month}/pdf`,
      { headers: authHeaders },
    );
    expect(pdfResponse.ok()).toBeTruthy();
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
    const pdfBytes = await pdfResponse.body();
    expect(pdfBytes.byteLength).toBeGreaterThan(128);

    const informeYear = new Date().getFullYear() - 1;
    const informeResponse = await request.get(
      `${API_BASE_URL}/api/v1/rh/payslips/informe/${informeYear}`,
      { headers: authHeaders },
    );
    expect(informeResponse.ok()).toBeTruthy();
    const informe = (await informeResponse.json()) as IncomeStatement;
    expect(informe.lines.length).toBeGreaterThan(0);

    await page.goto(`${PAGE_BASE_URL}/servicos/contracheque`);
    await openServiceCard(page, "Informe de Rendimentos");
    await expect(page.locator(".pay-modal").getByRole("heading", { name: `Informe de rendimentos ${informeYear}` })).toBeVisible({
      timeout: 20_000,
    });

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "02-informe-ir.png"),
      fullPage: true,
    });
  });
});
