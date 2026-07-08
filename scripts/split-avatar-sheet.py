"""Split the 32-animal avatar sprite sheet into individual square PNG files."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET_PATH = (
    Path.home()
    / ".cursor/projects/c-Users-leonardo-mendes-Projects-LioConecta-FrontEnd/assets/avatar-sheet-32-animals.png"
)
OUT_DIR = ROOT / "public/assets/avatars/animals"
OUTPUT_SIZE = 512

ANIMALS = [
    ["cat", "dog", "rabbit", "bear", "fox", "owl", "penguin", "frog"],
    ["turtle", "elephant", "lion", "monkey", "panda", "koala", "hedgehog", "duck"],
    ["chick", "bee", "butterfly", "fish", "whale", "dolphin", "snail", "crab"],
    ["octopus", "giraffe", "zebra", "pig", "cow", "sheep", "deer", "raccoon"],
]

COL_RANGES = [
    (85, 173),
    (185, 283),
    (295, 394),
    (406, 505),
    (517, 616),
    (628, 727),
    (739, 838),
    (850, 942),
]

ROW_RANGES = [
    (141, 302),
    (314, 476),
    (488, 649),
    (661, 827),
]


def is_background(r: int, g: int, b: int) -> bool:
    lum = (int(r) + int(g) + int(b)) / 3
    if lum > 235:
        return True
    if lum > 210 and max(abs(r - g), abs(g - b), abs(r - b)) < 18:
        return True
    return False


def dominant_icon_color(img: Image.Image) -> tuple[int, int, int]:
    arr = np.array(img.convert("RGBA"))
    colors: list[tuple[int, int, int]] = []

    for r, g, b, a in arr.reshape(-1, 4):
        if a < 40 or is_background(r, g, b):
            continue
        spread = max(r, g, b) - min(r, g, b)
        lum = (int(r) + int(g) + int(b)) / 3
        if spread < 12 and 80 < lum < 210:
            continue
        colors.append((int(r), int(g), int(b)))

    if not colors:
        return (180, 190, 210)

    quantized = Counter((r // 16 * 16, g // 16 * 16, b // 16 * 16) for r, g, b in colors)
    qr, qg, qb = quantized.most_common(1)[0][0]
    return qr, qg, qb


def pastel_background(r: int, g: int, b: int) -> tuple[int, int, int]:
    """Blend icon color with white for a candy pastel background."""
    mix = 0.78
    pr = int(r * (1 - mix) + 255 * mix)
    pg = int(g * (1 - mix) + 255 * mix)
    pb = int(b * (1 - mix) + 255 * mix)
    return pr, pg, pb


def crop_to_content(img: Image.Image, padding: int = 6) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    mask = np.zeros(arr.shape[:2], dtype=bool)

    for y in range(arr.shape[0]):
        for x in range(arr.shape[1]):
            r, g, b, a = arr[y, x]
            if a > 20 and not is_background(r, g, b):
                mask[y, x] = True

    if not mask.any():
        return img

    ys, xs = np.where(mask)
    x0 = max(0, int(xs.min()) - padding)
    y0 = max(0, int(ys.min()) - padding)
    x1 = min(arr.shape[1], int(xs.max()) + padding + 1)
    y1 = min(arr.shape[0], int(ys.max()) + padding + 1)
    return img.crop((x0, y0, x1, y1))


def make_transparent(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.array(rgba)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

    bg = np.vectorize(lambda rr, gg, bb: is_background(int(rr), int(gg), int(bb)))(
        r, g, b
    )
    arr[bg, 3] = 0
    return Image.fromarray(arr, "RGBA")


def scale_icon_to_fit(icon: Image.Image, canvas_size: int, fill_ratio: float = 0.88) -> Image.Image:
    """Scale icon up or down to occupy most of the square canvas."""
    max_dim = int(canvas_size * fill_ratio)
    scale = min(max_dim / icon.width, max_dim / icon.height)
    new_w = max(1, int(round(icon.width * scale)))
    new_h = max(1, int(round(icon.height * scale)))
    return icon.resize((new_w, new_h), Image.Resampling.LANCZOS)


def compose_avatar(cell: Image.Image) -> Image.Image:
    icon = make_transparent(cell)
    icon = crop_to_content(icon)
    dr, dg, db = dominant_icon_color(icon)
    br, bg, bb = pastel_background(dr, dg, db)

    canvas = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (br, bg, bb, 255))

    icon = scale_icon_to_fit(icon, OUTPUT_SIZE)
    x = (OUTPUT_SIZE - icon.width) // 2
    y = (OUTPUT_SIZE - icon.height) // 2
    canvas.paste(icon, (x, y), icon)
    return canvas


def main() -> None:
    if not SHEET_PATH.exists():
        raise FileNotFoundError(f"Sprite sheet not found: {SHEET_PATH}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SHEET_PATH).convert("RGB")

    for row_idx, (y0, y1) in enumerate(ROW_RANGES):
        for col_idx, (x0, x1) in enumerate(COL_RANGES):
            name = ANIMALS[row_idx][col_idx]
            cell = sheet.crop((x0, y0, x1, y1))
            avatar = compose_avatar(cell)
            out_path = OUT_DIR / f"avatar-{name}.png"
            avatar.save(out_path, "PNG", optimize=True)
            print(f"saved {out_path.name}")

    print(f"\nDone: 32 avatars in {OUT_DIR}")


if __name__ == "__main__":
    main()
