import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { ConnectionsPage } from "../pages/ConnectionsPage.js";
import { ConnectExactOnlinePage } from "../pages/ConnectExactOnlinePage.js";
import { LoginData, TestData } from "../test-data/testData.js";
import { ConnectionState } from "../utils/connectionState.js";

test("Disconnect and Connect e-Boekhouden", async ({ page }) => {
  const login = new LoginPage(page);
  const connection = new ConnectionsPage(page);
  const exactOnline = new ConnectExactOnlinePage(page);
  const lastProvider = ConnectionState.getLastConnection();

  await login.navigate();

  await login.login(LoginData.email, LoginData.password);

  await login.verifyDashboard();
  await connection.open();

  if (lastProvider === "eboekhouden") {
    await (connection).disconnect();
    await exactOnline.reconnect(
      TestData.exactOnline.email,
      TestData.exactOnline.password,
    );

    ConnectionState.saveConnection("exactonline");
  } else {
    // Currently on Exact Online -> switch to e-Boekhouden
    await exactOnline.disconnect();
    await connection.reconnect(TestData.integration.apiKey);

    ConnectionState.saveConnection("eboekhouden");
  }

  // await connection.reconnect(TestData.integration.apiKey);
});
