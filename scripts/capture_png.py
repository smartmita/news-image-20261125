import pathlib
import PIL.Image
import playwright.sync_api

CANVAS_SIZE = 1024
PREVIEW_SIZE = 300


def render_canvas(html_file: pathlib.Path, png_file: pathlib.Path, thumb_file: pathlib.Path) -> None:
    with playwright.sync_api.sync_playwright() as engine:
        chrome = engine.chromium.launch()
        tab = chrome.new_page(viewport={"width": CANVAS_SIZE, "height": CANVAS_SIZE}, device_scale_factor=1)
        tab.goto(html_file.as_uri(), wait_until="load")
        tab.screenshot(path=str(png_file), type="png")
        chrome.close()

    with PIL.Image.open(png_file) as master:
        if master.size != (CANVAS_SIZE, CANVAS_SIZE):
            raise RuntimeError(f"Expected {CANVAS_SIZE}x{CANVAS_SIZE}, got {master.size}")
        reduced = master.resize((PREVIEW_SIZE, PREVIEW_SIZE), PIL.Image.Resampling.LANCZOS)
        reduced.save(thumb_file, format="PNG")


if __name__ == "__main__":
    base_dir = pathlib.Path(__file__).resolve().parent.parent
    html_doc = base_dir / "broadsheet.html"
    output_png = base_dir / "entry.png"
    preview_png = base_dir / "entry_300px.png"
    render_canvas(html_doc, output_png, preview_png)
    print(f"Captured {output_png.stat().st_size} B master and {preview_png.stat().st_size} B 300px thumb")
