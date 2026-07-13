import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5174";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "help-desk-tickets-uat");

let evidenceRunDir = EVIDENCE_ROOT;

const ME = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "TI",
  roles: ["Admin", "TI"],
};

const SERVICES = [
  {
    id: "abrir-chamado",
    title: "Abrir chamado",
    desc: "Registre um novo incidente ou solicitação.",
    category: "incidente",
    provider: "Portal GLPI",
    status: "disponivel",
    featured: true,
    action: "modal",
    helpText: "Abra um ticket no GLPI.",
    portalUrl: null,
  },
  {
    id: "acompanhar-ticket",
    title: "Acompanhar ticket",
    desc: "Consulte status e histórico dos chamados.",
    category: "solicitacao",
    provider: "Service Desk",
    status: "disponivel",
    featured: false,
    action: "modal",
    helpText: "Lista dos últimos 90 dias.",
    portalUrl: null,
  },
  {
    id: "base-conhecimento",
    title: "Base de conhecimento",
    desc: "Artigos e tutoriais de TI.",
    category: "duvida",
    provider: "Wiki TI",
    status: "disponivel",
    featured: false,
    action: "modal",
    helpText: "Consulte antes de abrir chamado.",
    portalUrl: "/documentos/wiki",
  },
];

const PRIORITIES = ["Muito alta", "Alta", "Média", "Baixa"] as const;
const STATUSES = [
  { status: "new", label: "Novo" },
  { status: "processing", label: "Em andamento" },
  { status: "pending", label: "Pendente" },
  { status: "solved", label: "Solucionado" },
] as const;

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

function buildTickets(count: number, marker: string) {
  const now = Date.now();
  return Array.from({ length: count }, (_, index) => {
    const status = STATUSES[index % STATUSES.length];
    const priority = PRIORITIES[index % PRIORITIES.length];
    const id = String(90000 + index);
    return {
      ticketId: id,
      subject: `${marker} chamado ${String(index + 1).padStart(2, "0")} — ${priority}`,
      status: status.status,
      statusLabel: status.label,
      priorityLabel: priority,
      createdAt: new Date(now - index * 3_600_000).toISOString(),
      externalUrl: null,
      requesterLabel: index % 2 === 0 ? "Leonardo Sabino Mendes" : "Maria Silva",
    };
  });
}

async function mockHelpDeskTicketsPage(page: Page, tickets: ReturnType<typeof buildTickets>) {
  await page.route("**/health**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "Healthy" }) });
  });

  await page.route("**/api/v1/me**", async (route) => {
    if (route.request().url().includes("preferences")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ bookmarks: [] }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME) });
  });

  await page.route("**/api/v1/notifications**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/auth/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }) });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/v1/ti/help-desk/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        openTickets: tickets.filter((t) => t.status !== "solved").length,
        avgResponseLabel: "2h críticos · 8h solicitações",
        canViewAllTickets: true,
      }),
    });
  });

  await page.route("**/api/v1/ti/help-desk/services", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SERVICES) });
  });

  await page.route("**/api/v1/ti/help-desk/tickets/mine**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(tickets) });
  });

  await page.route("**/api/v1/ti/help-desk/tickets/all**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(tickets) });
  });

  await page.route("**/api/v1/ti/help-desk/tickets/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/mine") || url.includes("/all") || url.endsWith("/tickets")) {
      await route.fallback();
      return;
    }
    const match = url.match(/\/tickets\/([^/?]+)/);
    const ticketId = match?.[1] ?? tickets[0]?.ticketId;
    const preview = tickets.find((t) => t.ticketId === ticketId) ?? tickets[0];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        summary: preview,
        description: `Detalhe mock do chamado #${preview.ticketId}.`,
        assignee: "Suporte TI",
        events: [
          {
            eventType: "Criação",
            createdAt: preview.createdAt,
            author: preview.requesterLabel,
          },
        ],
      }),
    });
  });
}

