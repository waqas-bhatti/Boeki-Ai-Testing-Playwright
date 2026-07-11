import { expect, type Page } from "@playwright/test";

export class AuditTrailPage {
  constructor(private page: Page) {}

  private get searchBox() {
    return this.page.getByPlaceholder(
      "Search by user, invoice number and relation",
    );
  }

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/audit-trail",
      {
        waitUntil: "networkidle",
      },
    );

    await expect(this.page).toHaveURL(/audit-trail/);
  }

  // --------------------------------------------------
  // Extract invoice number from filename
  // invoice_9936000584.png  -> 9936000584
  // invoice-9936000584.pdf  -> 9936000584
  // --------------------------------------------------
  private getInvoiceNumber(fileName: string): string {
    const match = fileName.match(/\d+/);

    if (!match) {
      throw new Error(`Invoice number not found in filename: ${fileName}`);
    }

    return match[0];
  }

  async searchInvoice(fileName: string): Promise<string> {
    const invoiceNumber = this.getInvoiceNumber(fileName);

    console.log("Searching invoice:", invoiceNumber);

    await expect(this.searchBox).toBeVisible();

    await this.searchBox.fill("");

    await this.searchBox.fill(invoiceNumber);

    await this.page.waitForLoadState("networkidle");

    return invoiceNumber;
  }

  async waitForInvoice(fileName: string) {
    const invoiceNumber = this.getInvoiceNumber(fileName);

    await expect(
      this.page.getByText(invoiceNumber, { exact: false }).first(),
    ).toBeVisible({
      timeout: 120000,
    });

    console.log(`Invoice ${invoiceNumber} found.`);
  }

  async verifyAutoProcessed(fileName: string) {
    const invoiceNumber = this.getInvoiceNumber(fileName);

    await expect(
      this.page.getByText(invoiceNumber, { exact: false }).first(),
    ).toBeVisible({
      timeout: 120000,
    });

    console.log(`Auto processed invoice found: ${invoiceNumber}`);
  }
}
