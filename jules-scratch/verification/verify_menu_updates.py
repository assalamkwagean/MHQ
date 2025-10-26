
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # Tunggu menu dimuat
    page.wait_for_selector(".kategori-title")

    # Klik pada judul kategori pertama untuk membukanya
    page.locator(".kategori-title").first.click()

    # Tunggu animasi selesai
    page.wait_for_timeout(500)

    # Ambil tangkapan layar dari sidebar
    sidebar = page.locator(".sidebar")
    sidebar.screenshot(path="jules-scratch/verification/menu_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