test.describe("UAT — Help Desk lista de chamados", () => {
  test.use({ ignoreHTTPSErrors: true });

  test("remove busca/chips, lista com ordenacao e scroll infinito", async ({ browser }) => {
    test.setTimeout(180_000);
    const { stamp: runStamp } = createEvidenceRun();
    const marker = `E2E-HD-LIST-${Date.now()}`;
    const tickets = buildTickets(32, marker);
    writeEvidence("00-setup-tickets.json", { marker, count: tickets.length, sample: tickets.slice(0, 3) });

    let passed = false;
    let errorMessage = "";
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1440, height: 900 },
      baseURL: PAGE_BASE_URL,
    });
    await context.addInitScript(() => {
      sessionStorage.setItem("lioconecta.auth.token", "e2e-mock-token");
    });

    const page = await context.newPage();

    try {
      await mockHelpDeskTicketsPage(page, tickets);
      await page.goto("/servicos/help-desk", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Help Desk" })).toBeVisible({ timeout: 20_000 });

      await expect(page.getByPlaceholder("Buscar chamados e artigos...")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Incidentes" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Solicitações" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Dúvidas" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Urgente" })).toHaveCount(0);

      const serviceCards = page.locator(".benefits-grid .benefit-card");
      await expect(serviceCards).toHaveCount(3);
      await expect(page.getByRole("heading", { name: "Abrir chamado" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Acompanhar ticket" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Base de conhecimento" })).toBeVisible();

      const list = page.getByRole("region", { name: "Lista de chamados" });
      await expect(list).toBeVisible();
      await expect(list.getByRole("heading", { name: "Chamados" })).toBeVisible();
      await expect(list.getByText("32 chamados (últimos 90 dias)")).toBeVisible();

      await page.screenshot({ path: evidencePath("01-colaborador-help-desk-sem-busca-chips.png"), fullPage: true });

      const rows = list.locator("tbody tr");
      await expect(rows).toHaveCount(15);
      await expect(rows.first()).toContainText(`${marker} chamado 01`);

      await page.screenshot({ path: evidencePath("02-colaborador-lista-inicial-15.png"), fullPage: true });

      const scrollRoot = list.getByTestId("hd-ticket-list-scroll");
      await scrollRoot.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect(rows).toHaveCount(30, { timeout: 10_000 });
      writeEvidence("03-scroll-page2-api.json", { visibleAfterScroll: 30, total: tickets.length });
      await page.screenshot({ path: evidencePath("03-colaborador-scroll-infinito-30.png"), fullPage: true });

      await scrollRoot.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect(rows).toHaveCount(32, { timeout: 10_000 });
      await expect(list.getByText("Exibindo 32 de 32 chamados")).toBeVisible();
      await page.screenshot({ path: evidencePath("04-colaborador-scroll-fim-lista.png"), fullPage: true });

      const sortSelect = list.getByLabel("Ordenar chamados");
      await sortSelect.selectOption("subject");
      await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(15);
      const firstSubjectAsc = await rows.first().locator("td").nth(1).innerText();
      await sortSelect.selectOption("createdAtDesc");
      await expect(rows.first()).toContainText(`${marker} chamado 01`);
      await sortSelect.selectOption("priority");
      await expect(rows.first()).toContainText("Muito alta");
      writeEvidence("05-sort-samples.json", {
        subjectAscFirst: firstSubjectAsc,
        afterPriorityFirst: await rows.first().locator("td").nth(1).innerText(),
      });
      await page.screenshot({ path: evidencePath("05-colaborador-ordenacao-prioridade.png"), fullPage: true });

      await list.getByRole("tab", { name: "Fila completa" }).click();
      await expect(list.getByRole("columnheader", { name: "Solicitante" })).toBeVisible();
      await page.screenshot({ path: evidencePath("06-colaborador-fila-completa.png"), fullPage: true });

      await rows.first().getByRole("button", { name: /Visualizar chamado/ }).click();
      const detail = page.getByRole("dialog", { name: /Chamado #/ });
      await expect(detail).toBeVisible({ timeout: 10_000 });
      await page.screenshot({ path: evidencePath("07-colaborador-detalhe-chamado.png"), fullPage: true });

      passed = true;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      await page.screenshot({ path: evidencePath("07b-colaborador-erro.png"), fullPage: true }).catch(() => undefined);
      throw error;
    } finally {
      writeEvidence("99-uat-summary.md", [
        "# UAT Help Desk lista de chamados — evidências",
        "",
        `## Resultado: ${passed ? "PASSOU" : "FALHOU"}`,
        "",
        `- **Run:** \`${runStamp}\``,
        `- **Marker:** ${marker}`,
        `- **Atores:** colaborador (Admin/TI mock)`,
        `- **URL:** ${PAGE_BASE_URL}/servicos/help-desk`,
        errorMessage ? `- **Erro:** ${errorMessage}` : "",
        "",
        "## Fluxo validado",
        "",
        "1. Sem barra de busca nem chips de filtro de serviços",
        "2. Três cards de serviço permanecem",
        "3. Lista de chamados abaixo dos cards",
        "4. Scroll infinito (15 → 30 → 32)",
        "5. Ordenação (assunto / data / prioridade)",
        "6. Toggle fila completa + detalhe do chamado",
        "",
        "## Prints",
        "",
        "| # | Arquivo | Etapa |",
        "|---|---------|-------|",
        "| 01 | `01-colaborador-help-desk-sem-busca-chips.png` | Página sem busca/chips |",
        "| 02 | `02-colaborador-lista-inicial-15.png` | Primeira página da lista |",
        "| 03 | `03-colaborador-scroll-infinito-30.png` | Scroll infinito |",
        "| 04 | `04-colaborador-scroll-fim-lista.png` | Fim da lista |",
        "| 05 | `05-colaborador-ordenacao-prioridade.png` | Ordenação |",
        "| 06 | `06-colaborador-fila-completa.png` | Fila completa |",
        "| 07 | `07-colaborador-detalhe-chamado.png` | Detalhe |",
        "",
        `Gerado em: ${new Date().toISOString()}`,
        "",
      ].filter(Boolean).join("\n"));

      await context.close();
    }
  });
});
