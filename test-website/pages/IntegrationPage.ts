import { type Page, expect } from "@playwright/test";

export class IntegrationPage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText("Choose your accounting software");
  }

  private get searchInput() {
    return this.page.getByPlaceholder("Accounting package");
  }

  private get continueBtn() {
    return this.page.getByRole("button", {
      name: /Continue with linking/i,
    });
  }

  async verifyPage() {
    await expect(this.heading).toBeVisible({
      timeout: 3000,
    });
  }
  

  async selectIntegration(name: string) {
    await this.searchInput.fill("");

    await this.searchInput.fill(name);

    const result = this.page.getByText(name).first();

    await expect(result).toBeVisible({
      timeout: 15000,
    });

    await result.click();

    if (name === "e-Boekhouden.nl") {
      // App automatically redirects
      await this.page.waitForURL(/step=CREDENTIALS/, {
        timeout: 30000,
      });

      return;
    }

    if (name === "Exact Online") {
      await this.page.waitForURL(/start\.exactonline\.nl/, {
        timeout: 30000,
      });

      return;
    }
    await result.click();

    await expect(this.continueBtn).toBeEnabled({
      timeout: 15000,
    });

    await this.continueBtn.click();
  }
}
