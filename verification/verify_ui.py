from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate desktop
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        page.goto("http://localhost:4173")

        # Wait for quote to appear
        page.wait_for_selector(".glass-card")

        # Take desktop screenshot
        page.screenshot(path="verification/desktop_view.png")

        # Emulate mobile
        context_mobile = browser.new_context(viewport={'width': 375, 'height': 667}, is_mobile=True)
        page_mobile = context_mobile.new_page()
        page_mobile.goto("http://localhost:4173")
        page_mobile.wait_for_selector(".glass-card")

        # Take mobile screenshot
        page_mobile.screenshot(path="verification/mobile_view.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
