import { expect, type Page } from "@playwright/test";

export class AuditTrailVerifyPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/audit-trail",
    );

    await expect(this.page).toHaveURL(/audit-trail/);
  }

  private get searchBox() {
    return this.page.getByPlaceholder(
      "Search by user, invoice number and relation",
    );
  }

  async searchInvoice(invoiceNumber: string) {
    const search = this.page.getByPlaceholder(
      "Search by user, invoice number and relation",
    );
    await search.fill(invoiceNumber);

    await this.page.keyboard.press("Enter");

    await this.page.waitForLoadState("networkidle");
  }

  async openInvoiceCard(invoiceNumber: string) {
    const card = this.page
      .locator('div[role="button"]')
      .filter({
        has: this.page.getByText(invoiceNumber, { exact: false }),
      })
      .filter({
        has: this.page.getByText("Approved", { exact: true }),
      })
      .first();

    await expect(card).toBeVisible({ timeout: 15000 });

    await card.scrollIntoViewIfNeeded();

    await card.click();

    // Wait until events become visible
    await expect(
      this.page.getByText("booking proposal of", { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async openBookingProposal(invoiceNumber: string) {
    const proposalCard = this.page
      .locator("div.flex.cursor-pointer")
      .filter({
        has: this.page.getByText("booking proposal of", { exact: false }),
      })
      .filter({
        has: this.page.getByText("Approved", { exact: true }),
      })
      .filter({
        has: this.page.getByText(`"${invoiceNumber}"`, { exact: true }),
      });

    await expect(proposalCard).toHaveCount(1, { timeout: 15000 });

    await proposalCard.scrollIntoViewIfNeeded();

    await proposalCard.click();

    await this.page.waitForLoadState("networkidle");
  }

  //====================================================
  // Verify Booking Line
  //====================================================

  async verifyBookingLine(ledgerAccount: string, vatCode: string) {
    //===========================
    // Scroll to Booking Lines
    //===========================

    const bookingTable = this.page.locator("table").last();

    await bookingTable.evaluate((el) => {
      el.scrollIntoView({
        block: "center",
      });
    });

    await expect(bookingTable).toBeVisible();

    //===========================
    // Verify Booking Lines
    //===========================

    const rows = bookingTable.locator("tbody tr");
    // Scroll booking table horizontally to the end
const tableContainer = bookingTable.locator("xpath=ancestor::div[contains(@class,'overflow')][1]");

await tableContainer.evaluate((el: any) => {
  el.scrollLeft = el.scrollWidth;
});

    await this.page.waitForTimeout(500);
    
    const horizontalScroll = this.page.locator("div.overflow-x-auto").last();

    await horizontalScroll.evaluate((el: any) => {
      el.scrollLeft = el.scrollWidth;
    });

    await this.page.waitForTimeout(500);

    const totalRows = await rows.count();

    console.log(`Rows found: ${totalRows}`);

    for (let i = 0; i < totalRows; i++) {
      const row = rows.nth(i);

      const ledger = (await row.locator("td").last().textContent())?.trim();

      if (ledger === ledgerAccount) {
        const vat = (await row.locator("td").nth(4).textContent())?.trim();

        expect(ledger).toBe(ledgerAccount);
        expect(vat).toContain(vatCode);
        
        return;
      }
    }

    throw new Error(`Ledger "${ledgerAccount}" not found.`);
  }
}
