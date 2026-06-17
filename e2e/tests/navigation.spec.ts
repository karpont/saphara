import { test, expect } from "@playwright/test";

test.describe("Saphara temel akis", () => {
  test("anasayfa yuklenir ve sol menu gorunur", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Saphara")).toBeVisible();
    await expect(page.getByRole("link", { name: /Reels/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Market/i })).toBeVisible();
  });

  test("korumali sayfa giris ekrani gosterir", async ({ page }) => {
    await page.goto("/create");
    // Giris yapilmamis: cuzdan bagla / giris ekrani
    await expect(page.getByText(/Saphara'ya Giris|Cuzdani Bagla/i)).toBeVisible();
  });

  test("market sayfasi acilir", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { name: /Market/i })).toBeVisible();
    await expect(page.getByText(/Escrow korumali/i)).toBeVisible();
  });

  test("kesfet kategori filtreleri calisir", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByPlaceholder(/Ara/i)).toBeVisible();
    await page.getByRole("button", { name: /Muzik/i }).click();
  });
});

test.describe("Saphara tam surum sayfalari", () => {
  test("haberler sayfasi kategori filtreleriyle acilir", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { name: /Guncel Haberler/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Teknoloji/i })).toBeVisible();
  });

  test("hakkinda sayfasi deger onermesini gosterir", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/Neden Saphara/i)).toBeVisible();
    await expect(page.getByText(/Uretici gercekten kazanir/i)).toBeVisible();
  });
});
