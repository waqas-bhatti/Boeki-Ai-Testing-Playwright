import { type Page, expect } from "@playwright/test";

export class UpgradePlanPage {
  constructor(private page: Page) {}

  private get upgradeButton() {
    return this.page.getByRole("button", {
      name: /Upgrade plan/i,
    });
  }

  private get uploadButton() {
    return this.page.getByText("upload", {
      exact: true,
    });
  }

  private get planTab() {
    return this.page.getByText("Plan & credits", { exact: true });
  }

  private get groeiToggle() {
    return this.page.locator("#yearly-toggle-no-sub-growth");
  }

  private get groeiCard() {
    return this.groeiToggle.locator(
      "xpath=ancestor::div[contains(@class,'relative flex')]",
    );
  }

  private get groeiGetStarted() {
    return this.groeiCard.getByRole("button", {
      name: "Get started",
    });
  }

  async chooseGroeiPlan() {
    await expect(this.groeiToggle).toBeVisible();

    // Turn ON annual billing if OFF
    if ((await this.groeiToggle.getAttribute("aria-checked")) === "false") {
      await this.groeiToggle.click();
    }

    await this.groeiGetStarted.click();

    await this.page.waitForURL(/stripe|checkout/, {
      timeout: 60000,
    });
  }

  async openInvoicePage() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/invoices-receipts",
      {
        waitUntil: "networkidle",
      },
    );

    // Wait until page rendering finishes
    await expect
      .poll(
        async () => {
          const upload = await this.page
            .getByText("upload", { exact: true })
            .isVisible()
            .catch(() => false);

          const upgrade = await this.page
            .getByRole("button", { name: /Upgrade plan/i })
            .isVisible()
            .catch(() => false);

          return upload || upgrade;
        },
        {
          timeout: 60000,
        },
      )
      .toBeTruthy();
  }

  async checkUpgradePage(): Promise<boolean> {
    // Wait until either Upload OR Upgrade Plan appears
    await expect(async () => {
      const upload = await this.uploadButton.isVisible().catch(() => false);
      const upgrade = await this.upgradeButton.isVisible().catch(() => false);

      expect(upload || upgrade).toBeTruthy();
    }).toPass({
      timeout: 30000,
    });

    if (await this.upgradeButton.isVisible().catch(() => false)) {
      console.log("Upgrade Plan detected.");

      await this.upgradeButton.click();

      await expect(this.page).toHaveURL(/profile\?tab=plan/, {
        timeout: 30000,
      });

      return true;
    }

    console.log("User already has access to upload invoices.");

    return false;
  }
}
