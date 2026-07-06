#!/usr/bin/env python3
"""Wrap legacy page headers and toolbars in section-page-head shells."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES_DIR = ROOT / "src" / "generated" / "pages"

SECTION_HUBS: dict[str, tuple[str | None, str]] = {
    "pessoas": ("/pessoas", "Pessoas"),
    "rh": ("/servicos/rh", "RH &amp; Pessoas"),
    "ti": ("/servicos/ti", "TI &amp; Suporte"),
    "facilities": (None, "Facilities"),
    "juridico": (None, "Jurídico &amp; Compliance"),
    "documentos": ("/documentos", "Documentos"),
    "grupos": ("/grupos", "Grupos"),
    "comunicados": ("/comunicados", "Comunicados"),
}

TI_IDS = {
    "servicos-help-desk",
    "servicos-solicitar-equipamento",
    "servicos-acesso-sistemas",
    "servicos-vpn-acesso-remoto",
}
RH_IDS = {
    "servicos-rh",
    "servicos-vale-transporte",
    "servicos-reembolso",
    "servicos-adiantamento",
}
FACILITIES_IDS = {
    "servicos-reservas-salas",
    "servicos-reserva-veiculos",
    "servicos-cracha-visitantes",
    "servicos-encomendas-correios",
    "servicos-limpeza",
    "servicos-manutencao-predial",
    "servicos-copiadora",
    "servicos-estacionamento",
    "servicos-refeitorio",
    "servicos-climatizacao",
    "servicos-gestao-residuos",
}
JURIDICO_IDS = {
    "servicos-declaracoes-certidoes",
    "servicos-assinatura-digital",
    "servicos-seguro-vida",
    "servicos-canal-denuncias",
    "servicos-contratos-minutas",
    "servicos-lgpd-privacidade",
    "servicos-codigo-conduta",
    "servicos-due-diligence",
    "servicos-procuracoes",
    "servicos-consultoria-juridica",
}

SKIP = {"feed", "pessoas-perfil"}

HEADER_RE = re.compile(r"<header class=\"page-header(?: page-header--[\w-]+)?\">.*?</header>", re.DOTALL)
TOOLBAR_RE = re.compile(r"<div class=\"page-toolbar\">.*?</div>", re.DOTALL)
BREADCRUMB_RE = re.compile(
    r"(<nav class=\"breadcrumb\"[^>]*>\s*<a href=\"/\">Início</a>\s*<span class=\"breadcrumb__sep\">/</span>\s*)(.*?)(\s*<span class=\"breadcrumb__sep\">/</span>\s*<span class=\"breadcrumb__current\">)",
    re.DOTALL,
)
OLD_SHELL_RE = re.compile(
    r"<div class=\"(?:section-page-head section-page-head--\w+|rh-page-head|pessoas-page-head|help-desk-page-head)(?: section-page-head--\w+)?\">",
)


def section_for(page_id: str) -> str | None:
    if page_id.startswith("pessoas-"):
        return None if page_id in SKIP else "pessoas"
    if page_id.startswith("documentos-"):
        return "documentos"
    if page_id.startswith("grupos-"):
        return "grupos"
    if page_id.startswith("comunicados-"):
        return "comunicados"
    if page_id in TI_IDS:
        return "ti"
    if page_id in RH_IDS:
        return "rh"
    if page_id in FACILITIES_IDS:
        return "facilities"
    if page_id in JURIDICO_IDS:
        return "juridico"
    return None


def hub_markup(section: str) -> str:
    hub_path, hub_label = SECTION_HUBS[section]
    if hub_path:
        return f'<a href="{hub_path}">{hub_label}</a>'
    return f"<span>{hub_label}</span>"


def fix_breadcrumb(header: str, section: str) -> str:
    hub = hub_markup(section)

    def repl(match: re.Match[str]) -> str:
        return f"{match.group(1)}{hub}{match.group(3)}"

    updated, count = BREADCRUMB_RE.subn(repl, header, count=1)
    return updated if count else header


def upgrade_existing_shell(html: str, section: str) -> str:
    html = re.sub(r"<div class=\"rh-page-head\">", f'<div class="section-page-head section-page-head--{section}">', html)
    html = re.sub(r"<div class=\"pessoas-page-head\">", f'<div class="section-page-head section-page-head--{section}">', html)
    html = re.sub(r"<div class=\"help-desk-page-head\">", f'<div class="section-page-head section-page-head--{section}">', html)
    html = re.sub(
        r'class="page-header page-header--(?:rh|pessoas|help-desk|ti|facilities|juridico|documentos|grupos|comunicados)"',
        f'class="page-header page-header--{section}"',
        html,
    )
    if "section-page-head" in html and f"section-page-head--{section}" not in html:
        html = html.replace('class="section-page-head"', f'class="section-page-head section-page-head--{section}"', 1)
    return html


def transform(html: str, section: str) -> str:
    if OLD_SHELL_RE.search(html):
        header_match = HEADER_RE.search(html)
        header = header_match.group(0) if header_match else ""
        if header:
            html = html.replace(header, fix_breadcrumb(header, section), 1)
        return upgrade_existing_shell(html, section)

    header_match = HEADER_RE.search(html)
    if not header_match:
        return html

    header = header_match.group(0)
    header = header.replace('class="page-header"', f'class="page-header page-header--{section}"')
    header = fix_breadcrumb(header, section)

    rest = html[header_match.end() :]
    toolbar_match = TOOLBAR_RE.search(rest)
    if toolbar_match:
        toolbar = toolbar_match.group(0)
        middle = rest[: toolbar_match.start()]
        tail = rest[toolbar_match.end() :]
        indent = ""
        if header.startswith("        "):
            indent = "        "
        wrapped = (
            f'{indent}<div class="section-page-head section-page-head--{section}">\n'
            f"{header}\n\n"
            f"{toolbar}\n"
            f"{indent}</div>\n"
            f"{middle}{tail}"
        )
        return html[: header_match.start()] + wrapped

    indent = "        " if header.startswith("        ") else ""
    wrapped = (
        f'{indent}<div class="section-page-head section-page-head--{section}">\n'
        f"{header}\n"
        f"{indent}</div>\n"
    )
    return html[: header_match.start()] + wrapped + html[header_match.end() :]


def main() -> None:
    changed = 0
    for page_dir in sorted(PAGES_DIR.iterdir()):
        if not page_dir.is_dir():
            continue
        page_id = page_dir.name
        if page_id in SKIP:
            continue
        section = section_for(page_id)
        if not section:
            continue
        content_path = page_dir / "content.html"
        if not content_path.exists():
            continue
        original = content_path.read_text(encoding="utf-8")
        updated = transform(original, section)
        if updated != original:
            content_path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"updated {page_id} ({section})")
    print(f"done — {changed} files updated")


if __name__ == "__main__":
    main()
