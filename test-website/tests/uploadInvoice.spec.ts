import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { UploadInvoicePage } from "../pages/UploadInvoicePage.js";
import { LoginData } from "../test-data/testData.js";
import { TaskPage } from "../pages/TasksPage.js";

test("Login and Upload Invoice", async ({ page }) => {
  const login = new LoginPage(page);
  const invoice = new UploadInvoicePage(page);
  const task = new TaskPage(page);

  await login.navigate();

  await login.login(LoginData.email, LoginData.password);

  // Verify login succeeded
  await login.verifyDashboard();

  // Now go to Invoice page
  await invoice.open();

  // Upload the first supported file from fixtures
  await invoice.uploadInvoice();

  // Open Tasks page
  await task.open();

  // Click the uploaded invoice
  await task.openFirstInvoice();

  // Click Confirm
  await task.confirmInvoice();
});
