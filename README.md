# Boekie AI Automation Testing

This project automates the end-to-end testing of the Boekie AI platform using **Playwright** with **TypeScript**.

The automation covers:

- User Signup
- Company Selection
- Accounting Integration
  - e-Boekhouden
  - Exact Online
- Invoice Upload
- Task Processing
- Invoice Confirmation
- Package Selection
- Stripe Payment

---

# Tech Stack

- Playwright
- TypeScript
- Node.js
- dotenv

---

# Project Structure

```
boekie-automation/
│
├── fixtures/
│   ├── invoice_9936000571.png
│   ├── invoice_9936000572.png
│   ├── invoice_9936000573.png
│   ├── invoice_9936000574.png
│   └── ...
├── helpers/
│   └── IntegrationTracker.ts
│
├── pages/
│   ├── CompanyPage.ts
│   ├── CredentialsPage.ts
│   ├── ConnectionsPage.ts
│   ├── ConnectExactOnlinePage.ts
│   ├── DivisionPage.ts
│   ├── EmailForwardingPage.ts
│   ├── EmailPage.ts
│   ├── ExactOnlinePage.ts
│   ├── IntegrationPage.ts
│   ├── InvoiceUploadPage.ts
│   ├── LoginPage.ts
│   ├── PackagePage.ts
│   ├── SignUpPage.ts
│   ├── StripePage.ts
│   ├── SuccessPage.ts
│   └── TaskPage.ts
│   ├── UpgradePlanPage.ts
│
├── test-data/
│   └── testData.ts
│
├── tests/
│   ├── aiSetting.spec.ts
│   ├── Connection.spec.ts
│   └── onboarding.spec.ts
│   ├── Connection.spec.ts
│   ├── UpgradePlan.spec.ts
│   ├── uploadInvoice.spec.ts
├── utils
│   └── connectionState.ts
├── fixtures/
│   ├── invoice.pdf
│   ├── invoice.png
│   └── invoice.webp
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
```

Go to project directory.

```bash
cd boekie-automation
```

Install dependencies.

```bash
npm install
```

Install Playwright browsers.

```bash
npx playwright install
```

---

# Environment Variables

Create a `.env` file.

Example:

```env
BASE_URL=https://staging.platform.boekie-ai.com

EMAIL=test@example.com
PASSWORD=Password123

API_KEY=xxxxxxxxxxxx
```

---

# Running Tests

Run all tests.

```bash
npx playwright test
```

Run UI Mode.

```bash
npx playwright test --ui
```

Run headed mode.

```bash
npx playwright test --headed
```

Run only Chromium.

```bash
npx playwright test --project=chromium
```

Run only Firefox.

```bash
npx playwright test --project=firefox
```

Run only WebKit.

```bash
npx playwright test --project=webkit
```

Run a specific test.

```bash
npx playwright test tests/onboarding.spec.ts
```

---

# Test Flow

## 1. User Signup

- Navigate to Signup page
- Fill registration form
- Accept Terms
- Submit

---

## 2. Company Selection

The automation:

- Searches available companies
- Selects first available company
- If company already exists:
  - Opens Manual Company Form
  - Fills company information
  - Saves company

---

## 3. Integration Selection

Automation supports two accounting integrations.

### e-Boekhouden

Flow:

- Search e-Boekhouden
- Continue with Linking
- Enter API Key
- Save
- Continue

---

### Exact Online

Flow:

- Search Exact Online
- Login to Exact
- Handle permission screen
- Allow access
- Redirect back to Boekie
- Select Division
- Continue

Permission page is automatically skipped if the Exact account was previously authorized.

---

# Integration Tracker

The project automatically alternates between:

- e-Boekhouden
- Exact Online

This prevents repeatedly testing the same integration.

Example:

```
Run 1

e-Boekhouden

↓

Run 2

Exact Online

↓

Run 3

e-Boekhouden

↓

Run 4

Exact Online
```

---

# Invoice Upload

Supported formats:

- PDF
- PNG
- JPG
- JPEG
- WEBP

Unsupported formats should fail validation.

Example upload:

```ts
await page.setInputFiles(
  'input[type="file"]',
  'fixtures/invoice.pdf'
);
```

---

# Task Processing

Automation:

- Navigate to Tasks page
- Wait for invoice processing
- Open invoice task
- Review invoice
- Click Confirm

---

# Email Flow

Automation handles:

- Email Address
- Email Confirmation
- Email Forwarding

---

# Package Selection

Automatically selects:

- Groei Plan

---

# Stripe Payment

Automation fills:

- Card Number
- Expiry
- CVC
- Name

Then completes payment.

---

# Browser Support

Supported browsers:

- Chromium
- Firefox
- WebKit

Configured inside:

```
playwright.config.ts
```

---

# Reports

Generate HTML Report.

```bash
npx playwright show-report
```

---

# Screenshots

