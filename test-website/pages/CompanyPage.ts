import { type Page, expect } from "@playwright/test";

export class CompanyPage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText("Let's get started!");
  }
  private get searchInput() {
    return this.page.getByPlaceholder("Company name or KVK number");
  }
  private get saveBtn() {
    return this.page.getByRole("button", { name: "Save and continue" });
  }

  async verifyPage() {
    await expect(this.heading).toBeVisible();
  }

  async searchAndSelectCompany(kvkNumber: string) {
    await this.searchInput.click();
    await this.searchInput.fill(kvkNumber);

    // Wait for the dropdown result card (contains the KVK number) and click it
    const resultCard = this.page.locator(`text=KvK: ${kvkNumber}`);
    await resultCard.waitFor({ state: "visible", timeout: 15000 });
    await resultCard.click();
  }

  async searchCompany(companyName: string): Promise<boolean> {

  // Clear search input
  await this.searchInput.fill("");

  // Type company name
  await this.searchInput.fill(companyName);

  // Wait for search results
  await this.page.waitForTimeout(2000);

  // Locate the company card
  const companyCard = this.page.locator("div").filter({
    hasText: companyName,
  }).first();

  // If company is not found in search results
  if (!(await companyCard.isVisible().catch(() => false))) {
    console.log(`Company "${companyName}" not found.`);
    return false;
  }

  // Click the company
  await companyCard.click();

  // Wait a moment for any validation message
  await this.page.waitForTimeout(1000);

  // Check if company already exists
  const alreadyExists = this.page.getByText(/already exists/i);

  if (await alreadyExists.isVisible().catch(() => false)) {

    console.log(`Company "${companyName}" already exists.`);

    return false;
  }

  // Company selected successfully
  console.log(`Company "${companyName}" selected successfully.`);

  return true;
}

  async openManualForm() {
    await this.page.getByText("No KvK number? Enter details manually").click();
  }

  async fillManualCompany(data: {
    companyName: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    vat: string;
  }) {
    await this.page.getByLabel("Company name").fill(data.companyName);

    await this.page.getByLabel("Street and house number").fill(data.street);

    await this.page.getByLabel("Postal code").fill(data.postalCode);

    await this.page.getByLabel("City").fill(data.city);

    await this.page.getByLabel("VAT number (optional)").fill(data.vat);
  }

  async saveAndContinue() {
    // Wait for button to be enabled after selection
    await expect(this.saveBtn).toBeEnabled({ timeout: 3000 });
    await this.saveBtn.click();
    await this.page.waitForURL("**/onboarding-v2/links/integration**", {
      timeout: 5000,
    });
  }
}

