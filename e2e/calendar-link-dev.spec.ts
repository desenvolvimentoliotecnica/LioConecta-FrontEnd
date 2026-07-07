import { test, expect } from "@playwright/test";
import path from "node:path";

const DEV_BASE_URL = process.env.LIO_DEV_BASE_URL ?? "http://10.0.0.79:8092";
const DEV_EMAIL = process.env.LIO_DEV_LOGIN_EMAIL ?? "leonardo.mendes@liotecnica.com.br";
const DEV_PASSWORD = process.env.LIO_DEV_LOGIN_PASSWORD ?? "ChangeMe@2026";
const EVIDENCE_DIR = path.join("e2e", "evidence", "calendar-link");

test.describe("Calendário — sessão portal e link-account API", () => {
  test("login, bootstrap e link-account sem refresh token MSAL", async ({ page, request }) => {
    test.setTimeout(60_000);
    const loginResponse = await request.post(`${DEV_BASE_URL}/api/v1/auth/login`, {
      data: { email: DEV_EMAIL, password: DEV_PASSWORD },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const login = await loginResponse.json();
    expect(login.accessToken).toBeTruthy();

    const authHeaders = { Authorization: `Bearer ${login.accessToken}` };

    const bootstrapResponse = await request.get(`${DEV_BASE_URL}/api/v1/calendar/bootstrap`, {
      headers: authHeaders,
    });
    expect(bootstrapResponse.ok()).toBeTruthy();
    const bootstrap = await bootstrapResponse.json();
    expect(bootstrap.enabled).toBeTruthy();
    expect(bootstrap.msalClientId).toBeTruthy();

    const linkResponse = await request.post(`${DEV_BASE_URL}/api/v1/calendar/link-account`, {
      headers: { ...authHeaders, "Content-Type": "application/json" },
      data: {
        accessToken: "e2e-test-access-token",
        refreshToken: "",
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        scopes: ["Calendars.ReadWrite", "User.Read", "offline_access"],
      },
    });
    expect(linkResponse.status()).toBe(204);

    const statusResponse = await request.get(`${DEV_BASE_URL}/api/v1/calendar/status`, {
      headers: authHeaders,
    });
    expect(statusResponse.ok()).toBeTruthy();
    const status = await statusResponse.json();
    expect(status.linked).toBeTruthy();

    const negotiateResponse = await request.post(
      `${DEV_BASE_URL}/hubs/notifications/negotiate?negotiateVersion=1`,
      { headers: authHeaders },
    );
    expect(negotiateResponse.ok()).toBeTruthy();

    await request.delete(`${DEV_BASE_URL}/api/v1/calendar/link-account`, { headers: authHeaders });

    await page.addInitScript(
      ({ tokenKey, token }) => {
        sessionStorage.setItem(tokenKey, token);
      },
      { tokenKey: "lioconecta.auth.token", token: login.accessToken },
    );

    await page.goto(`${DEV_BASE_URL}/calendario`);
    await expect(page.getByRole("heading", { name: /calend[aá]rio/i })).toBeVisible({ timeout: 20_000 });

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "calendar-authenticated.png"),
      fullPage: true,
    });
  });
});
