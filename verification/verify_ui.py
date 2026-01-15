from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1. Desktop View
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto("http://localhost:5173")
        page.wait_for_selector(".glass-card", state="visible")
        # Wait a bit for animations
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/desktop_view.png")

        # 2. Mobile View
        mobile_page = browser.new_page(viewport={"width": 375, "height": 812})
        mobile_page.goto("http://localhost:5173")
        mobile_page.wait_for_selector(".glass-card", state="visible")
        mobile_page.wait_for_timeout(2000)
        mobile_page.screenshot(path="verification/mobile_view.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
