import { type Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  private get emailInput() {
    return this.page.locator("#email");
  }

  private get passwordInput() {
    return this.page.locator("#password");
  }

  private get loginButton() {
    return this.page.getByRole("button", {
      name: /Sign In/i,
    });
  }

  async navigate() {
    await this.page.goto("https://staging.platform.boekie-ai.com/auth");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);

    await this.passwordInput.fill(password);

    await expect(this.emailInput).toHaveValue(email);

    await expect(this.passwordInput).toHaveValue(password);

    await this.page.locator("button[type='submit']").click();
  }

  async verifyDashboard() {
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
