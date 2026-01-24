from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto("http://localhost:5173")
        page.wait_for_selector("text=Click for next quote", state="attached") # Attached but hidden

        # Hover to show hint
        page.hover('div[role="button"]')
        page.wait_for_timeout(500) # Wait for transition

        page.screenshot(path="verification/verification_desktop.png")

        # Mobile
        page_mobile = browser.new_page(viewport={"width": 375, "height": 667})
        page_mobile.goto("http://localhost:5173")
        page_mobile.wait_for_selector("text=Tap for next quote") # Visible by default on mobile?
        # Code: sm:opacity-0. So on mobile (not sm), it should be visible?
        # <div className={`... sm:opacity-0 ...`}>
        # Yes, default opacity is 1 (implied).

        page_mobile.screenshot(path="verification/verification_mobile.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
