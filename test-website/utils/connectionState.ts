import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "connection-state.json");

export class ConnectionState {
  static getLastConnection(): "eboekhouden" | "exactonline" | null {
    if (!fs.existsSync(FILE)) return null;

    return fs.readFileSync(FILE, "utf8").trim() as
      | "eboekhouden"
      | "exactonline";
  }

  static saveConnection(name: "eboekhouden" | "exactonline") {
    fs.writeFileSync(FILE, name);
  }

  static getNextConnection() {
    const last = this.getLastConnection();

    if (last === "eboekhouden") return "exactonline";

    return "eboekhouden";
  }
}
