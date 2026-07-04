# -*- coding: utf-8 -*-
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src"
for css in root.rglob("*.css"):
    text = css.read_text(encoding="utf-8")
    new = re.sub(r'url\("(?!/|https?://|#|data:)([^"]+)"\)', r'url("/\1")', text)
    new = re.sub(r"url\('(?!/|https?://|#|data:)([^']+)'\)", r"url('/\1')", new)
    if new != text:
        css.write_text(new, encoding="utf-8", newline="\n")
        print(css.relative_to(root.parent))
