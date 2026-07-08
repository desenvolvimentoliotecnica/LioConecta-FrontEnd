/* eslint-disable no-unused-vars */
/** Fonte única de dados do roadmap LioConecta — Jul/2026 */
window.ROADMAP_DATA = {
  meta: {
    title: "Backlog Ágil LioConecta",
    date: "07/07/2026",
    version: "1.2",
    exportHint: "Após implementar, marque done: true nas tasks e atualize status da story em roadmap-data.js",
    sprintWeeks: 2,
  },

  phases: [
    { id: "F1", name: "Consolidar o que já funciona", sprints: "4–6", start: "2026-07", end: "2026-09" },
    { id: "F2", name: "RM transacional", sprints: "6–8", start: "2026-09", end: "2027-01" },
    { id: "F3", name: "Intranet e engajamento", sprints: "4–6", start: "2027-01", end: "2027-03" },
    { id: "F4", name: "Hub de aplicações + ERP", sprints: "3–4 + discovery", start: "2027-02", end: "2027-05" },
  ],

  releases: [
    {
      id: "R1",
      phase: "F1",
      name: "Self-service RH estável + Comunicados admin",
      demo: [
        "Login colaborador → Contracheque → baixar PDF holerite",
        "Férias → consultar saldo → abrir solicitação",
        "Ponto → espelho mensal + banco de horas",
        "Admin → criar comunicado oficial → publicar → listar",
        "Feed → registrar humor (Como me sinto)",
        "Aniversariantes → listar próximos 60 dias",
      ],
    },
    {
      id: "R2",
      phase: "F2",
      name: "Movimentações RM + Ajuste ponto + Vaga MVP",
      demo: [
        "Colaborador → solicitar ajuste de ponto → gestor aprova",
        "Gestor → abrir requisição de promoção → RH valida → status RM",
        "RH → requisição desligamento / transferência",
        "Gestor → abrir vaga → acompanhar pipeline até contratação",
      ],
    },
    {
      id: "R3",
      phase: "F3",
      name: "Feedback + Indicadores + Feed unificado",
      demo: [
        "Colaborador → enviar feedback",
        "RH → triagem de feedbacks",
        "Área Finanças → painel indicadores linkado",
        "Feed → notícias unificadas (sem cards estáticos)",
      ],
    },
    {
      id: "R4",
      phase: "F4",
      name: "Hub apps TI + Discovery ERP",
      demo: [
        "Colaborador → Hub por área → launch app autorizado",
        "Admin → cadastrar app no catálogo",
        "Apresentar documento discovery Datasul/TMS/Mercanet",
      ],
    },
  ],

  gestorChecklist: [
    { id: "G-RM-01", pillar: "RM", item: "Criar Requisição — Promoção", status: "new", spec: "03-specs-rm.html#spec-promocao", backlog: "02-backlog.html#US-RM-010" },
    { id: "G-RM-02", pillar: "RM", item: "Criar Requisição — Desligamento", status: "new", spec: "03-specs-rm.html#spec-desligamento", backlog: "02-backlog.html#US-RM-011" },
    { id: "G-RM-03", pillar: "RM", item: "Criar Requisição — Transferência", status: "new", spec: "03-specs-rm.html#spec-transferencia", backlog: "02-backlog.html#US-RM-012" },
    { id: "G-RM-04", pillar: "RM", item: "Acompanhar ciclo de vida da vaga até contratação", status: "new", spec: "03-specs-rm.html#spec-vaga", backlog: "02-backlog.html#US-RM-013" },
    { id: "G-RM-05", pillar: "RM", item: "Solicitação de férias", status: "integrated", spec: "03-specs-rm.html#spec-ferias", backlog: "02-backlog.html#US-RM-002" },
    { id: "G-RM-06", pillar: "RM", item: "Ajuste de Ponto", status: "new", spec: "03-specs-rm.html#spec-ajuste-ponto", backlog: "02-backlog.html#US-RM-004" },
    { id: "G-RM-07", pillar: "RM", item: "Visualização de Holerite", status: "integrated", spec: "03-specs-rm.html#spec-holerite", backlog: "02-backlog.html#US-RM-001" },
    { id: "G-RM-08", pillar: "RM", item: "Visualização de banco de Horas por colaborador", status: "partial", spec: "03-specs-rm.html#spec-banco-horas", backlog: "02-backlog.html#US-RM-005" },
    { id: "G-IN-01", pillar: "Intranet", item: "Painel de administração de comunicados", status: "partial", spec: "04-specs-intranet.html#spec-admin-comunicados", backlog: "02-backlog.html#US-INTRA-001" },
    { id: "G-IN-02", pillar: "Intranet", item: "Comunicação", status: "partial", spec: "04-specs-intranet.html#spec-comunicacao", backlog: "02-backlog.html#US-INTRA-002" },
    { id: "G-IN-03", pillar: "Intranet", item: "Aniversariantes", status: "partial", spec: "04-specs-intranet.html#spec-aniversariantes", backlog: "02-backlog.html#US-INTRA-003" },
    { id: "G-IN-04", pillar: "Intranet", item: "Feed de notícias", status: "partial", spec: "04-specs-intranet.html#spec-noticias", backlog: "02-backlog.html#US-INTRA-004" },
    { id: "G-IN-05", pillar: "Intranet", item: "Como me sinto", status: "partial", spec: "04-specs-intranet.html#spec-mood", backlog: "02-backlog.html#US-INTRA-005" },
    { id: "G-IN-06", pillar: "Intranet", item: "Envio de Feedback", status: "new", spec: "04-specs-intranet.html#spec-feedback", backlog: "02-backlog.html#US-INTRA-006" },
    { id: "G-IN-07", pillar: "Intranet", item: "Indicadores por área (Finanças, Operações, Comercial)", status: "prototype", spec: "04-specs-intranet.html#spec-indicadores", backlog: "02-backlog.html#US-INTRA-007" },
    { id: "G-AU-01", pillar: "Auth", item: "Hub com aplicações por área de negócio (apps TI)", status: "prototype", spec: "05-specs-auth-hub.html#spec-hub-apps", backlog: "02-backlog.html#US-AUTH-001" },
    { id: "G-AU-02", pillar: "Auth", item: "Datasul — avaliar com fornecedor", status: "blocked", spec: "05-specs-auth-hub.html#spec-datasul", backlog: "02-backlog.html#US-AUTH-003" },
    { id: "G-AU-03", pillar: "Auth", item: "TMS — avaliar com fornecedor", status: "blocked", spec: "05-specs-auth-hub.html#spec-tms", backlog: "02-backlog.html#US-AUTH-004" },
    { id: "G-AU-04", pillar: "Auth", item: "Mercanet — avaliar com fornecedor", status: "blocked", spec: "05-specs-auth-hub.html#spec-mercanet", backlog: "02-backlog.html#US-AUTH-005" },
  ],

  epics: [
    { id: "EPIC-RM", name: "Integração RM", color: "#2563eb" },
    { id: "EPIC-INTRA", name: "Portal Intranet", color: "#059669" },
    { id: "EPIC-AUTH", name: "Autenticação e Hub", color: "#7c3aed" },
  ],

  stories: [
    { id: "US-RM-001", epic: "EPIC-RM", feature: "Holerite", title: "Consultar holerite, PDF e histórico", phase: "F1", status: "integrated", priority: "Alta", route: "/servicos/contracheque", file: "src/components/contracheque/ContrachequePage.tsx" },
    { id: "US-RM-002", epic: "EPIC-RM", feature: "Férias", title: "Solicitar férias com write-back RM", phase: "F1", status: "integrated", priority: "Alta", route: "/servicos/ferias-ausencias", file: "src/components/ferias/FeriasAusenciasPage.tsx" },
    { id: "US-RM-003", epic: "EPIC-RM", feature: "Férias", title: "Acompanhar status da solicitação de férias", phase: "F1", status: "integrated", priority: "Média", route: "/servicos/ferias-ausencias", file: "src/components/ferias/FeriasAusenciasPage.tsx" },
    { id: "US-RM-004", epic: "EPIC-RM", feature: "Ajuste de Ponto", title: "Solicitar ajuste de ponto no espelho", phase: "F2", status: "new", priority: "Alta", route: "/servicos/ponto-eletronico", file: "— (novo módulo)" },
    { id: "US-RM-005", epic: "EPIC-RM", feature: "Banco de Horas", title: "Visualizar banco de horas por colaborador (gestor)", phase: "F1", status: "partial", priority: "Alta", route: "/servicos/ponto-eletronico", file: "src/components/ferias/LeaveBancoHorasModal.tsx" },
    { id: "US-RM-006", epic: "EPIC-RM", feature: "Ponto", title: "Consultar espelho de ponto mensal", phase: "F1", status: "integrated", priority: "Alta", route: "/servicos/ponto-eletronico", file: "src/components/ponto/PontoEletronicoPage.tsx" },
    { id: "US-RM-007", epic: "EPIC-RM", feature: "Ajuste de Ponto", title: "Gestor aprovar/rejeitar ajuste de ponto", phase: "F2", status: "new", priority: "Alta", route: "—", file: "— (novo módulo gestor)" },
    { id: "US-RM-008", epic: "EPIC-RM", feature: "Ajuste de Ponto", title: "RH validar e enviar ajuste ao RM", phase: "F2", status: "new", priority: "Alta", route: "—", file: "— (backoffice RH)" },
    { id: "US-RM-010", epic: "EPIC-RM", feature: "Movimentações", title: "Criar requisição de promoção", phase: "F2", status: "new", priority: "Alta", route: "/servicos/solicitacoes-rh", file: "src/generated/pages/servicos-rh/ (legacy mock)" },
    { id: "US-RM-011", epic: "EPIC-RM", feature: "Movimentações", title: "Criar requisição de desligamento", phase: "F2", status: "new", priority: "Alta", route: "/servicos/solicitacoes-rh", file: "— (novo)" },
    { id: "US-RM-012", epic: "EPIC-RM", feature: "Movimentações", title: "Criar requisição de transferência", phase: "F2", status: "new", priority: "Alta", route: "/servicos/solicitacoes-rh", file: "— (novo)" },
    { id: "US-RM-013", epic: "EPIC-RM", feature: "Ciclo de Vaga", title: "Abrir requisição de vaga e acompanhar pipeline", phase: "F2", status: "new", priority: "Alta", route: "—", file: "— (greenfield)" },
    { id: "US-RM-014", epic: "EPIC-RM", feature: "Ciclo de Vaga", title: "Registrar contratação e fechar vaga", phase: "F2", status: "new", priority: "Média", route: "—", file: "— (greenfield)" },
    { id: "US-INTRA-001", epic: "EPIC-INTRA", feature: "Admin Comunicados", title: "CRUD e publicação de comunicados", phase: "F1", status: "partial", priority: "Alta", route: "/comunicados/oficiais/novo", file: "src/components/comunicados/ComunicadoEditorPage.tsx" },
    { id: "US-INTRA-002", epic: "EPIC-INTRA", feature: "Comunicação", title: "Unificar canais de comunicação interna", phase: "F1", status: "partial", priority: "Média", route: "/comunicados", file: "src/components/comunicados/" },
    { id: "US-INTRA-003", epic: "EPIC-INTRA", feature: "Aniversariantes", title: "Listar aniversariantes e parabenizar", phase: "F1", status: "partial", priority: "Média", route: "/pessoas/aniversariantes", file: "src/generated/pages/pessoas-aniversariantes/" },
    { id: "US-INTRA-004", epic: "EPIC-INTRA", feature: "Feed Notícias", title: "Feed de notícias unificado (sem cards estáticos)", phase: "F3", status: "partial", priority: "Média", route: "/noticias", file: "src/components/pages/NoticiasHubPage.tsx" },
    { id: "US-INTRA-005", epic: "EPIC-INTRA", feature: "Como me sinto", title: "Registrar humor diário + dashboard RH", phase: "F1", status: "partial", priority: "Média", route: "/", file: "src/components/feed/MoodCheckCard.tsx" },
    { id: "US-INTRA-006", epic: "EPIC-INTRA", feature: "Feedback", title: "Enviar feedback e triagem RH/gestor", phase: "F3", status: "new", priority: "Média", route: "—", file: "— (greenfield)" },
    { id: "US-INTRA-007", epic: "EPIC-INTRA", feature: "Indicadores", title: "Painéis Finanças, Operações e Comercial", phase: "F3", status: "prototype", priority: "Média", route: "/analytics", file: "src/components/pages/AnalyticsPage.tsx" },
    { id: "US-AUTH-001", epic: "EPIC-AUTH", feature: "Hub Apps", title: "Catálogo de apps por área com launch URL", phase: "F4", status: "prototype", priority: "Alta", route: "/servicos/acesso-sistemas", file: "src/generated/pages/servicos-acesso-sistemas/" },
    { id: "US-AUTH-002", epic: "EPIC-AUTH", feature: "SSO", title: "Framework SSO reutilizável (SAML/OIDC/MSAL)", phase: "F4", status: "partial", priority: "Alta", route: "—", file: "src/auth/azureMsal.ts" },
    { id: "US-AUTH-003", epic: "EPIC-AUTH", feature: "Datasul", title: "Spike integração Datasul com fornecedor", phase: "F4", status: "blocked", priority: "Baixa", route: "—", file: "—" },
    { id: "US-AUTH-004", epic: "EPIC-AUTH", feature: "TMS", title: "Spike integração TMS com fornecedor", phase: "F4", status: "blocked", priority: "Baixa", route: "—", file: "—" },
    { id: "US-AUTH-005", epic: "EPIC-AUTH", feature: "Mercanet", title: "Spike integração Mercanet com fornecedor", phase: "F4", status: "blocked", priority: "Baixa", route: "—", file: "—" },
  ],

  /** specId = âncora da spec (ex.: spec-holerite) — tasks renderizadas em cada bloco de spec */
  tasks: [
    /* ── spec-holerite ── */
    { id: "TS-FE-RM-001a", specId: "spec-holerite", story: "US-RM-001", type: "FE", title: "Exibir metadados sync (syncedAt, dataSource) no header do holerite", phase: "F1", done: true },
    { id: "TS-FE-RM-001b", specId: "spec-holerite", story: "US-RM-001", type: "FE", title: "Regressão modal comparativo e histórico 12 meses", phase: "F1", done: true },
    { id: "TS-FE-RM-001c", specId: "spec-holerite", story: "US-RM-001", type: "FE", title: "Regressão download/print PDF holerite", phase: "F1", done: true },
    { id: "TS-FE-RM-001d", specId: "spec-holerite", story: "US-RM-001", type: "FE", title: "Regressão consultas FGTS, descontos, rubricas, informe IR", phase: "F1", done: true },
    { id: "TS-BE-RM-001a", specId: "spec-holerite", story: "US-RM-001", type: "BE", title: "Validar worker totvs-payslip-sync e período fechamento RM", phase: "F1", done: true },
    { id: "TS-BE-RM-001b", specId: "spec-holerite", story: "US-RM-001", type: "BE", title: "Garantir cache /rh/payslips consistente pós-sync", phase: "F1", done: true },
    { id: "TS-QA-RM-001a", specId: "spec-holerite", story: "US-RM-001", type: "QA", title: "Caso: PDF holerite bate com RM homolog", phase: "F1", done: true },
    { id: "TS-QA-RM-001b", specId: "spec-holerite", story: "US-RM-001", type: "QA", title: "Caso: informe IR abre e valores conferem", phase: "F1", done: true },

    /* ── spec-ferias ── */
    { id: "TS-FE-RM-002a", specId: "spec-ferias", story: "US-RM-002", type: "FE", title: "Formulário solicitação — validação saldo e datas", phase: "F1", done: true },
    { id: "TS-FE-RM-002b", specId: "spec-ferias", story: "US-RM-002", type: "FE", title: "Hook useLeave — mutation POST requests + invalidate cache", phase: "F1", done: true },
    { id: "TS-FE-RM-003a", specId: "spec-ferias", story: "US-RM-003", type: "FE", title: "Lista histórico solicitações com badge status", phase: "F1", done: true },
    { id: "TS-FE-RM-003b", specId: "spec-ferias", story: "US-RM-003", type: "FE", title: "Detalhe solicitação — timeline aprovação", phase: "F1", done: true },
    { id: "TS-BE-RM-002a", specId: "spec-ferias", story: "US-RM-002", type: "BE", title: "POST /rh/leave/requests — persist + fila write-back RM", phase: "F1", done: true },
    { id: "TS-BE-RM-002b", specId: "spec-ferias", story: "US-RM-002", type: "BE", title: "Integração RM Labore — registrar período férias", phase: "F1", done: true },
    { id: "TS-BE-RM-003a", specId: "spec-ferias", story: "US-RM-003", type: "BE", title: "GET /rh/leave/requests — status sync RM", phase: "F1", done: true },
    { id: "TS-QA-RM-002a", specId: "spec-ferias", story: "US-RM-002", type: "QA", title: "UAT: solicitação férias reflete no RM em 24h", phase: "F1", done: true },
    { id: "TS-QA-RM-002b", specId: "spec-ferias", story: "US-RM-002", type: "QA", title: "Caso: saldo zero bloqueia envio", phase: "F1", done: true },
    { id: "TS-BE-RM-002c", specId: "spec-ferias", story: "US-RM-002", type: "BE", title: "Notify portal + e-mail SMTP com override dest. no CreateRequest", phase: "F1", done: true },
    { id: "TS-BE-RM-003b", specId: "spec-ferias", story: "US-RM-003", type: "BE", title: "GET /rh/leave/management[+/{id}/pdf] — RBAC gestor/RH + QuestPDF", phase: "F1", done: true },
    { id: "TS-FE-RM-003c", specId: "spec-ferias", story: "US-RM-003", type: "FE", title: "Rota /servicos/ferias-ausencias/gestao — lista, detalhe, deep-link", phase: "F1", done: true },
    { id: "TS-FE-RM-003d", specId: "spec-ferias", story: "US-RM-003", type: "FE", title: "Imprimir/baixar comprovante PDF + help leave.email.dev_override", phase: "F1", done: true },
    { id: "TS-QA-RM-003a", specId: "spec-ferias", story: "US-RM-003", type: "QA", title: "UAT: e-mail só no override; notificação gestor; PDF ok", phase: "F1", done: true },

    /* ── spec-ajuste-ponto ── */
    { id: "TS-FE-RM-004a", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "FE", title: "Botão 'Solicitar ajuste' no espelho de ponto (dia selecionado)", phase: "F2" },
    { id: "TS-FE-RM-004b", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "FE", title: "Modal formulário — motivo, horário correto, anexo opcional", phase: "F2" },
    { id: "TS-FE-RM-007a", specId: "spec-ajuste-ponto", story: "US-RM-007", type: "FE", title: "Fila gestor — listar ajustes pendentes da equipe", phase: "F2" },
    { id: "TS-FE-RM-007b", specId: "spec-ajuste-ponto", story: "US-RM-007", type: "FE", title: "Ações aprovar/rejeitar com comentário", phase: "F2" },
    { id: "TS-FE-RM-008a", specId: "spec-ajuste-ponto", story: "US-RM-008", type: "FE", title: "Backoffice RH — validar e encaminhar ao RM", phase: "F2" },
    { id: "TS-BE-RM-004a", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "BE", title: "POST /rh/ponto/adjustments — criar solicitação", phase: "F2" },
    { id: "TS-BE-RM-004b", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "BE", title: "Workflow estados: pendente→aprovado_gestor→validado_rh→enviado_rm", phase: "F2" },
    { id: "TS-BE-RM-008a", specId: "spec-ajuste-ponto", story: "US-RM-008", type: "BE", title: "Integração RM — tabelas batida/justificativa (ABATFUN)", phase: "F2" },
    { id: "TS-BE-RM-008b", specId: "spec-ajuste-ponto", story: "US-RM-008", type: "BE", title: "Notificação colaborador/gestor em mudança status", phase: "F2" },
    { id: "TS-QA-RM-004a", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "QA", title: "E2E: colaborador→gestor→RH→RM homolog", phase: "F2" },

    /* ── spec-banco-horas ── */
    { id: "TS-FE-RM-005a", specId: "spec-banco-horas", story: "US-RM-005", type: "FE", title: "Expandir LeaveBancoHorasModal — extrato crédito/débito", phase: "F1" },
    { id: "TS-FE-RM-005b", specId: "spec-banco-horas", story: "US-RM-005", type: "FE", title: "Nova rota/view gestor — banco horas por colaborador", phase: "F1" },
    { id: "TS-FE-RM-005c", specId: "spec-banco-horas", story: "US-RM-005", type: "FE", title: "Filtro equipe + export CSV (gestor)", phase: "F1" },
    { id: "TS-BE-RM-005a", specId: "spec-banco-horas", story: "US-RM-005", type: "BE", title: "GET /rh/ponto/banco-horas — scope colaborador", phase: "F1" },
    { id: "TS-BE-RM-005b", specId: "spec-banco-horas", story: "US-RM-005", type: "BE", title: "GET /rh/ponto/banco-horas/team — scope gestor (subordinados)", phase: "F1" },
    { id: "TS-BE-RM-005c", specId: "spec-banco-horas", story: "US-RM-005", type: "BE", title: "GET /rh/ponto/banco-horas/extrato?from=&to=", phase: "F1" },
    { id: "TS-QA-RM-005a", specId: "spec-banco-horas", story: "US-RM-005", type: "QA", title: "Caso: saldo gestor bate RM para equipe", phase: "F1" },

    /* ── spec-promocao ── */
    { id: "TS-FE-RM-010a", specId: "spec-promocao", story: "US-RM-010", type: "FE", title: "Nova página React SolicitacoesRhPage — substituir legacy", phase: "F2" },
    { id: "TS-FE-RM-010b", specId: "spec-promocao", story: "US-RM-010", type: "FE", title: "Formulário promoção — campos cargo, salário, CC, anexos", phase: "F2" },
    { id: "TS-FE-RM-010c", specId: "spec-promocao", story: "US-RM-010", type: "FE", title: "Lista minhas requisições + detalhe status", phase: "F2" },
    { id: "TS-BE-RM-010a", specId: "spec-promocao", story: "US-RM-010", type: "BE", title: "POST /rh/requests/movimentacao { tipo: promocao }", phase: "F2" },
    { id: "TS-BE-RM-010b", specId: "spec-promocao", story: "US-RM-010", type: "BE", title: "Workflow aprovação gestor → RH → diretoria (configurável)", phase: "F2" },
    { id: "TS-BE-RM-010c", specId: "spec-promocao", story: "US-RM-010", type: "BE", title: "Write-back RM Vitae — movimentação promoção", phase: "F2" },
    { id: "TS-QA-RM-010a", specId: "spec-promocao", story: "US-RM-010", type: "QA", title: "UAT RH: promoção end-to-end homolog", phase: "F2" },

    /* ── spec-desligamento ── */
    { id: "TS-FE-RM-011a", specId: "spec-desligamento", story: "US-RM-011", type: "FE", title: "Formulário desligamento — tipo, datas, motivo RM", phase: "F2" },
    { id: "TS-FE-RM-011b", specId: "spec-desligamento", story: "US-RM-011", type: "FE", title: "Checklist RH visual (documentos, equipamentos)", phase: "F2" },
    { id: "TS-BE-RM-011a", specId: "spec-desligamento", story: "US-RM-011", type: "BE", title: "POST /rh/requests/movimentacao { tipo: desligamento }", phase: "F2" },
    { id: "TS-BE-RM-011b", specId: "spec-desligamento", story: "US-RM-011", type: "BE", title: "Integração RM Vitae — desligamento + audit trail", phase: "F2" },
    { id: "TS-BE-RM-011c", specId: "spec-desligamento", story: "US-RM-011", type: "BE", title: "RBAC: só gestor/RH iniciam desligamento", phase: "F2" },
    { id: "TS-QA-RM-011a", specId: "spec-desligamento", story: "US-RM-011", type: "QA", title: "Caso: colaborador comum não acessa formulário", phase: "F2" },

    /* ── spec-transferencia ── */
    { id: "TS-FE-RM-012a", specId: "spec-transferencia", story: "US-RM-012", type: "FE", title: "Formulário transferência — origem/destino dept, CC, filial", phase: "F2" },
    { id: "TS-FE-RM-012b", specId: "spec-transferencia", story: "US-RM-012", type: "FE", title: "Autocomplete colaborador + preview dados atuais RM", phase: "F2" },
    { id: "TS-BE-RM-012a", specId: "spec-transferencia", story: "US-RM-012", type: "BE", title: "POST /rh/requests/movimentacao { tipo: transferencia }", phase: "F2" },
    { id: "TS-BE-RM-012b", specId: "spec-transferencia", story: "US-RM-012", type: "BE", title: "Integração RM — alteração CC/departamento/filial", phase: "F2" },
    { id: "TS-QA-RM-012a", specId: "spec-transferencia", story: "US-RM-012", type: "QA", title: "UAT: transferência reflete organograma após sync", phase: "F2" },

    /* ── spec-vaga ── */
    { id: "TS-FE-RM-013a", specId: "spec-vaga", story: "US-RM-013", type: "FE", title: "Página /servicos/vagas — listagem + filtros status", phase: "F2" },
    { id: "TS-FE-RM-013b", specId: "spec-vaga", story: "US-RM-013", type: "FE", title: "Formulário abrir vaga — cargo, dept, requisitos", phase: "F2" },
    { id: "TS-FE-RM-013c", specId: "spec-vaga", story: "US-RM-013", type: "FE", title: "Pipeline kanban — drag status candidatos", phase: "F2" },
    { id: "TS-FE-RM-014a", specId: "spec-vaga", story: "US-RM-014", type: "FE", title: "Ação contratar — fecha vaga + registro contratação", phase: "F2" },
    { id: "TS-BE-RM-013a", specId: "spec-vaga", story: "US-RM-013", type: "BE", title: "CRUD /rh/vagas + estados lifecycle", phase: "F2" },
    { id: "TS-BE-RM-013b", specId: "spec-vaga", story: "US-RM-013", type: "BE", title: "POST /rh/vagas/{id}/candidatos + PATCH status", phase: "F2" },
    { id: "TS-BE-RM-014a", specId: "spec-vaga", story: "US-RM-014", type: "BE", title: "PATCH /rh/vagas/{id}/contratar — integração RM Vitae", phase: "F2" },
    { id: "TS-QA-RM-013a", specId: "spec-vaga", story: "US-RM-013", type: "QA", title: "E2E: vaga aberta → contratada", phase: "F2" },

    /* ── spec-admin-comunicados ── */
    { id: "TS-FE-IN-001a", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "FE", title: "Completar ComunicadoEditorPage — preview antes publicar", phase: "F1" },
    { id: "TS-FE-IN-001b", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "FE", title: "Implementar filtros e busca em ComunicadosList", phase: "F1" },
    { id: "TS-FE-IN-001c", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "FE", title: "Painel admin — métricas leitura (% lidos, visualizações)", phase: "F1" },
    { id: "TS-BE-IN-001a", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "BE", title: "PATCH /comunicados/{id} — rascunho/publicado/arquivado", phase: "F1" },
    { id: "TS-BE-IN-001b", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "BE", title: "GET /comunicados/{id}/metrics", phase: "F1" },
    { id: "TS-QA-IN-001a", specId: "spec-admin-comunicados", story: "US-INTRA-001", type: "QA", title: "Caso: publicar → aparece listagem em 1 min", phase: "F1" },

    /* ── spec-comunicacao ── */
    { id: "TS-FE-IN-002a", specId: "spec-comunicacao", story: "US-INTRA-002", type: "FE", title: "Remover cards estáticos demo do feed (enquetes/notícias mock)", phase: "F1" },
    { id: "TS-FE-IN-002b", specId: "spec-comunicacao", story: "US-INTRA-002", type: "FE", title: "Banner comunicado oficial no feed — link leitor", phase: "F1" },
    { id: "TS-FE-IN-002c", specId: "spec-comunicacao", story: "US-INTRA-002", type: "FE", title: "Unificar ComunicadosHubPage com dados API live", phase: "F1" },
    { id: "TS-BE-IN-002a", specId: "spec-comunicacao", story: "US-INTRA-002", type: "BE", title: "GET /comunicados/hub — agregado canais + contadores", phase: "F1" },
    { id: "TS-QA-IN-002a", specId: "spec-comunicacao", story: "US-INTRA-002", type: "QA", title: "Regressão feed API posts + comunicados integrados", phase: "F1" },

    /* ── spec-aniversariantes ── */
    { id: "TS-FE-IN-003a", specId: "spec-aniversariantes", story: "US-INTRA-003", type: "FE", title: "Migrar página aniversariantes legacy → React", phase: "F1" },
    { id: "TS-FE-IN-003b", specId: "spec-aniversariantes", story: "US-INTRA-003", type: "FE", title: "Botão parabenizar → composer feed pré-preenchido", phase: "F1" },
    { id: "TS-FE-IN-003c", specId: "spec-aniversariantes", story: "US-INTRA-003", type: "FE", title: "Integrar useBirthdays no calendário e hub parabenizações", phase: "F1" },
    { id: "TS-BE-IN-003a", specId: "spec-aniversariantes", story: "US-INTRA-003", type: "BE", title: "Sync /people/birthdays — RM primário, Graph fallback", phase: "F1" },
    { id: "TS-QA-IN-003a", specId: "spec-aniversariantes", story: "US-INTRA-003", type: "QA", title: "Caso: lista bate RM/AD; parabenizar cria post", phase: "F1" },

    /* ── spec-noticias ── */
    { id: "TS-FE-IN-004a", specId: "spec-noticias", story: "US-INTRA-004", type: "FE", title: "NoticiasHubPage — dados API em vez de links estáticos", phase: "F3" },
    { id: "TS-FE-IN-004b", specId: "spec-noticias", story: "US-INTRA-004", type: "FE", title: "Feed — render posts kind=news acima do composer", phase: "F3" },
    { id: "TS-BE-IN-004a", specId: "spec-noticias", story: "US-INTRA-004", type: "BE", title: "Estender feed API — filtro kind=news ou endpoint /noticias", phase: "F3" },
    { id: "TS-BE-IN-004b", specId: "spec-noticias", story: "US-INTRA-004", type: "BE", title: "Admin CRUD notícias (ou reutilizar comunicados dept)", phase: "F3" },
    { id: "TS-QA-IN-004a", specId: "spec-noticias", story: "US-INTRA-004", type: "QA", title: "Caso: notícia publicada aparece feed + hub", phase: "F3" },

    /* ── spec-mood ── */
    { id: "TS-FE-IN-005a", specId: "spec-mood", story: "US-INTRA-005", type: "FE", title: "MoodCheckCard — persistência e feedback pós-envio", phase: "F1" },
    { id: "TS-FE-IN-005b", specId: "spec-mood", story: "US-INTRA-005", type: "FE", title: "Página admin /admin/mood-analytics — gráficos agregados", phase: "F1" },
    { id: "TS-BE-IN-005a", specId: "spec-mood", story: "US-INTRA-005", type: "BE", title: "GET /mood/analytics?period= — agregado anonimizado", phase: "F1" },
    { id: "TS-BE-IN-005b", specId: "spec-mood", story: "US-INTRA-005", type: "BE", title: "RBAC: só RH/Admin vê analytics", phase: "F1" },
    { id: "TS-QA-IN-005a", specId: "spec-mood", story: "US-INTRA-005", type: "QA", title: "Caso: 1 registro/dia; analytics não expõe identidade", phase: "F1" },

    /* ── spec-feedback ── */
    { id: "TS-FE-IN-006a", specId: "spec-feedback", story: "US-INTRA-006", type: "FE", title: "Nova rota /feedback — formulário categoria + texto", phase: "F3" },
    { id: "TS-FE-IN-006b", specId: "spec-feedback", story: "US-INTRA-006", type: "FE", title: "Toggle anônimo + confirmação envio", phase: "F3" },
    { id: "TS-FE-IN-006c", specId: "spec-feedback", story: "US-INTRA-006", type: "FE", title: "Fila triagem RH — listar, responder, encerrar", phase: "F3" },
    { id: "TS-BE-IN-006a", specId: "spec-feedback", story: "US-INTRA-006", type: "BE", title: "POST /feedback — criar com flag anonymous", phase: "F3" },
    { id: "TS-BE-IN-006b", specId: "spec-feedback", story: "US-INTRA-006", type: "BE", title: "GET/PATCH /feedback — workflow triagem", phase: "F3" },
    { id: "TS-QA-IN-006a", specId: "spec-feedback", story: "US-INTRA-006", type: "QA", title: "E2E: enviar feedback anônimo → triagem RH", phase: "F3" },

    /* ── spec-indicadores ── */
    { id: "TS-FE-IN-007a", specId: "spec-indicadores", story: "US-INTRA-007", type: "FE", title: "Hub /areas/financeiro — tiles apps/dashboards", phase: "F3" },
    { id: "TS-FE-IN-007b", specId: "spec-indicadores", story: "US-INTRA-007", type: "FE", title: "Hub /areas/operacoes e /areas/comercial", phase: "F3" },
    { id: "TS-FE-IN-007c", specId: "spec-indicadores", story: "US-INTRA-007", type: "FE", title: "Linkar Loop/Pulse/Analytics existentes onde aplicável", phase: "F3" },
    { id: "TS-BE-IN-007a", specId: "spec-indicadores", story: "US-INTRA-007", type: "BE", title: "GET /areas/{slug}/indicators — catálogo links por área", phase: "F3" },
    { id: "TS-QA-IN-007a", specId: "spec-indicadores", story: "US-INTRA-007", type: "QA", title: "Caso: usuário sem role área não vê hub", phase: "F3" },

    /* ── spec-hub-apps ── */
    { id: "TS-FE-AU-001a", specId: "spec-hub-apps", story: "US-AUTH-001", type: "FE", title: "AppsHubPage React — substituir servicos-acesso-sistemas legacy", phase: "F4" },
    { id: "TS-FE-AU-001b", specId: "spec-hub-apps", story: "US-AUTH-001", type: "FE", title: "Grid apps por área — ícone, descrição, botão Acessar", phase: "F4" },
    { id: "TS-FE-AU-001c", specId: "spec-hub-apps", story: "US-AUTH-001", type: "FE", title: "Launch URL — nova aba ou SSO popup conforme ssoType", phase: "F4" },
    { id: "TS-BE-AU-001a", specId: "spec-hub-apps", story: "US-AUTH-001", type: "BE", title: "GET /apps/catalog?area= — CRUD admin apps", phase: "F4" },
    { id: "TS-BE-AU-001b", specId: "spec-hub-apps", story: "US-AUTH-001", type: "BE", title: "RBAC launch + audit log acesso app", phase: "F4" },
    { id: "TS-QA-AU-001a", specId: "spec-hub-apps", story: "US-AUTH-001", type: "QA", title: "Segurança: app oculto para role não autorizado", phase: "F4" },

    /* ── spec-sso ── */
    { id: "TS-FE-AU-002a", specId: "spec-sso", story: "US-AUTH-002", type: "FE", title: "Componente AppLaunchGate — reutilizar padrão MSAL link", phase: "F4" },
    { id: "TS-FE-AU-002b", specId: "spec-sso", story: "US-AUTH-002", type: "FE", title: "UI link-account genérico para apps Azure", phase: "F4" },
    { id: "TS-BE-AU-002a", specId: "spec-sso", story: "US-AUTH-002", type: "BE", title: "Token broker SAML/OIDC — config por app", phase: "F4" },
    { id: "TS-BE-AU-002b", specId: "spec-sso", story: "US-AUTH-002", type: "BE", title: "POST /apps/{id}/link-account — armazenar tokens", phase: "F4" },
    { id: "TS-DOC-AU-002a", specId: "spec-sso", story: "US-AUTH-002", type: "DOC", title: "ADR padrão SSO — MSAL vs SAML vs deeplink", phase: "F4" },

    /* ── spec-datasul ── */
    { id: "TS-DOC-AU-003a", specId: "spec-datasul", story: "US-AUTH-003", type: "DOC", title: "Questionário discovery Datasul — enviar fornecedor", phase: "F4" },
    { id: "TS-DOC-AU-003b", specId: "spec-datasul", story: "US-AUTH-003", type: "DOC", title: "Matriz opções integração (API, SSO, embed, deeplink)", phase: "F4" },
    { id: "TS-DOC-AU-003c", specId: "spec-datasul", story: "US-AUTH-003", type: "DOC", title: "Estimativa esforço e dependências infra", phase: "F4" },

    /* ── spec-tms ── */
    { id: "TS-DOC-AU-004a", specId: "spec-tms", story: "US-AUTH-004", type: "DOC", title: "Questionário discovery TMS — enviar fornecedor", phase: "F4" },
    { id: "TS-DOC-AU-004b", specId: "spec-tms", story: "US-AUTH-004", type: "DOC", title: "Documentar modelo auth e URLs launch", phase: "F4" },

    /* ── spec-mercanet ── */
    { id: "TS-DOC-AU-005a", specId: "spec-mercanet", story: "US-AUTH-005", type: "DOC", title: "Questionário discovery Mercanet — enviar fornecedor", phase: "F4" },
    { id: "TS-DOC-AU-005b", specId: "spec-mercanet", story: "US-AUTH-005", type: "DOC", title: "Mapear perfis Comercial e requisitos SSO", phase: "F4" },
  ],

  qaCases: [
    { id: "QA-RM-001", story: "US-RM-001", type: "Regressão", title: "Holerite PDF abre e bate com RM", phase: "F1" },
    { id: "QA-RM-002", story: "US-RM-002", type: "Integração RM", title: "Solicitação férias reflete no RM homolog", phase: "F1" },
    { id: "QA-RM-004", story: "US-RM-004", type: "E2E", title: "Fluxo ajuste ponto colaborador→gestor→RH", phase: "F2" },
    { id: "QA-RM-010", story: "US-RM-010", type: "UAT", title: "RH valida promoção end-to-end", phase: "F2" },
    { id: "QA-RM-013", story: "US-RM-013", type: "E2E", title: "Pipeline vaga aberta→contratada", phase: "F2" },
    { id: "QA-IN-001", story: "US-INTRA-001", type: "Regressão", title: "Publicar comunicado aparece na listagem", phase: "F1" },
    { id: "QA-IN-003", story: "US-INTRA-003", type: "Integração", title: "Aniversariantes bate com RM/AD", phase: "F1" },
    { id: "QA-IN-006", story: "US-INTRA-006", type: "E2E", title: "Feedback enviado e triado", phase: "F3" },
    { id: "QA-AU-001", story: "US-AUTH-001", type: "Segurança", title: "App bloqueado para role não autorizado", phase: "F4" },
  ],

  risks: [
    { id: "R1", title: "Write-back RM", impact: "Alto", mitigation: "Homologação Corpore dedicada; workers idempotentes" },
    { id: "R2", title: "Fornecedor ERP (Datasul/TMS/Mercanet)", impact: "Alto", mitigation: "Spikes F4; não bloquear F1–F3" },
    { id: "R3", title: "Sync aniversariantes RM+Graph", impact: "Médio", mitigation: "Fallback Graph; alerta se RM offline" },
    { id: "R4", title: "Legacy solicitações RH", impact: "Médio", mitigation: "Migrar para React na F2" },
    { id: "R5", title: "Permissões gestor/RH", impact: "Alto", mitigation: "RBAC centralizado; testes por papel" },
  ],

  maturityMatrix: [
    { route: "/servicos/contracheque", label: "Contracheque (Holerite)", maturity: "integrated", file: "ContrachequePage.tsx", api: "/rh/payslips/*", gestor: "G-RM-07", gap: "—" },
    { route: "/servicos/ferias-ausencias", label: "Férias e ausências", maturity: "integrated", file: "FeriasAusenciasPage.tsx", api: "/rh/leave/*", gestor: "G-RM-05", gap: "—" },
    { route: "/servicos/ferias-ausencias/gestao", label: "Gestão de férias", maturity: "integrated", file: "FeriasGestaoPage.tsx", api: "/rh/leave/management", gestor: "G-RM-05", gap: "Aprovação no Labore" },
    { route: "/servicos/ponto-eletronico", label: "Ponto eletrônico", maturity: "integrated", file: "PontoEletronicoPage.tsx", api: "/rh/ponto/*", gestor: "G-RM-06", gap: "Ajuste ponto (write) ausente" },
    { route: "/servicos/solicitacoes-rh", label: "Solicitações RH", maturity: "prototype", file: "servicos-rh/ (legacy)", api: "—", gestor: "G-RM-01..03", gap: "Greenfield React+API" },
    { route: "—", label: "Ciclo de vaga", maturity: "soon", file: "—", api: "—", gestor: "G-RM-04", gap: "Módulo inexistente" },
    { route: "/comunicados/oficiais/novo", label: "Editor comunicados", maturity: "prototype", file: "ComunicadoEditorPage.tsx", api: "POST /comunicados", gestor: "G-IN-01", gap: "Admin panel incompleto" },
    { route: "/comunicados", label: "Comunicados (listas)", maturity: "integrated", file: "ComunicadosKindPage.tsx", api: "GET /comunicados", gestor: "G-IN-02", gap: "Filtros/busca UI-only" },
    { route: "/", label: "Feed", maturity: "partial", file: "FeedComposer + legacy cards", api: "GET/POST /feed", gestor: "G-IN-02", gap: "Cards estáticos misturados" },
    { route: "/pessoas/aniversariantes", label: "Aniversariantes", maturity: "partial", file: "pessoas-aniversariantes/", api: "/people/birthdays", gestor: "G-IN-03", gap: "Parabenizar não wired" },
    { route: "/noticias", label: "Hub notícias", maturity: "prototype", file: "NoticiasHubPage.tsx", api: "—", gestor: "G-IN-04", gap: "Sem CMS/API" },
    { route: "/", label: "Como me sinto", maturity: "partial", file: "MoodCheckCard.tsx", api: "/mood", gestor: "G-IN-05", gap: "Dashboard RH ausente" },
    { route: "—", label: "Feedback", maturity: "soon", file: "—", api: "—", gestor: "G-IN-06", gap: "Greenfield" },
    { route: "/analytics", label: "Analytics portal", maturity: "prototype", file: "AnalyticsPage.tsx", api: "/analytics/snapshot", gestor: "G-IN-07", gap: "Indicadores área mock" },
    { route: "/servicos/acesso-sistemas", label: "Acesso a sistemas", maturity: "prototype", file: "servicos-acesso-sistemas/", api: "—", gestor: "G-AU-01", gap: "Links href=# mock" },
    { route: "—", label: "Datasul / TMS / Mercanet", maturity: "soon", file: "—", api: "—", gestor: "G-AU-02..04", gap: "Bloqueado fornecedor" },
  ],

  outOfScope: [
    "eSocial e obrigações fiscais",
    "Medicina ocupacional / SST",
    "Parametrização folha RM",
    "Backoffice completo de folha",
    "Admissão digital end-to-end (além MVP vaga)",
  ],

  pages: [
    { href: "index.html", label: "Hub", icon: "🏠", desc: "Visão geral e checklist gestor" },
    { href: "01-executivo.html", label: "Executivo", icon: "📊", desc: "Resumo para gestor" },
    { href: "02-backlog.html", label: "Backlog", icon: "📋", desc: "Histórias e tasks" },
    { href: "03-specs-rm.html", label: "Specs RM", icon: "👥", desc: "Integração RM" },
    { href: "04-specs-intranet.html", label: "Specs Intranet", icon: "💬", desc: "Portal intranet" },
    { href: "05-specs-auth-hub.html", label: "Specs Auth", icon: "🔐", desc: "Hub e SSO" },
    { href: "06-qa.html", label: "QA", icon: "✅", desc: "Plano de testes" },
    { href: "07-releases.html", label: "Releases", icon: "🚀", desc: "Marcos R1–R4" },
    { href: "08-matriz-maturidade.html", label: "Maturidade", icon: "🗺️", desc: "Código vs meta" },
  ],
};
