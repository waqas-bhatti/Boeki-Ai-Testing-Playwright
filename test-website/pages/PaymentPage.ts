import { type Page } from "@playwright/test";

export class PaymentPage {
  constructor(private page: Page) {}

  async selectStarterPlan() {
    await this.page.getByText("Starter").click();
  }

  async clickStartFreeTrial() {
    await this.page.getByRole("button", { name: /Start Free Trial/i }).click();
  }
}
