import { type Page, expect } from "@playwright/test";

export class EmailPage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText(
      "On which email address do you receive your incoming invoices?",
    );
  }
  private get saveBtn() {
    return this.page.getByRole("button", { name: "Save and continue" });
  }

  async verifyPage() {
    await expect(this.heading).toBeVisible();
  }

  async saveAndContinue() {
    await this.saveBtn.click();
    await this.page.waitForURL("**/links/email?step=2**", { timeout: 15000 });
  }

  async continueStep2() {
    // Step 2 has another "Save and continue" button
    await this.page.getByRole("button", { name: "Understood!" }).click();
    await this.page.waitForURL("**/links/email?step=3**", { timeout: 15000 });
  }
}
