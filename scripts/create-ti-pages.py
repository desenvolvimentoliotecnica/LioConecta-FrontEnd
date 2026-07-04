# -*- coding: utf-8 -*-
"""Generate TI & Suporte service pages for React app."""

import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "src" / "generated" / "pages"
REGISTRY = ROOT / "src" / "generated" / "pages.json"
BASE_STYLES = PAGES_DIR / "servicos-beneficios" / "styles.css"

TI_STYLE_REPLACEMENTS = {
    "/* PAGE: SERVIÇOS — BENEFÍCIOS */": "/* PAGE: SERVIÇOS — TI & SUPORTE */",
    "#fce7f3": "#cffafe",
    "#f9a8d4": "#67e8f9",
    "#be185d": "#0e7490",
    "#fdf2f8": "#ecfeff",
    "#db2777": "#0891b2",
    "#9d174d": "#155e75",
}

PAGES = [
    {
        "id": "servicos-help-desk",
        "route": "/servicos/help-desk",
        "title": "Help Desk",
        "icon": "fa-headset",
        "desc": "Abra chamados, acompanhe tickets em andamento e consulte canais de suporte técnico da Liotécnica.",
        "banner_title": "Central de atendimento TI disponível 24/7",
        "banner_text": "Tempo médio de resposta: 2h para incidentes críticos e 8h para solicitações. Use o chat interno ou abra um ticket pelo portal.",
        "search": "Buscar chamados e artigos...",
        "count_label": "serviço",
        "root_id": "ti-help-root",
        "filters_id": "ti-help-filters",
        "count_id": "ti-help-count",
        "filters": [
            ("all", "Todos"),
            ("incidente", "Incidentes"),
            ("solicitacao", "Solicitações"),
            ("duvida", "Dúvidas"),
            ("urgente", "Urgente"),
        ],
        "cat_labels": {
            "incidente": "Incidente",
            "solicitacao": "Solicitação",
            "duvida": "Dúvida",
            "urgente": "Urgente",
        },
        "cat_icons": {
            "incidente": "fa-triangle-exclamation",
            "solicitacao": "fa-file-circle-plus",
            "duvida": "fa-circle-question",
            "urgente": "fa-bolt",
        },
        "items": [
            ("Abrir chamado", "Registre um novo incidente ou solicitação com prioridade, categoria e descrição detalhada.", "incidente", "Portal GLPI", "disponivel", True),
            ("Acompanhar ticket", "Consulte status, histórico e mensagens dos seus chamados abertos nos últimos 90 dias.", "solicitacao", "Service Desk", "disponivel", False),
            ("Base de conhecimento", "Artigos, tutoriais e soluções para problemas frequentes de hardware, software e acesso.", "duvida", "Wiki TI", "disponivel", False),
            ("Chat ao vivo", "Atendimento síncrono com analista de plantão em horário comercial estendido (7h–22h).", "urgente", "Teams TI", "disponivel", False),
            ("E-mail suporte", "Canal assíncrono para demandas não urgentes. Resposta em até 1 dia útil.", "solicitacao", "ti.suporte@liotecnica.com.br", "disponivel", False),
            ("Telefone plantão", "Linha exclusiva para incidentes críticos que impactam produção ou segurança.", "urgente", "Ramal 5500", "disponivel", False),
        ],
    },
    {
        "id": "servicos-solicitar-equipamento",
        "route": "/servicos/solicitar-equipamento",
        "title": "Solicitar equipamento",
        "icon": "fa-laptop",
        "desc": "Solicite notebooks, monitores, periféricos e acessórios conforme política de TI e elegibilidade do cargo.",
        "banner_title": "Inventário corporativo padronizado",
        "banner_text": "Equipamentos seguem catálogo homologado pela TI. Prazo médio de entrega: 5 dias úteis para itens em estoque.",
        "search": "Buscar equipamentos...",
        "count_label": "item",
        "root_id": "ti-equip-root",
        "filters_id": "ti-equip-filters",
        "count_id": "ti-equip-count",
        "filters": [
            ("all", "Todos"),
            ("notebook", "Notebook"),
            ("periferico", "Periféricos"),
            ("mobilidade", "Mobilidade"),
            ("acessorio", "Acessórios"),
        ],
        "cat_labels": {
            "notebook": "Notebook",
            "periferico": "Periférico",
            "mobilidade": "Mobilidade",
            "acessorio": "Acessório",
        },
        "cat_icons": {
            "notebook": "fa-laptop",
            "periferico": "fa-keyboard",
            "mobilidade": "fa-mobile-screen",
            "acessorio": "fa-plug",
        },
        "items": [
            ("Notebook corporativo", "Dell Latitude ou Lenovo ThinkPad conforme perfil. SSD 512 GB, 16 GB RAM, Windows 11 Pro.", "notebook", "Catálogo TI", "disponivel", True),
            ("Monitor adicional", "Monitor 24\" Full HD para estações fixas. Sujeito à aprovação do gestor direto.", "periferico", "Logitech/Dell", "disponivel", False),
            ("Teclado e mouse", "Kit ergonômico sem fio para home office ou substituição por desgaste.", "periferico", "Logitech", "disponivel", False),
            ("Headset", "Headset com cancelamento de ruído para reuniões e atendimento.", "acessorio", "Jabra", "disponivel", False),
            ("Celular corporativo", "Aparelho + linha para cargos com mobilidade externa ou plantão.", "mobilidade", "Política TI", "sob_analise", False),
            ("Dock station", "Estação de acoplamento USB-C para conectar notebook a monitores e rede.", "acessorio", "Dell/CalDigit", "disponivel", False),
        ],
    },
    {
        "id": "servicos-acesso-sistemas",
        "route": "/servicos/acesso-sistemas",
        "title": "Acesso a sistemas",
        "icon": "fa-key",
        "desc": "Solicite permissões em ERP, produtividade, BI e demais sistemas corporativos com fluxo de aprovação.",
        "banner_title": "Governança de acessos com MFA obrigatório",
        "banner_text": "Todas as solicitações passam por aprovação do gestor e do owner do sistema. Prazo médio: 2 dias úteis.",
        "search": "Buscar sistemas...",
        "count_label": "sistema",
        "root_id": "ti-sys-root",
        "filters_id": "ti-sys-filters",
        "count_id": "ti-sys-count",
        "filters": [
            ("all", "Todos"),
            ("erp", "ERP"),
            ("produtividade", "Produtividade"),
            ("rh", "RH"),
            ("seguranca", "Segurança"),
        ],
        "cat_labels": {
            "erp": "ERP",
            "produtividade": "Produtividade",
            "rh": "RH",
            "seguranca": "Segurança",
        },
        "cat_icons": {
            "erp": "fa-industry",
            "produtividade": "fa-envelope",
            "rh": "fa-user-tie",
            "seguranca": "fa-shield-halved",
        },
        "items": [
            ("SAP / ERP", "Acesso ao módulo financeiro, compras, estoque e produção conforme perfil funcional.", "erp", "SAP S/4HANA", "disponivel", True),
            ("Microsoft 365", "E-mail, Teams, SharePoint, OneDrive e pacote Office. Provisionado na admissão.", "produtividade", "Microsoft", "disponivel", False),
            ("Active Directory", "Conta de rede, grupos de segurança e permissões em pastas compartilhadas.", "seguranca", "AD Liotécnica", "disponivel", False),
            ("Power BI", "Dashboards e relatórios gerenciais. Requer curso de LGPD concluído.", "erp", "Microsoft", "sob_analise", False),
            ("Jira / Confluence", "Gestão de projetos e documentação técnica para squads de produto e TI.", "produtividade", "Atlassian", "disponivel", False),
            ("Portal RH", "Folha, ponto, férias e benefícios. Integrado ao cadastro de colaboradores.", "rh", "RH Lio", "disponivel", False),
        ],
    },
    {
        "id": "servicos-vpn-acesso-remoto",
        "route": "/servicos/vpn-acesso-remoto",
        "title": "VPN e acesso remoto",
        "icon": "fa-shield-virus",
        "desc": "Configure VPN corporativa, autenticação multifator e acesso remoto seguro a sistemas internos.",
        "banner_title": "Conexão segura obrigatória fora da rede",
        "banner_text": "VPN FortiClient com MFA via Microsoft Authenticator. Consulte o guia de home office antes da primeira conexão.",
        "search": "Buscar guias e configurações...",
        "count_label": "recurso",
        "root_id": "ti-vpn-root",
        "filters_id": "ti-vpn-filters",
        "count_id": "ti-vpn-count",
        "filters": [
            ("all", "Todos"),
            ("vpn", "VPN"),
            ("remoto", "Remoto"),
            ("doc", "Documentação"),
        ],
        "cat_labels": {
            "vpn": "VPN",
            "remoto": "Remoto",
            "doc": "Documentação",
        },
        "cat_icons": {
            "vpn": "fa-lock",
            "remoto": "fa-house-laptop",
            "doc": "fa-book",
        },
        "items": [
            ("Instalar VPN FortiClient", "Download, instalação e perfil de conexão para Windows e macOS.", "vpn", "Fortinet", "disponivel", True),
            ("Reset senha VPN", "Redefinição de credenciais após bloqueio ou troca de dispositivo.", "vpn", "Self-service", "disponivel", False),
            ("Acesso RDP / VDI", "Área de trabalho remota para sistemas que exigem ambiente corporativo.", "remoto", "VMware Horizon", "sob_analise", False),
            ("Guia home office", "Checklist de segurança, ergonomia e conectividade para trabalho remoto.", "doc", "Wiki TI", "disponivel", False),
            ("Política de acesso remoto", "Normas de uso, horários, MFA e responsabilidades do colaborador.", "doc", "Compliance", "disponivel", False),
            ("Configurar MFA", "Ativação do Microsoft Authenticator para VPN, e-mail e sistemas críticos.", "vpn", "Microsoft", "disponivel", False),
        ],
    },
]

