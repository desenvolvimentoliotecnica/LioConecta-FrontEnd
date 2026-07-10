import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const EMPLOYEE_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const EMPLOYEE_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_ROOT = path.join("e2e", "evidence", "grupos-uat");
const LEONARDO_PERSON_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103";

let evidenceRunDir = EVIDENCE_ROOT;

type LoginResponse = { accessToken: string };
type MeDto = { id: string; email: string; name: string; permissions?: { key: string }[] };
type GroupDto = {
  id: string;
  name: string;
  status: number;
  isMember: boolean;
  myRole?: number | null;
  memberCount: number;
  postCount: number;
  topicCount: number;
  approver?: { id: string; name: string } | null;
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

/** Single-login UAT: reassign ApproverId to the logged-in user so pending-for-me works. */
function reassignApproverToLeonardo(groupId: string) {
  const sql = `UPDATE groups SET "ApproverId" = '${LEONARDO_PERSON_ID}' WHERE "Id" = '${groupId}';`;
  const sqlFile = path.join(evidenceRunDir, "00-reassign-approver.sql");
  fs.writeFileSync(sqlFile, sql, "utf8");
  execFileSync(
    "psql",
    ["-h", "localhost", "-p", "5433", "-U", "lioconecta", "-d", "lioconecta", "-f", sqlFile],
    {
      env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "lioconecta_dev" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

async function apiGetGroup(request: APIRequestContext, token: string, id: string) {
  const res = await request.get(`${API_BASE_URL}/api/v1/groups/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok(), `GET group ${id} failed: ${res.status()}`).toBeTruthy();
  return (await res.json()) as GroupDto;
}

test.describe("UAT — Grupos (comunidades Orkut-like)", () => {
  test.use({ ignoreHTTPSErrors: true });

  test("criar → aprovar → mural → tópicos → membros", async ({ browser, request }) => {
    test.setTimeout(300_000);
    const { stamp: runStamp } = createEvidenceRun();
    const marker = `E2E-GRUPOS-${Date.now()}`;
    let verdict = "PASSOU";
    let groupId = "";
    let failReason = "";

    try {
      const token = await login(request, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
      const meResponse = await request.get(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(meResponse.ok()).toBeTruthy();
      const me = (await meResponse.json()) as MeDto;
      writeEvidence("00-colaborador-me.json", me);
      expect(
        me.permissions?.some((p) => p.key === "groups.create"),
        "usuário precisa de groups.create",
      ).toBeTruthy();

      const { context, page } = await openAuthedPage(browser, token);

      try {
        // 1) Hub
        await page.goto(`${PAGE_BASE_URL}/grupos`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("01-colaborador-hub.png"), fullPage: true });

        // 2) Criar grupo
        await page.goto(`${PAGE_BASE_URL}/grupos/criar`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("02-colaborador-criar-vazio.png"), fullPage: true });

        const nameInput = page.locator('input[name="name"], #group-name, input[placeholder*="nome" i]').first();
        await nameInput.fill(marker);
        const desc = page.locator('textarea[name="description"], #group-description, textarea').first();
        if (await desc.count()) {
          await desc.fill(`Grupo UAT Orkut-like ${marker}`);
        }
        await page.screenshot({ path: evidencePath("03-colaborador-criar-preenchido.png"), fullPage: true });

        const submit = page.getByRole("button", { name: /criar|enviar|solicitar/i }).first();
        await submit.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: evidencePath("04-colaborador-criar-resultado.png"), fullPage: true });

        const createdRes = await request.get(`${API_BASE_URL}/api/v1/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(createdRes.ok()).toBeTruthy();
        const mine = (await createdRes.json()) as GroupDto[];
        const created = mine.find((g) => g.name === marker);
        expect(created, "grupo criado deve aparecer em Meus grupos (API)").toBeTruthy();
        groupId = created!.id;
        writeEvidence("04-group-created-api.json", created!);
        expect(created!.status).toBe(0);

        // 3) Meus grupos — pendente
        await page.goto(`${PAGE_BASE_URL}/grupos/meus-grupos`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("05-colaborador-meus-grupos-pendente.png"), fullPage: true });

        // 4) Reassign approver (single-login) + aprovar
        reassignApproverToLeonardo(groupId);
        writeEvidence("06-approver-reassigned.json", {
          groupId,
          note: "ApproverId apontado para Leonardo para UAT single-login (gestor simulado)",
        });

        await page.goto(`${PAGE_BASE_URL}/grupos/aprovacoes`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("07-gestor-aprovacoes.png"), fullPage: true });

        const approveApi = await request.post(`${API_BASE_URL}/api/v1/groups/${groupId}/approve`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        writeEvidence("07b-approve-api.json", {
          status: approveApi.status(),
          body: approveApi.ok() ? await approveApi.json() : await approveApi.text(),
        });
        expect(approveApi.ok(), "approve API deve funcionar após reassign").toBeTruthy();

        await page.reload({ waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("08-gestor-apos-aprovar.png"), fullPage: true });

        const approved = await apiGetGroup(request, token, groupId);
        writeEvidence("08-group-approved-api.json", approved);
        expect(approved.status).toBe(1);

        // 5) Explorar + abrir grupo
        await page.goto(`${PAGE_BASE_URL}/grupos/explorar`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("09-colaborador-explorar.png"), fullPage: true });

        await page.goto(`${PAGE_BASE_URL}/grupos/${groupId}`, { waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("10-colaborador-detalhe-mural.png"), fullPage: true });

        // 6) Post no mural
        const wallComposer = page.locator("textarea").first();
        if (await wallComposer.count()) {
          await wallComposer.fill(`Olá comunidade — post mural ${marker}`);
          const postBtn = page.getByRole("button", { name: /publicar|postar|enviar/i }).first();
          if (await postBtn.count()) {
            await postBtn.click();
            await page.waitForTimeout(1200);
          }
        } else {
          const wallApi = await request.post(`${API_BASE_URL}/api/v1/groups/${groupId}/wall`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { content: `Olá comunidade — post mural ${marker}` },
          });
          writeEvidence("11b-wall-api.json", {
            status: wallApi.status(),
            body: wallApi.ok() ? await wallApi.json() : await wallApi.text(),
          });
          expect(wallApi.ok()).toBeTruthy();
          await page.reload({ waitUntil: "networkidle" });
        }
        await page.screenshot({ path: evidencePath("11-colaborador-mural-post.png"), fullPage: true });

        // 7) Tópicos
        const topicsTab = page.getByRole("button", { name: /t[oó]picos/i }).or(page.getByRole("tab", { name: /t[oó]picos/i }));
        if (await topicsTab.count()) {
          await topicsTab.first().click();
          await page.waitForTimeout(500);
        } else {
          await page.goto(`${PAGE_BASE_URL}/grupos/${groupId}?tab=topicos`, { waitUntil: "networkidle" });
        }
        await page.screenshot({ path: evidencePath("12-colaborador-topicos.png"), fullPage: true });

        const topicTitle = `Tópico UAT ${marker}`;
        const topicApi = await request.post(`${API_BASE_URL}/api/v1/groups/${groupId}/topics`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { title: topicTitle, body: `Discussão inicial do ${marker}` },
        });
        writeEvidence("13-topic-created-api.json", {
          status: topicApi.status(),
          body: topicApi.ok() ? await topicApi.json() : await topicApi.text(),
        });
        expect(topicApi.ok(), "criar tópico via API").toBeTruthy();
        const topic = (await topicApi.json()) as { id: string };
        const replyApi = await request.post(
          `${API_BASE_URL}/api/v1/groups/${groupId}/topics/${topic.id}/replies`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { body: `Resposta UAT ${marker}` },
          },
        );
        writeEvidence("14-topic-reply-api.json", {
          status: replyApi.status(),
          body: replyApi.ok() ? await replyApi.json() : await replyApi.text(),
        });
        expect(replyApi.ok()).toBeTruthy();

        await page.reload({ waitUntil: "networkidle" });
        await page.screenshot({ path: evidencePath("15-colaborador-topico-thread.png"), fullPage: true });

        // 8) Membros
        const membersTab = page.getByRole("button", { name: /membros/i }).or(page.getByRole("tab", { name: /membros/i }));
        if (await membersTab.count()) {
          await membersTab.first().click();
          await page.waitForTimeout(500);
        } else {
          await page.goto(`${PAGE_BASE_URL}/grupos/${groupId}?tab=membros`, { waitUntil: "networkidle" });
        }
        await page.screenshot({ path: evidencePath("16-colaborador-membros.png"), fullPage: true });

        const membersApi = await request.get(`${API_BASE_URL}/api/v1/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        writeEvidence("16-members-api.json", {
          status: membersApi.status(),
          body: membersApi.ok() ? await membersApi.json() : await membersApi.text(),
        });
        expect(membersApi.ok()).toBeTruthy();

        // 9) Join em grupo seed (explorar)
        const exploreApi = await request.get(`${API_BASE_URL}/api/v1/groups/explore`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const explore = (await exploreApi.json()) as GroupDto[];
        const joinTarget = explore.find((g) => !g.isMember && g.id !== groupId);
        writeEvidence("17-explore-api.json", { count: explore.length, joinTarget });
        if (joinTarget) {
          const joinRes = await request.post(`${API_BASE_URL}/api/v1/groups/${joinTarget.id}/join`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          writeEvidence("18-join-api.json", {
            status: joinRes.status(),
            body: joinRes.ok() ? await joinRes.json() : await joinRes.text(),
          });
          expect(joinRes.ok()).toBeTruthy();
          await page.goto(`${PAGE_BASE_URL}/grupos/${joinTarget.id}`, { waitUntil: "networkidle" });
          await page.screenshot({ path: evidencePath("19-colaborador-grupo-seed-apos-join.png"), fullPage: true });
        }

        const finalGroup = await apiGetGroup(request, token, groupId);
        writeEvidence("20-group-final-api.json", finalGroup);
        expect(finalGroup.status).toBe(1);
        expect(finalGroup.postCount).toBeGreaterThanOrEqual(1);
        expect(finalGroup.topicCount).toBeGreaterThanOrEqual(1);
      } finally {
        await context.close();
      }
    } catch (err) {
      verdict = "FALHOU";
      failReason = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      writeEvidence(
        "21-uat-summary.md",
        `# UAT Grupos (comunidades) — evidências

## Resultado: ${verdict}

- **Run:** \`${runStamp}\`
- **Marker:** \`${marker}\`
- **GroupId:** \`${groupId || "—"}\`
- **Atores:** colaborador/gestor simulado (Leonardo; ApproverId reassigned para single-login)
${failReason ? `- **Erro:** ${failReason}` : ""}

## Fluxo validado

1. Hub Grupos
2. Criar grupo (sempre pendente)
3. Meus grupos — status pendente
4. Reassign ApproverId → Leonardo (fixture UAT)
5. Aprovar em /grupos/aprovacoes
6. Página do grupo — mural (post)
7. Tópicos (criar + responder)
8. Membros
9. Join em grupo seed (quando disponível)

## Observações

- Entrada em grupo ativo é livre (sem aprovação de membership).
- Aprovação de **criação** é do gestor direto; neste run o ApproverId foi reatribuído para permitir UAT com um único login.
`,
      );
    }
  });
});
