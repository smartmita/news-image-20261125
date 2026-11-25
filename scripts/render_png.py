from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
html_path = root / "broadsheet.html"
out_png = root / "entry.png"
preview_300 = root / "entry_300px.png"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1024, "height": 1024}, device_scale_factor=1)
    page.goto(html_path.as_uri(), wait_until="load")
    page.screenshot(path=str(out_png), type="png")
    browser.close()

img = Image.open(out_png)
assert img.size == (1024, 1024), f"Unexpected size: {img.size}"
print("Rendered entry.png:", img.size, out_png.stat().st_size, "bytes")

thumb = img.resize((300, 300), Image.Resampling.LANCZOS)
thumb.save(preview_300, format="PNG")
print("Saved 300px preview:", preview_300.stat().st_size, "bytes")
