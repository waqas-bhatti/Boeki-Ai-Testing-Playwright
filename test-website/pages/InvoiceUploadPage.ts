import { type Page, expect } from "@playwright/test";

export class InvoiceUploadPage {
  constructor(private page: Page) {}

  private get heading() {
    return this.page.getByText("Received receipts or invoices?");
  }
  private get skipBtn() {
    return this.page.getByRole("button", { name: "Skip" });
  }
  private get uploadInput() {
    return this.page.locator("input[type='file']");
  }
  async verifyPage() {
    await expect(this.heading).toBeVisible();
  }

  async skip() {
    await this.skipBtn.click();
    await this.page.waitForURL(
      "**https://staging.platform.boekie-ai.com/onboarding-v2/links/email**",
    );
  }

  // For dashboard flow (after signin)
  async navigate() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/invoices-receipts",
    );
    await expect(this.page.getByText("Invoices & Receipts")).toBeVisible({
      timeout: 10000,
    });
  }

  // Upload invoice (for dashboard flow)
  async uploadInvoice(filePath: string) {
    const allowedExtensions = [".pdf", ".webp", ".png", ".jpg", ".jpeg"];
    const fileExtension = "." + filePath.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `Invalid file type: ${fileExtension}. Allowed: ${allowedExtensions.join(", ")}`,
      );
    }

    await this.uploadInput.setInputFiles(filePath);

    // Wait for upload to complete
    await expect(this.page.getByText(/uploading|processing/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(this.page.getByText(/uploading|processing/i)).not.toBeVisible({
      timeout: 30000,
    });
    
  }

  // Verify upload success
  async verifyUploadSuccess() {
    await expect(
      this.page.getByText("Total number of documents"),
    ).toBeVisible();
   
  }
}
