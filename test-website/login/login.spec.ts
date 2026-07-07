import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { LoginData } from "../test-data/testData.js";

test.describe("Boekie Login", () => {
  test("User can login successfully", async ({ page }) => {
    const login = new LoginPage(page);

    await login.navigate();

    await login.login(LoginData.email, LoginData.password);

    await login.verifyDashboard();

    // Stay on the dashboard for 6 seconds
    await page.waitForTimeout(6000);
  });
});
