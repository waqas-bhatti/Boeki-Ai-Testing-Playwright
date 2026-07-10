import { expect, type FrameLocator, type Page } from "@playwright/test";
import { TestData } from "../test-data/testData.js";

export class StripeCheckoutPage {
  constructor(private page: Page) {}

  // ------------------------------------------------------------
  // Wait until Stripe Checkout opens
  // ------------------------------------------------------------
  async verifyPage() {
    await this.page.waitForURL(/checkout\.stripe\.com/, {
      timeout: 120000,
    });

    await this.page.waitForLoadState("domcontentloaded");
  }

  // ------------------------------------------------------------
  // Stripe sometimes renders fields directly on the page and
  // sometimes inside iframes.
  // ------------------------------------------------------------
  private get cardFrame(): FrameLocator {
    return this.page
      .frameLocator('iframe[title*="Secure card payment input"]')
      .first();
  }

  private get expiryFrame(): FrameLocator {
    return this.page.frameLocator('iframe[title*="expiration"]').first();
  }

  private get cvcFrame(): FrameLocator {
    return this.page.frameLocator('iframe[title*="CVC"]').first();
  }

  private get nameInput() {
    return this.page
      .locator('input[name="billingName"]')
      .or(this.page.getByPlaceholder(/name/i))
      .first();
  }

  private get payButton() {
    return this.page.getByRole("button", {
      name: /Pay/i,
    });
  }

  // ------------------------------------------------------------
  // Complete Checkout Payment
  // ------------------------------------------------------------
  async completePayment() {
    // -----------------------------
    // CASE 1
    // Card fields directly visible
    // -----------------------------
    const directCard = this.page
      .getByPlaceholder("1234 1234 1234 1234")
      .first();

    if (await directCard.isVisible().catch(() => false)) {
      await directCard.fill(TestData.payment.cardNumber);

      await this.page.getByPlaceholder("MM / YY").fill(TestData.payment.expiry);

      await this.page.getByPlaceholder("CVC").fill(TestData.payment.cvc);

      if (await this.nameInput.isVisible().catch(() => false)) {
        await this.nameInput.fill(TestData.payment.cardholderName);
      }
    }

    // -----------------------------
    // CASE 2
    // Stripe Elements (iframe)
    // -----------------------------
    else {
      await this.cardFrame
        .locator('input[name="cardnumber"]')
        .fill(TestData.payment.cardNumber);

      await this.expiryFrame
        .locator('input[name="exp-date"]')
        .fill(TestData.payment.expiry);

      await this.cvcFrame
        .locator('input[name="cvc"]')
        .fill(TestData.payment.cvc);

      if (await this.nameInput.isVisible().catch(() => false)) {
        await this.nameInput.fill(TestData.payment.cardholderName);
      }
    }

    // -----------------------------
    // Click Pay
    // -----------------------------
    await expect(this.payButton).toBeEnabled({
      timeout: 30000,
    });

    await this.payButton.click();

    // -----------------------------
    // Wait until Boekie opens again
    // -----------------------------
//     await this.page.waitForURL(/dashboard/, {
//       timeout: 120000,
//     });
  }
}
