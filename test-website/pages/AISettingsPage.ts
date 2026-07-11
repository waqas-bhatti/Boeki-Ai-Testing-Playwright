import { expect, type Page } from "@playwright/test";

export class AISettingsPage {
  constructor(private page: Page) {}

  // ============================================================
  // Open AI Settings
  // ============================================================

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/ai-settings",
    );

    await expect(this.page).toHaveURL(/ai-settings/);
  }

  // ============================================================
  // Locators
  // ============================================================

  private get sliderThumb() {
    return this.page.locator("[data-slot='slider-thumb']").first();
  }

  private get sliderTrack() {
    return this.page.locator("[data-slot='slider-track']").first();
  }

  private get maximumPerDay() {
    return this.page.locator("input[type='number']").first();
  }

  private get maximumAmount() {
    return this.page.locator("input[type='number']").last();
  }

  private get saveButton() {
    return this.page.getByRole("button", {
      name: "Save",
    });
  }

  // ========================
  // Automatic Processing
  // ========================
  private get automaticProcessingCard() {
    return this.page
      .getByText("Automatic processing", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded')][1]");
  }
  private get automaticProcessingSwitch() {
    return this.automaticProcessingCard.locator("div.cursor-pointer");
  }

  private get onOption() {
    return this.automaticProcessingCard.getByText("ON", { exact: true });
  }

  private get offOption() {
    return this.automaticProcessingCard.getByText("OFF", { exact: true });
  }

  private get restrictionsCard() {
    return this.page
      .getByText("Restrictions for Boekie", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded')][1]");
  }

  // ============================================================
  // Turn ON only if OFF
  // ============================================================

  async ensureAutomaticProcessingOn() {
    // Agar Restrictions enabled hain to already ON hai
    const restrictions = this.restrictionsCard;

    const isDisabled = await restrictions.evaluate((el) =>
      el.classList.contains("pointer-events-none"),
    );

    if (!isDisabled) {
      console.log("Already ON");
      return;
    }

    console.log("OFF detected. Turning ON...");

    await this.automaticProcessingSwitch.click({
      force: true,
    });

    // Wait until restrictions enabled
    await expect(async () => {
      const disabled = await restrictions.evaluate((el) =>
        el.classList.contains("pointer-events-none"),
      );

      expect(disabled).toBeFalsy();
    }).toPass({
      timeout: 10000,
    });

    console.log("Automatic Processing turned ON");
  }

  // ============================================================
  // Set Confidence LOW — unchanged, this part already works.
  // ============================================================

  async ensureLowConfidence() {
    const current = Number(
      await this.sliderThumb.getAttribute("aria-valuenow"),
    );

    console.log("Current Confidence:", current);

    if (current <= 59) {
      console.log("Confidence already LOW");
      return;
    }

    const track = await this.sliderTrack.boundingBox();

    if (!track) {
      throw new Error("Slider track not found.");
    }

    await this.sliderThumb.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(
      track.x + track.width * 0.08,
      track.y + track.height / 2,
      { steps: 30 },
    );
    await this.page.mouse.up();

    await expect(this.sliderThumb).toHaveAttribute("aria-valuenow", /5[0-9]/);

    console.log("Confidence changed to LOW");
  }

  // ============================================================
  // Maximum Per Day
  // ============================================================

  async setMaximumPerDay(value: number) {
    await this.maximumPerDay.clear();
    await this.maximumPerDay.fill(value.toString());
    await expect(this.maximumPerDay).toHaveValue(value.toString());
  }

  // ============================================================
  // Maximum Amount
  // ============================================================

  async setMaximumAmount(value: number) {
    await this.maximumAmount.clear();
    await this.maximumAmount.fill(value.toString());
    await expect(this.maximumAmount).toHaveValue(value.toString());
  }

  // ============================================================
  // Save
  // ============================================================

  async save() {
    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeEnabled();

    await expect(this.page.locator("svg.animate-spin")).toHaveCount(0);

    await this.saveButton.scrollIntoViewIfNeeded();
    await this.saveButton.click({ force: true });

    await this.page.waitForLoadState("networkidle");
  }

  async updateSettings() {
    await this.ensureAutomaticProcessingOn();

    const currentValue = await this.sliderThumb.getAttribute("aria-valuenow");

    if (currentValue !== "55") {
      await this.ensureLowConfidence();
      await this.save();
    } else {
      console.log("Already Low Confidence.");
    }
  }

  // ============================================================
  // Go To Invoice Page
  // ============================================================

  async goToInvoicesPage() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/invoices-receipts",
    );

    await expect(this.page).toHaveURL(/invoices-receipts/);
    await expect(this.page.getByText("Drop your files here")).toBeVisible();
  }

  // ============================================================
  // Complete Flow
  // ============================================================

  async configureAutoProcessing(maxPerDay: number, maxAmount: number) {
    await this.open();
    await this.ensureAutomaticProcessingOn();
    await this.ensureLowConfidence();
    await this.setMaximumPerDay(maxPerDay);
    await this.setMaximumAmount(maxAmount);
    await this.save();
    await this.goToInvoicesPage();
  }
}
