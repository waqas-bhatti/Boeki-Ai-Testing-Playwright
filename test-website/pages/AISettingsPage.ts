import { expect, type Page } from "@playwright/test";

export class AISettingsPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/ai-settings",
    );

    await expect(this.page).toHaveURL(/ai-settings/);
  }

  // ========================
  // Locators
  // ========================

  private get onButton() {
    return this.page.locator("div").filter({ hasText: /^ON$/ }).first();
  }

  private get offButton() {
    return this.page.locator("div").filter({ hasText: /^OFF$/ }).first();
  }

  private get saveButton() {
    return this.page.getByRole("button", { name: "Save" });
  }

  private get slider() {
    return this.page.locator("[role='slider']");
  }

  private get maximumPerDay() {
    return this.page.locator("input[type='number']").first();
  }

  private get maximumAmount() {
    return this.page.locator("input[type='number']").last();
  }

  // ========================
  // Automatic Processing
  // ========================

  //   async turnOff() {
  //     await this.offButton.click();

  //     // Save should become disabled
  //     await expect(this.saveButton).toBeDisabled();
  //   }

  async turnOn() {
    const onActive = this.page.locator("div.text-white", {
      hasText: "ON",
    });
// If ON is already active, don't click it again.
  if (await onActive.count()) {
    return;
  }

    await this.onButton.click();

    await expect(
      this.page.locator("div.text-white", { hasText: "ON" }),
    ).toBeVisible();

    await expect(this.page.getByRole("button", { name: "Save" })).toBeEnabled();
  }

  // ========================
  // Confidence
  // ========================

  async setLowConfidence() {
    const thumb = this.page.locator("[data-slot='slider-thumb']");
    const track = this.page.locator("[data-slot='slider-track']");

    const trackBox = await track.boundingBox();

    if (!trackBox) {
      throw new Error("Slider track not found.");
    }

    // Start dragging from the current thumb position
    await thumb.hover();

    await this.page.mouse.down();

    // Move near the left side (around 55)
    await this.page.mouse.move(
      trackBox.x + trackBox.width * 0.1,
      trackBox.y + trackBox.height / 2,
      { steps: 30 },
    );

    await this.page.mouse.up();

    // Wait for UI update
    await this.page.waitForTimeout(500);

    // Print the new value
    const value = await thumb.getAttribute("aria-valuenow");
  }

  // ========================
  // Maximum Per Day
  // ========================

  async setMaximumPerDay(value: number) {
    const input = this.page.locator("input[type='number']").first();

    await input.clear();

    await input.fill(value.toString());

    await expect(input).toHaveValue(value.toString());
  }

  // ========================
  // Maximum Amount
  // ========================

  async setMaximumAmount(value: number) {
    const input = this.page.locator("input[type='number']").last();

    await input.clear();

    await input.fill(value.toString());

    await expect(input).toHaveValue(value.toString());
  }

  // ========================
  // Save
  // ========================

  async save() {
    await this.page.getByRole("button", { name: "Save" }).click();

    await this.page.waitForLoadState("networkidle");
  }

  // ========================
  // Complete Flow
  // ========================

  async updateSettings(confidence: number, maxDay: number, maxAmount: number) {
    await this.turnOn();

    // await this.setConfidence(confidence);

    await this.setMaximumPerDay(maxDay);

    await this.setMaximumAmount(maxAmount);

    await this.save();

    // Verify saved values
    await expect(this.maximumPerDay).toHaveValue(maxDay.toString());

    await expect(this.maximumAmount).toHaveValue(maxAmount.toString());

    await expect(this.slider).toHaveAttribute(
      "aria-valuenow",
      confidence.toString(),
    );
  }

  async verifySettings(maxDay: number, maxAmount: number) {
    await expect(this.page.locator("input[type='number']").first()).toHaveValue(
      maxDay.toString(),
    );

    await expect(this.page.locator("input[type='number']").last()).toHaveValue(
      maxAmount.toString(),
    );
  }
}
