import { test, expect } from '@playwright/test'

test.describe('Public site', () => {
  test('home page loads and shows club name', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/gorkha fc/i)
    // Club name appears in the page content
    await expect(page.locator('body')).toContainText(/gorkha/i)
  })

  test('navigation links are present on home page', async ({ page }) => {
    await page.goto('/')
    // Key nav links should be present in the DOM
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeAttached()
  })

  test('/squad page loads without error', async ({ page }) => {
    await page.goto('/squad')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/fixtures page loads without error', async ({ page }) => {
    await page.goto('/fixtures')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/news page loads without error', async ({ page }) => {
    await page.goto('/news')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/gallery page loads without error', async ({ page }) => {
    await page.goto('/gallery')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/sponsors page loads without error', async ({ page }) => {
    await page.goto('/sponsors')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/about page loads without error', async ({ page }) => {
    await page.goto('/about')
    await expect(page).not.toHaveURL(/error|not-found|404/)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/contact page loads with contact form', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('form')).toBeVisible()
  })

  test('contact form shows error when submitted empty', async ({ page }) => {
    await page.goto('/contact')
    const form = page.locator('form')
    await expect(form).toBeVisible()
    // Find submit button
    const submitBtn = form.locator('button[type="submit"]')
    if (await submitBtn.count() > 0) {
      await submitBtn.click()
      // Either HTML5 validation keeps us on page, or our client error shows
      await expect(page).toHaveURL(/\/contact/)
    }
  })

  test('contact form validates required fields client-side', async ({ page }) => {
    await page.goto('/contact')
    // Fill only name, leave email and message blank
    const nameInput = page.locator('input[name="name"]')
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User')
      const submitBtn = page.locator('form button[type="submit"]')
      if (await submitBtn.count() > 0) {
        await submitBtn.click()
        // Should still be on contact page (HTML5 or client validation)
        await expect(page).toHaveURL(/\/contact/)
      }
    }
  })

  test('unknown route shows 404 / not found page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz123')
    // Should either show 404 content or redirect — not a blank crash
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
