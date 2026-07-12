import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "wiki-uat");

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; permissions?: { key: string }[] };
type WikiArticleListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: number;
  url: string;
};
type WikiArticleDto = WikiArticleListItem & {
  bodyHtml: string;
};
type HelpDeskKnowledgeArticle = {
  id: string;
  title: string;
  summary: string;
  category: string;
  url: string;
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

test.describe("UAT — Wiki (Documentos + Help Desk + CMS)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test("hub → busca → leitura → help desk → CMS create/publish/edit", async ({
    browser,
    request,
  }) => {
    test.setTimeout(300_000);
    const { stamp: runStamp } = createEvidenceRun();
    const marker = `E2E-WIKI-${Date.now()}`;
    let verdict = "PASSOU";
    let failReason = "";
    let createdSlug = "";
    let createdId = "";

    try {
      const token = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const meResponse = await request.get(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(meResponse.ok()).toBeTruthy();
      const me = (await meResponse.json()) as MeDto;
      writeEvidence("00-colaborador-me.json", me);

      const articlesRes = await request.get(`${API_BASE_URL}/api/v1/wiki/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(articlesRes.ok(), `GET wiki articles: ${articlesRes.status()}`).toBeTruthy();
      const seededArticles = (await articlesRes.json()) as WikiArticleListItem[];
      writeEvidence("00-wiki-articles-api.json", seededArticles);
      expect(seededArticles.length, "deve haver artigos seedados").toBeGreaterThanOrEqual(6);

      const knowledgeRes = await request.get(`${API_BASE_URL}/api/v1/ti/help-desk/knowledge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(knowledgeRes.ok()).toBeTruthy();
      const knowledge = (await knowledgeRes.json()) as HelpDeskKnowledgeArticle[];
      writeEvidence("00-helpdesk-knowledge-api.json", knowledge);
      expect(knowledge.every((a) => a.url.startsWith("/documentos/wiki/"))).toBeTruthy();

      const canManage = me.permissions?.some((p) => p.key === "wiki.manage") ?? false;
      writeEvidence("00-wiki-manage-flag.json", { canManage, marker });

      const { context, page } = await openAuthedPage(browser, token);

      try {
        // 1) Hub Documentos
        await page.goto(`${PAGE_BASE_URL}/documentos`, { waitUntil: "networkidle" });
        await expect(page.locator("main").getByRole("link", { name: /Wiki/i }).first()).toBeVisible({
          timeout: 15_000,
        });
        await page.screenshot({ path: evidencePath("01-colaborador-documentos-hub.png"), fullPage: true });

        // 2) Hub Wiki
        await page.goto(`${PAGE_BASE_URL}/documentos/wiki`, { waitUntil: "networkidle" });
        await expect(page.locator("main").getByRole("heading", { name: "Wiki", level: 1 })).toBeVisible({
          timeout: 20_000,
        });
        await expect(
          page.locator("main").getByRole("heading", { name: /VPN instável/i }),
        ).toBeVisible({ timeout: 20_000 });
        await page.screenshot({ path: evidencePath("02-colaborador-wiki-hub.png"), fullPage: true });

        // 3) Busca VPN
        await page.locator('main input[type="search"]').fill("VPN");
        await page.waitForTimeout(600);
        await expect(
          page.locator("main").getByRole("heading", { name: /VPN instável/i }),
        ).toBeVisible({ timeout: 10_000 });
        await page.screenshot({ path: evidencePath("03-colaborador-wiki-busca-vpn.png"), fullPage: true });

        // 4) Leitura artigo seed
        await page.goto(`${PAGE_BASE_URL}/documentos/wiki/vpn-instavel`, { waitUntil: "networkidle" });
        await expect(
          page.locator("main").getByRole("heading", { name: /VPN instável/i }).first(),
        ).toBeVisible({ timeout: 15_000 });
        await page.screenshot({ path: evidencePath("04-colaborador-wiki-artigo-vpn.png"), fullPage: true });

        // 5) Help Desk modal
        await page.goto(`${PAGE_BASE_URL}/servicos/help-desk`, { waitUntil: "networkidle" });
        const kbArticle = page.locator("main article").filter({ hasText: /Base de conhecimento/i }).first();
        await expect(kbArticle).toBeVisible({ timeout: 15_000 });
        await kbArticle.getByRole("button", { name: /^Acessar$/i }).click();
        await expect(page.getByRole("dialog", { name: /Base de conhecimento/i })).toBeVisible({
          timeout: 10_000,
        });
        await expect(page.getByRole("dialog").getByText(/VPN instável/i).first()).toBeVisible({
          timeout: 10_000,
        });
        await page.screenshot({
          path: evidencePath("05-colaborador-helpdesk-modal-kb.png"),
          fullPage: true,
        });

        // 6) Abrir Wiki do modal
        await page.getByRole("button", { name: /Abrir Wiki/i }).click();
        await page.waitForURL(/\/documentos\/wiki\/?$/, { timeout: 15_000 });
        await expect(page.locator("main").getByRole("heading", { name: "Wiki", level: 1 })).toBeVisible();
        await page.screenshot({
          path: evidencePath("06-colaborador-modal-abrir-wiki.png"),
          fullPage: true,
        });

        // 7) Artigo via modal
        await page.goto(`${PAGE_BASE_URL}/servicos/help-desk`, { waitUntil: "networkidle" });
        const kbArticle2 = page.locator("main article").filter({ hasText: /Base de conhecimento/i }).first();
        await kbArticle2.getByRole("button", { name: /^Acessar$/i }).click();
        await expect(page.getByRole("dialog").getByText(/Redefinir senha/i).first()).toBeVisible({
          timeout: 10_000,
        });
        await page.getByRole("dialog").getByRole("button", { name: /Redefinir senha de rede/i }).click();
        await page.waitForURL(/\/documentos\/wiki\/reset-senha/, { timeout: 15_000 });
        await page.screenshot({
          path: evidencePath("07-colaborador-modal-artigo-interno.png"),
          fullPage: true,
        });

        // 8) CMS (se tiver manage)
        if (canManage) {
          await page.goto(`${PAGE_BASE_URL}/documentos/wiki/novo`, { waitUntil: "networkidle" });
          await page.screenshot({ path: evidencePath("08-admin-wiki-novo.png"), fullPage: true });

          await page.locator(".wiki-editor__field input[type='text']").first().fill(marker);
          await page.locator(".wiki-editor__field textarea").first().fill(`Artigo UAT gerado automaticamente — ${marker}`);
          await page.locator(".wiki-editor__field select").first().selectOption("software");

          const editor = page.locator(".ProseMirror").first();
          await editor.click();
          await page.keyboard.type(`Conteudo UAT ${marker}`);

          await page.getByRole("button", { name: /Salvar rascunho/i }).click();
          await page.waitForURL(/\/documentos\/wiki\/(?!novo).+/, { timeout: 20_000 });
          createdSlug = page.url().split("/documentos/wiki/")[1]?.split(/[?#]/)[0] ?? "";
          await page.screenshot({
            path: evidencePath("09-admin-wiki-rascunho-criado.png"),
            fullPage: true,
          });

          // Publish via API (draft create), then open published article
          const listManage = await request.get(
            `${API_BASE_URL}/api/v1/wiki/articles?manage=true&q=${encodeURIComponent(marker)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const found = (await listManage.json()) as WikiArticleListItem[];
          const article = found.find((a) => a.title.includes(marker));
          expect(article, "artigo CMS deve existir").toBeTruthy();
          createdId = article!.id;
          createdSlug = article!.slug;
          const pub = await request.post(`${API_BASE_URL}/api/v1/wiki/articles/${createdId}/publish`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          expect(pub.ok(), `publish failed: ${pub.status()}`).toBeTruthy();
          writeEvidence("09b-wiki-publish-api.json", await pub.json());

          await page.goto(`${PAGE_BASE_URL}/documentos/wiki`, { waitUntil: "networkidle" });
          await page.locator('main input[type="search"]').fill(marker);
          await page.waitForTimeout(600);
          await expect(page.locator("main").getByText(marker).first()).toBeVisible({ timeout: 10_000 });
          await page.screenshot({
            path: evidencePath("10-admin-wiki-lista-publicado.png"),
            fullPage: true,
          });

          await page.goto(`${PAGE_BASE_URL}/documentos/wiki/${createdSlug}/editar`, {
            waitUntil: "networkidle",
          });
          await page.locator(".wiki-editor__field textarea").first().fill(`Editado UAT — ${marker}`);
          await page.getByRole("button", { name: /Salvar alterações|Salvar alteracoes/i }).click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: evidencePath("11-admin-wiki-editado.png"),
            fullPage: true,
          });

          const arch = await request.post(`${API_BASE_URL}/api/v1/wiki/articles/${createdId}/archive`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          writeEvidence("12-wiki-archive-api.json", {
            status: arch.status(),
            body: arch.ok() ? await arch.json() : await arch.text(),
          });
        } else {
          writeEvidence("08-admin-wiki-skipped.json", {
            reason: "Usuário sem wiki.manage — CMS UI pulado",
          });
        }
      } finally {
        await context.close();
      }
    } catch (error) {
      verdict = "FALHOU";
      failReason = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      writeEvidence("99-uat-summary.md", `# UAT Wiki — evidências

## Resultado: ${verdict}

- **Run:** \`${runStamp}\`
- **Marker:** ${marker}
- **CreatedSlug:** ${createdSlug || "—"}
- **CreatedId:** ${createdId || "—"}
- **Atores:** colaborador (${EMPLOYEE_EMAIL})
${failReason ? `\n## Falha\n\n${failReason}\n` : ""}
## Fluxo validado

1. Hub Documentos com card Wiki
2. Hub Wiki com artigos seedados
3. Busca VPN
4. Leitura vpn-instavel
5. Help Desk modal Base de conhecimento
6. Abrir Wiki → /documentos/wiki
7. Artigo interno via modal
8. CMS create/publish/edit (se wiki.manage)

Gerado em: ${new Date().toISOString()}
`);
    }
  });
});
