import { test, expect } from '@playwright/test'

test.describe('Admin authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage before each test
    await page.context().clearCookies()
  })

  test('login page loads at /admin/login', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByPlaceholder('admin')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('visiting /admin without auth redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login with invalid credentials shows error message', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByPlaceholder('admin').fill('wronguser')
    await page.getByPlaceholder('••••••••').fill('wrongpass')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid credentials|no active account/i)).toBeVisible({ timeout: 5000 })
  })

  test('login page shows "Admin Panel" subtitle', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByText('Admin Panel')).toBeVisible()
  })

  test('login form requires username field', async ({ page }) => {
    await page.goto('/admin/login')
    // Leave username empty, fill password
    await page.getByPlaceholder('••••••••').fill('somepassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // HTML5 required validation prevents submission — we stay on login page
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login form requires password field', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByPlaceholder('admin').fill('someuser')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
