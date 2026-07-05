/**
 * Gera relatório PDF de observabilidade com evidências visuais e saída dos testes.
 * Uso: node tools/generate-observability-e2e-report.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "docs", "observability", "report-assets");
const HTML_OUT = path.join(ROOT, "docs", "observability", "RELATORIO-OBSERVABILIDADE-E2E.html");
const PDF_OUT = path.join(ROOT, "docs", "observability", "RELATORIO-OBSERVABILIDADE-E2E.pdf");
const BACKEND_ROOT = path.resolve(ROOT, "..", "LioConecta.Backend");
const DEV_PORT = 5174;
const DEV_URL = `http://127.0.0.1:${DEV_PORT}`;

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

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function runCommand(label, command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  const output = [result.stdout ?? "", result.stderr ?? ""].filter(Boolean).join("\n");
  const file = path.join(ASSETS, `${label}.txt`);
  fs.writeFileSync(file, output, "utf8");
  return { ok: result.status === 0, output: output.trim(), file };
}

function imageToDataUri(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const ext = path.extname(filePath).slice(1).replace("jpg", "jpeg");
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:image/${ext};base64,${data}`;
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Servidor não respondeu em ${url}`);
}

function startDevServer() {
  return spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", `--port`, String(DEV_PORT)], {
    cwd: ROOT,
    shell: true,
    env: {
      ...process.env,
      VITE_USE_MOCK: "false",
      VITE_OBSERVABILITY_ENABLED: "true",
      VITE_API_BASE_URL: "/api/v1",
    },
    stdio: "ignore",
  });
}

async function mockObservabilityApi(page, options = {}) {
  const correlationId = options.correlationId ?? "22222222-2222-2222-2222-222222222222";

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ADMIN_ME),
    });
  });

  await page.route("**/api/v1/admin/observability/summary**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUMMARY),
    });
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
            correlationId,
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
      body: JSON.stringify({
        items: [
          {
            id: "44444444-4444-4444-4444-444444444444",
            occurredAt: "2026-07-05T15:01:00Z",
            eventType: "Resource",
            eventName: "Resource.Viewed",
            userName: "Admin E2E",
            correlationId,
            resource: "/api/v1/admin/observability/summary",
            action: "GET",
            result: "Success",
            reasonCode: null,
          },
        ],
        page: 1,
        pageSize: 25,
        totalCount: 1,
        totalPages: 1,
      }),
    });
  });

  await page.route("**/api/v1/admin/observability/page-views**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "55555555-5555-5555-5555-555555555555",
            occurredAt: "2026-07-05T14:59:00Z",
            userName: "Admin E2E",
            sessionId: "66666666-6666-6666-6666-666666666666",
            correlationId,
            pageName: "ObservabilityHub",
            routeTemplate: "/admin/observabilidade",
            module: "admin",
            referrerTemplate: "/",
            durationMs: 4500,
          },
        ],
        page: 1,
        pageSize: 25,
        totalCount: 1,
        totalPages: 1,
      }),
    });
  });

  await page.route("**/api/v1/admin/observability/investigate**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        correlationId,
        items: [
          {
            occurredAt: "2026-07-05T14:59:00Z",
            source: "page_view",
            label: "ObservabilityHub",
            detail: "/admin/observabilidade",
            referenceId: "55555555-5555-5555-5555-555555555555",
          },
          {
            occurredAt: "2026-07-05T15:00:00Z",
            source: "observability_event",
            label: "Application.NetworkError",
            detail: "/api/v1/admin/observability/summary",
            referenceId: "77777777-7777-7777-7777-777777777777",
          },
          {
            occurredAt: "2026-07-05T15:01:00Z",
            source: "access_event",
            label: "Resource.Viewed",
            detail: "/api/v1/admin/observability/summary",
            referenceId: "44444444-4444-4444-4444-444444444444",
          },
          {
            occurredAt: "2026-07-05T15:02:00Z",
            source: "audit_event",
            label: "PUT /api/v1/me/preferences",
            detail: "HTTP 200",
            referenceId: "88888888-8888-8888-8888-888888888888",
          },
        ],
      }),
    });
  });
}

