import { test, expect } from '@playwright/test'

/**
 * Admin CRUD E2E tests.
 *
 * These tests require a running Django backend with a superadmin test account.
 * Set TEST_ADMIN_USER and TEST_ADMIN_PASS environment variables, or they default
 * to 'testadmin' / 'testadmin123' which must exist in the test DB.
 *
 * Skip this suite in CI unless those env vars are set.
 */

const ADMIN_USER = process.env.TEST_ADMIN_USER ?? 'testadmin'
const ADMIN_PASS = process.env.TEST_ADMIN_PASS ?? 'testadmin123'

async function loginAsAdmin(page) {
  await page.goto('/admin/login')
  await page.getByPlaceholder('admin').fill(ADMIN_USER)
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASS)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin(?!\/login)/, { timeout: 8000 })
}

test.describe('Admin dashboard', () => {
  test.skip(!process.env.TEST_ADMIN_USER, 'TEST_ADMIN_USER not set — skipping admin CRUD tests')

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await loginAsAdmin(page)
  })

  test('dashboard loads with stat cards', async ({ page }) => {
    await page.goto('/admin')
    // Wait for the dashboard content to load
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 })
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    // Find and click logout button
    const logoutBtn = page.getByRole('button', { name: /logout|sign out/i })
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 })
    }
  })
})

test.describe('Admin players CRUD', () => {
  test.skip(!process.env.TEST_ADMIN_USER, 'TEST_ADMIN_USER not set — skipping admin CRUD tests')

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await loginAsAdmin(page)
  })

  test('players page loads with table', async ({ page }) => {
    await page.goto('/admin/players')
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('can open add player modal', async ({ page }) => {
    await page.goto('/admin/players')
    const addBtn = page.getByRole('button', { name: /add player|new player/i })
    if (await addBtn.count() > 0) {
      await addBtn.click()
      // A form or modal should appear
      await expect(page.locator('form, [role="dialog"]').first()).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('Admin news CRUD', () => {
  test.skip(!process.env.TEST_ADMIN_USER, 'TEST_ADMIN_USER not set — skipping admin CRUD tests')

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await loginAsAdmin(page)
  })

  test('news page loads with table', async ({ page }) => {
    await page.goto('/admin/news')
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('can open add article modal', async ({ page }) => {
    await page.goto('/admin/news')
    const addBtn = page.getByRole('button', { name: /add article|new article|add news/i })
    if (await addBtn.count() > 0) {
      await addBtn.click()
      await expect(page.locator('form, [role="dialog"]').first()).toBeVisible({ timeout: 3000 })
    }
  })
})
