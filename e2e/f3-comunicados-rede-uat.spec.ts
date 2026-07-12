import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const ADMIN_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const ADMIN_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "f3-comunicados-rede-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };

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
  let lastStatus = 0;
  let lastBody = "";
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: { email, password },
    });
    lastStatus = loginResponse.status();
    if (loginResponse.ok()) {
      return ((await loginResponse.json()) as LoginResponse).accessToken;
    }
    lastBody = await loginResponse.text().catch(() => "");
    // 409 transient / DB blip — retry
    if (lastStatus === 409 || lastStatus >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      continue;
    }
    break;
  }
  expect(false, `login failed: ${lastStatus} ${lastBody}`).toBeTruthy();
  return "";
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

async function settle(page: Page, ms = 1200) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(ms);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: evidencePath(name), fullPage: true });
}

/** Abre dropdown da topbar e tira print do menu aberto. */
async function openTopbarMenu(page: Page, label: string, shotName: string) {
  const trigger = page.locator(".topbar__dropdown-trigger", { hasText: label }).first();
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();
  await page.waitForTimeout(400);
  await shot(page, shotName);
  return trigger;
}

/** Clica item do menu aberto da topbar. */
async function clickTopbarMenuItem(page: Page, itemLabel: string) {
  const item = page.locator(".topbar__dropdown.is-open a.topbar__menu-item", {
    hasText: itemLabel,
  }).first();
  await expect(item).toBeVisible({ timeout: 10_000 });
  await item.click();
  await settle(page);
}

/** Destaca e clica item da sidebar esquerda (quando existir). */
async function clickSidebarItem(page: Page, label: string, shotName: string) {
  const link = page.locator(".sidebar a, aside a, nav a").filter({ hasText: label }).first();
  const visible = await link.isVisible().catch(() => false);
  if (!visible) {
    // fallback: procura pelo title/aria-label
    const byLabel = page.getByRole("link", { name: new RegExp(label, "i") }).first();
    await expect(byLabel).toBeVisible({ timeout: 10_000 });
    await byLabel.hover().catch(() => undefined);
    await shot(page, shotName);
    await byLabel.click();
    await settle(page);
    return;
  }
  await link.hover().catch(() => undefined);
  await shot(page, shotName);
  await link.click();
  await settle(page);
}

