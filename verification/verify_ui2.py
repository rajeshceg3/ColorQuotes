import time
from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Wait for quote to appear
        page.wait_for_selector('h1.font-serif')

        # Double tap the card to favorite
        card = page.locator('button[aria-label="Display next quote"]')
        card.dblclick(force=True)

        # Wait a tiny bit for heart animation to appear
        time.sleep(0.1)

        page.screenshot(path="verification.png")
        browser.close()

if __name__ == "__main__":
    verify_ui()
