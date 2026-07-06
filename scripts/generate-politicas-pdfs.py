# -*- coding: utf-8 -*-
"""Generate internal policy PDFs for LioConecta documentos/politicas-internas."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = Path(__file__).resolve().parent / "data" / "politicas-internas.json"
OUT_DIR = ROOT / "public" / "documents" / "politicas-internas"

MARGIN = 20
LINE_HEIGHT = 6
FONT = "PolicyFont"


def resolve_font_files() -> dict[str, str]:
    """Resolve Unicode TTF files from common system locations."""
    if sys.platform == "win32":
        win_fonts = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
        regular = win_fonts / "arial.ttf"
        bold = win_fonts / "arialbd.ttf"
        italic = win_fonts / "ariali.ttf"
        if regular.exists() and bold.exists() and italic.exists():
            return {"": str(regular), "B": str(bold), "I": str(italic)}

    for base in (
        Path("/usr/share/fonts/truetype/dejavu"),
        Path("/usr/share/fonts/truetype/liberation"),
        Path("/usr/share/fonts/TTF"),
    ):
        regular = base / "DejaVuSans.ttf"
        bold = base / "DejaVuSans-Bold.ttf"
        italic = base / "DejaVuSans-Oblique.ttf"
        if regular.exists() and bold.exists() and italic.exists():
            return {"": str(regular), "B": str(bold), "I": str(italic)}

    raise FileNotFoundError(
        "Nenhuma fonte Unicode encontrada. No Windows, instale Arial; "
        "no Linux, instale fonts-dejavu-core."
    )


class PolicyPDF(FPDF):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        for style, path in resolve_font_files().items():
            self.add_font(FONT, style, path)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(FONT, "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f"LioTécnica — LioConecta  |  Página {self.page_no()}", align="C")


def section_heading(pdf: PolicyPDF, title: str) -> None:
    pdf.ln(4)
    pdf.set_font(FONT, "B", 12)
    pdf.set_text_color(67, 56, 202)
    pdf.multi_cell(0, LINE_HEIGHT + 1, title)
    pdf.set_text_color(30, 41, 59)
    pdf.ln(2)


def body_text(pdf: PolicyPDF, text: str) -> None:
    pdf.set_font(FONT, "", 10)
    pdf.multi_cell(0, LINE_HEIGHT, text)
    pdf.ln(2)


def bullet_list(pdf: PolicyPDF, items: list[str]) -> None:
    pdf.set_font(FONT, "", 10)
    for item in items:
        pdf.set_x(MARGIN)
        pdf.multi_cell(0, LINE_HEIGHT, f"  \u2022  {item}")
        pdf.ln(1)
    pdf.ln(2)


def render_cover(pdf: PolicyPDF, policy: dict, company: str, portal: str) -> None:
    pdf.add_page()
    pdf.ln(30)
    pdf.set_font(FONT, "B", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 8, company.upper(), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(FONT, "", 9)
    pdf.cell(0, 6, portal, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(20)
    pdf.set_font(FONT, "B", 20)
    pdf.set_text_color(67, 56, 202)
    pdf.multi_cell(0, 10, policy["title"], align="C")
    pdf.ln(8)
    pdf.set_font(FONT, "", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 8, f"Área: {policy['areaLabel']}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Versão {policy['version']}  |  Revisão {policy['date']}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(30)
    pdf.set_draw_color(165, 180, 252)
    pdf.set_line_width(0.5)
    y = pdf.get_y()
    pdf.line(MARGIN + 30, y, pdf.w - MARGIN - 30, y)
    pdf.ln(10)
    pdf.set_font(FONT, "I", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(
        0,
        LINE_HEIGHT,
        "Documento corporativo interno. Uso restrito a colaboradores e terceiros autorizados.",
        align="C",
    )


def render_content(pdf: PolicyPDF, policy: dict) -> None:
    pdf.add_page()

    section_heading(pdf, "1. Objetivo")
    body_text(pdf, policy["desc"])

    section_heading(pdf, "2. Escopo e público-alvo")
    body_text(pdf, policy["scope"])

    section_heading(pdf, "3. Diretrizes")
    bullet_list(pdf, policy["guidelines"])

    resp = policy["responsibilities"]
    section_heading(pdf, "4. Responsabilidades")
    body_text(pdf, f"Colaborador: {resp['colaborador']}")
    body_text(pdf, f"Gestor: {resp['gestor']}")
    body_text(pdf, f"Área responsável: {resp['area']}")

    section_heading(pdf, "5. Vigência e contatos")
    body_text(
        pdf,
        f"Esta política entra em vigor na data de sua publicação no portal {policy.get('_portal', 'LioConecta')} "
        f"e permanece válida até nova revisão formal.",
    )
    body_text(pdf, policy["contacts"])


def build_pdf(policy: dict, company: str, portal: str) -> PolicyPDF:
    policy = {**policy, "_portal": portal}
    pdf = PolicyPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(MARGIN, MARGIN, MARGIN)
    render_cover(pdf, policy, company, portal)
    render_content(pdf, policy)
    return pdf


def main() -> None:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    company = data.get("company", "LioTécnica")
    portal = data.get("portal", "LioConecta")
    policies = data["policies"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for policy in policies:
        pdf = build_pdf(policy, company, portal)
        out_path = OUT_DIR / f"{policy['id']}.pdf"
        pdf.output(str(out_path))
        print(f"  {out_path.name}")

    print(f"\n{len(policies)} PDFs gerados em {OUT_DIR}")


if __name__ == "__main__":
    main()
