import { type Page, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

export class UploadInvoicePage {
  constructor(private page: Page) {}

  private get uploadButton() {
    return this.page.getByText("upload", { exact: true });
  }

  private get processingCard() {
    return this.page.getByText(/Processing \d+ document/i);
  }

  private get duplicateMessage() {
    return this.page.getByText("Invoice uploaded but detected as duplicate", {
      exact: false,
    });
  }

  async open() {
    await this.page.goto(
      "https://staging.platform.boekie-ai.com/dashboard/invoices-receipts",
    );

    await expect(this.page).toHaveURL(/invoices-receipts/);
  }

  private async waitForUploadResult(): Promise<"success" | "duplicate"> {
    // Wait until processing starts
    await expect(this.processingCard).toBeVisible({
      timeout: 30000,
    });

    const timeout = 180000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      // Duplicate invoice
      if (await this.duplicateMessage.isVisible().catch(() => false)) {
        return "duplicate";
      }

      // Processing finished
      if (!(await this.processingCard.isVisible().catch(() => false))) {
        return "success";
      }

      await this.page.waitForTimeout(1000);
    }

    throw new Error("Invoice processing timeout.");
  }

  async uploadInvoice(): Promise<string> {
    const fixturesPath = path.join(process.cwd(), "test-website", "fixtures");

    const stateFile = path.join(
      process.cwd(),
      "test-website",
      "upload-state.json",
    );

    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

    const files = fs
      .readdirSync(fixturesPath)
      .filter((file) =>
        allowedExtensions.includes(path.extname(file).toLowerCase()),
      )
      .sort();

    if (files.length === 0) {
      throw new Error("No invoice files found.");
    }

    // Read last uploaded invoice
    let lastUploaded = "";

    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      lastUploaded = state.lastUploaded ?? "";
    }

    let startIndex = 0;

    if (lastUploaded) {
      const index = files.indexOf(lastUploaded);

      if (index !== -1) {
        startIndex = (index + 1) % files.length;
      }
    }

    // Try every invoice once
    for (let i = 0; i < files.length; i++) {
      const currentIndex = (startIndex + i) % files.length;

      const selectedFile = files[currentIndex];

      if (!selectedFile) continue;

      console.log("==================================");
      console.log("Trying:", selectedFile);
      console.log("==================================");

      const filePath = path.join(fixturesPath, selectedFile);

      const [chooser] = await Promise.all([
        this.page.waitForEvent("filechooser"),
        this.uploadButton.click(),
      ]);

      await chooser.setFiles(filePath);

      const result = await this.waitForUploadResult();

      if (result === "duplicate") {
        console.log(`${selectedFile} is duplicate.`);

        // Refresh page before trying another invoice
        await this.page.reload();

        await expect(this.page).toHaveURL(/invoices-receipts/);

        continue;
      }

      console.log(`${selectedFile} uploaded successfully.`);

      fs.writeFileSync(
        stateFile,
        JSON.stringify(
          {
            lastUploaded: selectedFile,
          },
          null,
          2,
        ),
      );

      return selectedFile;
    }

    throw new Error("All invoices in fixtures are duplicates.");
  }
}
