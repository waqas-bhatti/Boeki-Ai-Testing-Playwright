import { type Page } from "@playwright/test";

export class CheckoutPage {
  constructor(private page: Page) {}

  private get cardholderInput() {
    return this.page.getByLabel("Cardholder name");
  }
  private get countrySelect() {
    return this.page.getByLabel("Country or region");
  }
  private get startTrialBtn() {
    return this.page.getByRole("button", { name: "Start trial" });
  }
  async fillPayment(
    cardNumber: string,
    expiry: string,
    cvc: string,
    name: string,
    country: string,
  ) {
    // Stripe fields are inside iframes
    const stripeFrame = this.page
      .frameLocator('iframe[name*="stripe"]')
      .first();

    await stripeFrame.getByPlaceholder("1234 1234 1234 1234").fill(cardNumber);
    await stripeFrame.getByPlaceholder("MM / YY").fill(expiry);
    await stripeFrame.getByPlaceholder("CVC").fill(cvc);

    // These are outside the iframe
    await this.cardholderInput.fill(name);
    await this.countrySelect.selectOption(country);
  }

  async startTrial() {
    await this.startTrialBtn.click();
    await this.page.waitForURL("**/dashboard**", { timeout: 30000 });
  }
}
