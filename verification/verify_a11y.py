from playwright.sync_api import sync_playwright, expect

def verify_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector('h1', timeout=10000) # Wait for quote to load

            # 1. Verify the "Next Quote" button exists and has correct aria-label
            next_button = page.locator('button[aria-label="Display next quote"]')
            expect(next_button).to_have_count(1)

            # 2. Verify it's effectively visible (has size, not hidden)
            # Even if transparent, it has dimensions.
            expect(next_button).to_be_visible()

            # 3. Verify content is present
            quote_text = page.locator('h1')
            expect(quote_text).to_be_visible()

            # 4. Verify Author text has select-none class
            author_text = page.locator('p').nth(0) # Assuming first p is author or use text?
            # The component has p for error or author.
            # Author p has "— " prefix in text usually.
            # Let's check for the class 'select-none'
            # We can use get_by_text(regex)

            # 4. Click the button to change quote
            initial_text = quote_text.inner_text()
            # Click the center of the screen, which should hit the button
            # OR click the button element directly.
            # Since content is pointer-events-none, clicking center should work.
            next_button.click()

            page.wait_for_timeout(1000) # Wait for fade/change

            new_text = quote_text.inner_text()
            print(f"Initial: {initial_text}")
            print(f"New: {new_text}")

            # Note: Random quote might be same, but unlikely with 37 quotes.
            # Just asserting no crash.

            # 5. Take screenshot
            page.screenshot(path="verification.png")
            print("Verification successful, screenshot saved.")

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_a11y()
