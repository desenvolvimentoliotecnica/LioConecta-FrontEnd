# -*- coding: utf-8 -*-
"""One-time extraction of HTML pages into React-ready content/CSS/scripts."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "generated"
STYLES = ROOT / "src" / "styles"

PAGES = [
    ("intranet-wireframe.html", "feed", "/"),
    ("comunicados-oficiais.html", "comunicados-oficiais", "/comunicados/oficiais"),
    ("comunicados-departamentais.html", "comunicados-departamentais", "/comunicados/departamentais"),
    ("comunicados-urgentes.html", "comunicados-urgentes", "/comunicados/urgentes"),
    ("comunicados-arquivo.html", "comunicados-arquivo", "/comunicados/arquivo"),
    ("pessoas-diretorio.html", "pessoas-diretorio", "/pessoas/diretorio"),
    ("pessoas-novos-colaboradores.html", "pessoas-novos-colaboradores", "/pessoas/novos-colaboradores"),
    ("pessoas-aniversariantes.html", "pessoas-aniversariantes", "/pessoas/aniversariantes"),
    ("pessoas-organograma.html", "pessoas-organograma", "/pessoas/organograma"),
    ("pessoas-perfil.html", "pessoas-perfil", "/pessoas/perfil"),
    ("grupos-meus-grupos.html", "grupos-meus-grupos", "/grupos/meus-grupos"),
    ("grupos-explorar-grupos.html", "grupos-explorar", "/grupos/explorar"),
    ("grupos-criar-grupo.html", "grupos-criar-grupo", "/grupos/criar"),
    ("documentos-politicas-internas.html", "documentos-politicas", "/documentos/politicas-internas"),
    ("documentos-manuais-procedimentos.html", "documentos-manuais", "/documentos/manuais-procedimentos"),
    ("documentos-formularios.html", "documentos-formularios", "/documentos/formularios"),
    ("documentos-modelos-documentos.html", "documentos-modelos", "/documentos/modelos"),
    ("documentos-biblioteca-corporativa.html", "documentos-biblioteca", "/documentos/biblioteca"),
    ("servicos-beneficios.html", "servicos-beneficios", "/servicos/beneficios"),
    ("servicos-contracheque.html", "servicos-contracheque", "/servicos/contracheque"),
    ("servicos-ponto-eletronico.html", "servicos-ponto", "/servicos/ponto-eletronico"),
    ("servicos-ferias-ausencias.html", "servicos-ferias", "/servicos/ferias-ausencias"),
    ("servicos-solicitacoes-rh.html", "servicos-rh", "/servicos/solicitacoes-rh"),
    ("servicos-vale-transporte.html", "servicos-vale-transporte", "/servicos/vale-transporte"),
    ("servicos-reembolso-despesas.html", "servicos-reembolso", "/servicos/reembolso-despesas"),
    ("servicos-adiantamento-viagem.html", "servicos-adiantamento", "/servicos/adiantamento-viagem"),
]

HTML_TO_ROUTE = {html: route for html, _, route in PAGES}
HTML_TO_ROUTE["intranet-wireframe.html"] = "/"

LINK_RE = re.compile(
    r'href="(' + "|".join(re.escape(h) for h in HTML_TO_ROUTE) + r')(\?[^"]*)?"'
)

MAIN_RE = re.compile(r"<main class=\"main\">(.*?)</main>", re.DOTALL)
STYLE_RE = re.compile(r"<style>(.*?)</style>", re.DOTALL)
INLINE_SCRIPTS_RE = re.compile(r"<script>(.*?)</script>", re.DOTALL)
EXTERNAL_SCRIPTS_RE = re.compile(r'<script src="([^"]+)"></script>')


def strip_css_indent(css: str) -> str:
    lines = []
    for line in css.splitlines():
        if line.startswith("    "):
            lines.append(line[4:])
        else:
            lines.append(line)
    return "\n".join(lines).strip() + "\n"


def extract_style_block(text: str) -> str:
    m = STYLE_RE.search(text)
    return m.group(1) if m else ""


def extract_section(css: str, start_marker: str, end_markers: list[str]) -> str:
    start = css.find(start_marker)
    if start == -1:
        return ""
    end = len(css)
    for marker in end_markers:
        pos = css.find(marker, start + len(start_marker))
        if pos != -1:
            end = min(end, pos)
    return css[start:end].strip()


def rewrite_paths(html: str) -> str:
    html = re.sub(r'src="(?!https?://|/)([^"]+)"', r'src="/\1"', html)
    html = re.sub(r'url\("(?!https?://|/|#|data:)([^"]+)"\)', r'url("/\1")', html)
    html = re.sub(r"url\('(?!https?://|/|#|data:)([^']+)'\)", r"url('/\1')", html)

    def link_repl(m: re.Match) -> str:
        file = m.group(1)
        qs = m.group(2) or ""
        route = HTML_TO_ROUTE.get(file, "#")
        if file == "pessoas-perfil.html" and qs:
            id_val = ""
            if "id=" in qs:
                id_val = qs.split("id=", 1)[1].split("&", 1)[0]
            if id_val:
                return f'href="/pessoas/perfil?id={id_val}"'
        return f'href="{route}"'

    html = LINK_RE.sub(link_repl, html)
    html = re.sub(r'href="intranet-wireframe\.html"', 'href="/"', html)
    return html


def extract_page_css(css: str, page_id: str) -> str:
    if page_id == "feed":
        shared = extract_section(css, "/* BODY */", ["/* ANNOUNCEMENT */"])
        page = extract_section(css, "/* ANNOUNCEMENT */", ["@media"])
        media = css[css.find("@media") :] if "@media" in css else ""
        return shared + "\n\n" + page + "\n\n" + media

    shared = extract_section(css, "/* BODY */", ["/* ANNOUNCEMENT */", "/* PAGE:"])
    list_page = extract_section(css, "/* PAGE: COMUNICADOS OFICIAIS */", ["/* PAGE:"])
    second_page = re.search(r"/\* PAGE: [^*]+ \*/", css)
    page_specific = ""
    if second_page:
        markers = list(re.finditer(r"/\* PAGE: [^*]+ \*/", css))
        if len(markers) >= 2:
            start = markers[1].start()
            tail = css[start:]
            end = tail.find("/* QUICK ACCESS */")
            if end == -1:
                end = tail.find("@media")
            if end == -1:
                end = len(tail)
            page_specific = tail[:end].strip()
    media = ""
    if "@media" in css:
        media = css[css.rfind("@media") :]
    return shared + "\n\n" + list_page + "\n\n" + page_specific + "\n\n" + media


def extract_scripts(text: str) -> tuple[str | None, list[str]]:
    inline = INLINE_SCRIPTS_RE.findall(text)
    externals = [
        s
        for s in EXTERNAL_SCRIPTS_RE.findall(text)
        if not s.endswith("user-menu.js") and not s.endswith("notifications.js")
    ]
    page_script = None
    for block in inline:
        if "setupSidebar" in block and len(inline) == 1:
            continue
        if "setupSidebar" in block:
            continue
        page_script = block.strip()
        break
    if page_script is None and len(inline) == 1 and "setupSidebar" not in inline[0]:
        page_script = inline[0].strip()
    return page_script, externals


def extract_shared_layout_css(css: str) -> str:
    prefix_end = css.find("/* BODY */")
    if prefix_end == -1:
        prefix_end = 0
    body_end = css.find("/* MAIN */")
    if body_end == -1:
        return ""
    main_end = css.find("/* ANNOUNCEMENT */")
    if main_end == -1:
        main_end = css.find("/* PAGE:")
    if main_end == -1:
        main_end = len(css)
    return css[:prefix_end] + css[prefix_end:main_end]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    STYLES.mkdir(parents=True, exist_ok=True)

    registry = []
    shared_written = False
    list_page_written = False

    for html_file, page_id, route in PAGES:
        path = ROOT / html_file
        if not path.exists():
            path = ROOT / "legacy" / "html" / html_file
        if not path.exists():
            raise SystemExit(f"Missing {html_file}")

        text = path.read_text(encoding="utf-8")
        css_raw = extract_style_block(text)
        css = strip_css_indent(css_raw)

        if not shared_written:
            layout = extract_shared_layout_css(css)
            avatar_chip = extract_section(css, ".user-chip {", ["/* BODY */"])
            if avatar_chip:
                layout = layout + "\n\n" + ".user-chip {" + avatar_chip.split(".user-chip {", 1)[1]
            (STYLES / "layout.css").write_text(strip_css_indent(layout), encoding="utf-8", newline="\n")
            shared_written = True

        if not list_page_written and page_id != "feed":
            list_css = extract_section(css, "/* PAGE: COMUNICADOS OFICIAIS */", ["/* PAGE:"])
            if list_css:
                (STYLES / "list-page.css").write_text(
                    strip_css_indent(list_css), encoding="utf-8", newline="\n"
                )
                list_page_written = True

        main_m = MAIN_RE.search(text)
        if not main_m:
            raise SystemExit(f"No <main> in {html_file}")

        content = rewrite_paths(main_m.group(1).strip())
        page_css = strip_css_indent(extract_page_css(css, page_id))
        page_script, externals = extract_scripts(text)

        page_dir = OUT / "pages" / page_id
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "content.html").write_text(content, encoding="utf-8", newline="\n")
        (page_dir / "styles.css").write_text(page_css, encoding="utf-8", newline="\n")

        if page_script:
            (page_dir / "script.js").write_text(page_script, encoding="utf-8", newline="\n")

        entry = {
            "id": page_id,
            "htmlFile": html_file,
            "route": route,
            "hasScript": page_script is not None,
            "externals": externals,
        }
        if page_id == "pessoas-perfil":
            entry["profileAssets"] = True
        if page_id == "pessoas-organograma":
            entry["organograma"] = True
        registry.append(entry)
        print(f"  {page_id}: {route}")

    (OUT / "pages.json").write_text(
        json.dumps(registry, ensure_ascii=False, indent=2), encoding="utf-8", newline="\n"
    )

    shell_src = ROOT / "assets" / "shell.css"
    if shell_src.exists():
        shell = shell_src.read_text(encoding="utf-8")
        shell = re.sub(r"url\(\"assets/", 'url("/assets/', shell)
        (STYLES / "shell.css").write_text(strip_css_indent(shell), encoding="utf-8", newline="\n")

    for name in ("notifications.css", "user-menu.css", "pessoas-perfil.css", "org-profile-modal.css"):
        src = ROOT / "assets" / name
        if src.exists():
            css = src.read_text(encoding="utf-8")
            css = re.sub(r'url\("(?!/)([^"]+)"\)', r'url("/\1")', css)
            (STYLES / name).write_text(css, encoding="utf-8", newline="\n")

    print(f"\nExtracted {len(registry)} pages -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
