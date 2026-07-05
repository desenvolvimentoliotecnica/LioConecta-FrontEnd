# Plano de Observabilidade — LioConecta

> Baseado em `prompt_plano_logs_auditoria_metricas_react_dotnet_postgresql.md`  
> Branch de referência: `feature/audit-middleware-pipeline`  
> Data: 2026-07-05

## 1. Diagnóstico da arquitetura atual

### Backend (.NET 8 + PostgreSQL)

| Mecanismo | Estado | Onde |
|-----------|--------|------|
| Serilog estruturado | ✅ Console + LogContext | `Program.cs`, `AuditLoggingMiddleware` |
| Request logging global | ⚠️ Parcial | `UseSerilogRequestLogging()` sem correlation |
| Pipeline Audit (HTTP + EF) | ✅ MVP entregue | `AuditMiddleware` → `AuditTrailMiddleware` |
| Correlation ID | ✅ `X-Correlation-Id` | Request/response + `audit_events` |
| Transaction ID | ✅ `X-Audit-Transaction-Id` | Response header |
| Redaction | ✅ `AuditRedactor` | Bodies JSON sensíveis |
| Tratamento global exceções | ⚠️ Parcial | `GlobalExceptionHandler` → ProblemDetails **sem** correlationId |
| Auth audit | ❌ | DevAuth / Azure AD sem eventos |
| Access audit (GET/leitura) | ❌ | Só POST/PUT/PATCH/DELETE em `/api/*` |
| Métricas runtime (RED/OTel) | ❌ | Sem Prometheus/OpenTelemetry |
| Health checks | ✅ | `/health`, `/health/ready` (Postgres + Redis) |
| Product analytics | ✅ Separado | `analytics_events` + `/api/v1/analytics/*` |
| Admin consulta audit | ✅ | `/api/v1/admin/audit-events/*` |
| Testes integração audit | ✅ | `AuditEndpointTests` |

### Frontend (React 19 + Vite)

| Mecanismo | Estado | Onde |
|-----------|--------|------|
| Correlation ID outbound | ⚠️ Por request | `src/api/client.ts` (UUID novo a cada call) |
| Error Boundary | ❌ | — |
| Handlers globais JS | ❌ | — |
| Page view tracking | ❌ | — |
| API central telemetry | ❌ | — |
| Batching / sendBeacon | ❌ | — |
| Dashboard analytics (produto) | ✅ | `/analytics` |
| Dashboard audit trail | ✅ | `/admin/trilha-auditoria` |

### Princípio confirmado

**Audit Trail transacional (before/after, EntityChange, mutações HTTP)** → **reutilizar** pipeline existente.  
**Observabilidade operacional** (logs, auth, page views, métricas técnicas) → **camada nova**, correlacionada via `CorrelationId` / `TraceId` / `SessionId`.

---

## 2. Gap Analysis

| Área | Existe | Estado | Ação proposta |
|------|:------:|--------|---------------|
| Audit Trail transacional | Sim | MVP em produção dev | **Reutilizar** — não duplicar |
| Correlation ID backend | Sim | Header + DB | **Estender** — ProblemDetails, Serilog global, session scope FE |
| Request logging estruturado | Parcial | Serilog genérico + audit mutações | **Evoluir** — middleware/enricher unificado |
| Exception handling | Parcial | ProblemDetails sem correlation | **Evoluir** `GlobalExceptionHandler` |
| Application logging | Parcial | Console only | **Fase 3+** — sink JSON/arquivo opcional |
| Auth audit | Não | — | **Novo** — `access_event` ou `observability_event` |
| Authorization denied | Não | — | **Novo** — handler/filter + persistência seletiva |
| Access audit (leitura) | Não | — | **Novo** — allowlist de rotas sensíveis |
| Page views (FE) | Não | — | **Novo** — router hook + batch API |
| Usage analytics (FE) | Parcial | Só backend domain events | **Estender** catálogo + FE `trackAction` |
| Métricas técnicas HTTP | Não | Summary query-time only | **Novo** — agregações + opcional OTel |
| Métricas funcionais | Parcial | `analytics_events` | **Reutilizar** onde couber; não misturar ops |
| Dashboard ops | Parcial | Audit Trail + Analytics | **Novo módulo** ou estender admin |
| OpenTelemetry | Não | — | **Fase 4** (opcional) |
| Retenção / LGPD | Não formal | Redactor básico | **Novo** — política + job cleanup |
| Testes observabilidade | Parcial | Audit happy path | **Expandir** cenários do MD |

