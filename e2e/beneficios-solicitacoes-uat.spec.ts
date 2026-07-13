import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const USER_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const USER_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "beneficios-solicitacoes-uat");
const FIXTURES_DIR = path.join("e2e", "fixtures", "solicitacoes-rh");

/** Benefícios com fluxo Solicitações RH (mesmo escopo pedido pelo usuário + catálogo ativo). */
const BENEFIT_TARGETS = [
  { id: "creche", slug: "creche", title: "Auxílio Creche" },
  { id: "home-office", slug: "home-office", title: "Auxílio Home Office" },
  { id: "licencas", slug: "licencas", title: "Licenças e Afastamentos" },
  { id: "previdencia", slug: "previdencia", title: "Previdência Privada" },
  { id: "assistencia", slug: "assistencia", title: "Programa de Assistência" },
  { id: "seguro-vida", slug: "seguro-vida", title: "Seguro de Vida" },
  { id: "vale-alimentacao", slug: "vale-alimentacao", title: "Vale-alimentação" },
  { id: "vale-refeicao", slug: "vale-refeicao", title: "Vale-refeição" },
  { id: "vale-transporte", slug: "vale-transporte", title: "Vale-transporte" },
  { id: "wellhub", slug: "wellhub", title: "Wellhub (Gympass)" },
] as const;

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type BenefitListItem = { id: string; title: string; status: string; isActive?: boolean };
type ServiceRequestDto = {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  events: Array<{ id: string; eventType: string }>;
};

type BenefitRunResult = {
  slug: string;
  title: string;
  marker: string;
  requestId: string;
  status: string;
  passed: boolean;
  error?: string;
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
  if (!fs.existsSync(pngPath)) {
    fs.writeFileSync(
      pngPath,
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
        "base64",
      ),
    );
  }
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
  expect(loginResponse.ok(), `login failed: ${loginResponse.status()}`).toBeTruthy();
  return ((await loginResponse.json()) as LoginResponse).accessToken;
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
  return { context, page: await context.newPage() };
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
    `${API_BASE_URL}/api/v1/service-requests/management?status=&q=&limit=100`,
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

async function closeModalFooter(page: Page) {
  const footerClose = page
    .locator(".pay-modal__footer button.pay-modal__btn--ghost")
    .filter({ hasText: "Fechar" });
  if (await footerClose.isVisible().catch(() => false)) {
    await footerClose.click();
  }
}

