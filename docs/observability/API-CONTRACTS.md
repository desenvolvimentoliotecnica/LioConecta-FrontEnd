# API Contracts — Observabilidade

**Fase:** 2 — Design  
Base path: `/api/v1`  
Auth: Bearer / DevAuth — ingestão requer usuário autenticado; consulta requer Admin

---

## Ingestão (Frontend batch)

### `POST /telemetry/events`

Batch de eventos ops (max 50 por request).

**Request:**

```json
{
  "sessionId": "uuid",
  "correlationId": "uuid",
  "events": [
    {
      "eventType": "Application",
      "eventName": "Application.UnhandledRejection",
      "occurredAt": "2026-07-05T15:00:00Z",
      "severity": 4,
      "properties": {
        "routeTemplate": "/analytics",
        "message": "truncated..."
      }
    }
  ]
}
```

**Response:** `202 Accepted` `{ "accepted": 3, "rejected": 0 }`

Falha parcial: rejeitar eventos inválidos individualmente; não falhar batch inteiro.

---

### `POST /telemetry/page-views`

```json
{
  "sessionId": "uuid",
  "correlationId": "uuid",
  "views": [
    {
      "occurredAt": "2026-07-05T15:00:00Z",
      "pageName": "AuditTrail",
      "routeTemplate": "/admin/trilha-auditoria",
      "module": "admin",
      "referrerTemplate": "/",
      "durationMs": 45000
    }
  ]
}
```

**Response:** `202 Accepted`

---

## Consulta admin

Prefix: `/admin/observability`

| Method | Path | Descrição |
|--------|------|-----------|
| GET | `/summary?from=&to=` | KPIs agregados (12 indicadores) |
| GET | `/errors?from=&to=&page=&pageSize=&eventName=` | Lista paginada |
| GET | `/access-events?from=&to=&result=&page=` | Lista paginada |
| GET | `/page-views?from=&to=&module=&page=` | Lista paginada |
| GET | `/metrics?from=&to=&period=24h` | Séries temporais (RPM, error rate, P95) |
| GET | `/investigate?correlationId={guid}` | Timeline unificada |

### Summary DTO (preview)

```typescript
interface ObservabilitySummaryDto {
  errorsLast24h: number;
  httpErrorRate: number;
  p95LatencyMs: number;
  requestsPerMinute: number;
  dailyActiveUsers: number;
  pageViews: number;
  accessDenied: number;
  authFailures: number;
  topModule?: string;
  topPage?: string;
  // ...
}
```

### Investigate DTO

```typescript
interface ObservabilityTimelineDto {
  correlationId: string;
  items: Array<{
    occurredAt: string;
    source: "page_view" | "access_event" | "observability_event" | "audit_event";
    label: string;
    detail?: string;
    referenceId: string;
  }>;
}
```

---

## Headers

| Header | Direção | Descrição |
|--------|---------|-----------|
| `X-Correlation-Id` | FE → BE | Session-scoped UUID |
| `X-Session-Id` | FE → BE | UUID sessão navegação (localStorage) |
| `X-Correlation-Id` | BE → FE | Echo response |
| `traceparent` | W3C | OTel propagation (automático) |

---

## Erros padronizados (evolução Fase 3)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An unexpected error occurred",
  "status": 500,
  "detail": "Não foi possível concluir a operação.",
  "instance": "/api/v1/rh/payslips/2026/6",
  "correlationId": "uuid",
  "traceId": "hex"
}
```

---

## Rate limiting (Fase 5)

- Ingestão: 120 req/min por userId
- Batch max 50 eventos
- Payload max 256 KB

Telemetria rejeitada por rate limit → `429` sem impactar APIs de negócio.
