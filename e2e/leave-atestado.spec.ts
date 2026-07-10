import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL =
  process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5174";
const DEV_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const DEV_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_DIR = path.join("e2e", "evidence", "atestado-medico");
const FIXTURES_DIR = path.join("e2e", "fixtures", "atestado");

type LoginResponse = {
  accessToken: string;
};

type LeaveRequestResult = {
  requestId: string;
  recordId: string;
  status: string;
  message: string;
  protocol?: string;
};

/** Minimal valid PDF bytes (no external deps). */
function minimalPdf(label: string): Buffer {
  const content = `BT /F1 12 Tf 40 750 Td (${label}) Tj ET`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefPos = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

function ensureFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  const pdfPath = path.join(FIXTURES_DIR, "atestado-sample.pdf");
  const pdf2Path = path.join(FIXTURES_DIR, "atestado-sample-2.pdf");
  const pngPath = path.join(FIXTURES_DIR, "atestado-sample.png");

  fs.writeFileSync(pdfPath, minimalPdf("Atestado medico E2E"));
  fs.writeFileSync(pdf2Path, minimalPdf("Atestado medico E2E 2"));
  fs.writeFileSync(
    pngPath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5xq6QAAAAASUVORK5CYII=",
      "base64",
    ),
  );

  return { pdfPath, pdf2Path, pngPath };
}

async function loginAndSeedSession(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
) {
  const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { email: DEV_EMAIL, password: DEV_PASSWORD },
  });
  expect(loginResponse.ok(), `login failed: ${loginResponse.status()}`).toBeTruthy();
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

test.describe("Atestado médico — anexo PDF/PNG + protocolo", () => {
  test.use({ ignoreHTTPSErrors: true });

  test.beforeAll(() => {
    ensureFixtures();
  });

  test("API multipart aceita 2 PDFs e retorna protocolo", async ({ request }) => {
    test.setTimeout(90_000);
    const { pdfPath, pdf2Path } = ensureFixtures();

    const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { email: DEV_EMAIL, password: DEV_PASSWORD },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const login = (await loginResponse.json()) as LoginResponse;

    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 2);
    const end = endDate.toISOString().slice(0, 10);

    const { execFileSync } = await import("node:child_process");
    const out = execFileSync(
      "curl.exe",
      [
        "-s",
        "-w",
        "\nHTTP_STATUS:%{http_code}",
        "-X",
        "POST",
        `${API_BASE_URL}/api/v1/rh/leave/requests/multipart`,
        "-H",
        `Authorization: Bearer ${login.accessToken}`,
        "-F",
        "serviceId=atestado",
        "-F",
        `startDate=${start}`,
        "-F",
        `endDate=${end}`,
        "-F",
        "notes=E2E atestado com 2 PDFs",
        "-F",
        `files=@${pdfPath};type=application/pdf`,
        "-F",
        `files=@${pdf2Path};type=application/pdf`,
      ],
      { encoding: "utf8" },
    );

    const statusMatch = out.match(/HTTP_STATUS:(\d+)/);
    const bodyText = out.replace(/\nHTTP_STATUS:\d+\s*$/, "").trim();
    const status = Number(statusMatch?.[1] ?? 0);

    fs.writeFileSync(
      path.join(EVIDENCE_DIR, "01-api-multipart-response.json"),
      JSON.stringify(
        {
          status,
          ok: status >= 200 && status < 300,
          body: (() => {
            try {
              return JSON.parse(bodyText);
            } catch {
              return bodyText;
            }
          })(),
        },
        null,
        2,
      ),
    );

    expect(status, `multipart failed ${status}: ${bodyText}`).toBe(200);
    const result = JSON.parse(bodyText) as LeaveRequestResult;
    expect(result.protocol).toMatch(/^LC-[A-F0-9]{8}$/i);
    expect(result.message.toLowerCase()).toContain("protocolo");
  });

  test("UI registra atestado com anexos e mostra protocolo", async ({ page, request }) => {
    test.setTimeout(120_000);
    const { pdfPath, pngPath } = ensureFixtures();
    await loginAndSeedSession(page, request);

    await page.goto(`${PAGE_BASE_URL}/servicos/ferias-ausencias`);
    await expect(page.getByRole("heading", { name: /Férias e Ausências/i })).toBeVisible({
      timeout: 20_000,
    });

    const card = page
      .locator(".leave-card")
      .filter({ has: page.getByRole("heading", { name: "Registrar Atestado Médico", exact: true }) });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.locator("button.leave-card__open").click();

    const modal = page.locator(".pay-modal").filter({
      has: page.locator("#pay-modal-title", { hasText: "Registrar Atestado Médico" }),
    });
    await expect(modal).toBeVisible();
    await expect(modal.locator("#pay-modal-title")).toHaveText("Registrar Atestado Médico");

    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 3);
    const end = endDate.toISOString().slice(0, 10);

    await modal.locator('input[type="date"]').nth(0).fill(start);
    await modal.locator('input[type="date"]').nth(1).fill(end);
    await modal.locator("textarea").fill("E2E UI — atestado com PDF e PNG");

    await modal.locator(".leave-form__file-input").setInputFiles([pdfPath, pngPath]);
    await expect(modal.locator(".leave-form__file-item")).toHaveCount(2);

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "02-form-with-attachments.png"),
      fullPage: true,
    });

    await modal.getByRole("button", { name: /Enviar solicitação/i }).click();

    await expect(page.getByRole("heading", { name: /Solicitação registrada/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(".leave-result__protocol")).toBeVisible();
    const protocolText = await page.locator(".leave-result__protocol").innerText();
    expect(protocolText).toMatch(/Protocolo:\s*LC-[A-F0-9]{8}/i);

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "03-success-protocol.png"),
      fullPage: true,
    });

    fs.writeFileSync(path.join(EVIDENCE_DIR, "04-ui-protocol.txt"), `${protocolText.trim()}\n`);
  });
});
