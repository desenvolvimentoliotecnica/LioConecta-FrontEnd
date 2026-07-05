# Catálogo de Eventos — v1

**Fase:** 2 — Design  
Arquivos de implementação previstos (Fase 3–4):

- Backend: `LioConecta.Application/Common/Observability/ObservabilityEventCatalog.cs`
- Frontend: `src/telemetry/eventCatalog.ts`

## Convenção de nomenclatura

```
{Domain}.{Action}[.{Detail}]
```

Exemplos: `Authentication.LoginSucceeded`, `Navigation.PageViewed`

---

## Authentication → `access_event`

| event_name | event_type | result | Persistir |
|------------|------------|--------|-----------|
| `Authentication.LoginSucceeded` | Authentication | Success | Sim |
| `Authentication.LoginFailed` | Authentication | Failed | Sim |
| `Authentication.Logout` | Authentication | Success | Sim |
| `Authentication.SessionExpired` | Authentication | Failed | Sim |
| `Authentication.TokenRejected` | Authentication | Failed | Sim |
| `Authentication.AnonymousBlocked` | Authentication | Denied | Sim |

**metadata_json:** `{ "scheme": "DevAuth|Bearer", "failureReason": "..." }` — sem token.

---

## Authorization → `access_event`

| event_name | event_type | result |
|------------|------------|--------|
| `Authorization.AccessDenied` | Authorization | Denied |

**Campos:** `resource` (route template), `action` (HTTP method), `permission` (policy name), `reason_code` (`Forbidden`, `RequireAdmin`, etc.)

**Regra:** não registrar autorização bem-sucedida em massa (volume).

---

## Resource access (GET allowlist) → `access_event`

| event_name | event_type | result |
|------------|------------|--------|
| `Resource.Viewed` | ResourceAccess | Success |
| `Resource.Export` | ResourceAccess | Success |
| `Resource.Download` | ResourceAccess | Success |
| `Resource.Search` | ResourceAccess | Success |

---

## Navigation → `page_view` (+ espelho opcional em `observability_event`)

| event_name | Destino | Notas |
|------------|---------|-------|
| `Navigation.PageViewed` | `page_view` | Primary store |
| `Navigation.PageLeft` | update `duration_ms` | PATCH batch ou evento leave |

---

## Application / Frontend errors → `observability_event`

| event_name | severity | Origem |
|------------|----------|--------|
| `Application.Error` | Error | Backend unhandled (via handler) |
| `Application.Error` | Error | FE ErrorBoundary |
| `Application.UnhandledRejection` | Error | FE global handler |
| `Application.NetworkError` | Warning | FE client HTTP |

---

## HTTP complementar → `observability_event` (amostragem)

| event_name | Notas |
|------------|-------|
| `Http.RequestCompleted` | Sample 10% sucesso 2xx; 100% 4xx/5xx |

Mutations já cobertas por `audit_events` — **não duplicar** POST/PUT/PATCH/DELETE body audit.

---

## Integration → `observability_event`

| event_name | severity |
|------------|----------|
| `Integration.Error` | Error |
| `Integration.Timeout` | Warning |
| `Integration.Retry` | Warning |

---

## Action (FE trackAction) → `observability_event`

| event_name | Exemplos de uso |
|------------|-----------------|
| `Action.Performed` | Filtro aplicado, enquete votada |
| `Action.Export` | Export relatório |
| `Action.Download` | PDF contracheque |
| `Action.Search` | Busca global |

---

## Envelope JSON (ingestão batch)

```json
{
  "eventType": "Navigation",
  "eventName": "PageViewed",
  "occurredAt": "2026-07-05T15:00:00.000Z",
  "sessionId": "uuid",
  "correlationId": "uuid",
  "resource": {
    "type": "Page",
    "name": "AuditTrail",
    "routeTemplate": "/admin/trilha-auditoria"
  },
  "properties": {
    "module": "admin",
    "referrerTemplate": "/"
  }
}
```

Validação: `eventName` deve existir no catálogo; rejeitar desconhecido com 400 (não persistir lixo).

---

## Mapeamento FE route → module (amostra)

| route_template | module | page_name |
|----------------|--------|-----------|
| `/` | feed | HomeFeed |
| `/analytics` | analytics | AnalyticsDashboard |
| `/admin/trilha-auditoria` | admin | AuditTrail |
| `/admin/observabilidade` | admin | ObservabilityHub |
| `/admin/observabilidade/configuracoes` | admin | ObservabilitySettings |
| `/servicos/contracheque` | rh | PayslipHub |
| `/servicos/ferias-ausencias` | rh | LeaveHub |
| `/pessoas/perfil` | pessoas | PersonProfile |
| `/grupos/aprovacoes` | grupos | GroupApprovals |

Arquivo completo: `src/telemetry/routeCatalog.ts` (Fase 4).
