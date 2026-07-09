import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { UpgradePlanPage } from "../pages/UpgradePlanPage.js";
import { CheckoutPage } from "../pages/CheckoutPage.js";
import { LoginData, TestData } from "../test-data/testData.js";

test("Upgrade Plan Successfully", async ({ page }) => {
  const login = new LoginPage(page);
  const upgrade = new UpgradePlanPage(page);
  const checkout = new CheckoutPage(page);

  // Login
  await login.navigate();
  await login.login(LoginData.email, LoginData.password);
  await login.verifyDashboard();

  // Navigate to invoices page
  await upgrade.openInvoicePage();

  // Check if upgrade is needed → navigates to plan page
  const needsUpgrade = await upgrade.checkUpgradePage();

  if (needsUpgrade) {
    // Select Groei plan (toggle + Get started)
    await upgrade.chooseGroeiPlan();

    // Fill Stripe checkout
    await checkout.fillPayment(
      TestData.payment.cardNumber,
      TestData.payment.expiry,
      TestData.payment.cvc,
      TestData.payment.cardholderName,
      TestData.payment.country,
    );

    // Subscribe
    await page.click('button:has-text("Subscribe")');

    console.log("Subscription completed.");
  } else {
    console.log("User already has an active plan.");
  }
});
