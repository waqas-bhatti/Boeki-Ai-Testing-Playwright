import { type Page, expect } from "@playwright/test";

export class DivisionPage {
  constructor(private page: Page) {}

  private get divisionDropdown() {
    return this.page.locator("button").filter({
      hasText: /Select a division/i,
    });
  }

  private get divisionOption() {
    return this.page.locator('[role="option"]').first();
  }

  async selectDivision() {
    // Wait until Boekie Division page is loaded
    await expect(this.divisionDropdown).toBeVisible({
      timeout: 60000,
    });

    // Open dropdown
    await this.divisionDropdown.click();

    // Wait options
    await expect(this.divisionOption).toBeVisible({
      timeout: 30000,
    });

    // Select first division
    await this.divisionOption.click();

    // Wait until Invoice page appears
    await expect(
      this.page.getByText(/Received receipts or invoices/i),
    ).toBeVisible({
      timeout: 60000,
    });
  }
}
