import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { AISettingsPage } from "../pages/AISettingsPage.js";
import { LoginData } from "../test-data/testData.js";

test("Update AI Settings", async ({ page }) => {
  const login = new LoginPage(page);
  const ai = new AISettingsPage(page);

  // Login
  await login.navigate();
  await login.login(LoginData.email, LoginData.password);
  await login.verifyDashboard();

  // Open AI Settings
  await ai.open();

  // Automatic Processing ON
  await ai.turnOn();

  // Low confidence (Boekie processes most invoices automatically)
  await ai.setLowConfidence();

  // Update values
  await ai.setMaximumPerDay(75);

  await ai.setMaximumAmount(5000);

  // Save
  await ai.save();
  
});
