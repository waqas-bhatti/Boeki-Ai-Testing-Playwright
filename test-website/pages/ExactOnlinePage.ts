import { type Page, expect } from "@playwright/test";

export class ExactOnlinePage {
  constructor(private page: Page) {}

  //----------------------------
  // Locators
  //----------------------------

  private get usernameInput() {
    return this.page.locator('input[type="text"]');
  }

  private get passwordInput() {
    return this.page.locator('input[type="password"]');
  }

  private get nextButton() {
    return this.page.getByRole("button", {
      name: "Next",
    });
  }

  private get divisionRadio() {
    return this.page.locator('input[type="radio"]').first();
  }

  private get checkbox1() {
    return this.page.locator('input[type="checkbox"]').nth(0);
  }

  private get checkbox2() {
    return this.page.locator('input[type="checkbox"]').nth(1);
  }

  private get allowButton() {
    return this.page.getByRole("button", {
      name: "Toestaan",
    });
  }

  //----------------------------
  // Login
  //----------------------------

  async login(username: string, password: string) {
    await expect(this.page).toHaveURL(/exactonline/i);

    await this.usernameInput.fill(username);

    await this.nextButton.click();

    await this.passwordInput.waitFor();

    await this.passwordInput.fill(password);

    await this.nextButton.click();
  }

  //----------------------------
  // Permission Page
  //----------------------------

  async allowAccess() {
    await Promise.race([
      this.divisionRadio.waitFor({
        state: "visible",
        timeout: 10000,
      }),

      this.page.waitForURL(/onboarding-v2\/links\/integration/, {
        timeout: 10000,
      }),
    ]).catch(() => {});

    // Already redirected to Boekie
    if (this.page.url().includes("/onboarding-v2/links/integration")) {
      console.log("Permission page skipped.");
      return;
    }

    console.log("Permission page shown.");

    await this.divisionRadio.check();

    await this.checkbox1.check();

    await this.checkbox2.check();

    await expect(this.allowButton).toBeEnabled();

    await this.allowButton.click();
  }

  //----------------------------
  // Callback
  //----------------------------

  async waitForCallback() {
    await this.page.waitForURL(/onboarding-v2\/links\/integration/, {
      timeout: 120000,
      waitUntil: "domcontentloaded",
    });

    await this.page.waitForLoadState("networkidle");
    await this.page.waitForURL("**/onboarding-v2/links/integration?**", {
      timeout: 120000,
    });
  }
}