async function runBenefitFlow(
  page: Page,
  request: APIRequestContext,
  token: string,
  pngPath: string,
  benefit: (typeof BENEFIT_TARGETS)[number],
  marker: string,
): Promise<BenefitRunResult> {
  const { slug, title } = benefit;
  const prefix = slug;

  try {
    await page.goto("/servicos/beneficios", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Benefícios/i }).first()).toBeVisible({
      timeout: 30_000,
    });

    const card = page.locator(".benefit-card").filter({ hasText: title }).first();
    await expect(card, `card não encontrado: ${title}`).toBeVisible({ timeout: 15_000 });
    await card.locator(".benefit-card__open").click();

    const requestBtn = page.getByTestId("benefit-request-start");
    await expect(
      requestBtn,
      `botão de solicitação ausente em ${title}`,
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, `${prefix}-01-colaborador-detalhe.png`);

    await requestBtn.click();
    const notes = `${marker} — UAT E2E pedido de alteração/informação sobre ${title}.`;
    await page.getByTestId("benefit-request-notes").fill(notes);
    await shot(page, `${prefix}-02-colaborador-formulario.png`);

    const createRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes("/api/v1/rh/benefits/requests") && r.request().method() === "POST",
      { timeout: 30_000 },
    );
    await page.getByTestId("benefit-request-submit").click();
    const createResp = await createRespPromise;
    if (!createResp.ok()) {
      await shot(page, `${prefix}-02b-colaborador-erro.png`);
      throw new Error(`criar pedido falhou: HTTP ${createResp.status()}`);
    }
    const createBody = await createResp.json();
    writeEvidence(`${prefix}-create-api.json`, createBody);
    await shot(page, `${prefix}-03-colaborador-enviado.png`);

    let requestId = "";
    for (let i = 0; i < 12; i++) {
      const found = await findRequestByMarker(request, token, marker);
      if (found) {
        requestId = found.id;
        break;
      }
      await page.waitForTimeout(400);
    }
    if (!requestId && typeof createBody === "object" && createBody && "requestId" in createBody) {
      requestId = String((createBody as { requestId: string }).requestId);
    }
    if (!requestId) throw new Error("requestId não encontrado após envio");
    writeEvidence(`${prefix}-request-id.json`, { requestId, marker, title });

    await closeModalFooter(page);
    await page.goto("/servicos/solicitacoes-rh", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Pendente", exact: true }).click();
    const rhCard = page.getByTestId(`sr-card-${requestId}`);
    await expect(rhCard).toBeVisible({ timeout: 30_000 });
    await shot(page, `${prefix}-04-rh-fila.png`);
    await rhCard.click();
    await expect(page.getByTestId("sr-gestao-detail")).toBeVisible({ timeout: 20_000 });
    await shot(page, `${prefix}-05-rh-detalhe.png`);

    await page
      .getByTestId("sr-reply-message")
      .fill(`RH (${title}): recebemos o pedido ${marker}.`);
    await page.locator(".sr-thread__composer input[type=file]").setInputFiles(pngPath);
    const rhReplyPromise = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/v1/service-requests/management/${requestId}/messages`) &&
        r.request().method() === "POST",
      { timeout: 30_000 },
    );
    await page.getByTestId("sr-reply-send").click();
    const rhReply = await rhReplyPromise;
    if (!rhReply.ok()) throw new Error(`resposta RH falhou: HTTP ${rhReply.status()}`);
    writeEvidence(`${prefix}-rh-reply-api.json`, await rhReply.json());
    await expect(
      page.locator(".sr-thread__bubble").filter({ hasText: "Resposta do RH" }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, `${prefix}-06-rh-resposta.png`);

    await closeModalFooter(page);
    await page.getByRole("tab", { name: /Meus pedidos/i }).click();
    await page.getByTestId(`sr-card-${requestId}`).click();
    await expect(page.getByTestId("sr-gestao-detail")).toBeVisible({ timeout: 20_000 });
    await page
      .getByTestId("sr-reply-message")
      .fill(`Solicitante (${title}): confirmo informações do ${marker}.`);
    const mineReplyPromise = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/v1/service-requests/${requestId}/messages`) &&
        r.request().method() === "POST",
      { timeout: 30_000 },
    );
    await page.getByTestId("sr-reply-send").click();
    const mineReply = await mineReplyPromise;
    if (!mineReply.ok()) throw new Error(`resposta solicitante falhou: HTTP ${mineReply.status()}`);
    writeEvidence(`${prefix}-solicitante-reply-api.json`, await mineReply.json());
    await shot(page, `${prefix}-07-solicitante-resposta.png`);

    await closeModalFooter(page);
    await page.getByRole("tab", { name: /Fila RH/i }).click();
    await page.getByRole("button", { name: "Todos", exact: true }).click();
    await page.getByTestId(`sr-card-${requestId}`).click();
    const reason = page.getByTestId("sr-gestao-reason");
    if (await reason.isVisible()) {
      await reason.fill(`Aprovado UAT ${marker}`);
    }
    const approvePromise = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/v1/service-requests/management/${requestId}/approve`) &&
        r.request().method() === "POST",
      { timeout: 30_000 },
    );
    await page.getByTestId("sr-gestao-approve").click();
    const approveResp = await approvePromise;
    if (!approveResp.ok()) throw new Error(`aprovar falhou: HTTP ${approveResp.status()}`);
    const approved = (await approveResp.json()) as ServiceRequestDto;
    writeEvidence(`${prefix}-approve-api.json`, approved);
    await expect(
      page.locator(".sr-status-banner").getByText(/Aprovado/i).first(),
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, `${prefix}-08-rh-aprovado.png`);
    await closeModalFooter(page);

    const detailRes = await request.get(
      `${API_BASE_URL}/api/v1/service-requests/management/${requestId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(detailRes.ok()).toBeTruthy();
    const detail = (await detailRes.json()) as ServiceRequestDto;
    writeEvidence(`${prefix}-detail-final-api.json`, detail);
    expect(String(detail.status)).toMatch(/Approved/i);

    return {
      slug,
      title,
      marker,
      requestId,
      status: String(detail.status),
      passed: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await shot(page, `${prefix}-99-erro.png`).catch(() => undefined);
    return {
      slug,
      title,
      marker,
      requestId: "",
      status: "error",
      passed: false,
      error: message,
    };
  }
}

