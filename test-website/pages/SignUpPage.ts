import { type Page, expect } from "@playwright/test";

export class SignUpPage {
  constructor(private page: Page) {}

  private get signUpTab() {
    return this.page.getByRole("tab", { name: "Sign Up" });
  }
  private get firstNameInput() {
    return this.page.getByLabel("First Name");
  }
  private get lastNameInput() {
    return this.page.getByLabel("Last Name");
  }
  private get emailInput() {
    return this.page.getByLabel("Email Address");
  }
  private get passwordInput() {
    return this.page.getByLabel("Password");
  }
  private get termsCheckbox() {
    return this.page.getByRole("checkbox");
  }
  private get createAccountBtn() {
    return this.page.getByRole("button", { name: "Create Account" });
  }
  async navigate() {
    await this.page.goto("https://staging.platform.boekie-ai.com/auth");
  }

  async clickSignUpTab() {
    await this.signUpTab.click();
  }

  async fillForm(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submit() {
    await this.createAccountBtn.click();
    await this.page.waitForURL(
      "https://staging.platform.boekie-ai.com/onboarding-v2/company",
      { timeout: 15000 },
    );
  }
}
