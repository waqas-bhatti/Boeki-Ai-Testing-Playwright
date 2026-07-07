import { type Page, expect } from "@playwright/test";
import path from "path";

export class InvoicePage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/invoices-receipts",
    );

    await expect(this.page).toHaveURL(/invoices-receipts/);
  }

  // Upload PDF, PNG, WEBP, JPG
  async uploadInvoice(fileName: string) {
    const filePath = path.join(process.cwd(), "fixtures", fileName);

    // Click on the "upload" text inside dropzone
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.page.getByText("upload", { exact: true }).click(),
    ]);

    await fileChooser.setFiles(filePath);
  }

  async waitForProcessing() {
    // Wait until invoice appears in dashboard
    await expect(this.page.getByText(/Total number of documents/i)).toBeVisible(
      {
        timeout: 60000,
      },
    );
  }

  async openFirstTask() {
    await this.page.goto("https://staging.platform.boekie-ai.com/dashboard/tasks");

    // Wait until uploaded invoice task appears
    const task = this.page.locator("text=Process Invoice").first();

    await expect(task).toBeVisible({
      timeout: 120000,
    });

    await task.click();

    await expect(this.page).toHaveURL(/taskId=/);
  }

  async confirmInvoice() {
    await this.page.getByRole("button", { name: /Confirm/i }).click();
  }
}