function buildSummary(
  stamp: string,
  runDir: string,
  results: BenefitRunResult[],
  allPassed: boolean,
) {
  const rows = results
    .map(
      (r) =>
        `| ${r.title} | \`${r.slug}\` | ${r.passed ? "PASSOU" : "FALHOU"} | \`${r.requestId || "—"}\` | ${r.error ?? "—"} |`,
    )
    .join("\n");

  const printRows = BENEFIT_TARGETS.map((b) => {
    const p = b.slug;
    return `| ${b.title} | \`${p}-01…\` … \`${p}-08-rh-aprovado.png\` |`;
  }).join("\n");

  writeEvidence(
    "99-uat-summary.md",
    `# UAT Benefícios — Solicitações RH (todos os benefícios)

## Resultado: ${allPassed ? "PASSOU" : "FALHOU"}

- **Run:** \`${stamp}\`
- **Benefícios testados:** ${BENEFIT_TARGETS.length}
- **Pasta:** \`${runDir.replace(/\\/g, "/")}\`

## Resultado por benefício

| Benefício | Slug | Status | RequestId | Erro |
|-----------|------|--------|-----------|------|
${rows}

## Fluxo validado (cada benefício)

1. Colaborador abre benefício e vê **Solicitar alteração ou informação**
2. Envia pedido com marker único
3. RH responde com mensagem + anexo
4. Solicitante responde em **Meus pedidos**
5. RH aprova → status **Approved**

## Prints por benefício

| Benefício | Arquivos (prefixo slug) |
|-----------|-------------------------|
${printRows}

Gerado em: ${new Date().toISOString()}
`,
  );
}

test.describe("UAT Benefícios — solicitação, conversa e aprovação (todos)", () => {
  test.setTimeout(900_000);

  test("cada benefício do catálogo RH segue o fluxo completo", async ({ request, browser }) => {
    const { stamp, runDir, pngPath } = createEvidenceRun();
    const runMarker = `E2E-BEN-ALL-${Date.now()}`;
    const results: BenefitRunResult[] = [];

    const health = await request.get(`${API_BASE_URL}/health`);
    expect(health.ok()).toBeTruthy();

    const token = await login(request, USER_EMAIL, USER_PASSWORD);
    const benefitsRes = await request.get(`${API_BASE_URL}/api/v1/rh/benefits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(benefitsRes.ok()).toBeTruthy();
    const catalog = (await benefitsRes.json()) as BenefitListItem[];
    writeEvidence("00-benefits-catalog.json", catalog);

    const missing = BENEFIT_TARGETS.filter(
      (t) => !catalog.some((b) => b.id === t.id && b.isActive !== false),
    );
    expect(missing, `benefícios ausentes no catálogo: ${missing.map((m) => m.id).join(", ")}`).toEqual(
      [],
    );

    const { context, page } = await openAuthedPage(browser, token);
    try {
      for (const benefit of BENEFIT_TARGETS) {
        const marker = `${runMarker}-${benefit.slug}`;
        const result = await runBenefitFlow(page, request, token, pngPath, benefit, marker);
        results.push(result);
        writeEvidence(`${benefit.slug}-result.json`, result);
        expect(result.passed, `${benefit.title}: ${result.error ?? "falhou"}`).toBeTruthy();
      }
    } finally {
      await context.close();
    }

    const allPassed = results.every((r) => r.passed);
    buildSummary(stamp, runDir, results, allPassed);
    writeEvidence("00-results.json", results);
    expect(allPassed).toBeTruthy();
  });
});
