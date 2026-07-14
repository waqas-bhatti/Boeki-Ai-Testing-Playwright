import { test } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage.js";
import { ProfilePage } from "../pages/ProfilePage.js";

import { LoginData } from "../test-data/testData.js";
import {
  randomFirstName,
  randomLastName,
      randomPhoneNumber,
  randomCountry
} from "../test-data/testData.js";

test("Update profile account details", async ({ page }) => {
  const login = new LoginPage(page);
  const profile = new ProfilePage(page);

  await login.navigate();
  await login.login(LoginData.email, LoginData.password);
  await login.verifyDashboard();

  const firstName = randomFirstName();
  const lastName = randomLastName();
  const phoneNumber = randomPhoneNumber();
      const country = randomCountry();

  console.log(
    `Updating profile with: ${firstName} ${lastName}, phone ${phoneNumber}`,
  );

  await profile.updateProfile({
    firstName,
    lastName,
    country,
    phoneNumber,
  });
});
