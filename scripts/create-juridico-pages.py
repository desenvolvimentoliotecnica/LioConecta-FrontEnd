# -*- coding: utf-8 -*-
"""Generate Jurídico & Compliance service pages for React app."""

import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "src" / "generated" / "pages"
REGISTRY = ROOT / "src" / "generated" / "pages.json"
BASE_STYLES = PAGES_DIR / "servicos-beneficios" / "styles.css"

JURIDICO_STYLE_REPLACEMENTS = {
    "/* PAGE: SERVIÇOS — BENEFÍCIOS */": "/* PAGE: SERVIÇOS — JURÍDICO & COMPLIANCE */",
    "#fce7f3": "#ede9fe",
    "#f9a8d4": "#c4b5fd",
    "#be185d": "#6d28d9",
    "#fdf2f8": "#f5f3ff",
    "#db2777": "#7c3aed",
    "#9d174d": "#5b21b6",
}

PAGES = [
    {
        "id": "servicos-declaracoes-certidoes",
        "route": "/servicos/declaracoes-certidoes",
        "title": "Declarações e certidões",
        "icon": "fa-file-contract",
        "desc": "Solicite declarações de vínculo, certidões negativas, cartas de referência e documentos para processos externos.",
        "banner_title": "Emissão digital de documentos corporativos",
        "banner_text": "Prazo médio: 3 dias úteis para declarações simples. Certidões que exigem consulta externa podem levar até 10 dias úteis.",
        "search": "Buscar declarações e certidões...",
        "count_label": "documento",
        "root_id": "jur-doc-root",
        "filters_id": "jur-doc-filters",
        "count_id": "jur-doc-count",
        "filters": [("all", "Todos"), ("declaracao", "Declaração"), ("certidao", "Certidão"), ("carta", "Carta"), ("urgente", "Urgente")],
        "cat_labels": {"declaracao": "Declaração", "certidao": "Certidão", "carta": "Carta", "urgente": "Urgente"},
        "cat_icons": {"declaracao": "fa-file-lines", "certidao": "fa-stamp", "carta": "fa-envelope-open-text", "urgente": "fa-bolt"},
        "items": [
            ("Declaração de vínculo", "Comprovação de emprego com cargo, salário e tempo de casa para bancos e cartórios.", "declaracao", "Jurídico", "disponivel", True),
            ("Certidão negativa trabalhista", "Consulta e emissão de CNDT para licitações, contratos e cadastros.", "certidao", "Jurídico", "disponivel", False),
            ("Carta de referência", "Documento assinado pela empresa atestando funções e desempenho do colaborador.", "carta", "Jurídico", "disponivel", False),
            ("Certidão simplificada da Junta", "Extração de dados cadastrais da empresa para processos administrativos.", "certidao", "Jurídico", "sob_analise", False),
            ("Declaração de renda", "Modelo corporativo para comprovação de rendimentos em processos internos.", "declaracao", "Jurídico", "disponivel", False),
            ("Emissão urgente", "Solicitação expressa com justificativa para prazos inferiores a 48 horas.", "urgente", "Jurídico", "disponivel", False),
        ],
    },
    {
        "id": "servicos-assinatura-digital",
        "route": "/servicos/assinatura-digital",
        "title": "Assinatura digital",
        "icon": "fa-file-signature",
        "desc": "Assine documentos com certificado ICP-Brasil, solicite coletas de assinatura e consulte status de envelopes.",
        "banner_title": "Plataforma de assinatura eletrônica homologada",
        "banner_text": "Certificado A1/A3 integrado. Fluxos com múltiplos signatários, lembretes automáticos e trilha de auditoria completa.",
        "search": "Buscar documentos para assinar...",
        "count_label": "serviço",
        "root_id": "jur-assinatura-root",
        "filters_id": "jur-assinatura-filters",
        "count_id": "jur-assinatura-count",
        "filters": [("all", "Todos"), ("pendente", "Pendente"), ("icp", "ICP-Brasil"), ("simples", "Simples"), ("lote", "Em lote")],
        "cat_labels": {"pendente": "Pendente", "icp": "ICP-Brasil", "simples": "Simples", "lote": "Em lote"},
        "cat_icons": {"pendente": "fa-clock", "icp": "fa-certificate", "simples": "fa-pen-nib", "lote": "fa-layer-group"},
        "items": [
            ("Assinar documento pendente", "Lista de envelopes aguardando sua assinatura com prazo e prioridade.", "pendente", "DocuSign Lio", "disponivel", True),
            ("Enviar para assinatura", "Crie fluxo de coleta com ordem de signatários, anexos e lembretes.", "simples", "DocuSign Lio", "disponivel", False),
            ("Certificado ICP-Brasil", "Orientações para instalação e renovação de certificado digital A1.", "icp", "Jurídico + TI", "disponivel", False),
            ("Assinatura em lote", "Processamento de múltiplos contratos ou termos com template padronizado.", "lote", "Jurídico", "disponivel", False),
            ("Validar documento assinado", "Verifique autenticidade e integridade de PDFs assinados digitalmente.", "icp", "Jurídico", "disponivel", False),
            ("Política de assinatura", "Regras sobre quem pode assinar, limites de alçada e documentos elegíveis.", "simples", "Compliance", "disponivel", False),
        ],
    },
    {
        "id": "servicos-seguro-vida",
        "route": "/servicos/seguro-vida",
        "title": "Seguro de vida",
        "icon": "fa-heart-pulse",
        "desc": "Consulte cobertura do seguro de vida em grupo, beneficiários, sinistros e alterações cadastrais.",
        "banner_title": "Seguro de vida corporativo ativo",
        "banner_text": "Cobertura básica incluída para todos os colaboradores CLT. Beneficiários podem ser atualizados a qualquer momento pelo portal.",
        "search": "Buscar informações do seguro...",
        "count_label": "serviço",
        "root_id": "jur-seguro-root",
        "filters_id": "jur-seguro-filters",
        "count_id": "jur-seguro-count",
        "filters": [("all", "Todos"), ("cobertura", "Cobertura"), ("beneficiario", "Beneficiário"), ("sinistro", "Sinistro"), ("complementar", "Complementar")],
        "cat_labels": {"cobertura": "Cobertura", "beneficiario": "Beneficiário", "sinistro": "Sinistro", "complementar": "Complementar"},
        "cat_icons": {"cobertura": "fa-shield-heart", "beneficiario": "fa-user-group", "sinistro": "fa-file-medical", "complementar": "fa-plus-circle"},
        "items": [
            ("Consultar cobertura", "Capital segurado, coberturas incluídas, carências e exclusões do plano corporativo.", "cobertura", "Porto Seguro", "disponivel", True),
            ("Atualizar beneficiários", "Cadastre ou altere beneficiários do seguro de vida com validação de percentuais.", "beneficiario", "RH + Jurídico", "disponivel", False),
            ("Comunicar sinistro", "Abertura de processo de indenização com documentação exigida pela seguradora.", "sinistro", "Porto Seguro", "disponivel", False),
            ("Seguro complementar", "Contratação opcional de coberturas adicionais para titular e dependentes.", "complementar", "Porto Seguro", "sob_analise", False),
            ("Carteirinha digital", "Acesso à apólice coletiva e contatos de assistência 24h.", "cobertura", "Porto Seguro", "disponivel", False),
            ("FAQ do seguro", "Dúvidas frequentes sobre elegibilidade, portabilidade e desligamento.", "cobertura", "Jurídico", "disponivel", False),
        ],
    },
    {
        "id": "servicos-canal-denuncias",
        "route": "/servicos/canal-denuncias",
        "title": "Canal de denúncias",
        "icon": "fa-user-shield",
        "desc": "Registre denúncias de forma anônima ou identificada sobre condutas antiéticas, assédio ou irregularidades.",
        "banner_title": "Canal independente e confidencial",
        "banner_text": "Operado por empresa externa. Anonimato garantido. Retorno em até 5 dias úteis com protocolo de acompanhamento.",
        "search": "Buscar orientações do canal...",
        "count_label": "recurso",
        "root_id": "jur-denuncia-root",
        "filters_id": "jur-denuncia-filters",
        "count_id": "jur-denuncia-count",
        "filters": [("all", "Todos"), ("etica", "Ética"), ("assédio", "Assédio"), ("fraude", "Fraude"), ("compliance", "Compliance")],
        "cat_labels": {"etica": "Ética", "assédio": "Assédio", "fraude": "Fraude", "compliance": "Compliance"},
        "cat_icons": {"etica": "fa-scale-balanced", "assédio": "fa-hand", "fraude": "fa-mask", "compliance": "fa-clipboard-check"},
        "items": [
            ("Registrar denúncia", "Formulário seguro para relato de fatos com opção de anonimato total.", "etica", "Canal Externo", "disponivel", True),
            ("Acompanhar protocolo", "Consulte status da sua denúncia identificada com número de protocolo.", "compliance", "Canal Externo", "disponivel", False),
            ("Política antirretaliação", "Garantias de proteção a quem reporta de boa-fé irregularidades.", "compliance", "Compliance", "disponivel", False),
            ("Assédio moral ou sexual", "Canal dedicado com equipe especializada e sigilo reforçado.", "assédio", "Canal Externo", "disponivel", False),
            ("Fraude e corrupção", "Denúncias sobre desvios financeiros, suborno ou conflito de interesses.", "fraude", "Compliance", "disponivel", False),
            ("Estatísticas anuais", "Relatório agregado de denúncias recebidas e medidas adotadas (sem identificação).", "compliance", "Compliance", "disponivel", False),
        ],
    },
    {
        "id": "servicos-contratos-minutas",
        "route": "/servicos/contratos-minutas",
        "title": "Contratos e minutas",
        "icon": "fa-file-contract",
        "desc": "Solicite minutas contratuais, revisão de cláusulas e apoio na elaboração de acordos com terceiros.",
        "banner_title": "Biblioteca de minutas homologadas",
        "banner_text": "Use sempre modelos aprovados pelo Jurídico. Contratos fora do padrão exigem análise com prazo mínimo de 5 dias úteis.",
        "search": "Buscar minutas e contratos...",
        "count_label": "modelo",
        "root_id": "jur-contratos-root",
        "filters_id": "jur-contratos-filters",
        "count_id": "jur-contratos-count",
        "filters": [("all", "Todos"), ("prestacao", "Prestação"), ("fornecedor", "Fornecedor"), ("nda", "NDA"), ("parceria", "Parceria")],
        "cat_labels": {"prestacao": "Prestação", "fornecedor": "Fornecedor", "nda": "NDA", "parceria": "Parceria"},
        "cat_icons": {"prestacao": "fa-handshake", "fornecedor": "fa-truck-field", "nda": "fa-user-secret", "parceria": "fa-people-arrows"},
        "items": [
            ("Minutas padronizadas", "Biblioteca de contratos de prestação de serviços, locação e compra e venda.", "prestacao", "Jurídico", "disponivel", True),
            ("Revisão de contrato", "Envie minuta de contraparte para análise de riscos e sugestões de cláusulas.", "fornecedor", "Jurídico", "disponivel", False),
            ("NDA / Confidencialidade", "Acordo de não divulgação para projetos, parceiros e prestadores.", "nda", "Jurídico", "disponivel", False),
            ("Contrato de fornecedor", "Fluxo de homologação jurídica integrado ao cadastro de fornecedores.", "fornecedor", "Compras + Jurídico", "disponivel", False),
            ("Termo de parceria", "Modelos para parcerias comerciais, acadêmicas e de co-desenvolvimento.", "parceria", "Jurídico", "sob_analise", False),
            ("Cláusulas essenciais", "Guia de cláusulas obrigatórias: LGPD, anticorrupção, propriedade intelectual.", "prestacao", "Compliance", "disponivel", False),
        ],
    },
    {
        "id": "servicos-lgpd-privacidade",
        "route": "/servicos/lgpd-privacidade",
        "title": "LGPD e privacidade",
        "icon": "fa-shield-halved",
        "desc": "Exercite direitos de titular de dados, consulte políticas de privacidade e solicite avaliações de impacto.",
        "banner_title": "Programa de privacidade Liotécnica",
        "banner_text": "DPO disponível para dúvidas. Prazo de resposta a titulares: até 15 dias. Treinamento LGPD obrigatório anual.",
        "search": "Buscar serviços de privacidade...",
        "count_label": "serviço",
        "root_id": "jur-lgpd-root",
        "filters_id": "jur-lgpd-filters",
        "count_id": "jur-lgpd-count",
        "filters": [("all", "Todos"), ("titular", "Titular"), ("politica", "Política"), ("impacto", "Impacto"), ("incidente", "Incidente")],
        "cat_labels": {"titular": "Titular", "politica": "Política", "impacto": "Impacto", "incidente": "Incidente"},
        "cat_icons": {"titular": "fa-user-lock", "politica": "fa-book", "impacto": "fa-chart-line", "incidente": "fa-triangle-exclamation"},
        "items": [
            ("Direitos do titular", "Solicite acesso, correção, exclusão ou portabilidade dos seus dados pessoais.", "titular", "DPO Lio", "disponivel", True),
            ("Política de privacidade", "Documento vigente sobre coleta, uso, compartilhamento e retenção de dados.", "politica", "Compliance", "disponivel", False),
            ("RIPD / DPIA", "Avaliação de impacto para novos projetos que tratam dados sensíveis ou em larga escala.", "impacto", "DPO Lio", "disponivel", False),
            ("Comunicar incidente", "Notifique vazamento ou acesso indevido a dados pessoais imediatamente.", "incidente", "DPO Lio", "disponivel", False),
            ("Treinamento LGPD", "Curso anual obrigatório e materiais de conscientização em privacidade.", "politica", "Compliance", "disponivel", False),
            ("Mapeamento de dados", "Inventário de sistemas e bases que tratam dados pessoais por área.", "impacto", "DPO Lio", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-codigo-conduta",
        "route": "/servicos/codigo-conduta",
        "title": "Código de conduta",
        "icon": "fa-book-open",
        "desc": "Consulte o código de ética, políticas anticorrupção, conflito de interesses e declarações de conformidade.",
        "banner_title": "Ética e integridade corporativa",
        "banner_text": "Todo colaborador deve ler e aceitar o código na admissão. Revisão anual com atualização de conflitos de interesse.",
        "search": "Buscar políticas de conduta...",
        "count_label": "documento",
        "root_id": "jur-conduta-root",
        "filters_id": "jur-conduta-filters",
        "count_id": "jur-conduta-count",
        "filters": [("all", "Todos"), ("etica", "Ética"), ("anticorrupcao", "Anticorrupção"), ("conflito", "Conflito"), ("treinamento", "Treinamento")],
        "cat_labels": {"etica": "Ética", "anticorrupcao": "Anticorrupção", "conflito": "Conflito", "treinamento": "Treinamento"},
        "cat_icons": {"etica": "fa-scale-balanced", "anticorrupcao": "fa-ban", "conflito": "fa-arrows-split-up-and-left", "treinamento": "fa-graduation-cap"},
        "items": [
            ("Código de conduta vigente", "Princípios éticos, comportamento esperado e consequências de violações.", "etica", "Compliance", "disponivel", True),
            ("Política anticorrupção", "Regras sobre brindes, hospitalidade, due diligence e relação com agentes públicos.", "anticorrupcao", "Compliance", "disponivel", False),
            ("Declaração de conflito", "Formulário anual de conflitos de interesse e relacionamentos relevantes.", "conflito", "Compliance", "disponivel", False),
            ("Presentes e hospitalidade", "Limites e aprovações para recebimento ou oferta de brindes e eventos.", "anticorrupcao", "Compliance", "disponivel", False),
            ("Treinamento de integridade", "Curso EAD sobre ética, anticorrupção e canal de denúncias.", "treinamento", "Compliance", "disponivel", False),
            ("Certificado de leitura", "Comprovante de aceite do código de conduta e políticas associadas.", "etica", "Compliance", "disponivel", False),
        ],
    },
    {
        "id": "servicos-due-diligence",
        "route": "/servicos/due-diligence",
        "title": "Due diligence",
        "icon": "fa-magnifying-glass-chart",
        "desc": "Solicite análise de background de fornecedores, parceiros e terceiros conforme política de compliance.",
        "banner_title": "Homologação de terceiros",
        "banner_text": "Obrigatória para contratos acima de R$ 50 mil/ano. Inclui consulta a listas restritivas, mídia negativa e certidões.",
        "search": "Buscar processos de due diligence...",
        "count_label": "processo",
        "root_id": "jur-dd-root",
        "filters_id": "jur-dd-filters",
        "count_id": "jur-dd-count",
        "filters": [("all", "Todos"), ("fornecedor", "Fornecedor"), ("parceiro", "Parceiro"), ("midia", "Mídia"), ("certidao", "Certidão")],
        "cat_labels": {"fornecedor": "Fornecedor", "parceiro": "Parceiro", "midia": "Mídia", "certidao": "Certidão"},
        "cat_icons": {"fornecedor": "fa-industry", "parceiro": "fa-handshake", "midia": "fa-newspaper", "certidao": "fa-stamp"},
        "items": [
            ("Iniciar due diligence", "Abra processo de análise informando CNPJ, escopo e valor estimado do contrato.", "fornecedor", "Compliance", "disponivel", True),
            ("Consultar status", "Acompanhe etapas: documentação, certidões, mídia negativa e parecer final.", "fornecedor", "Compliance", "disponivel", False),
            ("Listas restritivas", "Verificação em CEIS, CNEP, listas internacionais e sanções.", "certidao", "Compliance", "disponivel", False),
            ("Análise de mídia", "Pesquisa de notícias negativas e reputacionais sobre o terceiro.", "midia", "Compliance", "disponivel", False),
            ("Due diligence simplificada", "Fluxo reduzido para contratos de baixo risco conforme matriz de risco.", "parceiro", "Compliance", "disponivel", False),
            ("Matriz de risco", "Critérios para definir profundidade da análise por tipo de contratação.", "fornecedor", "Compliance", "disponivel", False),
        ],
    },
    {
        "id": "servicos-procuracoes",
        "route": "/servicos/procuracoes",
        "title": "Procurações e poderes",
        "icon": "fa-gavel",
        "desc": "Solicite procurações públicas ou particulares, outorga de poderes e revogações conforme alçada.",
        "banner_title": "Gestão de procurações corporativas",
        "banner_text": "Procurações públicas exigem reconhecimento de firma. Prazo médio: 7 dias úteis. Matriz de alçadas define limites por cargo.",
        "search": "Buscar procurações...",
        "count_label": "serviço",
        "root_id": "jur-proc-root",
        "filters_id": "jur-proc-filters",
        "count_id": "jur-proc-count",
        "filters": [("all", "Todos"), ("publica", "Pública"), ("particular", "Particular"), ("revogacao", "Revogação"), ("consulta", "Consulta")],
        "cat_labels": {"publica": "Pública", "particular": "Particular", "revogacao": "Revogação", "consulta": "Consulta"},
        "cat_icons": {"publica": "fa-stamp", "particular": "fa-file-signature", "revogacao": "fa-ban", "consulta": "fa-magnifying-glass"},
        "items": [
            ("Solicitar procuração", "Peça outorga de poderes com escopo, prazo e finalidade definidos.", "particular", "Jurídico", "disponivel", True),
            ("Procuração pública", "Orientações para lavratura em cartório e documentos necessários.", "publica", "Jurídico", "disponivel", False),
            ("Revogar procuração", "Formalize revogação de poderes outorgados anteriormente.", "revogacao", "Jurídico", "disponivel", False),
            ("Consultar procurações ativas", "Lista de procurações vigentes em seu nome ou emitidas por você.", "consulta", "Jurídico", "disponivel", False),
            ("Matriz de alçadas", "Limites de representação por cargo e tipo de ato.", "consulta", "Jurídico", "disponivel", False),
            ("Substabelecimento", "Regras para transferência de poderes a terceiros.", "particular", "Jurídico", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-consultoria-juridica",
        "route": "/servicos/consultoria-juridica",
        "title": "Consultoria jurídica",
        "icon": "fa-comments",
        "desc": "Agende orientação jurídica interna sobre dúvidas trabalhistas, contratuais, societárias e regulatórias.",
        "banner_title": "Jurídico interno à disposição",
        "banner_text": "Consultas rápidas por chat ou e-mail. Reuniões agendadas para temas complexos. Não substitui assessoria externa em litígios.",
        "search": "Buscar temas de consultoria...",
        "count_label": "serviço",
        "root_id": "jur-consulta-root",
        "filters_id": "jur-consulta-filters",
        "count_id": "jur-consulta-count",
        "filters": [("all", "Todos"), ("trabalhista", "Trabalhista"), ("contratos", "Contratos"), ("societario", "Societário"), ("regulatorio", "Regulatório")],
        "cat_labels": {"trabalhista": "Trabalhista", "contratos": "Contratos", "societario": "Societário", "regulatorio": "Regulatório"},
        "cat_icons": {"trabalhista": "fa-briefcase", "contratos": "fa-file-contract", "societario": "fa-building-columns", "regulatorio": "fa-landmark"},
        "items": [
            ("Agendar consulta", "Marque horário com advogado interno para dúvida específica da sua área.", "contratos", "Jurídico", "disponivel", True),
            ("Parecer expresso", "Resposta por e-mail em até 2 dias úteis para questões objetivas.", "trabalhista", "Jurídico", "disponivel", False),
            ("Orientação trabalhista", "Dúvidas sobre jornada, férias, desligamento e relações de trabalho.", "trabalhista", "Jurídico", "disponivel", False),
            ("Questões societárias", "Assembleias, atas, alterações contratuais e governança corporativa.", "societario", "Jurídico", "sob_analise", False),
            ("Regulatório e licenças", "Orientação sobre ANVISA, IBAMA, ANATEL e órgãos do setor.", "regulatorio", "Jurídico", "disponivel", False),
            ("Base de pareceres", "Consulte pareceres anteriores anonimizados por tema (acesso restrito).", "contratos", "Jurídico", "disponivel", False),
        ],
    },
]

STATUS_LABELS = {
    "disponivel": "Disponível",
    "sob_analise": "Sob análise",
    "indisponivel": "Indisponível",
}


def juridico_styles() -> str:
    css = BASE_STYLES.read_text(encoding="utf-8")
    for old, new in JURIDICO_STYLE_REPLACEMENTS.items():
        css = css.replace(old, new)
    css += textwrap.dedent("""
        [class*="benefit-card__icon--"] {
          background: #ede9fe; color: #6d28d9; border-color: #c4b5fd;
        }
        [class*="benefit-card__cat--"] {
          background: #ede9fe; color: #5b21b6;
        }
        .benefit-card__status--disponivel { background: #dcfce7; color: #15803d; }
        .benefit-card__status--sob_analise { background: #fef3c7; color: #b45309; }
        .filter-chip.is-active {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #5b21b6;
        }
        .topbar__dropdown-menu--services a.is-active {
          background: #ede9fe;
          color: #5b21b6;
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
            <span>Jurídico &amp; Compliance</span>
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
        items.append({"title": title, "desc": desc, "cat": cat, "provider": provider, "status": status, "featured": featured})
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
                <i class="fa-solid ${{catIcons[item.cat] || "fa-scale-balanced"}}"></i>
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
              <span><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> ${{item.provider}}</span>
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
    styles = juridico_styles()
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
    print("\nDone. Run: python scripts/generate-pages-index.py")


if __name__ == "__main__":
    main()
