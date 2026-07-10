import { expect, type Page } from "@playwright/test";

export class ExtraCreditsPage {
  constructor(private page: Page) {}

  // Top-nav "Credits 391/500" button that opens the "Add extra
  // credits" modal (Image 1, top right, arrow pointing at it).
  private get creditsNavButton() {
    return this.page
      .getByRole("button")
      .filter({ hasText: /Credits/i })
      .first();
  }

  private get modalHeading() {
    return this.page.getByRole("heading", { name: "Add extra credits" });
  }

  private get creditsLabel() {
    return this.page.getByText("Number of credits", { exact: true });
  }

  // ----------------------------------------------------------------

  // ----------------------------------------------------------------

  private get stepperRow() {
    return this.creditsLabel.locator("xpath=following-sibling::*[1]");
  }

  private stepperChild(index: number) {
    return this.stepperRow.locator(":scope > *").nth(index);
  }

  private get minusButton() {
    return this.stepperChild(0);
  }
  private get plusButton() {
    return this.stepperChild(2);
  }

  private get creditsInput() {
    return this.page.locator('input[type="number"]').first();
  }

  private get continueToCheckoutButton() {
    return this.page.getByRole("button", {
      name: "Continue to checkout",
    });
  }

  private get cancelButton() {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  async openAddCreditsModal() {
    await this.creditsNavButton.click();
    await expect(this.modalHeading).toBeVisible();
  }

  async increaseCredits(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.plusButton.click();
      await this.page.waitForTimeout(300);
      
    }
  }

  async decreaseCredits(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.minusButton.click();
      await this.page.waitForTimeout(300);
      console.log("Credits =", await this.getCurrentCreditsValue());
    }
  }

  async getCurrentCreditsValue(): Promise<number> {
    const raw =
      (await this.creditsInput.inputValue().catch(() => null)) ??
      (await this.creditsInput.textContent().catch(() => null)) ??
      "0";
    return parseInt(raw.trim(), 10) || 0;
  }

  /**
   * Sets the credits field to an exact custom value.
   * Tries typing directly into the field first. If it's not
   * fillable (display-only, controlled purely by +/-), falls back
   * to clicking +/- enough times to reach the target value.
   */
  async setCustomCredits(value: number) {
    const filledDirectly = await this.creditsInput
      .fill(String(value))
      .then(() => true)
      .catch(() => false);

    if (filledDirectly) {
      // Explicitly click elsewhere (not just press Tab) to force a
      // real blur so the app recalculates the total and enables
      // "Continue to checkout" — some UIs only recompute on blur,
      // and a keyboard Tab doesn't always fire the same handlers a
      // real pointer-driven blur does.
      await this.modalHeading.click({ trial: false }).catch(() => {});
      await this.page.waitForTimeout(300); // let debounce/recalc settle
      return;
    }

    const current = await this.getCurrentCreditsValue();
    const diff = value - current;

    if (diff > 0) {
      await this.increaseCredits(diff);
    } else if (diff < 0) {
      await this.decreaseCredits(Math.abs(diff));
    }
  }

  async continueToCheckout() {
    try {
      await expect(this.continueToCheckoutButton).toBeEnabled({
        timeout: 15000,
      });
      await this.continueToCheckoutButton.scrollIntoViewIfNeeded();
      await this.continueToCheckoutButton.click({ timeout: 15000 });
    } catch (err) {
      await this.page.screenshot({
        path: "test-results/continue-to-checkout-failure.png",
        fullPage: true,
      });
      console.log(
        "Continue to checkout click failed. Screenshot saved to test-results/continue-to-checkout-failure.png",
      );
      throw err;
    }
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
