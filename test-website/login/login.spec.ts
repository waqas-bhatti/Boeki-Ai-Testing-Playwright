import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { InvoiceUploadPage } from "../pages/InvoiceUploadPage.js";
import { LoginData } from "../test-data/testData.js";

test.describe("Boekie Login", () => {
  test("Login and navigate to Invoice & Receipts", async ({ page }) => {
    const login = new LoginPage(page);
    const invoice = new InvoiceUploadPage(page);

    // Open Login Page
    await login.navigate();

    // Login
    await login.login(LoginData.email, LoginData.password);

    // Verify Dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Open Invoice & Receipts page
    await (invoice as any).open();

    // Verify page
    await expect(page).toHaveURL(/invoices-receipts/);

    // Optional: Verify upload section is visible
    await expect(page.getByText(/Drop your files here/i)).toBeVisible();
  });
});
