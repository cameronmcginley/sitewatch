import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const AUTH_FILE_PATH = path.resolve(__dirname, "../../auth.json");

test.describe("E2E Tests for SiteWatch", () => {
  test("Sign in with Google and save session", async ({ page, context }) => {
    const email = process.env.GOOGLE_EMAIL;
    const password = process.env.GOOGLE_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "GOOGLE_EMAIL or GOOGLE_PASSWORD is not defined in environment variables."
      );
    }

    await page.goto("/");

    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    const googleSignInButton = page.locator(
      'span:has-text("Sign in with Google")'
    );
    await googleSignInButton.waitFor({ state: "visible" });
    await googleSignInButton.click();

    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();
    await emailInput.type(email, { delay: 10 });

    const emailNextButton = page.locator('button:has-text("Next")');
    await emailNextButton.click();

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();
    await passwordInput.type(password, { delay: 10 });

    const passwordNextButton = page.locator('button:has-text("Next")');
    await passwordNextButton.click();

    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();

    await page.waitForNavigation();

    await expect(page).toHaveURL("/");

    await context.storageState({ path: AUTH_FILE_PATH });
    console.log("Session saved to auth.json");
  });

  // Group tests that require a logged-in state
  test.describe("Logged-in E2E Tests", () => {
    // Reuse the saved session
    test.use({ storageState: AUTH_FILE_PATH });

    const generateUniqueCode = () => {
      return Math.floor(1000000 + Math.random() * 9000000).toString();
    };

    const uniqueAlias = generateUniqueCode();

    test("Navigate to Application Page", async ({ page }) => {
      await page.goto("/");

      const applicationButton = page.locator('button:has-text("Application")');
      await expect(applicationButton).toBeVisible();
      await applicationButton.click();

      await expect(page).toHaveURL(/.*app/);
    });

    test("Create a New Check", async ({ page }) => {
      await page.goto("/app");

      await page.waitForTimeout(3000);

      // Check if checks are already created and delete them
      // if checkbox with aria labvel "Select all" is visible, then items exist. If not move on.
      // If it exists click it. Then click button with arialabel "Delete selected checks"
      const selectAllCheckbox = page.locator('[aria-label="Select all"]');
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.click();
        const deleteButton = page.locator(
          '[aria-label="Delete selected checks"]'
        );
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();
        const confirmDeleteButton = page.locator(
          '[aria-label="Delete confirmation button"]'
        );
        await expect(confirmDeleteButton).toBeVisible();
        await confirmDeleteButton.click();
        // Wait 3 seconds to ensure the checks are deleted
        await page.waitForTimeout(3000);
      }

      // Configuration map
      const config = {
        dropdowns: {
          checkType: {
            label: "Check type",
            option: "KEYWORD CHECK",
          },
          frequency: {
            label: "Frequency",
            option: "5 minutes",
          },
        },
        textFields: {
          keyword: { placeholder: "Keyword", value: "Nuka" },
          url: {
            placeholder: "URL",
            value:
              "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
          },
          alias: { placeholder: "Alias", value: uniqueAlias },
          email: { placeholder: "Email", value: process.env.GOOGLE_EMAIL },
        },
        buttons: {
          createCheck: "Create Check",
          submit: "Submit",
        },
      };

      const createCheckButton = page.locator(
        `button:has-text("${config.buttons.createCheck}")`
      );
      await expect(createCheckButton).toBeVisible();
      await createCheckButton.click();

      // Handle dropdowns
      for (const [key, { label, option }] of Object.entries(config.dropdowns)) {
        const dropdown = page.getByLabel(label);
        await dropdown.waitFor({ state: "visible" });
        await dropdown.click();

        const dropdownOption = page.getByLabel(option);
        await dropdownOption.waitFor({ state: "visible" });
        await dropdownOption.click();
      }

      // Fill in text fields
      for (const [key, { placeholder, value }] of Object.entries(
        config.textFields
      )) {
        const textBox = page.getByPlaceholder(placeholder);
        await expect(textBox).toBeVisible();
        await textBox.fill(value);
      }

      const submitButton = page.locator(
        `button:has-text("${config.buttons.submit}")`
      );
      await submitButton.waitFor({ state: "visible" });
      await submitButton.click();

      await page.waitForTimeout(3000);
    });

    test("Verify Check in Table", async ({ page }) => {
      await page.goto("/app");

      const newRow = page.locator('tr:has-text("Active"):has-text("Details")');
      await expect(newRow).toBeVisible();
    });

    test("Check Gmail for Notification", async ({ page }) => {
      const gmailEmail = process.env.GOOGLE_EMAIL;
      const gmailPassword = process.env.GOOGLE_PASSWORD;

      if (!gmailEmail || !gmailPassword) {
        throw new Error(
          "GMAIL_EMAIL or GMAIL_PASSWORD is not defined in environment variables."
        );
      }

      await page.goto("https://mail.google.com/");
      await expect(page).toHaveURL(/.*mail.google.com\/mail/);

      await page.waitForTimeout(3000);

      const maxWaitTime = 600000; // 10 minutes
      const checkInterval = 30000; // 30 seconds
      let emailFound = false;

      for (let elapsed = 0; elapsed < maxWaitTime; elapsed += checkInterval) {
        const emailItems = page.locator("tr.zA"); // Gmail email row selector
        const emailCount = await emailItems.count();

        if (emailCount > 0) {
          const emailItem = emailItems.first();
          await emailItem.click();

          // Wait for the email body to appear in the right pane
          const emailBody = page.locator('div[role="listitem"]');
          await emailBody.waitFor();

          const emailText = await emailBody.innerText();
          if (emailText.includes(uniqueAlias)) {
            emailFound = true;
            break;
          }
        }

        if (emailFound) {
          break;
        }

        await page.waitForTimeout(checkInterval);
      }

      if (!emailFound) {
        throw new Error(
          "Notification email not found within the expected time."
        );
      }
    });

    test("Delete checks", async ({ page }) => {
      await page.goto("/app");

      const selectAllCheckbox = page.locator('[aria-label="Select all"]');
      await selectAllCheckbox.click();
      const deleteButton = page.locator(
        '[aria-label="Delete selected checks"]'
      );
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();
      const confirmDeleteButton = page.locator(
        '[aria-label="Delete confirmation button"]'
      );
      await expect(confirmDeleteButton).toBeVisible();
      await confirmDeleteButton.click();

      const noChecksMessage = page.locator(
        'text="No check configurations found"'
      );
      await noChecksMessage.waitFor();
      await expect(noChecksMessage).toBeVisible();
    });
  });
});
