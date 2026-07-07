import { type Page, type FrameLocator } from "@playwright/test";
import { TestData } from "../test-data/testData.js";

export class StripePage {
  constructor(private page: Page) {}

  private getStripeFrame(): FrameLocator {
    return this.page.frameLocator('iframe[src*="stripe"]').first();
  }

  async verifyPage() {
    const frame = this.getStripeFrame();
    await frame.getByPlaceholder("1234 1234 1234 1234").waitFor({
      state: "visible",
      timeout: 30000,
    });
  }

  async completePayment() {
    const frame = this.getStripeFrame();

    await frame.getByPlaceholder("email@example.com").fill(TestData.user.email);
    await frame
      .getByPlaceholder("1234 1234 1234 1234")
      .fill(TestData.payment.cardNumber);
    await frame.getByPlaceholder("MM / YY").fill(TestData.payment.expiry);
    await frame.getByPlaceholder("CVC").fill(TestData.payment.cvc);
    await frame
      .getByPlaceholder("Full name on card")
      .fill(TestData.payment.cardholderName);

    // Force click to bypass any overlay blocking the button
    await frame
      .getByTestId("hosted-payment-submit-button")
      .click({ force: true, timeout: 15000 });

    // Wait for redirect to dashboard (full page navigation after Stripe)
    await this.page.waitForURL("**/dashboard**", { timeout: 60000 });
  }
}
