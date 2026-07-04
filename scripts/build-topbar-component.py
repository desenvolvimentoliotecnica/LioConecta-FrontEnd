# -*- coding: utf-8 -*-
"""Single source topbar partial — inject into all HTML pages at build time."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARTIALS = ROOT / "partials"
ASSETS = ROOT / "assets"
PARTIAL_PATH = PARTIALS / "topbar.html"
SOURCE = ROOT / "servicos-beneficios.html"

TOPBAR_HEADER_RE = re.compile(
    r"    <header class=\"topbar\" aria-label=\"Barra superior\">.*?</header>\n",
    re.DOTALL,
)
TOPBAR_MOUNT_RE = re.compile(r"    <div id=\"topbar-mount\"></div>\n", re.DOTALL)

TOPBAR_CSS_RE = re.compile(
    r"    /\* TOP BAR \*/.*?    \.icon-btn-wrap::after \{.*?\n    \}\n\n",
    re.DOTALL,
)

SHELL_CSS_LINK = '  <link rel="stylesheet" href="assets/shell.css" />\n'
TOPBAR_JS = '  <script src="assets/topbar.js"></script>\n'


def strip_active(html: str) -> str:
    html = re.sub(r" is-active", "", html)
    return html


def extract_partial_from_source(text: str) -> str:
    m = TOPBAR_HEADER_RE.search(text)
    if not m:
        raise SystemExit("topbar header not found in source")
    return strip_active(m.group(0))


def activate_dropdown_trigger(html: str, menu_id: str) -> str:
    return re.sub(
        rf'(<div class="topbar__dropdown">\s*<button\s+)class="topbar__dropdown-trigger"([^>]*aria-controls="{re.escape(menu_id)}")',
        r'\1class="topbar__dropdown-trigger is-active"\2',
        html,
        count=1,
    )


def render_topbar(partial: str, page: str) -> str:
    html = partial

    if page == "intranet-wireframe.html":
        return html.replace(
            '<a href="intranet-wireframe.html">Feed</a>',
            '<a href="intranet-wireframe.html" class="is-active">Feed</a>',
            1,
        )

    link_pattern = rf'(<a href="{re.escape(page)}" role="menuitem")>'
    if re.search(link_pattern, html):
        html = re.sub(link_pattern, r'\1 class="is-active">', html, count=1)
        for menu_id in (
            "menu-comunicados",
            "menu-pessoas",
            "menu-grupos",
            "menu-documentos",
            "menu-servicos",
        ):
            chunk = html.split(f'id="{menu_id}"', 1)
            if len(chunk) > 1 and f'href="{page}"' in chunk[1].split("</div>", 1)[0]:
                html = activate_dropdown_trigger(html, menu_id)
                break
        return html

    if page.startswith("pessoas-"):
        return activate_dropdown_trigger(html, "menu-pessoas")

    return html


def extract_shell_css(text: str) -> str:
    m = TOPBAR_CSS_RE.search(text)
    if not m:
        raise SystemExit("topbar CSS block not found in source")

    prefix_m = re.search(
        r"(    :root \{.*?\n    \}\n\n"
        r"    \* \{.*?\n    \}\n\n"
        r"    body \{.*?\n    \}\n\n"
        r"    \.wireframe-badge \{.*?\n    \}\n\n"
        r"    \.app-shell \{.*?\n    \}\n\n)",
        text,
        re.DOTALL,
    )
    prefix = prefix_m.group(1) if prefix_m else ""

    topbar_css = m.group(0)
    topbar_css = re.sub(
        r"    \.icon-btn-wrap::after \{.*?\n    \}\n",
        """    .icon-btn-wrap::after {
      content: attr(data-badge);
      position: absolute;
      top: 2px;
      right: 2px;
      transform: translate(20%, -20%);
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: #fff;
      color: #ef4444;
      font-size: 10px;
      font-weight: 700;
      line-height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ef4444;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 1;
    }

""",
        topbar_css,
        count=1,
        flags=re.DOTALL,
    )

    return "/* Shell layout + topbar — shared across all pages */\n" + prefix + topbar_css


def ensure_assets_links(text: str) -> str:
    if "assets/shell.css" not in text and "font-awesome" in text:
        if "assets/notifications.css" in text:
            text = text.replace(
                '  <link rel="stylesheet" href="assets/notifications.css" />\n',
                '  <link rel="stylesheet" href="assets/notifications.css" />\n' + SHELL_CSS_LINK,
                1,
            )
        elif "assets/user-menu.css" in text:
            text = text.replace(
                '  <link rel="stylesheet" href="assets/user-menu.css" />\n',
                '  <link rel="stylesheet" href="assets/user-menu.css" />\n' + SHELL_CSS_LINK,
                1,
            )

    if TOPBAR_JS.strip() in text:
        text = text.replace(TOPBAR_JS, "")

    return text


def patch_page(path: Path, partial: str) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    page = path.name

    rendered = render_topbar(partial, page)

    if TOPBAR_MOUNT_RE.search(text):
        text = TOPBAR_MOUNT_RE.sub(rendered, text, count=1)
    elif TOPBAR_HEADER_RE.search(text):
        text = TOPBAR_HEADER_RE.sub(rendered, text, count=1)

    if TOPBAR_CSS_RE.search(text):
        text = TOPBAR_CSS_RE.sub("", text, count=1)

    text = ensure_assets_links(text)

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def main():
    source_text = SOURCE.read_text(encoding="utf-8")

    if PARTIAL_PATH.exists():
        partial = PARTIAL_PATH.read_text(encoding="utf-8")
    else:
        partial = extract_partial_from_source(source_text)
        PARTIALS.mkdir(exist_ok=True)
        PARTIAL_PATH.write_text(partial, encoding="utf-8", newline="\n")

    shell_css_path = ASSETS / "shell.css"
    if TOPBAR_CSS_RE.search(source_text):
        shell_css = extract_shell_css(source_text)
        shell_css_path.write_text(shell_css, encoding="utf-8", newline="\n")
    elif not shell_css_path.exists():
        raise SystemExit("shell.css missing and source has no topbar CSS to extract")

    updated = [p.name for p in sorted(ROOT.glob("*.html")) if patch_page(p, partial)]
    print(f"Topbar partial: {PARTIAL_PATH.relative_to(ROOT)}")
    print(f"Shell CSS: assets/shell.css")
    print(f"Patched {len(updated)} HTML files")
    print("Run this script after editing partials/topbar.html")


if __name__ == "__main__":
    main()
