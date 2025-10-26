
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # Tunggu sidebar dimuat
    page.wait_for_selector(".sidebar")

    # Temukan label sakelar sorotan dan klik
    highlighter_switch = page.locator(".switch-highlighter")
    highlighter_switch.click()

    # Tunggu sebentar untuk memastikan status aktif diterapkan
    page.wait_for_timeout(500)

    # Ambil tangkapan layar dari bilah sisi
    sidebar = page.locator(".sidebar")
    sidebar.screenshot(path="jules-scratch/verification/highlighter_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
