import { test } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage.js";
import { TaskPage } from "../pages/TasksPage.js";
import { EditInvoicePage } from "../pages/EditInvoicePage.js";
import { AuditTrailVerifyPage } from "../pages/AuditTrailVerifyPage.js";

import { LoginData } from "../test-data/testData.js";


test.describe("Invoice Edit", () => {
  test("Edit Ledger Account & VAT then Verify in Audit Trail", async ({
    page,
  }) => {
    //-----------------------------------------
    // Login
    //-----------------------------------------

    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(LoginData.email, LoginData.password);
    await loginPage.verifyDashboard();

    //-----------------------------------------
    // Open Task Page
    //-----------------------------------------

    const taskPage = new TaskPage(page);

    await taskPage.open();

    //-----------------------------------------
    // Open First Invoice
    //-----------------------------------------

    await taskPage.openFirstInvoice();

    //-----------------------------------------
    // Edit Invoice
    //-----------------------------------------

        const invoice = new EditInvoicePage(page);
        const invoiceNumber = await invoice.getInvoiceNumber();

//     const invoiceNo = "9936000584";

    const ledgerAccount = "4850 - Cursussen/seminars";

    const vatCode = "BTW hoog, inkopen 21%";

    await invoice.selectLedgerAccount(ledgerAccount);

    await invoice.selectVat(vatCode);

    //-----------------------------------------
    // Confirm Invoice
    //-----------------------------------------

    await invoice.confirmInvoice();

    //-----------------------------------------
    // Check API Error
    //-----------------------------------------

    const apiError = page.getByText("E-boekhouden API error", {
      exact: false,
    });

    if (await apiError.isVisible().catch(() => false)) {
      console.log("Purchase VAT not accepted.");

      await invoice.selectVat("BTW laag, inkopen");

      await invoice.confirmInvoice();
    }

    console.log("Invoice processed successfully.");

    //-----------------------------------------
    // Audit Trail Verification
    //-----------------------------------------

    const audit = new AuditTrailVerifyPage(page);

    await audit.open();

    await audit.searchInvoice(invoiceNumber);

await audit.openInvoiceCard(invoiceNumber);

await audit.openBookingProposal(invoiceNumber);

        await audit.verifyBookingLine(ledgerAccount, vatCode);
    
  });
      
});
