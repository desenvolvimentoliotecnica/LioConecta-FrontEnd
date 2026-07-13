import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const USER_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const USER_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "solicitacoes-rh-uat");
const FIXTURES_DIR = path.join("e2e", "fixtures", "solicitacoes-rh");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; permissions?: string[] };
type BenefitListItem = { id: string; title: string; status: string };
type ServiceRequestDto = {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  events: Array<{ id: string; eventType: string; details?: Record<string, unknown> | null }>;
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

function ensureFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const pngPath = path.join(FIXTURES_DIR, "anexo-rh-resposta.png");
  fs.writeFileSync(
    pngPath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
      "base64",
    ),
  );
  return { pngPath };
}

function createEvidenceRun() {
  const stamp = formatRunStamp();
  const runDir = path.join(EVIDENCE_ROOT, stamp);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE_ROOT, "latest.txt"), `${stamp}\n`, "utf8");
  evidenceRunDir = runDir;
  return { stamp, runDir, pngPath: ensureFixtures().pngPath };
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

async function shot(page: Page, name: string) {
  await page.screenshot({ path: evidencePath(name), fullPage: true });
}

async function findRequestByMarker(
  request: APIRequestContext,
  token: string,
  marker: string,
): Promise<ServiceRequestDto | null> {
  const res = await request.get(
    `${API_BASE_URL}/api/v1/service-requests/management?status=&q=&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok()) return null;
  const items = (await res.json()) as ServiceRequestDto[];
  return (
    items.find((item) => {
      const notes = typeof item.payload?.notes === "string" ? item.payload.notes : "";
      return notes.includes(marker);
    }) ?? null
  );
}

test.describe("UAT Solicitações RH — pedido, conversa e aprovação", () => {
  test.setTimeout(300_000);

  test("colaborador solicita, conversa com RH e pedido é aprovado", async ({
    request,
    browser,
  }) => {
    const { stamp, runDir, pngPath } = createEvidenceRun();
    const marker = `E2E-SR-RH-${Date.now()}`;
    let requestId = "";
    let passed = false;
    let failReason = "";

    try {
      const health = await request.get(`${API_BASE_URL}/health`);
      expect(health.ok(), `API health failed: ${health.status()}`).toBeTruthy();

      const token = await login(request, USER_EMAIL, USER_PASSWORD);
      const meRes = await request.get(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(meRes.ok()).toBeTruthy();
      const me = (await meRes.json()) as MeDto;
      writeEvidence("00-me.json", me);

      const benefitsRes = await request.get(`${API_BASE_URL}/api/v1/rh/benefits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(benefitsRes.ok()).toBeTruthy();
      const benefits = (await benefitsRes.json()) as BenefitListItem[];
      writeEvidence("00-benefits-list.json", benefits);
      const targetBenefit =
        benefits.find((b) => /creche/i.test(b.title)) ??
        benefits.find((b) => b.status === "opcional") ??
        benefits[0];
      expect(targetBenefit, "nenhum benefício disponível para solicitar").toBeTruthy();

      const { context, page } = await openAuthedPage(browser, token);
      try {
        // 1) Colaborador — Benefícios e envio do pedido
        await page.goto(`${PAGE_BASE_URL}/servicos/beneficios`, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: /Benefícios/i }).first()).toBeVisible({
          timeout: 30_000,
        });
        await shot(page, "01-colaborador-beneficios.png");

        const card = page.locator(".benefit-card").filter({ hasText: targetBenefit!.title }).first();
        await expect(card).toBeVisible({ timeout: 15_000 });
        await card.locator(".benefit-card__open").click();
        await expect(page.getByTestId("benefit-request-start")).toBeVisible({ timeout: 15_000 });
        await shot(page, "02-colaborador-beneficio-detalhe.png");

        await page.getByTestId("benefit-request-start").click();
        const notes = `${marker} preciso incluir mais um filho no auxílio creche — UAT E2E.`;
        await page.getByTestId("benefit-request-notes").fill(notes);
        await shot(page, "03-colaborador-formulario-pedido.png");

        const createRespPromise = page.waitForResponse(
          (r) =>
            r.url().includes("/api/v1/rh/benefits/requests") &&
            r.request().method() === "POST",
          { timeout: 30_000 },
        );
        await page.getByTestId("benefit-request-submit").click();
        const createResp = await createRespPromise;
        if (!createResp.ok()) {
          await shot(page, "03b-colaborador-erro-envio.png");
          writeEvidence("03b-create-error.json", {
            status: createResp.status(),
            body: await createResp.text(),
          });
          throw new Error(`Falha ao criar pedido: HTTP ${createResp.status()}`);
        }
        const createBody = (await createResp.json()) as { requestId?: string; message?: string };
        writeEvidence("04-create-request-api.json", createBody);
        await shot(page, "04-colaborador-pedido-enviado.png");

        // Resolve request id (prefer API list by marker)
        for (let i = 0; i < 10; i++) {
          const found = await findRequestByMarker(request, token, marker);
          if (found) {
            requestId = found.id;
            break;
          }
          await page.waitForTimeout(500);
        }
        if (!requestId && createBody.requestId) requestId = createBody.requestId;
        expect(requestId, "requestId não encontrado após criar pedido").toBeTruthy();
        writeEvidence("05-request-id.json", { requestId, marker, benefit: targetBenefit });

        // 2) RH — Fila e resposta com anexo
        await page.goto(`${PAGE_BASE_URL}/servicos/solicitacoes-rh`, {
          waitUntil: "domcontentloaded",
        });
        await expect(page.getByRole("heading", { name: /Solicitações RH/i })).toBeVisible({
          timeout: 30_000,
        });
        // Lista padrão filtra Pendente — garantir filtro e abrir o card
        await page.getByRole("button", { name: "Pendente", exact: true }).click();
        const rhCard = page.getByTestId(`sr-card-${requestId}`);
        await expect(rhCard).toBeVisible({ timeout: 30_000 });
        await shot(page, "06-rh-fila-pendente.png");
        await rhCard.click();
        await expect(page.getByTestId("sr-gestao-detail")).toBeVisible({ timeout: 20_000 });
        await shot(page, "07-rh-detalhe-pendente.png");

        await page.getByTestId("sr-reply-message").fill(`RH: recebemos o pedido ${marker}. Segue orientação.`);
        await page.locator(".sr-thread__composer input[type=file]").setInputFiles(pngPath);
        await shot(page, "08-rh-resposta-preenchida.png");

        const rhReplyPromise = page.waitForResponse(
          (r) =>
            r.url().includes(`/api/v1/service-requests/management/${requestId}/messages`) &&
            r.request().method() === "POST",
          { timeout: 30_000 },
        );
        await page.getByTestId("sr-reply-send").click();
        const rhReply = await rhReplyPromise;
        if (!rhReply.ok()) {
          await shot(page, "08b-rh-erro-resposta.png");
          writeEvidence("08b-rh-reply-error.json", {
            status: rhReply.status(),
            body: await rhReply.text(),
          });
          throw new Error(`Falha na resposta do RH: HTTP ${rhReply.status()}`);
        }
        writeEvidence("09-rh-reply-api.json", await rhReply.json());
        await expect(
          page.locator(".sr-thread__bubble").filter({ hasText: "Resposta do RH" }).first(),
        ).toBeVisible({ timeout: 15_000 });
        await shot(page, "09-rh-conversa-apos-resposta.png");

        // 3) Solicitante — Meus pedidos e resposta de volta
        await page.locator(".pay-modal__footer button.pay-modal__btn--ghost").filter({ hasText: "Fechar" }).click();
        await page.getByRole("tab", { name: /Meus pedidos/i }).click();
        await expect(page.getByTestId(`sr-card-${requestId}`)).toBeVisible({ timeout: 20_000 });
        await shot(page, "10-solicitante-meus-pedidos.png");
        await page.getByTestId(`sr-card-${requestId}`).click();
        await expect(page.getByTestId("sr-gestao-detail")).toBeVisible({ timeout: 20_000 });
        await shot(page, "11-solicitante-detalhe.png");

        await page
          .getByTestId("sr-reply-message")
          .fill(`Solicitante: ok, obrigado. Confirmo os dados do ${marker}.`);
        await shot(page, "12-solicitante-resposta-preenchida.png");

        const mineReplyPromise = page.waitForResponse(
          (r) =>
            r.url().includes(`/api/v1/service-requests/${requestId}/messages`) &&
            r.request().method() === "POST",
          { timeout: 30_000 },
        );
        await page.getByTestId("sr-reply-send").click();
        const mineReply = await mineReplyPromise;
        if (!mineReply.ok()) {
          await shot(page, "12b-solicitante-erro-resposta.png");
          writeEvidence("12b-solicitante-reply-error.json", {
            status: mineReply.status(),
            body: await mineReply.text(),
          });
          throw new Error(`Falha na resposta do solicitante: HTTP ${mineReply.status()}`);
        }
        writeEvidence("13-solicitante-reply-api.json", await mineReply.json());
        await expect(
          page.locator(".sr-thread__bubble").filter({ hasText: "Resposta do colaborador" }).first(),
        ).toBeVisible({ timeout: 15_000 });
        await shot(page, "13-solicitante-conversa-completa.png");

        // 4) RH — Aprovar
        await page.locator(".pay-modal__footer button.pay-modal__btn--ghost").filter({ hasText: "Fechar" }).click();
        await page.getByRole("tab", { name: /Fila RH/i }).click();
        await page.getByRole("button", { name: "Todos", exact: true }).click();
        await expect(page.getByTestId(`sr-card-${requestId}`)).toBeVisible({ timeout: 20_000 });
        await page.getByTestId(`sr-card-${requestId}`).click();
        await expect(page.getByTestId("sr-gestao-detail")).toBeVisible({ timeout: 20_000 });
        const reason = page.getByTestId("sr-gestao-reason");
        if (await reason.isVisible()) {
          await reason.fill(`Aprovado no UAT ${marker}`);
        }
        await shot(page, "14-rh-antes-aprovar.png");

        const approvePromise = page.waitForResponse(
          (r) =>
            r.url().includes(`/api/v1/service-requests/management/${requestId}/approve`) &&
            r.request().method() === "POST",
          { timeout: 30_000 },
        );
        await page.getByTestId("sr-gestao-approve").click();
        const approveResp = await approvePromise;
        if (!approveResp.ok()) {
          await shot(page, "14b-rh-erro-aprovar.png");
          writeEvidence("14b-approve-error.json", {
            status: approveResp.status(),
            body: await approveResp.text(),
          });
          throw new Error(`Falha ao aprovar: HTTP ${approveResp.status()}`);
        }
        const approved = (await approveResp.json()) as ServiceRequestDto;
        writeEvidence("15-approve-api.json", approved);
        expect(String(approved.status)).toMatch(/Approved/i);
        await expect(
          page.locator(".sr-status-banner").getByText(/Aprovado/i).first(),
        ).toBeVisible({ timeout: 15_000 });
        await shot(page, "15-rh-apos-aprovar.png");

        // 5) API final dump
        const detailRes = await request.get(
          `${API_BASE_URL}/api/v1/service-requests/management/${requestId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        expect(detailRes.ok()).toBeTruthy();
        const detail = (await detailRes.json()) as ServiceRequestDto;
        writeEvidence("16-detail-final-api.json", detail);
        expect(String(detail.status)).toMatch(/Approved/i);
        const eventTypes = detail.events.map((e) => e.eventType);
        expect(eventTypes).toContain("Submitted");
        expect(eventTypes).toContain("Message");
        expect(eventTypes).toContain("Approved");

        passed = true;
      } finally {
        await context.close();
      }
    } catch (err) {
      failReason = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      writeEvidence("99-uat-summary.md", `# UAT Solicitações RH — pedido, conversa e aprovação

## Resultado: ${passed ? "PASSOU" : "FALHOU"}

- **Run:** \`${stamp}\`
- **Marker:** \`${marker}\`
- **RequestId:** \`${requestId || "—"}\`
- **Atores:** colaborador/RH (\`${USER_EMAIL}\` — mesmo usuário local com \`rh_requests.manage\`)
- **Pasta:** \`${runDir.replace(/\\/g, "/")}\`
${failReason ? `- **Erro:** ${failReason}\n` : ""}
## Fluxo validado

1. Colaborador abre Benefícios e envia pedido com observação (marker)
2. RH abre a fila, responde com mensagem + anexo PNG
3. Solicitante responde na aba Meus pedidos
4. RH aprova o pedido
5. API confirma status Approved e eventos Submitted/Message/Approved

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | \`01-colaborador-beneficios.png\` | Lista de benefícios |
| 02 | \`02-colaborador-beneficio-detalhe.png\` | Detalhe do benefício |
| 03 | \`03-colaborador-formulario-pedido.png\` | Formulário de solicitação |
| 04 | \`04-colaborador-pedido-enviado.png\` | Após envio |
| 06 | \`06-rh-fila-pendente.png\` | Fila RH com pedido |
| 07 | \`07-rh-detalhe-pendente.png\` | Detalhe na fila RH |
| 08 | \`08-rh-resposta-preenchida.png\` | Resposta RH + anexo |
| 09 | \`09-rh-conversa-apos-resposta.png\` | Conversa após RH |
| 10 | \`10-solicitante-meus-pedidos.png\` | Meus pedidos |
| 11 | \`11-solicitante-detalhe.png\` | Detalhe do solicitante |
| 12 | \`12-solicitante-resposta-preenchida.png\` | Resposta do solicitante |
| 13 | \`13-solicitante-conversa-completa.png\` | Conversa completa |
| 14 | \`14-rh-antes-aprovar.png\` | Antes de aprovar |
| 15 | \`15-rh-apos-aprovar.png\` | Após aprovação |

Gerado em: ${new Date().toISOString()}
`);
    }
  });
});
