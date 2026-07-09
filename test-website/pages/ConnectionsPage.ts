import { expect, type Page } from "@playwright/test";

export class ConnectionsPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/profile?tab=link",
      {
        waitUntil: "networkidle",
      },
    );

    await expect(this.page).toHaveURL(/profile\?tab=link/);

    await expect(
      this.page.getByRole("tab", { name: "Connections" }),
    ).toBeVisible();
  }

  // e-Boekhouden card
  private get eboekhoudenCard() {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByText("e-Boekhouden", { exact: true }),
      })
      .first();
  }

  private disconnectButton() {
    return this.eboekhoudenCard.getByRole("button", {
      name: "Disconnect",
    });
  }

  private connectButton() {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByRole("heading", { name: "e-Boekhouden" }),
      })
      .filter({
        has: this.page.getByRole("button", { name: /^Connect$/ }),
      })
      .last()
      .getByRole("button", { name: /^Connect$/ });
  }

  private get apiKeyInput() {
    return this.page.getByPlaceholder("Enter your API token...");
  }

  private get validateButton() {
    return this.page.getByRole("button", {
      name: /^Validate$/,
    });
  }

  private get eboekhoudenHeading() {
    return this.page.getByRole("heading", {
      name: "e-Boekhouden",
    });
  }

  // The "Are you sure?" confirmation dialog's Continue button.
  // Scoped to role=dialog so it can never be confused with any
  // other button on the page.
  private get confirmContinueButton() {
    return this.page
      .getByRole("dialog")
      .getByRole("button", { name: /^Continue$/ });
  }

  // --------------------------------------------------------------
  // NEW: disconnect() — standalone, does nothing else.
  // Added because your provider-switch test calls
  // `connection.disconnect()` directly, and that method didn't
  // exist on this class before (only the combined reconnect() did).
  // This does NOT touch/replace reconnect() below — reconnect()
  // still works exactly as before.
  // --------------------------------------------------------------
  async disconnect() {
    // Soft-check: if the e-Boekhouden card/heading isn't even on the
    // page (e.g. because Exact Online is the currently active
    // provider and these cards are mutually exclusive), there's
    // nothing to disconnect — that's not an error.
    const headingPresent = await this.eboekhoudenHeading
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!headingPresent) {
      console.log(
        "e-Boekhouden card not present on page - nothing to disconnect.",
      );
      return;
    }

    if (!(await this.disconnectButton().isVisible())) {
      console.log("e-Boekhouden already disconnected, nothing to do.");
      return;
    }

    console.log("Disconnecting...");

    await this.disconnectButton().click();

    await expect(this.confirmContinueButton).toBeVisible();
    await this.confirmContinueButton.click();

    await expect(this.disconnectButton()).toHaveCount(0);
    await expect(this.connectButton()).toBeVisible({ timeout: 30000 });

    console.log("e-Boekhouden disconnected.");
  }

  // --------------------------------------------------------------
  // NEW: connect() — standalone, assumes already disconnected.
  // Same logic as the "Connect" section inside reconnect() below,
  // extracted so it can be called on its own when switching providers.
  // --------------------------------------------------------------
  async connect(apiKey: string) {
    await expect(this.eboekhoudenHeading).toBeVisible();

    await this.connectButton().click();

    await expect(this.apiKeyInput).toBeVisible();
    await this.apiKeyInput.fill(apiKey);

    await expect(this.validateButton).toBeEnabled();

    const validateResponsePromise = this.page
      .waitForResponse(
        (res) =>
          /validate|connect|token/i.test(res.url()) &&
          res.request().method() === "POST",
        { timeout: 15000 },
      )
      .catch(() => null);

    await this.validateButton.click();

    const validateResponse = await validateResponsePromise;
    if (validateResponse) {
      console.log(
        `Validate call -> ${validateResponse.url()} status=${validateResponse.status()}`,
      );
      if (!validateResponse.ok()) {
        console.log(
          "Validate response body:",
          await validateResponse.text().catch(() => "<unreadable>"),
        );
      }
    } else {
      console.log("No validate/connect network call observed within 15s.");
    }

    try {
      await expect(this.disconnectButton()).toBeVisible({ timeout: 60000 });
    } catch (err) {
      await this.page.screenshot({
        path: "test-results/eboekhouden-validate-failure.png",
        fullPage: true,
      });
      console.log(
        "Validate did not result in Disconnect button appearing. Screenshot saved to test-results/eboekhouden-validate-failure.png",
      );
      throw err;
    }

    console.log("e-Boekhouden connected successfully.");
  }

  // --------------------------------------------------------------
  // UNCHANGED — your original working reconnect(), left exactly as-is.
  // --------------------------------------------------------------
  async reconnect(apiKey: string) {
    await expect(this.eboekhoudenHeading).toBeVisible();

    // --------------------------
    // Already Connected -> Disconnect first
    // --------------------------
    if (await this.disconnectButton().isVisible()) {
      console.log("Disconnecting...");

      await this.disconnectButton().click();

      // Confirmation modal (Image 4)
      await expect(this.confirmContinueButton).toBeVisible();
      await this.confirmContinueButton.click();

      // Wait until Disconnect disappears
      await expect(this.disconnectButton()).toHaveCount(0);

      // Wait until Connect appears
      await expect(this.connectButton()).toBeVisible({
        timeout: 30000,
      });
    }

    // --------------------------
    // Connect
    // --------------------------

    // BUG FIX: this used to click a (non-existent) second "Continue"
    // button. The button that reveals the API token form is "Connect".
    await this.connectButton().click();

    await expect(this.apiKeyInput).toBeVisible();
    await this.apiKeyInput.fill(apiKey);

    await expect(this.validateButton).toBeEnabled();

    // Watch the actual network response for the validate call so we
    // know WHY reconnect fails, instead of just timing out blind.
    const validateResponsePromise = this.page
      .waitForResponse(
        (res) =>
          /validate|connect|token/i.test(res.url()) &&
          res.request().method() === "POST",
        { timeout: 15000 },
      )
      .catch(() => null);

    await this.validateButton.click();

    const validateResponse = await validateResponsePromise;
    if (validateResponse) {
      console.log(
        `Validate call -> ${validateResponse.url()} status=${validateResponse.status()}`,
      );
      if (!validateResponse.ok()) {
        console.log(
          "Validate response body:",
          await validateResponse.text().catch(() => "<unreadable>"),
        );
      }
    } else {
      console.log("No validate/connect network call observed within 15s.");
    }

    // If Disconnect doesn't show up, dump what's actually on screen
    // instead of just timing out with no context.
    try {
      await expect(this.disconnectButton()).toBeVisible({
        timeout: 60000,
      });
    } catch (err) {
      await this.page.screenshot({
        path: "test-results/eboekhouden-validate-failure.png",
        fullPage: true,
      });
      console.log(
        "Validate did not result in Disconnect button appearing. Screenshot saved to test-results/eboekhouden-validate-failure.png",
      );
      throw err;
    }

    console.log("Connected successfully");
  }
}
