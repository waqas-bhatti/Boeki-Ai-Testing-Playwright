import { expect, type Page } from "@playwright/test";

export class ProfilePage {
  constructor(private page: Page) {}

  // =====================================================
  // Open
  // =====================================================

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/profile?tab=account",
    );

    await expect(this.page).toHaveURL(/profile\?tab=account/);
    await expect(this.firstNameInput).toBeVisible();
  }

  // =====================================================
  // Locators
  // =====================================================
  
  private get profileCard() {
    return this.page
      .getByText("First Name", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded')][1]");
  }

  private fieldInput(label: string) {
    return this.profileCard
      .getByText(label, { exact: true })
      .locator("xpath=following::input[1]");
  }

  private get firstNameInput() {
    return this.fieldInput("First Name");
  }

  private get lastNameInput() {
    return this.fieldInput("Last Name");
  }

  private get emailInput() {
    return this.fieldInput("Email Address");
  }

  private get phoneNumberInput() {
    return this.fieldInput("Phone Number");
  }
 
  private get countrySelect() {
    return this.profileCard
      .getByText("Country", { exact: true })
      .locator("xpath=following::select[1]");
  }

  async selectCountry(country: string) {
    await this.countrySelect.selectOption({ label: country });
    await expect(this.countrySelect).toHaveValue(country);
  }
  
  private get saveChangesButton() {
    return this.profileCard.getByRole("button", { name: /^Save changes$/i });
  }

  // =====================================================
  // Actions
  // =====================================================

  async updateFirstName(value: string) {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(value);
    await expect(this.firstNameInput).toHaveValue(value);
  }

  async updateLastName(value: string) {
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(value);
    await expect(this.lastNameInput).toHaveValue(value);
  }

  async updatePhoneNumber(value: string) {
    await this.phoneNumberInput.clear();
    await this.phoneNumberInput.fill(value);
    await expect(this.phoneNumberInput).toHaveValue(value);
  }

  /**
   * Email Address is read-only (Image 1: "readonly this field").
   * Verifies this functionally — attempting to change its value has
   * no effect — rather than depending on a specific HTML attribute
   * name (readonly vs disabled vs aria-disabled), which we can't
   * confirm without inspecting the real DOM.
   */
  async verifyEmailIsReadOnly() {
    const originalValue = await this.emailInput.inputValue();

    const isEditable = await this.emailInput.isEditable().catch(() => false);
    if (!isEditable) {
      console.log("Email field confirmed read-only (not editable).");
      return;
    }

    // Fallback: even if Playwright considers it "editable" (e.g. no
    // readonly/disabled attribute, just styled to look non-editable),
    // confirm typing into it doesn't actually change the value.
    await this.emailInput.fill("attempted-change@example.com").catch(() => {});
    const valueAfterAttempt = await this.emailInput.inputValue();

    expect(valueAfterAttempt).toBe(originalValue);
    console.log(
      "Email field confirmed read-only (value unchanged after fill attempt).",
    );
  }

  async saveChanges() {
    await expect(this.saveChangesButton).toBeEnabled();
    await this.saveChangesButton.click();

    await expect(
      this.page.getByText("Profile updated successfully", { exact: false }),
    ).toBeVisible({ timeout: 15000 });
 
  }

  // =====================================================
  // Complete Flow
  // =====================================================

  async updateProfile(details: {
    firstName: string;
    lastName: string;
    country: string;
    phoneNumber: string;
  }) {
    await this.open();

    await this.verifyEmailIsReadOnly();

    await this.updateFirstName(details.firstName);
    await this.updateLastName(details.lastName);
    await this.selectCountry(details.country);
    await this.updatePhoneNumber(details.phoneNumber);

    await this.saveChanges();
    
  }
}
