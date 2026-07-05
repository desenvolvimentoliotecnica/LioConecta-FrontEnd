# ADR-001 — Fronteira Audit Trail vs Observabilidade

**Status:** Aceito (Fase 2)  
**Data:** 2026-07-05  
**Branch:** `feature/observability-platform`

## Contexto

O LioConecta possui pipeline de **Audit Trail** (`audit_events`) que registra:

- mutações HTTP (`POST`/`PUT`/`PATCH`/`DELETE` em `/api/*`);
- alterações EF (`EntityChange` com diff em `DetailsJson`);
- correlação via `CorrelationId`, `TransactionId`, actor.

O documento de requisitos pede observabilidade ampla (logs, auth, page views, métricas, OTel) **sem reimplementar** auditoria transacional.

## Decisão

Manter **dois domínios persistidos distintos**, correlacionados por identificadores:

| Domínio | Tabela(s) | Responsabilidade |
|---------|-----------|------------------|
| **Audit Trail** | `audit_events` | Histórico transacional, before/after, mutações de negócio |
| **Observabilidade ops** | `observability_event`, `page_view`, `access_event` | Telemetria, segurança, navegação, erros, diagnóstico |

### O que NÃO vai para `audit_events`

- Login/logout/falha de auth → `access_event`
- Acesso negado (403) → `access_event`
- Page views SPA → `page_view`
- Erros React / JS → `observability_event`
- Métricas agregadas → consultas + OTel/Prometheus (não linha a linha em audit)

### O que permanece em `audit_events`

- Pipeline middleware existente (sem duplicar lógica de diff)
- `ChangeAuditInterceptor` (EF)
- Admin `/admin/audit-events` (Trilha de Auditoria)

## Correlação

Todos os domínios compartilham, quando disponível:

```
CorrelationId  ← X-Correlation-Id (session-scoped no FE a partir da Fase 4)
TraceId        ← Activity.Current (OTel, Fase 3)
SessionId      ← cookie/header X-Session-Id (novo)
UserId         ← claims / DevAuth
```

Endpoint de investigação (Fase 6):

```
GET /api/v1/admin/observability/investigate?correlationId={guid}
```

Retorna timeline unificada (read-only) referenciando IDs em cada tabela + links para Audit Trail.

## Consequências

**Positivas**

- Audit Trail estável; evolução ops isolada
- Retenção e LGPD diferentes por tabela
- Volume de page views não infla audit transacional

**Negativas**

- JOIN cross-table para jornada completa (mitigado por endpoint investigate)
- Mais migrations e repositórios

## Alternativas rejeitadas

1. **Estender `AuditSource` enum** com Auth, PageView, Error — acopla ops ao modelo transacional e confunde UI da Trilha.
2. **Tabela única `observability_event`** — mistura volumes e retenções distintas; rejeitado pelo stakeholder (preferiu 3 tabelas).