---

## 3. Arquitetura proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  AppShell route listener ──► TelemetryClient (queue + batch)    │
│  ErrorBoundary + window handlers ──► POST /api/v1/telemetry/*   │
│  api/client.ts ──► SessionCorrelationId + X-Correlation-Id       │
└────────────────────────────┬────────────────────────────────────┘
                             │ X-Correlation-Id, X-Session-Id
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (ASP.NET Core)                       │
│  CorrelationMiddleware (evoluir AuditMiddleware ou wrapper)      │
│  RequestLoggingEnricher ◄── Activity/TraceId (OTel fase 4)       │
│  GlobalExceptionHandler + correlationId em ProblemDetails        │
│  AuthAuditHandler (login/logout/fail)                            │
│  AuthorizationAuditFilter (403/401 seletivo)                     │
│  AccessAuditMiddleware (GET allowlist — rotas sensíveis)         │
│  Audit Pipeline existente (mutações + EntityChange) ──► audit_events │
│  TelemetryIngestionService ──► observability_event / page_view   │
│  ObservabilityQueryService ──► GET /admin/observability/*        │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   audit_events      observability_event    analytics_events
   (transacional)    (ops/segurança/naveg.)  (produto/engajamento)
```

### Correlação ponta a ponta (Cenário 6 do MD)

| Etapa | Fonte | Chave |
|-------|-------|-------|
| Page view | `page_view` / `observability_event` | `sessionId`, `correlationId` |
| Ação UI | batch telemetry | `correlationId` |
| Request HTTP | Serilog + access audit | `correlationId`, `traceId` |
| Mutação + EF | `audit_events` | `correlationId`, `transactionId` |
| Investigação admin | JOIN por `correlationId` | UI unificada (fase 7) |

---

## 4. Modelo de dados proposto (PostgreSQL)

### Tabela `observability_event` (nova)

Eventos ops: erros app, auth, authz negada, integração, HTTP complementar.

Campos alinhados ao MD + enums `ObservabilityEventType` / catálogo central.

Índices: `(occurred_at)`, `(event_type, occurred_at)`, `(correlation_id)`, `(user_id, occurred_at)`.

### Tabela `page_view` (nova)

Volume analítico de navegação SPA — `route_template`, `module`, `duration_ms`, `session_id`.

Índices: `(occurred_at)`, `(route_template, occurred_at)`, `(user_id)`.

### Tabela `access_event` (opcional — fase 2b)

Se eventos de segurança justificarem separação de `observability_event`.

**Não alterar** schema de `audit_events` além de correlacionar.

### Retenção sugerida (configurável)

| Tipo | Retenção default |
|------|------------------|
| `observability_event` (técnico) | 90 dias |
| `page_view` bruto | 180 dias |
| `access_event` / auth | 365 dias |
| Agregados diários | 24 meses |
| `audit_events` | Governança RH/compliance (decisão negócio) |

Job: `ObservabilityRetentionHostedService` ou script SQL agendado.

---

## 5. Catálogo inicial de eventos

```
Authentication.LoginSucceeded
Authentication.LoginFailed
Authentication.Logout
Authentication.SessionExpired

Authorization.AccessDenied

Navigation.PageViewed
Resource.Viewed

Action.Performed
Action.Export
Action.Download
Action.Search

Http.RequestCompleted        (opcional — amostragem)
Application.Error            (frontend + backend)
Integration.Error
```

Implementação: `ObservabilityEventCatalog` (backend) + `telemetry/events.ts` (frontend).

---

## 6. Plano de arquivos (estimativa)

### Backend — novos

```
src/LioConecta.Domain/Enums/ObservabilityEventType.cs
src/LioConecta.Domain/Entities/ObservabilityEvent.cs
src/LioConecta.Domain/Entities/PageView.cs
src/LioConecta.Application/Common/Observability/ObservabilityEventCatalog.cs
src/LioConecta.Application/Common/Observability/TelemetryRedactor.cs
src/LioConecta.Application/Services/ObservabilityIngestionService.cs
src/LioConecta.Application/Services/ObservabilityQueryService.cs
src/LioConecta.Infrastructure/Persistence/Repositories/ObservabilityRepository.cs
src/LioConecta.Api/Controllers/TelemetryController.cs          (POST ingest — autenticado)
src/LioConecta.Api/Controllers/AdminObservabilityController.cs   (GET consulta — admin)
src/LioConecta.Api/Middleware/AccessAuditMiddleware.cs         (GET allowlist)
src/LioConecta.Api/Auth/AuthAuditEvents.cs                       (hooks DevAuth/Azure)
src/LioConecta.Infrastructure/Migrations/YYYYMMDD_AddObservabilityTables.cs
tests/LioConecta.IntegrationTests/ObservabilityEndpointTests.cs
```

### Backend — alterados

```
src/LioConecta.Api/Middleware/GlobalExceptionHandler.cs   (+ correlationId)
src/LioConecta.Api/Program.cs                             (+ middleware, DI, retention)
src/LioConecta.Infrastructure/Persistence/AppDbContext.cs
src/LioConecta.Infrastructure/DependencyInjection.cs
```

### Frontend — novos

```
src/telemetry/sessionCorrelation.ts
src/telemetry/eventCatalog.ts
src/telemetry/telemetryClient.ts          (queue, batch, sendBeacon)
src/telemetry/usePageViewTracking.ts
src/components/telemetry/TelemetryProvider.tsx
src/components/telemetry/AppErrorBoundary.tsx
src/components/pages/ObservabilityDashboardPage.tsx   (fase 7)
src/api/hooks/useObservability.ts
src/styles/observability-dashboard.css
```

### Frontend — alterados

```
src/api/client.ts                         (session correlation, ApiError.correlationId)
src/main.tsx                              (ErrorBoundary, global handlers)
src/components/layout/AppShell.tsx        (page view hook)
src/App.tsx                               (rota admin observability)
src/config/sitemap.ts
src/components/layout/Sidebar.tsx
```

---

## 7. Fases de implementação (incremental)

| Fase | Escopo | Entregável |
|------|--------|------------|
| **1 — Discovery** | ✅ Este documento | Diagnóstico + gaps |
| **2 — Design** | ✅ Concluída | ADR + catálogo + política LGPD |
| **3 — Backend core** | ✅ Core + OTel | Exception, access audit, OTel |
| **4 — Frontend core** | ✅ Entregue | ErrorBoundary, telemetry client, page views |
| **5 — Persistência** | ✅ Entregue | Migrations + ingestão batch + retention |
| **6 — Métricas** | ✅ API consulta | Agregações + endpoints admin |
| **7 — Consulta UI** | Dashboard admin observability | Sitemap |
| **8 — Testes E2E** | ✅ Entregue | Cenários 1–6 + vitest + Playwright |

### Rollout (feature flags)

```
Observability:Enabled
Observability:PageViews:Enabled
Observability:AccessAudit:Enabled
Observability:AuthAudit:Enabled
Observability:BatchIngestion:Enabled
```

---

## 8. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Duplicar Audit Trail | Alto | Fronteira clara: `audit_events` = transacional |
| Volume de page views | Médio | Batching, sampling sucesso, índices |
| GET audit em todo `/api` | Alto | Allowlist de rotas sensíveis |
| Telemetria derrubar app | Alto | Try/catch, circuit breaker, async fire-and-forget |
| LGPD (IP, UA) | Médio | Hash IP, minimização, retenção |
| Correlation ID por request no FE | Médio | Session-scoped + refresh por navegação |
| Workers sem HTTP audit | Médio | Background flush de entity audit separado (backlog) |

---

## 9. O que NÃO fazer

- Reimplementar before/after ou ChangeAuditInterceptor
- Registrar cada GET ou cada clique
- Persistir JWT, senha, cookies
- Criar request HTTP por evento de UI
- Misturar `analytics_events` (produto) com ops telemetry sem contrato

---

## 10. Decisões confirmadas (2026-07-05)

| Decisão | Escolha |
|---------|---------|
| Persistência | **3 tabelas:** `observability_event` + `page_view` + `access_event` |
| Dashboard admin | **Novo hub** `/admin/observabilidade` |
| Escopo v1 | **Escopo completo do MD** (auth, metrics, retention, tests, etc.) |
| OpenTelemetry | **Fase 3 completa** — OTel + export para stack PMO (Prometheus/Grafana/Tempo) |
| Access audit GET | **Allowlist** de rotas sensíveis (`/admin/*`, `/rh/*`, export/download) |

### Implicações

- **OTel + Tempo:** validar conectividade com containers `pmo-prometheus`, `pmo-grafana`, `pmo-tempo` já no Docker local; definir endpoints OTLP no `appsettings`.
- **3 tabelas:** `access_event` recebe auth/authz; `page_view` navegação SPA; `observability_event` erros, integração, HTTP complementar.
- **Hub unificado:** links cruzados para Trilha de Auditoria (`/admin/trilha-auditoria`) e Analytics (`/analytics`) sem duplicar KPIs de produto.
- **Allowlist GET:** atributo `[AccessAudited]` ou config central em `AccessAuditOptions` — evitar logar todo GET.

---

## 11. Roadmap revisado (pós-decisões)

### Fase 2 — Design técnico ✅

- [x] ADR: fronteira Audit Trail vs observability → `docs/observability/ADR-001-audit-vs-observability.md`
- [x] DDL final 3 tabelas + índices + política retenção → `docs/observability/DATA-MODEL.md`
- [x] Catálogo de eventos v1 → `docs/observability/EVENT-CATALOG.md`
- [x] `TelemetryRedactor` / LGPD checklist → `docs/observability/LGPD-REDACTION.md`
- [x] Config OTel → Tempo/Prometheus → `docs/observability/OTEL-CONFIG.md`
- [x] Allowlist inicial de rotas GET sensíveis → `docs/observability/ACCESS-AUDIT-ALLOWLIST.md`
- [x] Wireframes hub `/admin/observabilidade` → `docs/observability/UI-SPEC-hub.md`
- [x] Contratos REST ingestão/consulta → `docs/observability/API-CONTRACTS.md`

### Fase 3 — Backend core + OTel ✅ (core entregue)

- [x] `GlobalExceptionHandler` — `correlationId` + `traceId` em ProblemDetails
- [x] `CorrelationMiddleware` — correlation antes de auth (403 incluído)
- [x] `ObservabilityLoggingMiddleware` — Serilog CorrelationId/TraceId/SessionId
- [x] `AccessAuditMiddleware` + `[AccessAudited]` + allowlist JSON
- [x] `ObservabilityAuthorizationResultHandler` — 401/403 → access audit
- [x] JWT auth audit hooks (Azure AD — LoginSucceeded/LoginFailed)
- [x] OpenTelemetry — traces OTLP + Prometheus `/metrics`
- [x] `app_settings` observability (14 chaves)
- [x] Persistência `access_events` — Fase 5

### Fase 4 — Frontend core ✅

- [x] `SessionCorrelationId` + `X-Session-Id` em `client.ts`
- [x] `ApiError.correlationId` a partir de ProblemDetails / header
- [x] `AppErrorBoundary` + handlers globais (`error`, `unhandledrejection`)
- [x] `TelemetryClient` — batch 30s / 20 eventos / flush em `pagehide`
- [x] `usePageViewTracking` em `AppShell` + `KioskShell`
- [x] `trackAction` / `trackResourceView` exportados em `src/telemetry`
- [x] Endpoints backend `/telemetry/*` — Fase 5

### Fase 5 — Persistência + ingestão ✅

- [x] Migration `20260705154034_AddObservabilityTables` — 3 tabelas + índices
- [x] `TelemetryController` — `POST /telemetry/events`, `POST /telemetry/page-views`
- [x] `ObservabilityIngestionService` + `TelemetryRedactor` (LGPD allowlist)
- [x] `AccessAuditRecorder` → persiste em `access_events`
- [x] `ObservabilityRetentionHostedService` — purge diário configurável
- [x] Testes integração (`ObservabilityEndpointTests`, `ObservabilityCoreTests`)
- [x] SQL manual: `tools/apply-add-observability-tables.sql`

### Fase 6 — Métricas + consulta API ✅

- [x] `GET /api/v1/admin/observability/summary` — 12 KPIs
- [x] `GET /api/v1/admin/observability/errors` — paginado
- [x] `GET /api/v1/admin/observability/access-events` — paginado
- [x] `GET /api/v1/admin/observability/page-views` — paginado
- [x] `GET /api/v1/admin/observability/metrics` — RPM, taxa erro, P95 (audit HTTP)
- [x] `GET /api/v1/admin/observability/investigate?correlationId=` — timeline unificada
- [x] `ObservabilityQueryService` + testes integração

### Fase 7 — UI hub ✅

- [x] `ObservabilityHubPage` — 12 KPIs, tabs Erros/Acessos/Page views/Investigar/Links
- [x] `ObservabilityTimeline` — timeline unificada por correlation ID
- [x] `useObservability*.ts` hooks + tipos em `api/types.ts`
- [x] Filtros período (reutilizar padrão Audit Trail)
- [x] Drill-down → Investigar + link Trilha com `?correlationId=`
- [x] `BackendConfigPage` suporta `?category=observability`
- [x] Rota `/admin/observabilidade` + sidebar + sitemap

### Fase 8 — Testes E2E ✅

| Cenário | Descrição | Cobertura |
|---------|-----------|-----------|
| 1 | Correlation ID em erro HTTP (header + ProblemDetails) | `ObservabilityE2EScenariosTests.Scenario1_*` |
| 2 | Ingestão batch com redaction LGPD | `Scenario2_*` + `TelemetryRedactorTests` |
| 3 | Page views batch persistidos | `Scenario3_*` |
| 4 | Access audit em GET admin | `Scenario4_*` |
| 5 | APIs admin (summary, errors, metrics) | `Scenario5_*` |
| 6 | Timeline unificada (page + access + ops + audit) | `Scenario6_*` |

**Backend** (`LioConecta.Backend/tests`):
- [x] `ObservabilityE2EScenariosTests.cs` — cenários 1–6 + smoke OTel (desabilitado em Testing)
- [x] `TelemetryRedactorTests.cs` — allowlist/sensitive keys
- [x] Testes existentes (`ObservabilityEndpointTests`, `ObservabilityCoreTests`) mantidos

**Frontend** (`LioConecta-FrontEnd`):
- [x] Vitest — `sessionCorrelation`, `telemetryClient` (batch + falha silenciosa), `routeCatalog`
- [x] Playwright — `e2e/observability-hub.spec.ts` (KPIs, Investigar, Links)
- [x] Scripts: `npm run test`, `npm run test:e2e`

**Smoke OTel produção:** `/metrics` exposto quando `Observability:Otel:PrometheusEnabled=true` e ambiente ≠ Testing. Validar manualmente com stack PMO Docker.

---

## 12. Milestone concluído

Todas as fases 1–8 do plano de observabilidade estão implementadas. Próximos passos opcionais: integração Grafana/Tempo em produção, sampling avançado, E2E full-stack com backend real no CI.

---

## 10. Decisões pendentes (ver interativo)

~~Respostas do stakeholder necessárias antes da Fase 3~~ → **Resolvidas na seção 10.**

Pendências menores (confirmar na Fase 2):

1. ~~Retenção exata em dias por tabela~~ → **Configurável via admin UI**, defaults: observability 90d, page_view 180d, access 365d, agregados 24m.
2. ~~IP~~ → **Persistir IP completo + hash**; admin UI escolhe o que gravar (só IP, só hash, ou ambos).
3. ~~Branch Git~~ → **`feature/observability-platform`** (nova branch dedicada).

### Configurações admin (app_settings ou módulo Observability)

| Chave | Default | Descrição |
|-------|---------|-----------|
| `observability.retention.observability_days` | 90 | Purge `observability_event` |
| `observability.retention.page_view_days` | 180 | Purge `page_view` |
| `observability.retention.access_event_days` | 365 | Purge `access_event` |
| `observability.retention.aggregates_days` | 730 | Purge agregados |
| `observability.privacy.ip_mode` | `both` | `full` \| `hash` \| `both` |
| `observability.access_audit.enabled` | true | Feature flag |
| `observability.page_views.enabled` | true | Feature flag |
| `observability.otel.enabled` | true | Feature flag |
| `observability.otel.otlp_endpoint` | (env) | Tempo/Collector URL |

UI de configuração: seção em `/admin/observabilidade/configuracoes` (ou reutilizar padrão `app_settings` existente se houver tela admin).

---

## Referências internas

- Audit pipeline: `LioConecta.Backend/src/LioConecta.Api/Middleware/Audit*.cs`
- Observability middleware: `CorrelationMiddleware`, `AccessAuditMiddleware`, `ObservabilityLoggingMiddleware`
- OTel config: `LioConecta.Api/Extensions/ObservabilityServiceExtensions.cs`
- Design docs: `docs/observability/*.md`
- Admin audit UI: `LioConecta-FrontEnd/src/components/pages/AuditTrailPage.tsx`
- Product analytics: `analytics_events`, `AnalyticsPage.tsx`
- Correlation FE: `src/api/client.ts`
