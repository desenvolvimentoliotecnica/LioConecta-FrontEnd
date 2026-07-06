# -*- coding: utf-8 -*-
"""Generate template PDFs for LioConecta documentos/modelos."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = Path(__file__).resolve().parent / "data" / "modelos-documentos.json"
OUT_DIR = ROOT / "public" / "documents" / "modelos"

MARGIN = 20
LINE_HEIGHT = 6
FONT = "TemplateFont"
ACCENT = (2, 132, 199)
ACCENT_LIGHT = (186, 230, 253)


def resolve_font_files() -> dict[str, str]:
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


class TemplatePDF(FPDF):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        for style, path in resolve_font_files().items():
            self.add_font(FONT, style, path)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(FONT, "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f"LioTécnica — LioConecta  |  Página {self.page_no()}", align="C")


def section_heading(pdf: TemplatePDF, title: str) -> None:
    pdf.ln(4)
    pdf.set_font(FONT, "B", 12)
    pdf.set_text_color(*ACCENT)
    pdf.multi_cell(0, LINE_HEIGHT + 1, title)
    pdf.set_text_color(30, 41, 59)
    pdf.ln(2)


def body_text(pdf: TemplatePDF, text: str) -> None:
    pdf.set_font(FONT, "", 10)
    pdf.multi_cell(0, LINE_HEIGHT, text)
    pdf.ln(2)


def bullet_list(pdf: TemplatePDF, items: list[str]) -> None:
    pdf.set_font(FONT, "", 10)
    for item in items:
        pdf.set_x(MARGIN)
        pdf.multi_cell(0, LINE_HEIGHT, f"  \u2022  {item}")
        pdf.ln(1)
    pdf.ln(2)


def render_cover(pdf: TemplatePDF, template: dict, company: str, portal: str) -> None:
    pdf.add_page()
    pdf.ln(28)
    pdf.set_font(FONT, "B", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 8, company.upper(), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(FONT, "", 9)
    pdf.cell(0, 6, portal, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(16)
    pdf.set_font(FONT, "B", 18)
    pdf.set_text_color(*ACCENT)
    pdf.multi_cell(0, 9, template["title"], align="C")
    pdf.ln(6)
    pdf.set_font(FONT, "", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 8, f"{template['categoryLabel']} · {template['formatLabel']}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Área: {template['areaLabel']}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Versão {template['version']}  |  Atualizado {template['date']}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(24)
    pdf.set_draw_color(*ACCENT_LIGHT)
    pdf.set_line_width(0.5)
    y = pdf.get_y()
    pdf.line(MARGIN + 30, y, pdf.w - MARGIN - 30, y)
    pdf.ln(10)
    pdf.set_font(FONT, "I", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(
        0,
        LINE_HEIGHT,
        "Modelo corporativo interno. Versão PDF de referência para visualização no portal.",
        align="C",
    )


def render_content(pdf: TemplatePDF, template: dict) -> None:
    pdf.add_page()

    section_heading(pdf, "1. Descrição")
    body_text(pdf, template["desc"])

    section_heading(pdf, "2. Quando utilizar")
    body_text(pdf, template["whenToUse"])

    section_heading(pdf, "3. Estrutura do modelo")
    bullet_list(pdf, template["structure"])

    section_heading(pdf, "4. Personalização")
    body_text(pdf, template["customization"])

    section_heading(pdf, "5. Contato")
    body_text(pdf, template["contacts"])


def build_pdf(template: dict, company: str, portal: str) -> TemplatePDF:
    pdf = TemplatePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(MARGIN, MARGIN, MARGIN)
    render_cover(pdf, template, company, portal)
    render_content(pdf, template)
    return pdf


def main() -> None:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    company = data.get("company", "LioTécnica")
    portal = data.get("portal", "LioConecta")
    templates = data["templates"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for template in templates:
        pdf = build_pdf(template, company, portal)
        out_path = OUT_DIR / f"{template['id']}.pdf"
        pdf.output(str(out_path))
        print(f"  {out_path.name}")

    print(f"\n{len(templates)} PDFs gerados em {OUT_DIR}")


if __name__ == "__main__":
    main()
