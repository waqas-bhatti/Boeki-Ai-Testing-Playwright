import { type Page, expect } from "@playwright/test";

export class CredentialsPage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText("We'll link that for you!");
  }
  private get apiKeyInput() {
    return this.page.getByPlaceholder("Enter your API key");
  }
  private get saveBtn() {
    return this.page.getByRole("button", { name: "Save and continue" });
  }

  async verifyPage() {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async enterApiKey(apiKey: string) {
    await this.apiKeyInput.waitFor({
      state: "visible",
      timeout: 20000,
    });

    await this.apiKeyInput.fill(apiKey);
  }

  async saveAndContinue() {
    await expect(this.saveBtn).toBeEnabled({
      timeout: 10000,
    });

    await this.saveBtn.click();
  }
}
