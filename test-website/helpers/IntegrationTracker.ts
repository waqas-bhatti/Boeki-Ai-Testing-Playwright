/// <reference types="node" />
import * as fs from "fs";
import * as path from "path";

export class IntegrationTracker {
  private static readonly STATE_FILE = path.join(
    process.cwd(),
    "integration-state.json",
  );

  private static getState(): { lastUsed: "eboekhouden" | "exact" } {
    try {
      if (fs.existsSync(this.STATE_FILE)) {
        const data = fs.readFileSync(this.STATE_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading state file:", error);
    }

    // Default state
    return { lastUsed: "exact" };
  }

  private static saveState(state: { lastUsed: "eboekhouden" | "exact" }): void {
    try {
      fs.writeFileSync(this.STATE_FILE, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error("Error saving state file:", error);
    }
  }

  getNextIntegration(): "eboekhouden" | "exact" {
    const state = IntegrationTracker.getState();

    // Toggle: if last was "exact", next is "eboekhouden" and vice versa
    const nextIntegration =
      state.lastUsed === "exact" ? "eboekhouden" : "exact";

    // Save the new state
    IntegrationTracker.saveState({ lastUsed: nextIntegration });

    console.log(`Previous: ${state.lastUsed}, Next: ${nextIntegration}`);

    return nextIntegration;
  }

  // Optional: Reset to start fresh
  static reset(): void {
    try {
      if (fs.existsSync(this.STATE_FILE)) {
        fs.unlinkSync(this.STATE_FILE);
      }
    } catch (error) {
      console.error("Error resetting state:", error);
    }
  }
}
