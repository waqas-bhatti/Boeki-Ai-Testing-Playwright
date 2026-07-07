import { type Page, expect } from "@playwright/test";

export class SuccessPage {
  constructor(private page: Page) {}

  private get successText() {
    return this.page.getByText("Success!");
  }
  private get continueBtn() {
    return this.page.getByRole("button", { name: "Continue" });
  }

  async verifySuccess() {
    await expect(this.successText).toBeVisible();
  }

  async continue() {
    await this.continueBtn.click();
    // Wait for next page element instead of URL
    await this.page.getByText("Received receipts or invoices").waitFor({
      state: "visible",
      timeout: 15000,
    });
  }
}
