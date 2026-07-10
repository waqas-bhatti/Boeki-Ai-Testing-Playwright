import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { ExtraCreditsPage } from "../pages/ExtraCreditsPage.js";
import { StripeCheckoutPage } from "../pages/StripeCheckoutPage.js";
import { LoginData } from "../test-data/testData.js";

test("Purchase extra credits", async ({ page }) => {
  const login = new LoginPage(page);
  const credits = new ExtraCreditsPage(page);
  const stripe = new StripeCheckoutPage(page);

  await login.navigate();
  await login.login(LoginData.email, LoginData.password);
  await login.verifyDashboard();

  // Open popup
  await credits.openAddCreditsModal();

  // ----------- OPTION 1 ------------
  // Test custom credits
  // await credits.setCustomCredits(20);

  // ----------- OPTION 2 ------------
  // If you want to test +/- instead, comment the above line
  // and uncomment these:
  //
  await credits.increaseCredits(5);
  await page.waitForTimeout(1000);

  // Continue to Stripe
  await credits.continueToCheckout();

  // Stripe checkout
  await stripe.verifyPage();
  await stripe.completePayment();
});
