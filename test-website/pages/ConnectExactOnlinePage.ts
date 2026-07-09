import { expect, type Page } from "@playwright/test";

// Class name matches your test's import:
// import { ConnectExactOnlinePage } from "../pages/ConnectExactOnlinePage.js";
export class ConnectExactOnlinePage {
  constructor(private page: Page) {}

  // Exact Online card, scoped precisely.
  // filter({ has }) on "div" returns matching ancestors in document
  // order (outermost first). .last() gives the innermost/smallest
  // wrapper that contains BOTH the heading and a Connect/Disconnect
  // button — i.e. the actual Exact Online card, not a shared parent
  // container that also wraps the e-Boekhouden card.
  private get exactCard() {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByRole("heading", { name: "Exact Online" }),
      })
      .filter({
        has: this.page.getByRole("button", { name: /^Connect$|^Disconnect$/ }),
      })
      .last();
  }

  private get exactHeading() {
    return this.page.getByRole("heading", { name: "Exact Online" });
  }

  // "Connect" DOES need card-scoping — both e-Boekhouden and Exact
  // Online can show a "Connect" button at the same time (disconnected
  // state, both cards visible side by side).
  private get connectButton() {
    return this.exactCard.getByRole("button", { name: /^Connect$/ });
  }

  // "Disconnect" does NOT need scoping. Once connected, only ONE
  // provider's card is ever rendered (e-Boekhouden and Exact Online
  // are mutually exclusive), so "Disconnect" text is unique
  // page-wide — same as e-Boekhouden's disconnectButton.
  //
  // IMPORTANT: this used to be scoped through `exactCard` (finding
  // the smallest div wrapping both the heading and the button). Once
  // connected, that card also contains "Digital mailbox" and "Scan &
  // Herken" sections with their own toggles, dropdowns, date pickers,
  // and "Pause for 24 hours" buttons — a much deeper tree than when
  // disconnected. That scoping became unreliable against this bigger
  // structure, which is why the Disconnect click wasn't working.
  // Going unscoped removes that fragility entirely.
  private get disconnectButton() {
    return this.page
      .getByRole("heading", { name: "Exact Online" })
      .locator(
        "xpath=ancestor::div[contains(@class,'rounded-[16px]')]//button[normalize-space()='Disconnect']",
      )
      .first();
  }
  // Disconnect confirmation modal's Continue button. Also simplified
  // to unscoped — "Continue" only ever appears in this one
  // confirmation dialog, so it doesn't need role=dialog scoping
  // either (and that scoping is a risk if the modal markup doesn't
  // actually use role="dialog").
  private get continueButton() {
    return this.page.getByRole("button", { name: /^Continue$/ });
  }

  // Exact Online's own OAuth login page (different origin).
  // This is a TWO-STEP form, not a single username+password+login
  // form:
  //   Step 1: only a "Username" field + "Next" button.
  //   Step 2 (after clicking Next): the username is shown read-only,
  //     a "Password" field appears, plus "Back" and "Next" buttons
  //     (the second "Next" is what actually submits the login).
  private get usernameInput() {
    return this.page.getByPlaceholder("Username");
  }

  private get passwordInput() {
    return this.page.getByPlaceholder("Password");
  }

  // Scoped with .last() defensively: if step 1's "Next" button is
  // still in the DOM (just hidden) when step 2 renders its own
  // "Next", this picks the currently-relevant one rather than
  // throwing a strict-mode violation.
  private get nextButton() {
    return this.page.getByRole("button", { name: /^Next$/ }).last();
  }

  // OAuth consent screen
  private get allowButton() {
    return this.page
      .getByRole("button", { name: /allow|accept|authorize/i })
      .first();
  }

  /**
   * Disconnects Exact Online if it is currently connected.
   * No-op if it's already disconnected OR if the card isn't even
   * rendered (e.g. because e-Boekhouden is the currently active
   * provider — these two cards appear to be mutually exclusive:
   * only the active provider's card shows on the page).
   */
  async disconnect() {
    const headingPresent = await this.exactHeading
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!headingPresent) {
      console.log(
        "Exact Online card not present on page (likely e-Boekhouden is the active connection) - nothing to disconnect.",
      );
      return;
    }

    const isConnected =
      (await this.disconnectButton.count()) > 0 &&
      (await this.disconnectButton.first().isVisible());

    if (!isConnected) {
      console.log("Already disconnected");
      return;
    }

    console.log("Disconnecting Exact Online...");

        try {
          await this.disconnectButton.scrollIntoViewIfNeeded();

          await expect(this.disconnectButton).toBeVisible();

      await this.disconnectButton.click();

      await expect(this.continueButton).toBeVisible({ timeout: 10000 });
      await this.continueButton.click();

      await expect(this.disconnectButton).toHaveCount(0, { timeout: 30000 });
      await expect(this.connectButton).toBeVisible({ timeout: 30000 });
    } catch (err) {
      await this.page.screenshot({
        path: "test-results/exactonline-disconnect-failure.png",
        fullPage: true,
      });
      console.log(
        "Disconnect flow failed. Screenshot saved to test-results/exactonline-disconnect-failure.png",
      );
      throw err;
    }

    console.log("Exact Online disconnected.");
  }

  /**
   * Connects Exact Online via OAuth login.
   * Assumes it is currently disconnected (Connect button visible).
   */
  async connect(email: string, password: string) {
    await expect(this.exactHeading).toBeVisible();

    console.log("Connecting Exact Online...");

    await this.connectButton.click();

    // Step 1: Username screen
    await expect(this.usernameInput).toBeVisible({ timeout: 60000 });
    await this.usernameInput.fill(email);
    await this.nextButton.click();

    // Step 2: Password screen (username now shown read-only)
    await expect(this.passwordInput).toBeVisible({ timeout: 30000 });
    await this.passwordInput.fill(password);
    await this.nextButton.click();

    // Consent screen (only appears on first-time authorization)
    if (await this.allowButton.isVisible().catch(() => false)) {
      await this.allowButton.click();
    }

    // Redirect back to Boekie
    await this.page.waitForURL(/profile\?tab=link/, { timeout: 120000 });

    await expect(this.disconnectButton).toBeVisible({ timeout: 60000 });

    console.log("Exact Online connected successfully.");
  }

  /**
   * Convenience wrapper: disconnect if connected, then connect fresh.
   */
  async reconnect(email: string, password: string) {
    await this.disconnect();
    await this.connect(email, password);
  }
}
