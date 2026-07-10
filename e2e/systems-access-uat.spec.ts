import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "systems-access-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string };
type PortalSystemDto = {
  id: string;
  name: string;
  slug: string;
  category: string;
  isActive: boolean;
  accessNotes?: string | null;
};
type HelpDeskTicketResultDto = {
  requestId: string;
  status: string;
  message: string;
  externalRef?: string | null;
  externalUrl?: string | null;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatRunStamp(date = new Date()): string {
  return [
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    `${pad2(date.getHours())}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`,
  ].join("_");
}

function createEvidenceRun() {
  const stamp = formatRunStamp();
  const runDir = path.join(EVIDENCE_ROOT, stamp);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE_ROOT, "latest.txt"), `${stamp}\n`, "utf8");
  evidenceRunDir = runDir;
  return { stamp, runDir };
}

function writeEvidence(name: string, content: string | object) {
  const body = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(path.join(evidenceRunDir, name), body);
}

function evidencePath(name: string): string {
  return path.join(evidenceRunDir, name);
}

async function login(request: APIRequestContext, email: string, password: string) {
  const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { email, password },
  });
  expect(loginResponse.ok(), `login failed for ${email}: ${loginResponse.status()}`).toBeTruthy();
  const login = (await loginResponse.json()) as LoginResponse;
  expect(login.accessToken).toBeTruthy();
  return login.accessToken;
}

async function openAuthedPage(browser: Browser, token: string) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 960 },
  });
  await context.addInitScript(
    ({ tokenKey, value }) => {
      sessionStorage.setItem(tokenKey, value);
    },
    { tokenKey: "lioconecta.auth.token", value: token },
  );
  const page = await context.newPage();
  return { context, page };
}