STATUS_LABELS = {
    "disponivel": "Disponível",
    "sob_analise": "Sob análise",
    "indisponivel": "Indisponível",
}


def ti_styles() -> str:
    css = BASE_STYLES.read_text(encoding="utf-8")
    for old, new in TI_STYLE_REPLACEMENTS.items():
        css = css.replace(old, new)
    css += textwrap.dedent("""
        .benefit-card__icon--incidente,
        .benefit-card__icon--notebook,
        .benefit-card__icon--erp,
        .benefit-card__icon--vpn {
          background: #ecfeff; color: #0891b2; border-color: #67e8f9;
        }
        .benefit-card__icon--solicitacao,
        .benefit-card__icon--periferico,
        .benefit-card__icon--produtividade,
        .benefit-card__icon--remoto {
          background: #e0f2fe; color: #0284c7; border-color: #7dd3fc;
        }
        .benefit-card__icon--duvida,
        .benefit-card__icon--mobilidade,
        .benefit-card__icon--rh,
        .benefit-card__icon--doc {
          background: #f0fdf4; color: #16a34a; border-color: #86efac;
        }
        .benefit-card__icon--urgente,
        .benefit-card__icon--acessorio,
        .benefit-card__icon--seguranca {
          background: #fef3c7; color: #b45309; border-color: #fcd34d;
        }
        .benefit-card__cat--incidente,
        .benefit-card__cat--notebook,
        .benefit-card__cat--erp,
        .benefit-card__cat--vpn { background: #cffafe; color: #0e7490; }
        .benefit-card__cat--solicitacao,
        .benefit-card__cat--periferico,
        .benefit-card__cat--produtividade,
        .benefit-card__cat--remoto { background: #dbeafe; color: #1d4ed8; }
        .benefit-card__cat--duvida,
        .benefit-card__cat--mobilidade,
        .benefit-card__cat--rh,
        .benefit-card__cat--doc { background: #dcfce7; color: #15803d; }
        .benefit-card__cat--urgente,
        .benefit-card__cat--acessorio,
        .benefit-card__cat--seguranca { background: #fef3c7; color: #b45309; }
        .benefit-card__status--disponivel { background: #dcfce7; color: #15803d; }
        .benefit-card__status--sob_analise { background: #fef3c7; color: #b45309; }
        .topbar__dropdown-menu--services a.is-active {
          background: #cffafe;
          color: #0e7490;
          font-weight: 600;
        }
    """)
    return css