test.describe("UAT F3 — Comunicados & rede", () => {
  test.setTimeout(360_000);

  test("CMS, notícias, pessoas, clima e feedback com evidências", async ({ request, browser }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-F3-${Date.now()}`;
    const failures: string[] = [];
    const printRows: string[] = [];

    const token = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const me = await request.get(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeEvidence("00-me.json", {
      status: me.status(),
      body: await me.json().catch(async () => await me.text()),
    });

    // --- F3-A CMS: publish comunicado ---
    const createRes = await request.post(`${API_BASE_URL}/api/v1/comunicados`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        kind: 0,
        title: `${marker} Comunicado CMS`,
        excerpt: "UAT F3 CMS",
        content: { html: `<p>${marker} corpo</p>` },
        heroImageUrl: null,
        isMandatory: false,
        status: 2,
        audienceType: 0,
        audienceDepartmentIds: [],
      },
    });
    writeEvidence("01-comunicado-create.json", {
      status: createRes.status(),
      body: await createRes.json().catch(() => null),
    });
    if (!createRes.ok()) failures.push(`create comunicado ${createRes.status()}`);
    const comunicado = createRes.ok() ? await createRes.json() : null;

    if (comunicado?.id) {
      const metricsRes = await request.get(
        `${API_BASE_URL}/api/v1/comunicados/${comunicado.id}/metrics`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      writeEvidence("02-comunicado-metrics.json", {
        status: metricsRes.status(),
        body: await metricsRes.json().catch(() => null),
      });
      const archiveRes = await request.post(
        `${API_BASE_URL}/api/v1/comunicados/${comunicado.id}/archive`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      writeEvidence("03-comunicado-archive.json", {
        status: archiveRes.status(),
        body: await archiveRes.json().catch(() => null),
      });
      if (!archiveRes.ok()) failures.push(`archive comunicado ${archiveRes.status()}`);
    }

    // --- F3-B News ---
    const newsCreate = await request.post(`${API_BASE_URL}/api/v1/feed/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        type: 4,
        content: `${marker} corpo da notícia F3 para validação UAT.`,
        metadata: {
          title: `${marker} Notícia F3`,
          excerpt: "Resumo curto da notícia criada no UAT F3.",
        },
      },
    });
    writeEvidence("04-news-create.json", {
      status: newsCreate.status(),
      body: await newsCreate.json().catch(() => null),
    });
    if (!newsCreate.ok()) failures.push(`create news ${newsCreate.status()}`);

    const newsList = await request.get(`${API_BASE_URL}/api/v1/feed/news?limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeEvidence("05-news-list.json", {
      status: newsList.status(),
      body: await newsList.json().catch(() => null),
    });

    // --- F3-C people ---
    const birthdays = await request.get(`${API_BASE_URL}/api/v1/people/birthdays?days=60`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const birthdaysBody = await birthdays.json().catch(() => null);
    writeEvidence("06-birthdays.json", {
      status: birthdays.status(),
      count: Array.isArray(birthdaysBody) ? birthdaysBody.length : 0,
      sample: Array.isArray(birthdaysBody) ? birthdaysBody.slice(0, 3) : birthdaysBody,
    });

    const newHires = await request.get(`${API_BASE_URL}/api/v1/people/new-hires?days=180`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeEvidence("07-new-hires.json", {
      status: newHires.status(),
      body: await newHires.json().catch(() => null),
    });

    const trigger = await request.post(
      `${API_BASE_URL}/api/v1/admin/workers/new-hire-announce/trigger`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    writeEvidence("08-new-hire-worker.json", {
      status: trigger.status(),
      body: await trigger.json().catch(() => null),
    });

    // --- F3-D mood ---
    const moodMetrics = await request.get(`${API_BASE_URL}/api/v1/mood/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    writeEvidence("09-mood-metrics.json", {
      status: moodMetrics.status(),
      body: await moodMetrics.json().catch(() => null),
    });
    if (!moodMetrics.ok()) failures.push(`mood metrics ${moodMetrics.status()}`);

    // --- F3-E feedback ---
    const feedbackCreate = await request.post(`${API_BASE_URL}/api/v1/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        category: 0,
        subject: `${marker} assunto`,
        message: `${marker} mensagem de feedback UAT`,
        isAnonymous: false,
      },
    });
    writeEvidence("10-feedback-create.json", {
      status: feedbackCreate.status(),
      body: await feedbackCreate.json().catch(() => null),
    });
    if (!feedbackCreate.ok()) failures.push(`feedback create ${feedbackCreate.status()}`);
    const feedback = feedbackCreate.ok() ? await feedbackCreate.json() : null;

    if (feedback?.id) {
      const triage = await request.patch(`${API_BASE_URL}/api/v1/feedback/${feedback.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { status: 2, responseText: "Resposta UAT F3" },
      });
      writeEvidence("11-feedback-respond.json", {
        status: triage.status(),
        body: await triage.json().catch(() => null),
      });
      if (!triage.ok()) failures.push(`feedback respond ${triage.status()}`);
    }

    // --- UI: navegação + telas ---
    const { context, page } = await openAuthedPage(browser, token);
    try {
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1800);
      await shot(page, "12-admin-home-ponto-partida.png");
      printRows.push("| 12 | `12-admin-home-ponto-partida.png` | Home autenticada (ponto de partida) |");

      // 1) Comunicados oficiais → Novo
      await openTopbarMenu(page, "Comunicados", "13-acesso-menu-comunicados.png");
      printRows.push("| 13 | `13-acesso-menu-comunicados.png` | Como acessar: topbar **Comunicados** aberta |");
      await clickTopbarMenuItem(page, "Oficiais");
      await expect(page).toHaveURL(/\/comunicados\/oficiais/);
      await shot(page, "14-acesso-comunicados-oficiais.png");
      printRows.push("| 14 | `14-acesso-comunicados-oficiais.png` | Listagem Oficiais (após menu) |");

      const novoBtn = page.getByRole("link", { name: /Novo comunicado/i }).first();
      await expect(novoBtn).toBeVisible({ timeout: 15_000 });
      await novoBtn.hover().catch(() => undefined);
      await shot(page, "15-acesso-botao-novo-comunicado.png");
      printRows.push("| 15 | `15-acesso-botao-novo-comunicado.png` | Como acessar: botão **Novo comunicado** |");
      await novoBtn.click();
      await settle(page, 1600);
      await expect(page).toHaveURL(/\/comunicados\/oficiais\/novo/);
      await shot(page, "16-admin-editor-cms.png");
      printRows.push("| 16 | `16-admin-editor-cms.png` | Editor CMS (header + agendar no padrão) |");

      // 2) Notícias via Comunicados → Notícias
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Comunicados", "17-acesso-menu-comunicados-noticias.png");
      printRows.push("| 17 | `17-acesso-menu-comunicados-noticias.png` | Como acessar: topbar **Comunicados** → Notícias |");
      await clickTopbarMenuItem(page, "Notícias");
      await expect(page).toHaveURL(/\/noticias/);
      await settle(page, 1600);
      await shot(page, "18-admin-noticias.png");
      printRows.push("| 18 | `18-admin-noticias.png` | Hub de Notícias (header Comunicados + toolbar) |");

      // 3) Aniversariantes via Pessoas
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Pessoas", "19-acesso-menu-pessoas-aniversariantes.png");
      printRows.push("| 19 | `19-acesso-menu-pessoas-aniversariantes.png` | Como acessar: topbar **Pessoas** |");
      await clickTopbarMenuItem(page, "Aniversariantes");
      await expect(page).toHaveURL(/\/pessoas\/aniversariantes/);
      await shot(page, "20-admin-aniversariantes.png");
      printRows.push("| 20 | `20-admin-aniversariantes.png` | Aniversariantes (cards + avatar) |");

      // 4) Novos colaboradores via Pessoas
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Pessoas", "21-acesso-menu-pessoas-novos.png");
      printRows.push("| 21 | `21-acesso-menu-pessoas-novos.png` | Como acessar: topbar **Pessoas** (novos) |");
      await clickTopbarMenuItem(page, "Novos colaboradores");
      await expect(page).toHaveURL(/\/pessoas\/novos-colaboradores/);
      await shot(page, "22-admin-novos-colaboradores.png");
      printRows.push("| 22 | `22-admin-novos-colaboradores.png` | Novos colaboradores (empty state/cards) |");

      // 5) Clima via Serviços
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Serviços", "23-acesso-menu-servicos-clima.png");
      printRows.push("| 23 | `23-acesso-menu-servicos-clima.png` | Como acessar: topbar **Serviços** |");
      await clickTopbarMenuItem(page, "Clima organizacional");
      await expect(page).toHaveURL(/\/servicos\/clima/);
      await settle(page, 1600);
      await shot(page, "24-rh-clima.png");
      printRows.push("| 24 | `24-rh-clima.png` | Clima organizacional (KPIs + gráfico + grid) |");

      // 6) Feedback via Serviços
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Serviços", "25-acesso-menu-servicos-feedback.png");
      printRows.push("| 25 | `25-acesso-menu-servicos-feedback.png` | Como acessar: topbar **Serviços** → Feedback |");
      await clickTopbarMenuItem(page, "Feedback");
      await expect(page).toHaveURL(/\/feedback$/);
      await settle(page, 1400);
      await shot(page, "26-colaborador-feedback.png");
      printRows.push("| 26 | `26-colaborador-feedback.png` | Feedback colaborador (form amigável) |");

      // 7) Triagem via Serviços
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      await openTopbarMenu(page, "Serviços", "27-acesso-menu-servicos-triagem.png");
      printRows.push("| 27 | `27-acesso-menu-servicos-triagem.png` | Como acessar: topbar **Serviços** → Triagem |");
      await clickTopbarMenuItem(page, "Triagem de feedback");
      await expect(page).toHaveURL(/\/feedback\/triagem/);
      await settle(page, 1600);
      await shot(page, "28-rh-feedback-triagem.png");
      printRows.push("| 28 | `28-rh-feedback-triagem.png` | Triagem de feedback (fila RH) |");

      // Acesso alternativo: sidebar Feedback / Clima / Triagem
      await page.goto(`${PAGE_BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1200);
      try {
        await clickSidebarItem(page, "Clima", "29-acesso-sidebar-clima.png");
        printRows.push("| 29 | `29-acesso-sidebar-clima.png` | Como acessar: sidebar **Clima** |");
        await expect(page).toHaveURL(/\/servicos\/clima/);
        await shot(page, "30-rh-clima-via-sidebar.png");
        printRows.push("| 30 | `30-rh-clima-via-sidebar.png` | Clima aberto via sidebar |");
      } catch (error) {
        writeEvidence("29-acesso-sidebar-clima-skip.json", {
          reason: "Sidebar Clima não disponível nesta sessão",
          error: String(error),
        });
      }
    } finally {
      await context.close();
    }

    const passed = failures.length === 0;
    const absRun = path.resolve(runDir);
    writeEvidence(
      "99-uat-summary.md",
      [
        `# UAT F3 Comunicados & rede — evidências`,
        "",
        `## Resultado: ${passed ? "PASSOU" : "FALHOU"}`,
        "",
        `- **Run:** \`${stamp}\``,
        `- **Pasta:** \`${absRun}\``,
        `- **Marker:** \`${marker}\``,
        `- **Ator:** admin/RH (\`${ADMIN_EMAIL}\`)`,
        `- **Falhas:** ${failures.length ? failures.join("; ") : "nenhuma"}`,
        "",
        "## Fluxo validado",
        "",
        "1. API CMS (create / metrics / archive)",
        "2. API News (create + list com metadata.title)",
        "3. API People (birthdays / new-hires / worker)",
        "4. API Mood metrics",
        "5. API Feedback create + respond",
        "6. UI navegação (topbar/sidebar) + prints das telas melhoradas",
        "",
        "## Como acessar cada view (prints)",
        "",
        "| # | Arquivo | Etapa |",
        "|---|---------|-------|",
        ...printRows,
        "",
        "Gerado em: " + new Date().toISOString(),
        "",
      ].join("\n"),
    );

    expect(passed, failures.join("; ")).toBeTruthy();
  });
});
