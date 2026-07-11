import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
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

test.describe("UAT F3 — Comunicados & rede", () => {
  test.setTimeout(300_000);

  test("CMS, notícias, pessoas, clima e feedback com evidências", async ({ request, browser }) => {
    const { stamp, runDir } = createEvidenceRun();
    const marker = `E2E-F3-${Date.now()}`;
    const failures: string[] = [];

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
      data: { type: 4, content: `${marker} Notícia F3`, metadata: null },
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

    // Trigger new-hire worker (best effort)
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

    // --- UI screenshots ---
    const { context, page } = await openAuthedPage(browser, token);
    try {
      await page.goto(`${PAGE_BASE_URL}/comunicados/oficiais/novo`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("12-admin-editor-cms.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/noticias`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("13-admin-noticias.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/pessoas/aniversariantes`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("14-admin-aniversariantes.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/pessoas/novos-colaboradores`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("15-admin-novos-colaboradores.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/servicos/clima`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("16-rh-clima.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/feedback`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: evidencePath("17-colaborador-feedback.png"), fullPage: true });

      await page.goto(`${PAGE_BASE_URL}/feedback/triagem`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: evidencePath("18-rh-feedback-triagem.png"), fullPage: true });
    } finally {
      await context.close();
    }

    const passed = failures.length === 0;
    writeEvidence(
      "99-uat-summary.md",
      [
        `# UAT F3 Comunicados & rede — ${passed ? "PASSOU" : "FALHOU"}`,
        "",
        `- Run: \`${stamp}\``,
        `- Pasta: \`${runDir}\``,
        `- Marker: \`${marker}\``,
        `- Falhas: ${failures.length ? failures.join("; ") : "nenhuma"}`,
        "",
        "## Cobertura",
        "- CMS create/metrics/archive",
        "- News create + list",
        "- Birthdays / new-hires + worker trigger",
        "- Mood metrics",
        "- Feedback create + respond",
        "- Screenshots das telas React",
        "",
      ].join("\n"),
    );

    expect(passed, failures.join("; ")).toBeTruthy();
  });
});
