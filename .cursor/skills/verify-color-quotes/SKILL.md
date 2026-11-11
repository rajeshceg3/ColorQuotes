# Verify ColorQuotes
Color Quotes - inspirational quote app (vite + React + TS, jest tests).
## Launch
npm install, then npm run dev or npm run build && npm run preview.
## Doctor
`python3 .cursor/skills/verify-color-quotes/verify.py`
## Drive
Runs the jest suite, builds with tsc + vite, renders the built app in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-color-quotes/evidence.json`
## Cleanup
Static/streamlit server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.
