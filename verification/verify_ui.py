from playwright.sync_api import sync_playwright

def verify_ui(page):
    page.goto("http://localhost:5173/")

    # Wait for the main quote card to be visible
    page.wait_for_selector(".glass-panel", state="visible", timeout=10000)

    # Hover over the card to trigger the spotlight effect and 3D tilt
    card = page.locator(".glass-panel")

    # Move mouse to the top-left quadrant to trigger a visible tilt and spotlight shift
    box = card.bounding_box()
    page.mouse.move(box["x"] + box["width"] * 0.2, box["y"] + box["height"] * 0.2)

    # Wait a tiny bit for the CSS transition to apply
    page.wait_for_timeout(600)

    page.screenshot(path="verification/verification-hover.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ui(page)
        finally:
            browser.close()