def content_html(page: dict) -> str:
    filters = "\n".join(
        f'            <button class="filter-chip{" is-active" if k == "all" else ""}" type="button" data-filter="{k}">{label}</button>'
        for k, label in page["filters"]
    )
    return textwrap.dedent(f"""
        <header class="page-header">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Início</a>
            <span class="breadcrumb__sep">/</span>
            <span>Serviços</span>
            <span class="breadcrumb__sep">/</span>
            <span>TI &amp; Suporte</span>
            <span class="breadcrumb__sep">/</span>
            <span class="breadcrumb__current">{page["title"]}</span>
          </nav>
          <div class="page-header__row">
            <div>
              <h1 class="page-header__title">{page["title"]}</h1>
              <p class="page-header__desc">{page["desc"]}</p>
            </div>
          </div>
        </header>

        <div class="welcome-banner">
          <div class="welcome-banner__icon" aria-hidden="true"><i class="fa-solid {page["icon"]}"></i></div>
          <div>
            <div class="welcome-banner__title">{page["banner_title"]}</div>
            <p class="welcome-banner__text">{page["banner_text"]}</p>
          </div>
        </div>

        <div class="page-toolbar">
          <div class="page-filters" id="{page["filters_id"]}" role="group" aria-label="Filtros">
{filters}
          </div>
          <div class="page-search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            {page["search"]}
          </div>
        </div>

        <div class="benefits-grid" id="{page["root_id"]}" aria-label="{page["title"]}"></div>

        <p class="page-empty-note" id="{page["count_id"]}">Carregando...</p>
    """).strip() + "\n"