async function captureScreenshots() {
  let devProcess = null;
  let startedServer = false;

  try {
    await fetch(DEV_URL);
  } catch {
    devProcess = startDevServer();
    startedServer = true;
    await waitForServer(DEV_URL);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await mockObservabilityApi(page);

  const shots = [];

  async function shot(name, action) {
    await page.goto(`${DEV_URL}/admin/observabilidade`, { waitUntil: "networkidle" });
    if (action) await action();
    await page.waitForTimeout(400);
    const file = path.join(ASSETS, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    shots.push({ name, file, title: name.replace(/-/g, " ") });
  }

  await shot("01-hub-kpis-erros", null);
  await shot("02-aba-acessos", async () => {
    await page.getByRole("tab", { name: "Acessos" }).click();
  });
  await shot("03-aba-page-views", async () => {
    await page.getByRole("tab", { name: "Page views" }).click();
  });
  await shot("04-aba-investigar-timeline", async () => {
    await page.getByRole("tab", { name: "Investigar" }).click();
    await page.locator("#obs-investigate-correlation").fill("22222222-2222-2222-2222-222222222222");
    await page.getByRole("button", { name: "Investigar" }).click();
    await page.waitForTimeout(600);
  });
  await shot("05-aba-links", async () => {
    await page.getByRole("tab", { name: "Links" }).click();
  });

  await browser.close();
  if (startedServer && devProcess) devProcess.kill();
  return shots;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml({ shots, backend, frontend, e2e }) {
  const generatedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const scenarioBlocks = [
    {
      id: 1,
      title: "Correlation ID em erros HTTP",
      desc: "Quando uma requisição falha, o backend propaga o mesmo UUID informado em X-Correlation-Id tanto no header de resposta quanto no corpo ProblemDetails (campo correlationId). Isso permite rastrear erros no hub e na trilha.",
      test: "Scenario1_CorrelationId_PropagatesOnHttpError",
    },
    {
      id: 2,
      title: "Ingestão batch com redaction LGPD",
      desc: "O endpoint POST /api/v1/telemetry/events aceita lotes de eventos. Campos sensíveis (password, token) são removidos pelo TelemetryRedactor antes da persistência; apenas chaves da allowlist são gravadas em metadata_json.",
      test: "Scenario2_TelemetryBatch_PersistsWithRedaction",
    },
    {
      id: 3,
      title: "Page views persistidos",
      desc: "Navegação SPA enviada via POST /api/v1/telemetry/page-views grava page_name, route_template, module, duração e correlationId na tabela page_views.",
      test: "Scenario3_PageViewBatch_PersistsNavigationEvent",
    },
    {
      id: 4,
      title: "Access audit em rotas admin",
      desc: "GETs em rotas sensíveis (/api/v1/admin/**) geram access_events com event_name Resource.Viewed, correlacionados ao header X-Correlation-Id.",
      test: "Scenario4_AdminGetAccessAudit_PersistsResourceViewed",
    },
    {
      id: 5,
      title: "APIs admin de consulta",
      desc: "Endpoints /admin/observability/summary, /errors e /metrics retornam KPIs, listas paginadas e séries temporais consumidas pelo hub React.",
      test: "Scenario5_AdminQueryEndpoints_ReturnAggregatedData",
    },
    {
      id: 6,
      title: "Timeline unificada por correlationId",
      desc: "GET /admin/observability/investigate agrega page_views, access_events, observability_events e audit_events ordenados cronologicamente — cenário ponta a ponta do MD.",
      test: "Scenario6_InvestigateTimeline_UnifiesAllSourcesByCorrelationId",
    },
  ];

  const screenshotSections = shots
    .map((s) => {
      const uri = imageToDataUri(s.file);
      const titles = {
        "01-hub-kpis-erros": "Hub — KPIs e aba Erros",
        "02-aba-acessos": "Hub — aba Acessos",
        "03-aba-page-views": "Hub — aba Page views",
        "04-aba-investigar-timeline": "Hub — aba Investigar (timeline unificada)",
        "05-aba-links": "Hub — aba Links relacionados",
      };
      const captions = {
        "01-hub-kpis-erros":
          "Doze indicadores operacionais no topo; filtros de período reutilizam o padrão da Trilha de Auditoria. A aba Erros lista eventos severity ≥ Error com correlationId clicável.",
        "02-aba-acessos":
          "Eventos de leitura/autorização (Resource.Viewed, Access.Denied etc.) com filtros por resultado e event_name.",
        "03-aba-page-views":
          "Histórico de navegação SPA: page_name, rota, módulo, duração e usuário.",
        "04-aba-investigar-timeline":
          "Investigação por UUID: timeline vertical com badges por fonte (page view, ops, acesso, auditoria) e link para a Trilha.",
        "05-aba-links":
          "Atalhos para Trilha de Auditoria, Analytics e Configurações backend (categoria observability).",
      };
      return `
        <section class="evidence">
          <h3>${titles[s.name] ?? s.name}</h3>
          <p>${captions[s.name] ?? ""}</p>
          ${uri ? `<img src="${uri}" alt="${titles[s.name] ?? s.name}" />` : "<p><em>Screenshot indisponível</em></p>"}
        </section>`;
    })
    .join("\n");

  const scenarioHtml = scenarioBlocks
    .map(
      (s) => `
      <section class="scenario">
        <h3>Cenário ${s.id} — ${s.title}</h3>
        <p>${s.desc}</p>
        <p><strong>Teste:</strong> <code>${s.test}</code></p>
      </section>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório Observabilidade LioConecta — Testes E2E</title>
  <style>
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .cover {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 40px;
      background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 60%);
      page-break-after: always;
    }
    .cover h1 { font-size: 28pt; margin: 0 0 12px; color: #0f766e; }
    .cover .subtitle { font-size: 14pt; color: #475569; max-width: 680px; }
    .cover .meta { margin-top: 32px; color: #64748b; font-size: 10pt; }
    h2 {
      color: #0f766e;
      border-bottom: 2px solid #99f6e4;
      padding-bottom: 6px;
      margin-top: 28px;
      page-break-after: avoid;
    }
    h3 { color: #134e4a; margin-top: 18px; page-break-after: avoid; }
    .content { padding: 8px 40px 40px; }
    p, li { color: #334155; }
    ul { padding-left: 20px; }
    code, pre {
      font-family: Consolas, "Courier New", monospace;
      font-size: 9pt;
    }
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      page-break-inside: avoid;
    }
    .ok { color: #047857; font-weight: 700; }
    .scenario, .evidence {
      margin: 16px 0 24px;
      page-break-inside: avoid;
    }
    img {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-top: 10px;
      box-shadow: 0 8px 24px rgba(15, 118, 110, 0.08);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f1f5f9; }
    .arch {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 16px;
      font-family: Consolas, monospace;
      font-size: 9pt;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Observabilidade LioConecta</h1>
    <p class="subtitle">
      Relatório de implementação e evidências dos testes E2E (Fases 1–8).
      Inclui hub admin, ingestão de telemetria, APIs de consulta, correlação ponta a ponta e suite automatizada backend/frontend.
    </p>
    <p class="meta">
      Gerado em: ${generatedAt}<br />
      Branch: feature/observability-platform<br />
      Repositórios: LioConecta-FrontEnd + LioConecta.Backend
    </p>
  </div>

  <div class="content">
    <h2>1. Resumo do que foi implementado</h2>
    <table>
      <thead><tr><th>Fase</th><th>Entregável</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>2 — Design</td><td>ADR, catálogo de eventos, LGPD, OTel, UI-SPEC, contratos API</td><td>Concluída</td></tr>
        <tr><td>3 — Backend core</td><td>CorrelationMiddleware, GlobalExceptionHandler, AccessAudit, OTel</td><td>Concluída</td></tr>
        <tr><td>4 — Frontend core</td><td>TelemetryClient, ErrorBoundary, session correlation, page views</td><td>Concluída</td></tr>
        <tr><td>5 — Persistência</td><td>3 tabelas + ingestão batch + retention job</td><td>Concluída</td></tr>
        <tr><td>6 — APIs admin</td><td>summary, errors, page-views, access-events, metrics, investigate</td><td>Concluída</td></tr>
        <tr><td>7 — UI hub</td><td>/admin/observabilidade — 12 KPIs, 5 abas, timeline</td><td>Concluída</td></tr>
        <tr><td>8 — Testes E2E</td><td>6 cenários backend + vitest + Playwright</td><td>Concluída</td></tr>
      </tbody>
    </table>

    <h2>2. Arquitetura (visão operacional)</h2>
    <div class="arch">Frontend React
  ├─ TelemetryClient (batch 30s / 20 eventos, sendBeacon em pagehide)
  ├─ SessionCorrelationId + headers X-Correlation-Id / X-Session-Id
  └─ ObservabilityHubPage (/admin/observabilidade)

Backend ASP.NET Core
  ├─ POST /api/v1/telemetry/events | page-views  → observability_event, page_view
  ├─ AccessAuditMiddleware + auth handler         → access_event
  ├─ Audit pipeline existente                     → audit_events
  └─ GET /api/v1/admin/observability/*            → consulta + investigate

Correlação: mesmo correlationId liga page view → request HTTP → access → audit → timeline admin</div>

    <h2>3. Cenários de teste backend (integração)</h2>
    <p>Arquivo: <code>ObservabilityE2EScenariosTests.cs</code> — ${backend.ok ? '<span class="ok">APROVADO</span>' : "FALHOU"}</p>
    ${scenarioHtml}
    <h3>Saída completa — dotnet test (Observability)</h3>
    <pre>${escapeHtml(backend.output.slice(-3500))}</pre>

    <h2>4. Testes unitários frontend (Vitest)</h2>
    <p>Arquivos: sessionCorrelation, telemetryClient, routeCatalog — ${frontend.ok ? '<span class="ok">APROVADO</span>' : "FALHOU"}</p>
    <ul>
      <li><strong>sessionCorrelation</strong> — IDs estáveis por sessão; refresh de correlation por navegação; headers aplicados.</li>
      <li><strong>telemetryClient</strong> — flush automático ao atingir 20 eventos; falha de rede não derruba a app; telemetria desligada quando VITE_OBSERVABILITY_ENABLED=false.</li>
      <li><strong>routeCatalog</strong> — rota /admin/observabilidade mapeada para módulo admin.</li>
    </ul>
    <pre>${escapeHtml(frontend.output.slice(-2500))}</pre>

    <h2>5. Testes E2E UI (Playwright)</h2>
    <p>Arquivo: <code>e2e/observability-hub.spec.ts</code> — ${e2e.ok ? '<span class="ok">APROVADO</span>' : "FALHOU"}</p>
    <pre>${escapeHtml(e2e.output.slice(-2500))}</pre>

    <h2>6. Evidências visuais — Hub de Observabilidade</h2>
    <p>Capturas realizadas com API mockada (mesmo padrão dos testes E2E), simulando respostas admin reais.</p>
    ${screenshotSections}

    <h2>7. Como reproduzir</h2>
    <pre># Backend
dotnet test LioConecta.Backend/tests/LioConecta.IntegrationTests --filter "Observability"

# Frontend
npm run test
npm run test:e2e

# Regenerar este PDF
node tools/generate-observability-e2e-report.mjs</pre>
  </div>
</body>
</html>`;
}

async function htmlToPdf(htmlPath, pdfPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "14mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
}

async function main() {
  console.log("Gerando relatório de observabilidade...");
  ensureDir(ASSETS);

  console.log("Executando testes backend...");
  const backend = runCommand(
    "backend-observability-tests",
    "dotnet",
    [
      "test",
      path.join(BACKEND_ROOT, "tests", "LioConecta.IntegrationTests", "LioConecta.IntegrationTests.csproj"),
      "--filter",
      "FullyQualifiedName~Observability",
      "--no-restore",
    ],
    BACKEND_ROOT,
  );

  console.log("Executando testes frontend (vitest)...");
  const frontend = runCommand("frontend-vitest", "npm", ["run", "test"], ROOT);

  console.log("Executando testes E2E (playwright)...");
  const e2e = runCommand("frontend-playwright", "npm", ["run", "test:e2e"], ROOT);

  console.log("Capturando screenshots do hub...");
  const shots = await captureScreenshots();

  console.log("Montando HTML...");
  const html = buildHtml({ shots, backend, frontend, e2e });
  fs.writeFileSync(HTML_OUT, html, "utf8");

  console.log("Exportando PDF...");
  await htmlToPdf(HTML_OUT, PDF_OUT);

  console.log(`\nRelatório gerado:`);
  console.log(`  HTML: ${HTML_OUT}`);
  console.log(`  PDF:  ${PDF_OUT}`);
  console.log(`  Assets: ${ASSETS}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
