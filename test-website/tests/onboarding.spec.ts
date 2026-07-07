import { test } from "@playwright/test";
import { SignUpPage } from "../pages/SignUpPage.js";
import { CompanyPage } from "../pages/CompanyPage.js";
import { IntegrationPage } from "../pages/IntegrationPage.js";
import { CredentialsPage } from "../pages/CredentialsPage.js";
import { SuccessPage } from "../pages/SuccessPage.js";
import { InvoiceUploadPage } from "../pages/InvoiceUploadPage.js";
import { EmailPage } from "../pages/EmailPage.js";
import { EmailForwardingPage } from "../pages/EmailForwardingPage.js";
import { PackagePage } from "../pages/PackagePage.js";
import { StripePage } from "../pages/StripePage.js";
import { TestData } from "../test-data/testData.js";
import { ExactOnlinePage } from "../pages/ExactOnlinePage.js";
import { DivisionPage } from "../pages/DivisionPage.js";
import { IntegrationTracker } from "../helpers/IntegrationTracker.js";

test.describe("Boekie Onboarding", () => {
  test("Complete onboarding flow", async ({ page }) => {
    const signUp = new SignUpPage(page);
    const company = new CompanyPage(page);
    const integration = new IntegrationPage(page);
    const exact = new ExactOnlinePage(page);
    const division = new DivisionPage(page);
    const credentials = new CredentialsPage(page);
    const success = new SuccessPage(page);
    const invoiceUpload = new InvoiceUploadPage(page);
    const emailPage = new EmailPage(page);
    const emailForwarding = new EmailForwardingPage(page);
    const packagePage = new PackagePage(page);
    const stripe = new StripePage(page);
    const tracker = new IntegrationTracker();
    const integrationType = tracker.getNextIntegration();
    let companyFound = false;

    // 1. Sign Up
    await signUp.navigate();
    await signUp.clickSignUpTab();
    await signUp.fillForm(
      TestData.user.firstName,
      TestData.user.lastName,
      TestData.user.email,
      TestData.user.password,
    );
    await signUp.acceptTerms();
    await signUp.submit();

    // 2. Select Company
    await company.verifyPage();
    // await company.searchAndSelectCompany(TestData.company.kvkNumber);
    // await company.saveAndContinue();

    for (const companyName of TestData.companies) {
      console.log(`Searching: ${companyName}`);

      companyFound = await company.searchCompany(companyName);

      if (companyFound) {
        break;
      }
    }

    if (!companyFound) {
      await company.openManualForm();

      await company.fillManualCompany(TestData.manualCompany);
    }

    await company.saveAndContinue();

    // 3. Select Integration (e-Boekhouden)
    // await integration.verifyPage();
    // await integration.selectIntegration(TestData.integration.name);
    // await integration.continueWithLinking();

    // 4. Enter API Credentials

    if (integrationType === "eboekhouden") {
      await integration.selectIntegration("e-Boekhouden.nl");

      await credentials.verifyPage();

      await credentials.enterApiKey(TestData.integration.apiKey);

      await credentials.saveAndContinue();
      // Wait for Success page
      await success.verifySuccess();

      // Click Continue
      await success.continue();
    } else {
      await integration.selectIntegration("Exact Online");

      await exact.login(
        TestData.exactOnline.email,
        TestData.exactOnline.password,
      );

      await exact.allowAccess();

      await exact.waitForCallback();

      await division.selectDivision();
    }

    // 6. Invoice Upload - Skip
    await invoiceUpload.verifyPage();
    await invoiceUpload.skip();

    // 7. Email Address - Save and continue
    await emailPage.verifyPage();
    await emailPage.saveAndContinue();

    // 8. Email step 2 - Save and continue
    await emailPage.continueStep2();

    // 9. Email step 3 (Forwarding) - Click Continue
    await emailForwarding.skipSetup();

    // 10. Choose Package
    await packagePage.verifyPage();
    await packagePage.selectGroeiPlan();

    // 11. Stripe Payment
    await stripe.completePayment();
  });
});
