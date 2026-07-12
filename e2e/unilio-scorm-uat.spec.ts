import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * UAT SCORM UniLio — upload do fixture rico → aprovação → runtime pass → complete → certificado.
 * Requer API + frontend locais e usuário com permissão de author/approve.
 */

const API_BASE_URL =
  process.env.LIO_API_BASE_URL ?? process.env.LIO_DEV_BASE_URL ?? "http://127.0.0.1:5148";
const PAGE_BASE_URL = process.env.LIO_PAGE_BASE_URL ?? "http://127.0.0.1:5173";
const ADMIN_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const ADMIN_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";

const ZIP_PATH = path.join(process.cwd(), "e2e", "fixtures", "unilio-scorm-demo.zip");
const EVIDENCE_ROOT = path.join("e2e", "evidence", "unilio-scorm-uat");

type LoginResponse = { accessToken: string };

function ensureEvidenceDir() {
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
}

function writeEvidence(name: string, content: string | object) {
  ensureEvidenceDir();
  const body = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(path.join(EVIDENCE_ROOT, name), body);
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

test.describe("UniLio SCORM UAT", () => {
  test("API: upload fixture → approve → runtime pass → complete → certificate", async ({
    request,
    browser,
  }) => {
    test.setTimeout(180_000);
    expect(fs.existsSync(ZIP_PATH), `fixture missing: ${ZIP_PATH}`).toBeTruthy();

    const token = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const auth = { Authorization: `Bearer ${token}` };
    const stamp = Date.now();
    const title = `UAT SCORM Segurança ${stamp}`;

    const createRes = await request.post(`${API_BASE_URL}/api/v1/unilio/authoring/courses`, {
      headers: auth,
      data: {
        title,
        description: "Curso SCORM de UAT — Cultura de Segurança da Informação.",
        contentType: "scorm",
        durationMinutes: 45,
        isMandatory: false,
        area: "TI",
        department: "Geral",
        instructorName: "UAT UniLio",
        provider: "Fixture UniLio",
        tags: ["scorm", "uat", "seguranca"],
        scormPassingScore: 70,
      },
    });
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const course = (await createRes.json()) as { id: string };
    writeEvidence("01-create-course.json", course);

    const uploadRes = await request.post(
      `${API_BASE_URL}/api/v1/unilio/authoring/courses/${course.id}/scorm-package`,
      {
        headers: auth,
        multipart: {
          file: {
            name: "unilio-scorm-demo.zip",
            mimeType: "application/zip",
            buffer: fs.readFileSync(ZIP_PATH),
          },
          passingScore: "70",
        },
      },
    );
    expect(uploadRes.ok(), await uploadRes.text()).toBeTruthy();
    const pkg = await uploadRes.json();
    writeEvidence("02-scorm-package.json", pkg);
    expect(pkg.launchUrl || pkg.LaunchUrl).toBeTruthy();

    const submitRes = await request.post(
      `${API_BASE_URL}/api/v1/unilio/authoring/courses/${course.id}/submit`,
      { headers: auth },
    );
    expect(submitRes.ok(), await submitRes.text()).toBeTruthy();

    const approveRes = await request.post(
      `${API_BASE_URL}/api/v1/unilio/authoring/courses/${course.id}/approve`,
      { headers: auth },
    );
    expect(approveRes.ok(), await approveRes.text()).toBeTruthy();

    const detailRes = await request.get(`${API_BASE_URL}/api/v1/unilio/courses/${course.id}`, {
      headers: auth,
    });
    expect(detailRes.ok()).toBeTruthy();
    const detail = (await detailRes.json()) as {
      modules: Array<{ id: string; contentType: string; contentUrl?: string }>;
    };
    writeEvidence("03-course-detail.json", detail);
    const moduleId = detail.modules[0]?.id;
    expect(moduleId).toBeTruthy();

    await request.post(`${API_BASE_URL}/api/v1/unilio/courses/${course.id}/start`, {
      headers: auth,
    });

    const runtimeGet = await request.get(
      `${API_BASE_URL}/api/v1/unilio/courses/${course.id}/scorm/runtime`,
      { headers: auth },
    );
    expect(runtimeGet.ok(), await runtimeGet.text()).toBeTruthy();
    writeEvidence("04-runtime-get.json", await runtimeGet.json());

    const runtimePut = await request.put(
      `${API_BASE_URL}/api/v1/unilio/courses/${course.id}/scorm/runtime`,
      {
        headers: auth,
        data: {
          lessonStatus: "passed",
          scoreRaw: 80,
          scoreMin: 0,
          scoreMax: 100,
          lessonLocation: "quiz",
          suspendData: JSON.stringify({ currentModule: "quiz", completedModules: ["m1"] }),
          finish: true,
        },
      },
    );
    expect(runtimePut.ok(), await runtimePut.text()).toBeTruthy();
    const runtime = (await runtimePut.json()) as {
      courseCompletable?: boolean;
      CourseCompletable?: boolean;
    };
    writeEvidence("05-runtime-pass.json", runtime);
    expect(runtime.courseCompletable ?? runtime.CourseCompletable).toBeTruthy();

    const completeRes = await request.post(
      `${API_BASE_URL}/api/v1/unilio/courses/${course.id}/modules/${moduleId}/complete`,
      {
        headers: auth,
        data: { contentRating: 5, feedbackComment: "UAT SCORM OK" },
      },
    );
    expect(completeRes.ok(), await completeRes.text()).toBeTruthy();
    writeEvidence("06-complete.json", await completeRes.json());

    const certsRes = await request.get(`${API_BASE_URL}/api/v1/unilio/certificates`, {
      headers: auth,
    });
    expect(certsRes.ok()).toBeTruthy();
    const certs = (await certsRes.json()) as {
      items?: Array<{ courseId?: string; CourseId?: string; title?: string }>;
      Items?: Array<{ courseId?: string; CourseId?: string }>;
    };
    writeEvidence("07-certificates.json", certs);
    const items = certs.items ?? certs.Items ?? [];
    const hasCert = items.some(
      (c) => String(c.courseId ?? c.CourseId ?? "") === String(course.id),
    );
    expect(hasCert, "certificado SCORM não emitido").toBeTruthy();

    const { context, page } = await openAuthedPage(browser, token);
    try {
      await page.goto(`${PAGE_BASE_URL}/unilio/curso/${course.id}?uat=1`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(EVIDENCE_ROOT, "08-player.png"),
        fullPage: true,
      });
      await page.goto(`${PAGE_BASE_URL}/unilio/certificados`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(EVIDENCE_ROOT, "09-certificados.png"),
        fullPage: true,
      });
    } finally {
      await context.close();
    }
  });
});