Capture on failure:

```ts
await page.screenshot({
    path: 'error.png'
});
```

---

# Trace Viewer

Open trace.

```bash
npx playwright show-trace trace.zip
```

---

# Common Issues

## Timeout while waiting for URL

Instead of waiting for URL, wait for UI elements.

Example:

```ts
await expect(
page.getByRole('button')
).toBeVisible();
```

---

## Company Already Exists

Automation automatically:

- detects existing company
- opens manual company form
- fills company details

---

## Exact Online Permission Screen

Automation supports two scenarios.

### First Login

Permission page appears.

Automation:

- Selects permissions
- Allows access

### Existing Login

Permission page does not appear.

Automation automatically continues to Division page.

---

## Invoice Not Appearing

Invoice processing is asynchronous.

Automation waits until the task is created before continuing.

---

# Coding Pattern

This project follows the Page Object Model (POM).

Example:

```
tests/
        │
        ▼

SignUpPage

        ▼

CompanyPage

        ▼

IntegrationPage

        ▼

InvoiceUploadPage

        ▼

TaskPage

```

# Upload Logic

The automation performs the following steps:

1. Login
2. Navigate to **Invoices & Receipts**
3. Read every invoice from the fixtures folder
4. Start from the next invoice after the previously uploaded invoice
5. Upload the invoice
6. Wait for Boekie to process the document
7. If duplicate

```
Invoice uploaded but detected as duplicate
```

the automation automatically uploads the next invoice.

8. If upload succeeds

- Save the invoice name into

```
upload-state.json
```

9. Navigate to the Tasks page

10. Open the uploaded invoice

11. Click Confirm

---

# Upload State

The project stores the last successfully uploaded invoice.

File

```
upload-state.json
```

Example

```json
{
  "lastUploaded": "invoice_9936000575.png"
}
```

Next execution starts from

```
invoice_9936000576.png
```

instead of uploading the same invoice again.

---

# Duplicate Handling

If Boekie returns

```
Invoice uploaded but detected as duplicate
```

the framework will

- Ignore the duplicate
- Reload the page
- Pick the next invoice
- Retry automatically

The test only stops when

- A new invoice uploads successfully
- OR every invoice is already duplicated

---

# Test Flow

```
Login
      │
      ▼
Dashboard
      │
      ▼
Invoices & Receipts
      │
      ▼
Upload Invoice
      │
      ▼
Duplicate?
      │
 ┌────┴─────┐
 │          │
Yes        No
 │          │
 ▼          ▼
Next     Wait for Processing
Invoice      │
             ▼
        Tasks Page
             │
             ▼
     Open Uploaded Invoice
             │
             ▼
       Click Confirm
             │
             ▼
        Test Completed
```

## Connections

Automation supports both accounting software integrations.

### e-Boekhouden

Implemented features:

- Detect connection state.
- Disconnect existing connection.
- Handle confirmation popup.
- Reconnect using API Key.
- Validate successful connection.

---

### Exact Online

Implemented features:

- Detect connection state.
- Disconnect existing connection.
- Handle confirmation popup.
- OAuth login automation.
- Enter username.
- Click Next.
- Enter password.
- Complete authorization flow.
- Redirect back to Boekie.
- Verify successful connection.

---

# Connection Switching Logic

A utility file is used to remember the last tested accounting software.

```
utils/
    connectionState.ts
```

The workflow is:

Run 1

```
e-Boekhouden
        ↓
Store:
exactonline
```

Run 2

```
Exact Online
        ↓
Store:
eboekhouden
```

This allows continuous alternating between integrations without modifying the test.

---

# Test Data

Sensitive data is stored inside

```
test-data/
    testData.ts
```

Contains

- Login Email
- Login Password
- e-Boekhouden API Key
- Exact Online Email
- Exact Online Password

---

# Test Scenario

## Connection Automation

1. Login
2. Open Profile
3. Navigate to Connections
4. Read previous connection state
5. If previous connection was e-Boekhouden

   - Disconnect
   - Reconnect
   - Save Exact Online as next connection

6. If previous connection was Exact Online

   - Disconnect
   - OAuth Login
   - Reconnect
   - Save e-Boekhouden as next connection

---

# Utilities

## connectionState.ts

Responsible for

- Reading last connected software
- Saving next software
- Alternating integrations automatically

---

---

# Best Practices

- Use Page Object Model.
- Avoid hardcoded waits.
- Use explicit waits.
- Prefer locators over XPath.
- Store credentials in `.env`.
- Keep test data separate.
- Use reusable helper classes.

---

# Future Improvements

- GitHub Actions CI/CD
- Azure DevOps Pipeline
- Parallel Execution
- Slack Notifications
- Allure Reports
- Cross Environment Testing
- Docker Support

---

# Author

**Waqas Bhatti**

QA Automation Engineer

Playwright | TypeScript | End-to-End Testing