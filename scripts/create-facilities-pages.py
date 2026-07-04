# -*- coding: utf-8 -*-
"""Generate Facilities service pages for React app."""

import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "src" / "generated" / "pages"
REGISTRY = ROOT / "src" / "generated" / "pages.json"
BASE_STYLES = PAGES_DIR / "servicos-beneficios" / "styles.css"

FACILITIES_STYLE_REPLACEMENTS = {
    "/* PAGE: SERVIÇOS — BENEFÍCIOS */": "/* PAGE: SERVIÇOS — FACILITIES */",
    "#fce7f3": "#dbeafe",
    "#f9a8d4": "#93c5fd",
    "#be185d": "#0369a1",
    "#fdf2f8": "#eff6ff",
    "#db2777": "#0284c7",
    "#9d174d": "#1e40af",
}

PAGES = [
    {
        "id": "servicos-reservas-salas",
        "route": "/servicos/reservas-salas",
        "title": "Reservas de salas",
        "icon": "fa-door-open",
        "desc": "Consulte disponibilidade, reserve salas de reunião e gerencie seus agendamentos nas unidades Liotécnica.",
        "banner_title": "12 salas disponíveis para reserva",
        "banner_text": "Reservas com até 30 dias de antecedência. Salas equipadas com TV, videoconferência e quadro. Cancelamento gratuito até 2h antes.",
        "search": "Buscar salas e horários...",
        "count_label": "sala",
        "root_id": "fac-salas-root",
        "filters_id": "fac-salas-filters",
        "count_id": "fac-salas-count",
        "filters": [
            ("all", "Todos"),
            ("reuniao", "Reunião"),
            ("treinamento", "Treinamento"),
            ("auditorio", "Auditório"),
            ("hibrido", "Híbrido"),
        ],
        "cat_labels": {
            "reuniao": "Reunião",
            "treinamento": "Treinamento",
            "auditorio": "Auditório",
            "hibrido": "Híbrido",
        },
        "cat_icons": {
            "reuniao": "fa-users",
            "treinamento": "fa-chalkboard-user",
            "auditorio": "fa-microphone",
            "hibrido": "fa-video",
        },
        "items": [
            ("Sala Alpha — 8 lugares", "Sala de reunião no 2º andar com TV 55\", videoconferência Teams e quadro branco.", "reuniao", "Matriz SP", "disponivel", True),
            ("Sala Beta — 12 lugares", "Espaço amplo para workshops e reuniões de equipe com mesa em U e ar-condicionado.", "reuniao", "Matriz SP", "disponivel", False),
            ("Auditório Principal — 80 lugares", "Auditório completo com palco, sistema de som, projetor e tradução simultânea.", "auditorio", "Matriz SP", "disponivel", False),
            ("Sala Foco — 4 lugares", "Ambiente reservado para reuniões rápidas e calls individuais. Reserva mínima: 30 min.", "reuniao", "Matriz SP", "disponivel", False),
            ("War Room — 16 lugares", "Sala estratégica com múltiplas telas, lousa digital e conectividade dedicada.", "treinamento", "Matriz SP", "sob_analise", False),
            ("Sala Híbrida — 20 lugares", "Layout flexível com câmeras 360°, microfones de mesa e integração com Teams Rooms.", "hibrido", "Filial Campinas", "disponivel", False),
        ],
    },
    {
        "id": "servicos-reserva-veiculos",
        "route": "/servicos/reserva-veiculos",
        "title": "Reserva de veículos",
        "icon": "fa-car",
        "desc": "Reserve veículos da frota corporativa para deslocamentos a trabalho, visitas a clientes e eventos internos.",
        "banner_title": "Frota corporativa com 8 veículos",
        "banner_text": "Reserva com aprovação do gestor. CNH válida e curso de direção defensiva obrigatórios. Retirada na portaria com checklist.",
        "search": "Buscar veículos...",
        "count_label": "veículo",
        "root_id": "fac-veiculos-root",
        "filters_id": "fac-veiculos-filters",
        "count_id": "fac-veiculos-count",
        "filters": [
            ("all", "Todos"),
            ("carro", "Carro"),
            ("van", "Van"),
            ("utilitario", "Utilitário"),
            ("disponivel", "Disponível"),
        ],
        "cat_labels": {
            "carro": "Carro",
            "van": "Van",
            "utilitario": "Utilitário",
            "disponivel": "Disponível",
        },
        "cat_icons": {
            "carro": "fa-car-side",
            "van": "fa-shuttle-van",
            "utilitario": "fa-truck-pickup",
            "disponivel": "fa-circle-check",
        },
        "items": [
            ("Reservar veículo", "Fluxo completo de reserva com seleção de datas, destino, justificativa e aprovação do gestor.", "carro", "Portal Facilities", "disponivel", True),
            ("Frota disponível", "Consulte veículos livres em tempo real: sedans, hatches e utilitários por unidade.", "disponivel", "Matriz SP", "disponivel", False),
            ("Corolla — ABC1D23", "Sedan executivo para visitas externas. Ar-condicionado, GPS e seguro total.", "carro", "Matriz SP", "disponivel", False),
            ("Spin — DEF4G56", "Van para 7 passageiros. Ideal para equipes em deslocamento intermunicipal.", "van", "Matriz SP", "disponivel", False),
            ("Strada — GHI7J89", "Utilitário para transporte de materiais leves e amostras entre unidades.", "utilitario", "Filial Campinas", "sob_analise", False),
            ("Checklist de devolução", "Formulário de inspeção na devolução: combustível, limpeza, avarias e quilometragem.", "disponivel", "Portaria", "disponivel", False),
        ],
    },
    {
        "id": "servicos-cracha-visitantes",
        "route": "/servicos/cracha-visitantes",
        "title": "Crachá e visitantes",
        "icon": "fa-id-card",
        "desc": "Solicite crachás, registre visitantes e gerencie acessos temporários às instalações da Liotécnica.",
        "banner_title": "Controle de acesso integrado",
        "banner_text": "Visitantes devem ser pré-cadastrados com 24h de antecedência. Crachás provisórios retirados na recepção com documento com foto.",
        "search": "Buscar solicitações...",
        "count_label": "serviço",
        "root_id": "fac-cracha-root",
        "filters_id": "fac-cracha-filters",
        "count_id": "fac-cracha-count",
        "filters": [
            ("all", "Todos"),
            ("cracha", "Crachá"),
            ("visitante", "Visitante"),
            ("terceiro", "Terceiro"),
            ("evento", "Evento"),
        ],
        "cat_labels": {
            "cracha": "Crachá",
            "visitante": "Visitante",
            "terceiro": "Terceiro",
            "evento": "Evento",
        },
        "cat_icons": {
            "cracha": "fa-id-badge",
            "visitante": "fa-user-plus",
            "terceiro": "fa-hard-hat",
            "evento": "fa-calendar-days",
        },
        "items": [
            ("Solicitar crachá", "Segunda via, crachá provisório ou substituição por perda. Retirada em até 2 dias úteis.", "cracha", "Facilities", "disponivel", True),
            ("Registrar visitante", "Pré-cadastro de visitantes com nome, documento, empresa, anfitrião e horário previsto.", "visitante", "Portaria", "disponivel", False),
            ("Acesso de terceiros", "Prestadores de serviço e fornecedores com credenciamento e EPIs obrigatórios.", "terceiro", "Segurança", "disponivel", False),
            ("Eventos e grupos", "Cadastro em lote para treinamentos, auditorias e visitas técnicas com lista de participantes.", "evento", "Facilities", "disponivel", False),
            ("Política de visitantes", "Normas de conduta, áreas permitidas, acompanhamento obrigatório e registro de entrada/saída.", "visitante", "Compliance", "disponivel", False),
            ("Crachá de estacionamento", "Tag de acesso ao estacionamento de visitantes. Vinculada ao cadastro do visitante.", "cracha", "Portaria", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-encomendas-correios",
        "route": "/servicos/encomendas-correios",
        "title": "Encomendas e correios",
        "icon": "fa-box",
        "desc": "Acompanhe encomendas recebidas, registre retiradas e solicite envios corporativos via Facilities.",
        "banner_title": "Central de recebimento ativa",
        "banner_text": "Encomendas pessoais são registradas na portaria e notificadas por e-mail. Retirada em até 5 dias úteis no setor de Facilities.",
        "search": "Buscar encomendas...",
        "count_label": "registro",
        "root_id": "fac-correios-root",
        "filters_id": "fac-correios-filters",
        "count_id": "fac-correios-count",
        "filters": [
            ("all", "Todos"),
            ("recebida", "Recebidas"),
            ("enviada", "Enviadas"),
            ("pendente", "Pendente"),
            ("retirada", "Retirada"),
        ],
        "cat_labels": {
            "recebida": "Recebida",
            "enviada": "Enviada",
            "pendente": "Pendente",
            "retirada": "Retirada",
        },
        "cat_icons": {
            "recebida": "fa-inbox",
            "enviada": "fa-paper-plane",
            "pendente": "fa-clock",
            "retirada": "fa-hand-holding-box",
        },
        "items": [
            ("Minhas encomendas", "Lista de volumes recebidos em seu nome com data, remetente e status de retirada.", "recebida", "Portaria", "disponivel", True),
            ("Rastrear envio", "Consulte status de correspondências e encomendas enviadas pela empresa com código de rastreio.", "enviada", "Correios/Motoboy", "disponivel", False),
            ("Solicitar envio", "Pedido de coleta ou postagem corporativa com destinatário, peso e urgência.", "enviada", "Facilities", "disponivel", False),
            ("Notificação de chegada", "Alertas automáticos por e-mail quando uma encomenda é registrada na portaria.", "recebida", "Sistema Lio", "disponivel", False),
            ("Retirada pendente", "Volumes aguardando retirada há mais de 3 dias. Regularize para evitar devolução ao remetente.", "pendente", "Facilities", "disponivel", False),
            ("Malotes internos", "Circulação de documentos e materiais entre unidades com registro de cadeia de custódia.", "enviada", "Facilities", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-limpeza",
        "route": "/servicos/limpeza",
        "title": "Limpeza e higienização",
        "icon": "fa-broom",
        "desc": "Solicite serviços de limpeza, higienização de ambientes, desinfecção e apoio para eventos internos.",
        "banner_title": "Equipe de limpeza em todas as unidades",
        "banner_text": "Atendimento de segunda a sábado. Solicitações urgentes (vazamentos, odores, resíduos) têm prioridade em até 2 horas.",
        "search": "Buscar serviços de limpeza...",
        "count_label": "serviço",
        "root_id": "fac-limpeza-root",
        "filters_id": "fac-limpeza-filters",
        "count_id": "fac-limpeza-count",
        "filters": [
            ("all", "Todos"),
            ("rotina", "Rotina"),
            ("profunda", "Profunda"),
            ("emergencial", "Emergencial"),
            ("evento", "Evento"),
        ],
        "cat_labels": {"rotina": "Rotina", "profunda": "Profunda", "emergencial": "Emergencial", "evento": "Evento"},
        "cat_icons": {"rotina": "fa-calendar-check", "profunda": "fa-spray-can-sparkles", "emergencial": "fa-bolt", "evento": "fa-champagne-glasses"},
        "items": [
            ("Limpeza de estações", "Higienização de mesa, cadeira, teclado e lixeira da sua estação de trabalho.", "rotina", "Facilities", "disponivel", True),
            ("Limpeza profunda de sala", "Sanitização completa de salas de reunião após eventos ou uso intensivo.", "profunda", "Facilities", "disponivel", False),
            ("Desinfecção de ambientes", "Protocolo ampliado para áreas comuns, copas e banheiros em períodos de maior circulação.", "profunda", "Facilities", "disponivel", False),
            ("Atendimento emergencial", "Derramamentos, quebras de vidro, odores ou resíduos que exigem ação imediata.", "emergencial", "Plantão Facilities", "disponivel", False),
            ("Apoio a eventos", "Montagem e limpeza pós-evento em auditório, refeitório ou áreas externas.", "evento", "Facilities", "disponivel", False),
            ("Coleta de materiais", "Retirada de caixas, embalagens e itens descartáveis acumulados na área.", "rotina", "Facilities", "disponivel", False),
        ],
    },
    {
        "id": "servicos-manutencao-predial",
        "route": "/servicos/manutencao-predial",
        "title": "Manutenção predial",
        "icon": "fa-screwdriver-wrench",
        "desc": "Registre ocorrências de manutenção elétrica, hidráulica, civil e solicite inspeções preventivas.",
        "banner_title": "Manutenção corretiva e preventiva",
        "banner_text": "Chamados críticos (sem energia, vazamentos, portas travadas) são atendidos em regime de plantão. Demais solicitações em até 48h.",
        "search": "Buscar chamados de manutenção...",
        "count_label": "serviço",
        "root_id": "fac-manutencao-root",
        "filters_id": "fac-manutencao-filters",
        "count_id": "fac-manutencao-count",
        "filters": [
            ("all", "Todos"),
            ("eletrica", "Elétrica"),
            ("hidraulica", "Hidráulica"),
            ("civil", "Civil"),
            ("preventiva", "Preventiva"),
        ],
        "cat_labels": {"eletrica": "Elétrica", "hidraulica": "Hidráulica", "civil": "Civil", "preventiva": "Preventiva"},
        "cat_icons": {"eletrica": "fa-bolt", "hidraulica": "fa-faucet-drip", "civil": "fa-hammer", "preventiva": "fa-clipboard-check"},
        "items": [
            ("Abrir chamado de manutenção", "Registre o problema com local, foto e descrição. Acompanhe status pelo portal.", "civil", "Portal Facilities", "disponivel", True),
            ("Manutenção elétrica", "Tomadas, iluminação, disjuntores e quadros elétricos. Não manipule instalações por conta própria.", "eletrica", "Facilities", "disponivel", False),
            ("Manutenção hidráulica", "Vazamentos, entupimentos, torneiras e vasos sanitários em áreas comuns ou estações.", "hidraulica", "Facilities", "disponivel", False),
            ("Reparos civis", "Paredes, pintura, portas, fechaduras, divisórias e mobiliário fixo.", "civil", "Facilities", "disponivel", False),
            ("Inspeção preventiva", "Agende vistorias periódicas de ar-condicionado, extintores e sinalização de emergência.", "preventiva", "Facilities", "disponivel", False),
            ("Elevadores e acessos", "Reporte falhas em elevadores, rampas, corrimãos e portas automáticas.", "civil", "Facilities", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-copiadora",
        "route": "/servicos/copiadora",
        "title": "Copiadora e impressão",
        "icon": "fa-print",
        "desc": "Solicite impressões, digitalizações, plotagens e reposição de suprimentos nas estações de cópia.",
        "banner_title": "Centro de impressão corporativo",
        "banner_text": "Impressoras multifuncionais em todas as unidades. Impressões confidenciais com PIN. Plotagens com 24h de antecedência.",
        "search": "Buscar serviços de impressão...",
        "count_label": "serviço",
        "root_id": "fac-copiadora-root",
        "filters_id": "fac-copiadora-filters",
        "count_id": "fac-copiadora-count",
        "filters": [
            ("all", "Todos"),
            ("impressao", "Impressão"),
            ("digitalizacao", "Digitalização"),
            ("plotagem", "Plotagem"),
            ("suprimento", "Suprimento"),
        ],
        "cat_labels": {"impressao": "Impressão", "digitalizacao": "Digitalização", "plotagem": "Plotagem", "suprimento": "Suprimento"},
        "cat_icons": {"impressao": "fa-print", "digitalizacao": "fa-file-pdf", "plotagem": "fa-ruler-combined", "suprimento": "fa-box-open"},
        "items": [
            ("Impressão em grande volume", "Jobs acima de 500 páginas ou materiais para eventos. Envie arquivo e especificações.", "impressao", "Gráfica Interna", "disponivel", True),
            ("Digitalização de documentos", "Conversão de papéis para PDF pesquisável. Entrega via SharePoint ou e-mail seguro.", "digitalizacao", "Facilities", "disponivel", False),
            ("Plotagem técnica", "Plantas, projetos e banners em formato A0/A1. Prazo mínimo: 1 dia útil.", "plotagem", "Gráfica Interna", "disponivel", False),
            ("Reposição de toner e papel", "Solicite recarga de insumos para impressoras do seu andar ou departamento.", "suprimento", "Facilities", "disponivel", False),
            ("Impressão confidencial", "Liberação de documentos sensíveis com autenticação por crachá ou PIN na impressora.", "impressao", "TI + Facilities", "disponivel", False),
            ("Encadernação e acabamento", "Espiral, grampeação, capa dura e plastificação para materiais de treinamento.", "impressao", "Gráfica Interna", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-estacionamento",
        "route": "/servicos/estacionamento",
        "title": "Estacionamento",
        "icon": "fa-square-parking",
        "desc": "Gerencie vagas de estacionamento, mensalidades, visitantes e motos nas unidades Liotécnica.",
        "banner_title": "Estacionamento controlado por crachá",
        "banner_text": "Vagas limitadas por unidade. Mensalistas têm prioridade. Visitantes usam tag temporária vinculada ao cadastro na portaria.",
        "search": "Buscar vagas e solicitações...",
        "count_label": "serviço",
        "root_id": "fac-estacionamento-root",
        "filters_id": "fac-estacionamento-filters",
        "count_id": "fac-estacionamento-count",
        "filters": [
            ("all", "Todos"),
            ("vaga", "Vaga fixa"),
            ("mensalista", "Mensalista"),
            ("visitante", "Visitante"),
            ("moto", "Moto"),
        ],
        "cat_labels": {"vaga": "Vaga fixa", "mensalista": "Mensalista", "visitante": "Visitante", "moto": "Moto"},
        "cat_icons": {"vaga": "fa-car", "mensalista": "fa-id-card", "visitante": "fa-user-clock", "moto": "fa-motorcycle"},
        "items": [
            ("Solicitar vaga mensalista", "Cadastro para vaga rotativa ou fixa conforme disponibilidade e política da unidade.", "mensalista", "Facilities", "disponivel", True),
            ("Vaga para visitante", "Liberação temporária de estacionamento vinculada ao registro de visitante.", "visitante", "Portaria", "disponivel", False),
            ("Estacionamento de motos", "Vagas demarcadas com trava e cobertura. Cadastro obrigatório na portaria.", "moto", "Facilities", "disponivel", False),
            ("Troca de veículo", "Atualize placa e modelo no cadastro de mensalista após troca de carro.", "mensalista", "Facilities", "disponivel", False),
            ("Mapa de vagas", "Consulte disponibilidade por andar, PCD e carregamento elétrico.", "vaga", "Facilities", "disponivel", False),
            ("Estacionamento coberto", "Vagas premium com cobertura — lista de espera conforme antiguidade.", "vaga", "Facilities", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-refeitorio",
        "route": "/servicos/refeitorio",
        "title": "Refeitório e copa",
        "icon": "fa-utensils",
        "desc": "Consulte cardápio, reserve coffee breaks, solicite apoio para eventos e reporte ocorrências nas copas.",
        "banner_title": "Refeitório e copas em todas as unidades",
        "banner_text": "Almoço servido das 11h30 às 14h. Copas equipadas com café, micro-ondas e geladeira compartilhada.",
        "search": "Buscar serviços do refeitório...",
        "count_label": "serviço",
        "root_id": "fac-refeitorio-root",
        "filters_id": "fac-refeitorio-filters",
        "count_id": "fac-refeitorio-count",
        "filters": [
            ("all", "Todos"),
            ("almoco", "Almoço"),
            ("cafe", "Coffee break"),
            ("evento", "Evento"),
            ("copa", "Copa"),
        ],
        "cat_labels": {"almoco": "Almoço", "cafe": "Coffee break", "evento": "Evento", "copa": "Copa"},
        "cat_icons": {"almoco": "fa-bowl-food", "cafe": "fa-mug-hot", "evento": "fa-cookie-bite", "copa": "fa-kitchen-set"},
        "items": [
            ("Cardápio da semana", "Consulte opções de almoço, saladas, sobremesas e pratos especiais por dia.", "almoco", "Refeitório", "disponivel", True),
            ("Reservar coffee break", "Solicite café, água e snacks para reuniões com até 48h de antecedência.", "cafe", "Facilities", "disponivel", False),
            ("Alimentação para eventos", "Apoio de buffet ou coffee break ampliado para treinamentos e confraternizações.", "evento", "Facilities", "disponivel", False),
            ("Reportar problema na copa", "Micro-ondas, geladeira, cafeteira ou falta de suprimentos — abra solicitação.", "copa", "Facilities", "disponivel", False),
            ("Dieta restritiva", "Solicite opções vegetarianas, sem glúten ou sem lactose com antecedência.", "almoco", "Refeitório", "disponivel", False),
            ("Horário estendido", "Refeitório em horário especial para plantões — consulte disponibilidade.", "almoco", "Facilities", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-climatizacao",
        "route": "/servicos/climatizacao",
        "title": "Climatização",
        "icon": "fa-fan",
        "desc": "Solicite ajustes de temperatura, manutenção de ar-condicionado e inspeções do sistema de climatização.",
        "banner_title": "Conforto térmico monitorado",
        "banner_text": "Faixa recomendada: 22°C a 24°C. Ajustes coletivos por andar. Manutenção preventiva trimestral dos equipamentos.",
        "search": "Buscar serviços de climatização...",
        "count_label": "serviço",
        "root_id": "fac-clima-root",
        "filters_id": "fac-clima-filters",
        "count_id": "fac-clima-count",
        "filters": [
            ("all", "Todos"),
            ("ar", "Ar-condicionado"),
            ("ventilacao", "Ventilação"),
            ("temperatura", "Temperatura"),
            ("preventiva", "Preventiva"),
        ],
        "cat_labels": {"ar": "Ar-condicionado", "ventilacao": "Ventilação", "temperatura": "Temperatura", "preventiva": "Preventiva"},
        "cat_icons": {"ar": "fa-snowflake", "ventilacao": "fa-wind", "temperatura": "fa-temperature-half", "preventiva": "fa-calendar-check"},
        "items": [
            ("Ajuste de temperatura", "Solicite alteração do setpoint do ar-condicionado do seu setor ou sala.", "temperatura", "Facilities", "disponivel", True),
            ("Ar-condicionado com defeito", "Equipamento não liga, vaza água ou emite ruído — abra chamado urgente.", "ar", "Facilities", "disponivel", False),
            ("Limpeza de filtros", "Higienização periódica de filtros split e centrais para qualidade do ar.", "preventiva", "Facilities", "disponivel", False),
            ("Ventilação insuficiente", "Reporte ambientes abafados, odores ou fluxo de ar inadequado.", "ventilacao", "Facilities", "disponivel", False),
            ("Inspeção preventiva", "Agende vistoria técnica antes do verão ou após período de intenso uso.", "preventiva", "Facilities", "disponivel", False),
            ("Controle remoto / automação", "Suporte ao painel de automação predial e sensores de ocupação.", "ar", "Facilities", "sob_analise", False),
        ],
    },
    {
        "id": "servicos-gestao-residuos",
        "route": "/servicos/gestao-residuos",
        "title": "Gestão de resíduos",
        "icon": "fa-recycle",
        "desc": "Descarte correto de resíduos, coleta seletiva, resíduos perigosos e campanhas de sustentabilidade.",
        "banner_title": "Programa Lio Sustentável",
        "banner_text": "Separação obrigatória: reciclável, orgânico e rejeito. Resíduos químicos e eletrônicos têm descarte especial.",
        "search": "Buscar orientações de descarte...",
        "count_label": "serviço",
        "root_id": "fac-residuos-root",
        "filters_id": "fac-residuos-filters",
        "count_id": "fac-residuos-count",
        "filters": [
            ("all", "Todos"),
            ("reciclavel", "Reciclável"),
            ("organico", "Orgânico"),
            ("perigoso", "Perigoso"),
            ("coleta", "Coleta"),
        ],
        "cat_labels": {"reciclavel": "Reciclável", "organico": "Orgânico", "perigoso": "Perigoso", "coleta": "Coleta"},
        "cat_icons": {"reciclavel": "fa-recycle", "organico": "fa-leaf", "perigoso": "fa-biohazard", "coleta": "fa-truck"},
        "items": [
            ("Coleta seletiva", "Pontos de descarte por andar: papel, plástico, metal, vidro e rejeito.", "reciclavel", "Facilities", "disponivel", True),
            ("Resíduos orgânicos", "Composteira e lixeiras marrons para restos de alimentos no refeitório e copas.", "organico", "Facilities", "disponivel", False),
            ("Descarte de eletrônicos", "Coleta de cabos, toners vazios, equipamentos obsoletos e pilhas.", "perigoso", "TI + Facilities", "disponivel", False),
            ("Resíduos químicos", "Descarte de solventes, reagentes e materiais de laboratório conforme FISPQ.", "perigoso", "Segurança", "disponivel", False),
            ("Agendar coleta especial", "Grandes volumes ou móveis descartados — solicite coleta com data marcada.", "coleta", "Facilities", "disponivel", False),
            ("Campanhas de sustentabilidade", "Participe de mutirões de limpeza, troca de copos descartáveis e economia de energia.", "reciclavel", "ESG Lio", "disponivel", False),
        ],
    },
]

STATUS_LABELS = {
    "disponivel": "Disponível",
    "sob_analise": "Sob análise",
    "indisponivel": "Indisponível",
}


def facilities_styles() -> str:
    css = BASE_STYLES.read_text(encoding="utf-8")
    for old, new in FACILITIES_STYLE_REPLACEMENTS.items():
        css = css.replace(old, new)
    css += textwrap.dedent("""
        .benefit-card__icon--reuniao,
        .benefit-card__icon--carro,
        .benefit-card__icon--cracha,
        .benefit-card__icon--recebida {
          background: #dbeafe; color: #1d4ed8; border-color: #93c5fd;
        }
        .benefit-card__icon--treinamento,
        .benefit-card__icon--van,
        .benefit-card__icon--visitante,
        .benefit-card__icon--enviada {
          background: #e0f2fe; color: #0369a1; border-color: #7dd3fc;
        }
        .benefit-card__icon--auditorio,
        .benefit-card__icon--utilitario,
        .benefit-card__icon--terceiro,
        .benefit-card__icon--pendente {
          background: #eff6ff; color: #2563eb; border-color: #bfdbfe;
        }
        .benefit-card__icon--hibrido,
        .benefit-card__icon--disponivel,
        .benefit-card__icon--evento,
        .benefit-card__icon--retirada,
        .benefit-card__icon--rotina,
        .benefit-card__icon--profunda,
        .benefit-card__icon--emergencial,
        .benefit-card__icon--eletrica,
        .benefit-card__icon--hidraulica,
        .benefit-card__icon--civil,
        .benefit-card__icon--preventiva,
        .benefit-card__icon--impressao,
        .benefit-card__icon--digitalizacao,
        .benefit-card__icon--plotagem,
        .benefit-card__icon--suprimento,
        .benefit-card__icon--vaga,
        .benefit-card__icon--mensalista,
        .benefit-card__icon--visitante,
        .benefit-card__icon--moto,
        .benefit-card__icon--almoco,
        .benefit-card__icon--cafe,
        .benefit-card__icon--copa,
        .benefit-card__icon--ar,
        .benefit-card__icon--ventilacao,
        .benefit-card__icon--temperatura,
        .benefit-card__icon--reciclavel,
        .benefit-card__icon--organico,
        .benefit-card__icon--perigoso,
        .benefit-card__icon--coleta {
          background: #f0f9ff; color: #0284c7; border-color: #bae6fd;
        }
        .benefit-card__cat--reuniao,
        .benefit-card__cat--carro,
        .benefit-card__cat--cracha,
        .benefit-card__cat--recebida,
        .benefit-card__cat--rotina,
        .benefit-card__cat--eletrica,
        .benefit-card__cat--impressao,
        .benefit-card__cat--vaga,
        .benefit-card__cat--almoco,
        .benefit-card__cat--ar,
        .benefit-card__cat--reciclavel { background: #dbeafe; color: #1e40af; }
        .benefit-card__cat--treinamento,
        .benefit-card__cat--van,
        .benefit-card__cat--visitante,
        .benefit-card__cat--enviada,
        .benefit-card__cat--profunda,
        .benefit-card__cat--hidraulica,
        .benefit-card__cat--digitalizacao,
        .benefit-card__cat--mensalista,
        .benefit-card__cat--cafe,
        .benefit-card__cat--ventilacao,
        .benefit-card__cat--organico { background: #e0f2fe; color: #0369a1; }
        .benefit-card__cat--auditorio,
        .benefit-card__cat--utilitario,
        .benefit-card__cat--terceiro,
        .benefit-card__cat--pendente,
        .benefit-card__cat--emergencial,
        .benefit-card__cat--civil,
        .benefit-card__cat--plotagem,
        .benefit-card__cat--moto,
        .benefit-card__cat--evento,
        .benefit-card__cat--temperatura,
        .benefit-card__cat--perigoso { background: #eff6ff; color: #2563eb; }
        .benefit-card__cat--hibrido,
        .benefit-card__cat--disponivel,
        .benefit-card__cat--retirada,
        .benefit-card__cat--preventiva,
        .benefit-card__cat--suprimento,
        .benefit-card__cat--copa,
        .benefit-card__cat--coleta { background: #f0f9ff; color: #0284c7; }
        .benefit-card__status--disponivel { background: #dcfce7; color: #15803d; }
        .benefit-card__status--sob_analise { background: #fef3c7; color: #b45309; }
        .filter-chip.is-active {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1e40af;
        }
        .topbar__dropdown-menu--services a.is-active {
          background: #dbeafe;
          color: #1e40af;
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
            <span>Facilities</span>
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
                <i class="fa-solid ${{catIcons[item.cat] || "fa-building"}}"></i>
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
              <span><i class="fa-solid fa-building" aria-hidden="true"></i> ${{item.provider}}</span>
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
    styles = facilities_styles()
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
