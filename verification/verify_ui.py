from playwright.sync_api import sync_playwright
import time

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop View
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        try:
            page.goto("http://localhost:5173", timeout=10000)
            # Wait for any h1 to be visible (quote text)
            page.wait_for_selector("h1", timeout=5000)
            time.sleep(2)
            page.screenshot(path="verification/desktop_view.png")
            print("Desktop screenshot taken.")
        except Exception as e:
            print(f"Desktop verification failed: {e}")
            page.screenshot(path="verification/desktop_error.png")

        # Mobile View
        page_mobile = browser.new_page(viewport={'width': 375, 'height': 667})
        try:
            page_mobile.goto("http://localhost:5173", timeout=10000)
            page_mobile.wait_for_selector("h1", timeout=5000)
            time.sleep(2)
            page_mobile.screenshot(path="verification/mobile_view.png")
            print("Mobile screenshot taken.")
        except Exception as e:
             print(f"Mobile verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_ui()
