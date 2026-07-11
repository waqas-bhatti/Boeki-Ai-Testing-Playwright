import { test, expect } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage.js";
import { AISettingsPage } from "../pages/AISettingsPage.js";
import { UploadInvoicePage } from "../pages/UploadInvoicePage.js";
import { AuditTrailPage } from "../pages/AuditTrailPage.js";

import { LoginData } from "../test-data/testData.js";

test("Automatic Invoice Processing", async ({ page }) => {
  const login = new LoginPage(page);
  const ai = new AISettingsPage(page);
  const upload = new UploadInvoicePage(page);
  const audit = new AuditTrailPage(page);

  await login.navigate();
  await login.login(LoginData.email, LoginData.password);
  await login.verifyDashboard();

  //-----------------------
  // AI Settings
  //-----------------------

  await ai.open();

  //   await ai.turnOn();

  await ai.ensureLowConfidence();

  await ai.setMaximumPerDay(100);

  await ai.setMaximumAmount(10000);

  await ai.save();

  //-----------------------
  // Upload Invoice
  //-----------------------

  await upload.open();

  const uploadedInvoice = await upload.uploadInvoice();

  console.log(uploadedInvoice);

  //-----------------------
  // Audit Trail
  //-----------------------

  await audit.open();

  await audit.searchInvoice(uploadedInvoice);

  await audit.waitForInvoice(uploadedInvoice);

//   await audit.expandInvoice(uploadedInvoice);

//   await audit.verifyAutoProcessed();
});
