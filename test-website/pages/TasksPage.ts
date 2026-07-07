import { type Page, expect } from "@playwright/test";

export class TaskPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/tasks",
    );

    await expect(this.page).toHaveURL(/tasks/);
  }

  async openFirstInvoice() {
    // Wait until at least one task card is available
    const firstTask = this.page.locator("div[role='button']").first();

    await expect(firstTask).toBeVisible({
      timeout: 120000,
    });

    await firstTask.click();

    // Wait until the Confirm button is visible
    await expect(
      this.page.getByRole("button", { name: "Confirm" }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  async confirmInvoice() {
    const confirmButton = this.page.getByRole("button", {
      name: "Confirm",
      exact: true,
    });

    await confirmButton.click();

    // Wait until confirmation request completes
    await this.page.waitForLoadState("networkidle");
  }
}
