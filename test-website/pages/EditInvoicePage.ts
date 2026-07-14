import { expect, type Page } from "@playwright/test";

export class EditInvoicePage {
  constructor(private page: Page) {}

  // =====================================================
  // Locators
  // =====================================================

  private get ledgerDropdown() {
    return this.page.locator("button").filter({
      hasText: /7000 - Inkopen|LEDGER ACCOUNT/i,
    });
  }

  private get vatDropdown() {
    return this.page.locator("button").filter({
      hasText: /BTW|VAT/i,
    });
  }

  private get confirmButton() {
    return this.page.getByRole("button", {
      name: "Confirm",
    });
  }

  private get ledgerButton() {
    return this.page.getByRole("button", {
      name: "Edit Ledger account",
    });
  }

  private get vatButton() {
    return this.page.getByRole("button", {
      name: "Edit VAT",
    });
  }

  // =====================================================
  // Ledger Account
  // =====================================================

  async selectLedgerAccount(account: string) {
    await this.ledgerButton.first().click();

    const option = this.page.getByRole("option").filter({
      hasText: account,
    });

    await option.waitFor();

    await option.click();
    await expect(option).toBeHidden();

    await this.page.waitForTimeout(300);
  }

  // =====================================================
  // VAT
  // =====================================================

  async selectVat(vat: string) {
    await this.vatButton.first().click();

    const option = this.page.getByRole("option").filter({
      hasText: vat,
    });

    await option.waitFor();
    await option.click();
    await this.vatButton.first().click();
    //   await option.scrollIntoViewIfNeeded();
  }

  // =====================================================
  // Confirm
  // =====================================================

  async confirmInvoice() {
    await this.confirmButton.click();

    // Success notification
    const success = this.page.locator(
      "text=/Saved|Updated|Confirmed successfully/i",
    );

    if (await success.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Invoice confirmed successfully.");
      return;
    }

    // Purchase VAT error
    const purchaseVatError = this.page.locator(
      "text=E-boekhouden API error: VAT code must be of type purchase.",
    );

    if (
      await purchaseVatError.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      throw new Error(
        "Selected VAT belongs to Sales. Please select a Purchase VAT.",
      );
    }

    // Any other error
    const genericError = this.page.locator("text=/error|failed|invalid/i");

    if (await genericError.isVisible({ timeout: 3000 }).catch(() => false)) {
      throw new Error("Invoice confirmation failed.");
    }
  }

  async getInvoiceNumber(): Promise<string> {
    const invoiceButton = this.page.getByRole("button", {
      name: "Edit Invoice number",
    });

    await expect(invoiceButton).toBeVisible();

    const text = (await invoiceButton.textContent())?.trim();

    if (!text) {
      throw new Error("Invoice number not found.");
    }

    const match = text.match(/\d{10}/);

    if (!match) {
      throw new Error("Invoice number format is invalid.");
    }

    return match[0];
  }

  // =====================================================
  // Complete Flow
  // =====================================================

  async updateInvoice(
    ledgerAccount: string,
    purchaseVat: string,
  ): Promise<string> {
    const invoiceNumber = await this.getInvoiceNumber();

    await this.selectLedgerAccount(ledgerAccount);

    await this.selectVat(purchaseVat);

    await this.confirmInvoice();

    return invoiceNumber;
  }
}
