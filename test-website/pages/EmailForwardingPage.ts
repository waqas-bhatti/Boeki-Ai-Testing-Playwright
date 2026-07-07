import { type Page } from "@playwright/test";

export class EmailForwardingPage {
  constructor(private page: Page) {}

  async skipSetup() {
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForURL("**/onboarding-v2/payment**", {
      timeout: 15000,
    });
  }
}
