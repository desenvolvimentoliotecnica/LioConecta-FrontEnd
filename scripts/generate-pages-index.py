# -*- coding: utf-8 -*-
"""Generate src/generated/pagesIndex.ts with explicit raw imports."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "generated" / "pagesIndex.ts"
PAGES_DIR = ROOT / "src" / "generated" / "pages"

ids = sorted(p.name for p in PAGES_DIR.iterdir() if p.is_dir())

lines = [
    "// Auto-generated — run: python scripts/generate-pages-index.py",
    "",
]

for pid in ids:
    lines.append(f'import content_{pid.replace("-", "_")} from "./pages/{pid}/content.html?raw";')
    lines.append(f'import styles_{pid.replace("-", "_")} from "./pages/{pid}/styles.css?inline";')

lines.append("")
lines.append("export const pageAssets: Record<string, { content: string; styles: string }> = {")
for pid in ids:
    var = pid.replace("-", "_")
    lines.append(f'  "{pid}": {{ content: content_{var}, styles: styles_{var} }},')
lines.append("};")
lines.append("")

OUT.write_text("\n".join(lines), encoding="utf-8", newline="\n")
print(f"Wrote {OUT.relative_to(ROOT)} ({len(ids)} pages)")
