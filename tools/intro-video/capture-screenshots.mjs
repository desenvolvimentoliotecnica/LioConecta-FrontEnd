import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  DEV_PORT,
  MODULES,
  ROOT,
  SCREENSHOTS_DIR,
  WIDTH,
  HEIGHT,
} from "./config.mjs";

const ME = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "TI",
  roles: ["Admin"],
};

const HELP_DESK_AREAS = [
  { id: "ti", name: "Área TI", icon: "laptop", serviceCount: 21, entityId: 1 },
  { id: "custo", name: "Área CUSTO", icon: "money", serviceCount: 1, entityId: 1 },
  { id: "pricing", name: "Área PRINCING", icon: "clipboard", serviceCount: 6, entityId: 1 },
  { id: "financeira", name: "Área Financeira", icon: "money", serviceCount: 2, entityId: 1 },
];

const TI_CATEGORIES = [
  "Armazenamento",
  "Backup e Recuperação",
  "Cloud e DevOps",
  "Compras e Licenças",
  "Comunicação e Colaboração",
  "Conformidade e Auditoria",
  "Documentação e Treinamento",
  "Equipamentos do Usuário",
  "Identidade e Acessos",
  "Impressão e Digitalização",
  "Incidentes",
  "Infraestrutura e Servidores",
  "ITSM / GLPI",
  "Mobilidade",
  "Projetos De Dados",
  "Projetos de Infraestrutura",
  "Projetos De Sistemas",
  "Projetos e Mudanças",
  "Rede e Conectividade",
  "Segurança da Informação",
  "Sistemas Corporativos",
].map((name, index) => ({
  id: index + 1,
  name,
  fullName: name,
  parentId: null,
  hasChildren: true,
  entityId: 1,
}));

async function setupApiMocks(page) {
  await page.route("**/health", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "Healthy" }) });
  });

  await page.route("**/api/v1/me**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ME) });
  });

  await page.route("**/api/v1/me/preferences**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ bookmarks: [] }) });
  });

  await page.route("**/api/v1/notifications**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.route("**/api/v1/calendar/bootstrap", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        enabled: true,
        delegatedScopes: ["Calendars.Read"],
        defaultView: "dayGridMonth",
        showBirthdays: true,
        showCafeteriaMenu: true,
        msalClientId: "",
        msalTenantId: "",
        msalAuthority: "",
      }),
    });
  });

  await page.route("**/api/v1/calendar/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ linked: false, needsConsent: false }),
    });
  });

  await page.route("**/api/v1/calendar/calendars**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/calendar/events**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/api/v1/birthdays**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "1", name: "Maria Silva", date: "2026-07-15", departmentName: "RH", photoUrl: "/avatar-maria-silva.png" },
        { id: "2", name: "Carlos Mendes", date: "2026-07-22", departmentName: "Comercial", photoUrl: "/avatar-carlos-mendes.png" },
      ]),
    });
  });

  await page.route("**/api/v1/facilities/menu**", async (route) => {
    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "not found" }) });
  });

  await page.route("**/api/v1/ti/help-desk/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ openTickets: 2, avgResponseLabel: "2h" }),
    });
  });

  await page.route("**/api/v1/ti/help-desk/services", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "abrir-chamado",
          title: "Abrir chamado",
          desc: "Registre um novo incidente ou solicitação.",
          category: "incidente",
          provider: "Portal GLPI",
          status: "disponivel",
          featured: true,
          action: "modal",
          helpText: "Abra um ticket no GLPI pelo assistente em três passos.",
          portalUrl: null,
        },
      ]),
    });
  });

  await page.route("**/api/v1/ti/help-desk/areas", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(HELP_DESK_AREAS) });
  });

  await page.route("**/api/v1/ti/help-desk/categories**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(TI_CATEGORIES) });
  });

  await page.route("**/api/v1/comunicados/hub**", async (route) => {
    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "not found" }) });
  });
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npm",
      ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(DEV_PORT)],
      {
        cwd: ROOT,
        shell: true,
        env: {
          ...process.env,
          VITE_USE_MOCK: "false",
          VITE_AUTH_MODE: "portal",
          VITE_API_BASE_URL: "/api/v1",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let ready = false;
    const timeout = setTimeout(() => {
      if (!ready) reject(new Error("Dev server timeout"));
    }, 60_000);

    const onData = (chunk) => {
      const text = chunk.toString();
      if (text.includes("Local:") || text.includes(`127.0.0.1:${DEV_PORT}`)) {
        ready = true;
        clearTimeout(timeout);
        resolve(child);
      }
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", reject);
  });
}

export async function captureScreenshots() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  let devServer;
  const baseUrl = `http://127.0.0.1:${DEV_PORT}`;

  if (!process.env.INTRO_SKIP_DEV_SERVER) {
    console.log("Iniciando dev server...");
    devServer = await startDevServer();
    await new Promise((r) => setTimeout(r, 2500));
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await setupApiMocks(page);

  for (const mod of MODULES) {
    console.log(`Capturando: ${mod.title} (${mod.path})`);
    await page.goto(`${baseUrl}${mod.path}`, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1200);

    if (mod.id === "feed") {
      await page.evaluate(() => window.scrollTo(0, 280));
      await page.waitForTimeout(400);
    }

    const filePath = join(SCREENSHOTS_DIR, `${mod.id}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  → ${filePath}`);
  }

  await context.close();
  await browser.close();
  devServer?.kill("SIGTERM");

  return MODULES.map((m) => join(SCREENSHOTS_DIR, `${m.id}.png`));
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("capture-screenshots.mjs")) {
  captureScreenshots().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
