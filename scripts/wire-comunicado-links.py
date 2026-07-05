# -*- coding: utf-8 -*-
"""Wire comunicado list cards and feed CTAs to the reader page."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "src" / "generated" / "pages"

# title substring -> comunicado id
MAPPING = {
    "estrategia 2026": "estrategia-2026",
    "estratégia 2026": "estrategia-2026",
    "segurança da informação": "seguranca-informacao",
    "férias coletivas": "ferias-coletivas-2026",
    "parcerias estratégicas": "parcerias-estrategicas-2026",
    "centro de inovação": "centro-inovacao",
    "campanha interna do segundo semestre": "kickoff-campanha-h2",
    "manutenção dos sistemas internos": "manutencao-sistemas",
    "novos colaboradores de julho": "onboarding-julho",
    "time comercial em julho": "metas-comercial-julho",
    "evento de integração": "pesquisa-evento-integracao",
    "atualize sua senha": "senha-18h",
    "documentos de benefícios": "prazo-documentos-beneficios",
    "acesso VPN": "vpn-contorno",
    "treinamento de compliance": "treinamento-compliance",
    "primeiro trimestre": "resultados-q1-2026",
    "ambiente de colaboração": "migracao-colaboracao",
    "calendário de recesso": "encerramento-2025",
    "evento anual de integração": "evento-integracao-2025",
    "pesquisa de clima organizacional": "pesquisa-clima-2025",
}

FEED_EXTRAS = [
    (
        "announcement__cta",
        "estrategia-2026",
        r'(<div class="announcement__cta">Ler comunicado completo)',
    ),
    (
        "card seguranca",
        "seguranca-informacao",
        r'(<div class="announcement__cta">Acessar treinamento)',
    ),
]


def cta_link(cta_inner: str, cid: str) -> str:
    text = cta_inner.strip()
    if text.endswith("?"):
        text = text[:-1].strip() + " →"
    elif "→" not in text and "?" not in text:
        text = f"{text} →"
    return f'<a class="official-card__cta" href="/comunicados/leitura?id={cid}">{text}</a>'


def wire_official_list(html: str) -> str:
    def replace_article(match: re.Match[str]) -> str:
        block = match.group(0)
        title_match = re.search(
            r'<h2 class="official-card__title">([^<]+)</h2>', block, re.I
        )
        if not title_match:
            return block
        title = title_match.group(1).lower()
        cid = None
        for key in sorted(MAPPING.keys(), key=len, reverse=True):
            if key in title:
                cid = MAPPING[key]
                break
        if not cid:
            return block
        block = re.sub(
            r'<div class="official-card__cta">([^<]+)</div>',
            lambda m: cta_link(m.group(1), cid),
            block,
            count=1,
        )
        return block

    return re.sub(
        r'<article class="official-card[^"]*">.*?</article>',
        replace_article,
        html,
        flags=re.S,
    )


def wire_feed(html: str) -> str:
    html = re.sub(
        r'<div class="announcement__cta">Ler comunicado completo(.*?)</div>',
        r'<a class="announcement__cta" href="/comunicados/leitura?id=estrategia-2026">Ler comunicado completo\1</a>',
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'(<article class="card card--comunicado">.*?segurança da informação.*?)'
        r'<div class="announcement__cta">Acessar treinamento(.*?)</div>',
        r'\1<a class="announcement__cta" href="/comunicados/leitura?id=seguranca-informacao">Acessar treinamento\2</a>',
        html,
        count=1,
        flags=re.S,
    )
    return html


def main() -> None:
    targets = [
        "comunicados-oficiais",
        "comunicados-departamentais",
        "comunicados-urgentes",
        "comunicados-arquivo",
    ]
    for page_id in targets:
        path = PAGES / page_id / "content.html"
        original = path.read_text(encoding="utf-8")
        updated = wire_official_list(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print(f"updated {path.relative_to(ROOT)}")

    feed_path = PAGES / "feed" / "content.html"
    feed_original = feed_path.read_text(encoding="utf-8")
    feed_updated = wire_feed(feed_original)
    if feed_updated != feed_original:
        feed_path.write_text(feed_updated, encoding="utf-8", newline="\n")
        print(f"updated {feed_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