test.describe("UAT — Solicitar acesso a sistemas (GLPI)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test("fluxo colaborador com evidências tela a tela", async ({ browser, request }) => {
    test.setTimeout(240_000);
    const { stamp: runStamp } = createEvidenceRun();
    const marker = `E2E-SYSTEMS-ACCESS-${Date.now()}`;

    const token = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
    const meResponse = await request.get(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(meResponse.ok()).toBeTruthy();
    const me = (await meResponse.json()) as MeDto;
    writeEvidence("00-colaborador-me.json", me);

    const systemsResponse = await request.get(`${API_BASE_URL}/api/v1/systems`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(systemsResponse.ok(), `systems list failed: ${systemsResponse.status()}`).toBeTruthy();
    const systems = (await systemsResponse.json()) as PortalSystemDto[];
    writeEvidence("00-systems-list-api.json", systems);
    const active = systems.filter((item) => item.isActive);
    expect(active.length, "Catálogo de sistemas precisa ter ao menos 1 ativo").toBeGreaterThan(0);
    const target = active[0];

    const areasResponse = await request.get(`${API_BASE_URL}/api/v1/ti/help-desk/areas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeEvidence("00-helpdesk-areas-api.json", {
      status: areasResponse.status(),
      body: areasResponse.ok() ? await areasResponse.json() : await areasResponse.text(),
    });

    let protocol = "";
    let requestId = "";
    let externalUrl = "";
    const session = await openAuthedPage(browser, token);

    try {
      await session.page.goto(`${PAGE_BASE_URL}/servicos/acesso-sistemas`);
      await expect(session.page.getByRole("heading", { name: "Acesso a Sistemas" })).toBeVisible({
        timeout: 30_000,
      });
      await expect(session.page.getByRole("button", { name: "Solicitar acesso" }).first()).toBeVisible();

      await session.page.screenshot({
        path: evidencePath("01-colaborador-hub-sistemas.png"),
        fullPage: true,
      });

      const card = session.page.getByRole("article").filter({ hasText: target.name }).first();
      if ((await card.count()) > 0) {
        await card.getByRole("button", { name: "Solicitar acesso" }).click();
      } else {
        await session.page.getByRole("button", { name: "Solicitar acesso" }).first().click();
      }

      const dialog = session.page.getByRole("dialog", { name: "Solicitar acesso" });
      await expect(dialog).toBeVisible({ timeout: 15_000 });

      const systemSelect = dialog.locator("select").nth(0);
      const currentSystem = await systemSelect.inputValue();
      if (currentSystem !== target.id) {
        await systemSelect.selectOption(target.id);
      }

      await dialog.locator("select").nth(1).selectOption("prd");

      const serviceSelect = dialog.locator("select").nth(2);
      await expect
        .poll(async () => serviceSelect.locator("option[value]:not([value=''])").count(), {
          timeout: 20_000,
        })
        .toBeGreaterThan(0);
      const serviceValue = await serviceSelect.inputValue();
      if (!serviceValue) {
        const firstValue = await serviceSelect
          .locator("option[value]:not([value=''])")
          .first()
          .getAttribute("value");
        if (firstValue) {
          await serviceSelect.selectOption(firstValue);
        }
      }

      await dialog.locator("textarea").fill(
        `${marker}\nSolicitação UAT de acesso ao sistema ${target.name} (ambiente PRD).`,
      );

      await session.page.screenshot({
        path: evidencePath("02-colaborador-modal-preenchido.png"),
        fullPage: true,
      });

      const createResponsePromise = session.page.waitForResponse(
        (response) =>
          response.url().includes("/ti/help-desk/tickets") && response.request().method() === "POST",
        { timeout: 60_000 },
      );

      await dialog.getByRole("button", { name: "Enviar solicitação" }).click();

      const createResponse = await createResponsePromise;
      const createStatus = createResponse.status();
      const createBodyText = await createResponse.text();
      writeEvidence("03-create-ticket-api.json", {
        status: createStatus,
        body: (() => {
          try {
            return JSON.parse(createBodyText) as unknown;
          } catch {
            return createBodyText;
          }
        })(),
      });

      if (createStatus >= 400) {
        await session.page.screenshot({
          path: evidencePath("03b-colaborador-erro-submit.png"),
          fullPage: true,
        });
        writeEvidence(
          "99-uat-summary.md",
          [
            "# UAT Solicitar acesso a sistemas — evidências",
            "",
            "## Resultado: FALHOU",
            "",
            `- **Run:** \`${runStamp}\``,
            `- **Marker:** ${marker}`,
            `- **HTTP:** ${createStatus}`,
            `- **Atores:** colaborador`,
            "",
            "## Erro",
            "",
            "```",
            createBodyText.slice(0, 2000),
            "```",
            "",
            `Gerado em: ${new Date().toISOString()}`,
            "",
          ].join("\n"),
        );
        expect(createStatus, `POST /ti/help-desk/tickets falhou: ${createBodyText}`).toBeLessThan(400);
      }

      const resultDto = JSON.parse(createBodyText) as HelpDeskTicketResultDto;
      protocol = resultDto.externalRef ?? "";
      requestId = resultDto.requestId ?? "";
      externalUrl = resultDto.externalUrl ?? "";

      const resultDialog = session.page.getByRole("dialog", { name: "Chamado registrado" });
      await expect(resultDialog).toBeVisible({ timeout: 20_000 });
      if (protocol) {
        await expect(resultDialog.locator(".hd-result__ref")).toContainText(protocol);
      }
      await expect(resultDialog.getByRole("button", { name: "Acompanhar meus chamados" })).toBeVisible();

      await session.page.screenshot({
        path: evidencePath("03-colaborador-resultado-glpi.png"),
        fullPage: true,
      });

      await resultDialog.getByRole("button", { name: "Acompanhar meus chamados" }).click();
      await expect(session.page).toHaveURL(/\/servicos\/help-desk/, { timeout: 20_000 });
      await expect(session.page.getByRole("heading", { name: "Help Desk" })).toBeVisible({
        timeout: 20_000,
      });

      const trackDialog = session.page.getByRole("dialog", {
        name: /Acompanhar ticket|Fila completa GLPI/i,
      });
      await expect(trackDialog).toBeVisible({ timeout: 20_000 });
      await expect(trackDialog.getByText("Carregando chamados…")).toBeHidden({ timeout: 60_000 });

      const ticketsListResponse = await request.get(
        `${API_BASE_URL}/api/v1/ti/help-desk/tickets/mine?scope=90d`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      writeEvidence("04-tickets-mine-api.json", {
        status: ticketsListResponse.status(),
        body: ticketsListResponse.ok()
          ? await ticketsListResponse.json()
          : await ticketsListResponse.text(),
      });

      if (protocol) {
        await expect(trackDialog.locator(".hd-track__table")).toBeVisible({ timeout: 30_000 });
        await expect(trackDialog.getByRole("cell", { name: `#${protocol}`, exact: true })).toBeVisible({
          timeout: 15_000,
        });
      } else {
        await expect(trackDialog.locator(".hd-track__table")).toBeVisible({ timeout: 30_000 });
      }

      await session.page.screenshot({
        path: evidencePath("04-colaborador-help-desk-acompanhar.png"),
        fullPage: true,
      });

      writeEvidence(
        "99-uat-summary.md",
        [
          "# UAT Solicitar acesso a sistemas — evidências",
          "",
          "## Resultado: PASSOU",
          "",
          `- **Run:** \`${runStamp}\``,
          `- **Marker:** ${marker}`,
          `- **RecordId / Protocolo:** ${requestId || "—"} / ${protocol || "—"}`,
          `- **GLPI URL:** ${externalUrl || "—"}`,
          `- **Sistema:** ${target.name} (\`${target.slug}\`)`,
          `- **Atores:** colaborador`,
          "",
          "## Fluxo validado",
          "",
          "1. Hub Acesso a Sistemas",
          "2. Modal Solicitar acesso (sistema, ambiente PRD, serviço ITIL, justificativa com marker)",
          "3. POST Help Desk/GLPI com protocolo",
          "4. Resultado com Ver no GLPI + Acompanhar meus chamados",
          "5. Modal Acompanhar ticket com fila carregada (protocolo visível)",
          "",
          "## Prints",
          "",
          "| # | Arquivo | Etapa |",
          "|---|---------|-------|",
          "| 01 | `01-colaborador-hub-sistemas.png` | Hub de sistemas |",
          "| 02 | `02-colaborador-modal-preenchido.png` | Modal preenchido |",
          "| 03 | `03-colaborador-resultado-glpi.png` | Protocolo GLPI |",
          "| 04 | `04-colaborador-help-desk-acompanhar.png` | Fila Acompanhar ticket |",
          "",
          `Gerado em: ${new Date().toISOString()}`,
          "",
        ].join("\n"),
      );
    } finally {
      await session.context.close();
    }
  });
});