def script_js(page: dict) -> str:
    cat_labels = json.dumps(page["cat_labels"], ensure_ascii=False, indent=8)
    cat_icons = json.dumps(page["cat_icons"], ensure_ascii=False, indent=8)
    items = []
    for title, desc, cat, provider, status, featured in page["items"]:
        items.append(
            {
                "title": title,
                "desc": desc,
                "cat": cat,
                "provider": provider,
                "status": status,
                "featured": featured,
            }
        )
    items_json = json.dumps(items, ensure_ascii=False, indent=8)
    label = page["count_label"]
    return textwrap.dedent(f"""
    (function () {{
      const catLabels = {cat_labels};
      const catIcons = {cat_icons};
      const items = {items_json};
      const statusLabels = {json.dumps(STATUS_LABELS, ensure_ascii=False)};

      function renderItem(item) {{
        const featuredClass = item.featured ? " is-featured" : "";
        const statusClass = " benefit-card__status--" + item.status;
        const catBadgeClass = " benefit-card__cat--" + item.cat;
        return `
          <article class="benefit-card${{featuredClass}}" data-cat="${{item.cat}}">
            <div class="benefit-card__head">
              <div class="benefit-card__icon benefit-card__icon--${{item.cat}}" aria-hidden="true">
                <i class="fa-solid ${{catIcons[item.cat] || "fa-headset"}}"></i>
              </div>
              <div class="benefit-card__main">
                <h2 class="benefit-card__title">${{item.title}}</h2>
                <p class="benefit-card__desc">${{item.desc}}</p>
              </div>
            </div>
            <div class="benefit-card__tags">
              <span class="benefit-card__cat${{catBadgeClass}}">${{catLabels[item.cat] || item.cat}}</span>
              <span class="benefit-card__status${{statusClass}}">${{statusLabels[item.status] || item.status}}</span>
            </div>
            <div class="benefit-card__meta">
              <span><i class="fa-solid fa-server" aria-hidden="true"></i> ${{item.provider}}</span>
            </div>
            <div class="benefit-card__footer">
              <a class="benefit-card__open" href="#"><i class="fa-regular fa-eye" aria-hidden="true"></i> Acessar</a>
              <div class="benefit-card__actions">
                <a class="benefit-card__btn" href="#" aria-label="Abrir ${{item.title}}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
                <a class="benefit-card__btn" href="#" aria-label="Salvar ${{item.title}}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }}

      const root = document.getElementById("{page["root_id"]}");
      const countEl = document.getElementById("{page["count_id"]}");
      const filters = document.getElementById("{page["filters_id"]}");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {{
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {{
          const match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.hidden = !match;
          if (match) visible += 1;
        }});
        if (countEl) {{
          countEl.textContent = "Exibindo " + visible + " {label}" + (visible === 1 ? "" : "s");
        }}
      }}

      applyFilter("all");
      if (filters) {{
        filters.addEventListener("click", function (event) {{
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;
          filters.querySelectorAll(".filter-chip").forEach(function (btn) {{ btn.classList.remove("is-active"); }});
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        }});
      }}
    }})();
    """).strip() + "\n"


def main():
    styles = ti_styles()
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    existing_ids = {e["id"] for e in registry}

    for page in PAGES:
        page_dir = PAGES_DIR / page["id"]
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "content.html").write_text(content_html(page), encoding="utf-8", newline="\n")
        (page_dir / "styles.css").write_text(styles, encoding="utf-8", newline="\n")
        (page_dir / "script.js").write_text(script_js(page), encoding="utf-8", newline="\n")

        entry = {
            "id": page["id"],
            "htmlFile": f"{page['id']}.html",
            "route": page["route"],
            "hasScript": True,
            "externals": [],
        }
        if page["id"] not in existing_ids:
            registry.append(entry)
            print(f"  + {page['id']} -> {page['route']}")
        else:
            print(f"  ~ {page['id']} (updated)")

    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nDone. Run: python scripts/generate-pages-index.py")


if __name__ == "__main__":
    main()
