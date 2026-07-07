import { type Page, expect } from "@playwright/test";

export class PackagePage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText("That's it!");
  }

  async verifyPage() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  async selectGroeiPlan() {
    // There are 3 "Start free trial" buttons: Start(0), Groei(1), Autopilot(2)
    const groeiBtn = this.page
      .getByRole("button", { name: "Start free trial" })
      .nth(1);
    await groeiBtn.click();

    // SPA: wait for Stripe checkout to load
    await this.page.getByText("Payment method").waitFor({
      state: "visible",
      timeout: 30000,
    });
  }
}
