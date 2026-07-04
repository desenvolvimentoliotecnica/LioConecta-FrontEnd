"""Apply isolated user menu to all HTML pages and wire user-menu.js."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

USER_MENU_HTML = """        <div class="user-menu">
          <button
            class="user-menu__trigger"
            type="button"
            aria-expanded="false"
            aria-haspopup="true"
            aria-controls="user-menu-panel"
            aria-label="Perfil de Maria Silva"
          >
            <img class="avatar" src="avatar-maria-silva.png" alt="" />
            <span class="user-menu__name">Maria Silva</span>
            <span class="user-menu__chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
          </button>
          <div class="user-menu__panel" id="user-menu-panel" role="menu">
            <a href="pessoas-perfil.html?id=maria-silva" role="menuitem">
              <i class="fa-regular fa-user" aria-hidden="true"></i> Ver perfil completo
            </a>
            <a href="#" role="menuitem">
              <i class="fa-solid fa-gear" aria-hidden="true"></i> Configurações
            </a>
            <a href="#" role="menuitem">
              <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Sair
            </a>
          </div>
        </div>"""

OLD_BUTTON = """        <button class="user-chip" type="button" aria-label="Perfil de Maria Silva">
          <img class="avatar" src="avatar-maria-silva.png" alt="" />
          <span class="user-chip__name">Maria Silva</span>
          <span class="user-chip__chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
        </button>"""

OLD_DROPDOWN_RE = re.compile(
    r'        <div class="topbar__dropdown user-menu">.*?</div>\n        </div>',
    re.DOTALL,
)

CSS_LINK = '  <link rel="stylesheet" href="assets/user-menu.css" />\n'
JS_SCRIPT = '  <script src="assets/user-menu.js"></script>\n'

DROPDOWN_BLOCK_RE = re.compile(
    r"\n      document\.querySelectorAll\(\"\.topbar__dropdown\"\)\.forEach\(function \(dropdown\) \{[\s\S]*?"
    r"\n      document\.addEventListener\(\"click\", function \(event\) \{[\s\S]*?\n      \}\);\n",
)

updated = []
for path in sorted(ROOT.glob("*.html")):
    text = path.read_text(encoding="utf-8")
    original = text

    if OLD_BUTTON in text:
        text = text.replace(OLD_BUTTON, USER_MENU_HTML, 1)
    elif 'class="user-menu"' not in text and OLD_DROPDOWN_RE.search(text):
        text = OLD_DROPDOWN_RE.sub(USER_MENU_HTML, text, count=1)

    if "assets/user-menu.css" not in text and "font-awesome" in text:
        text = text.replace(
            '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />\n',
            '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />\n'
            + CSS_LINK,
            1,
        )

    if DROPDOWN_BLOCK_RE.search(text):
        text = DROPDOWN_BLOCK_RE.sub("\n", text, count=1)

    if "assets/user-menu.js" not in text:
        text = text.replace("</body>", JS_SCRIPT + "</body>", 1)

    if text != original:
        path.write_text(text, encoding="utf-8")
        updated.append(path.name)

print(f"Updated {len(updated)} files:")
for name in updated:
    print(f"  - {name}")

missing = []
for path in sorted(ROOT.glob("*.html")):
    text = path.read_text(encoding="utf-8")
    if "Maria Silva" in text and 'class="user-menu"' not in text:
        missing.append(path.name)
    if "Maria Silva" in text and "assets/user-menu.js" not in text:
        missing.append(path.name + " (no js)")

if missing:
    print("Still missing user-menu:", ", ".join(sorted(set(missing))))
