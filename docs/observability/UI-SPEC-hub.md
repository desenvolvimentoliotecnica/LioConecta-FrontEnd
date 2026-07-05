# UI Spec — Hub `/admin/observabilidade`

**Fase:** 2 — Design wireframe textual  
**Rota:** `/admin/observabilidade`  
**Config:** `/admin/observabilidade/configuracoes`  
**Acesso:** `canAccessAdminArea()` (Admin + AnalyticsViewer) — alinhado ao Audit Trail  
**Padrão visual:** reutilizar `analytics-kpi-grid`, `filter-chip`, `ContrachequeModal`, cards dashed border

---

## Layout hub principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Início / Observabilidade                                     │
│ Título: Observabilidade                                                  │
│ Sub: Logs, métricas, acessos e correlação com a Trilha de Auditoria      │
├─────────────────────────────────────────────────────────────────────────┤
│ [Visão consolidada · últimos 30 dias]                                    │
│ Chips: 24h | 7d | 30d | 90d | Tudo | Personalizado                      │
├─────────────────────────────────────────────────────────────────────────┤
│ KPI GRID (6 por linha) — 12 cards em 2 rows                              │
│ Row 1: Erros 24h | Taxa erro HTTP | P95 latência | RPM | DAU | Sessões  │
│ Row 2: Top módulo | Page views | Acessos negados | Auth falhas | ...     │
├─────────────────────────────────────────────────────────────────────────┤
│ Tabs: [ Erros ] [ Acessos ] [ Page views ] [ Investigar ] [ Links ]      │
├─────────────────────────────────────────────────────────────────────────┤
│ Tab content: tabela filtrada + paginação (padrão AuditTrailPage)         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tab: Erros

- Fonte: `observability_event` severity >= Error
- Colunas: Data, Severidade, event_name, Rota, Usuário, Correlation, Detalhes
- Filtros: severidade, event_name (dropdown), módulo

### Tab: Acessos

- Fonte: `access_event`
- Colunas: Data, event_name, Usuário, Recurso, Resultado, reason_code, Correlation
- Filtros: result (Success/Denied/Failed), event_type

### Tab: Page views

- Fonte: `page_view`
- Colunas: Data, page_name, route_template, module, duração, usuário
- Gráfico opcional: top 10 routes (bar chart Recharts — padrão Analytics)

### Tab: Investigar

- Input: Correlation ID (UUID)
- Resultado: **timeline vertical** unificada:
  1. Page views (FE)
  2. Access events
  3. Observability events
  4. Audit events (link "Abrir na Trilha" com filtro pré-aplicado)
  5. Trace link (Grafana/Tempo URL template se configurado)

### Tab: Links

- Card → Trilha de Auditoria (`/admin/trilha-auditoria`)
- Card → Analytics produto (`/analytics`)
- Card → Configurações backend (`/admin/configuracoes-backend` — seção observability)
- Card → Grafana (URL externa de `app_settings`)

---

## Página configurações `/admin/observabilidade/configuracoes`

Reutilizar layout `BackendConfigPage` — categoria **observability** em `AppSettingCatalog`:

| Campo UI | Tipo | Chave |
|----------|------|-------|
| Retenção observability (dias) | number | `observability.retention.observability_days` |
| Retenção page views (dias) | number | `observability.retention.page_view_days` |
| Retenção access events (dias) | number | `observability.retention.access_event_days` |
| Modo IP | select full/hash/both | `observability.privacy.ip_mode` |
| OTel habilitado | boolean | `observability.otel.enabled` |
| OTLP endpoint | string | `observability.otel.otlp_endpoint` |
| Page views habilitado | boolean | `observability.page_views.enabled` |
| Access audit habilitado | boolean | `observability.access_audit.enabled` |
| Sample ratio traces | number 0–1 | `observability.otel.trace_sample_ratio` |

Botão **Salvar** → `PUT /api/v1/admin/app-settings` (existente).

---

## Sidebar admin

Ícones existentes + novo item:

```
fa-chart-line  → /admin/observabilidade  (label: Observabilidade)
```

Posição: abaixo de Trilha de auditoria (`fa-clipboard-list`).

---

## Sitemap

Seção **Administração**:

- Observabilidade — `/admin/observabilidade`
- Configurações observabilidade — `/admin/observabilidade/configuracoes`

---

## Componentes novos (Fase 7)

```
ObservabilityHubPage.tsx
ObservabilitySettingsPage.tsx      (ou seção filtrada em BackendConfigPage)
ObservabilityInvestigatePanel.tsx
ObservabilityTimeline.tsx
useObservability*.ts hooks
observability-hub.css
```

---

## KPIs mínimos (MD § Dashboard)

| # | KPI | Fonte |
|---|-----|-------|
| 1 | Erros últimas 24h | COUNT observability severity>=4 |
| 2 | Erros por tipo | GROUP BY error_type |
| 3 | Erros por módulo | metadata module |
| 4 | Taxa erro HTTP | observability + audit HTTP |
| 5 | Requests/min | OTel metric ou aggregate |
| 6 | Endpoints mais lentos | P95 by route_template |
| 7 | P95 latência global | OTel histogram |
| 8 | Usuários ativos (DAU) | DISTINCT user_id page_view |
| 9 | Páginas mais acessadas | GROUP BY route_template |
| 10 | Funcionalidades mais usadas | Action.Performed count |
| 11 | Acessos negados | access_event Denied |
| 12 | Falhas autenticação | access_event LoginFailed |
