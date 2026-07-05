# Modelo de Dados — Observabilidade (PostgreSQL)

**Fase:** 2 — Design  
**Migration prevista:** `20260705140000_AddObservabilityTables.cs`

## Convenções

- PK: `uuid` (`gen_random_uuid()`)
- Timestamps: `timestamptz`
- Metadados variáveis: `jsonb` com contrato por `event_name`
- Snake case no PostgreSQL (padrão EF existente)
- **Não alterar** `audit_events`

---

## 1. `observability_event`

Eventos técnicos e operacionais de alto valor diagnóstico.

```sql
CREATE TABLE observability_events (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at         timestamptz NOT NULL,
    event_type          varchar(64) NOT NULL,      -- Application, Integration, Http, Navigation...
    event_name          varchar(128) NOT NULL,     -- catálogo: Application.Error
    severity            smallint NOT NULL DEFAULT 2, -- 0=Trace..5=Critical (mirror LogLevel)
    application         varchar(64) NOT NULL DEFAULT 'LioConecta.Api',
    environment         varchar(32) NOT NULL,
    user_id             uuid NULL REFERENCES people(id) ON DELETE SET NULL,
    session_id          uuid NULL,
    correlation_id      uuid NOT NULL,
    trace_id            varchar(64) NULL,
    span_id             varchar(32) NULL,
    request_id          varchar(64) NULL,
    http_method         varchar(10) NULL,
    route               text NULL,
    route_template      text NULL,
    status_code         integer NULL,
    duration_ms         integer NULL,
    resource_type       varchar(64) NULL,
    resource_id         varchar(128) NULL,
    action              varchar(128) NULL,
    success             boolean NOT NULL DEFAULT true,
    error_type          varchar(256) NULL,
    error_code          varchar(64) NULL,
    metadata_json       jsonb NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_observability_events_occurred_at ON observability_events (occurred_at DESC);
CREATE INDEX ix_observability_events_event_type_occurred_at ON observability_events (event_type, occurred_at DESC);
CREATE INDEX ix_observability_events_event_name_occurred_at ON observability_events (event_name, occurred_at DESC);
CREATE INDEX ix_observability_events_correlation_id ON observability_events (correlation_id);
CREATE INDEX ix_observability_events_trace_id ON observability_events (trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX ix_observability_events_user_id_occurred_at ON observability_events (user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX ix_observability_events_severity_occurred_at ON observability_events (severity, occurred_at DESC) WHERE severity >= 4; -- Error+
```

### Agregados diários (Fase 6 — tabela opcional)

```sql
CREATE TABLE observability_daily_aggregates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_date  date NOT NULL,
    metric_key      varchar(128) NOT NULL,  -- http.error_rate, errors.by_type, etc.
    dimension_json  jsonb NULL,             -- { "module": "rh", "eventName": "..." }
    value_numeric   double precision NOT NULL,
    sample_count    bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (aggregate_date, metric_key, dimension_json)
);
```

---

## 2. `page_view`

Navegação SPA (batch do frontend).

```sql
CREATE TABLE page_views (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at         timestamptz NOT NULL,
    user_id             uuid NULL REFERENCES people(id) ON DELETE SET NULL,
    session_id          uuid NOT NULL,
    correlation_id      uuid NOT NULL,
    page_name           varchar(128) NOT NULL,   -- label lógico: EmployeeProfile
    route_template      varchar(256) NOT NULL,   -- /pessoas/perfil/:slug
    module              varchar(64) NOT NULL,    -- pessoas, rh, admin...
    referrer_template   varchar(256) NULL,
    duration_ms         integer NULL,            -- preenchido no page leave
    metadata_json       jsonb NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_page_views_occurred_at ON page_views (occurred_at DESC);
CREATE INDEX ix_page_views_route_template_occurred_at ON page_views (route_template, occurred_at DESC);
CREATE INDEX ix_page_views_user_id_occurred_at ON page_views (user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX ix_page_views_session_id ON page_views (session_id);
CREATE INDEX ix_page_views_module_occurred_at ON page_views (module, occurred_at DESC);
```

---

## 3. `access_event`

Segurança e acesso a recursos sensíveis.

```sql
CREATE TABLE access_events (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at         timestamptz NOT NULL,
    event_type          varchar(64) NOT NULL,   -- Authentication, Authorization, ResourceAccess
    event_name          varchar(128) NOT NULL,  -- Authentication.LoginSucceeded
    user_id             uuid NULL REFERENCES people(id) ON DELETE SET NULL,
    username_snapshot   varchar(256) NULL,      -- sanitizado, nunca senha
    session_id          uuid NULL,
    correlation_id      uuid NOT NULL,
    resource            varchar(256) NULL,      -- path template ou recurso lógico
    action              varchar(128) NULL,
    permission          varchar(128) NULL,      -- policy/role
    result              varchar(32) NOT NULL,   -- Success, Denied, Failed
    reason_code         varchar(64) NULL,
    ip_address          varchar(45) NULL,       -- configurável: omitir via app_settings
    ip_hash             varchar(64) NULL,       -- SHA-256 hex truncado
    user_agent          varchar(512) NULL,
    metadata_json       jsonb NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_access_events_occurred_at ON access_events (occurred_at DESC);
CREATE INDEX ix_access_events_event_type_occurred_at ON access_events (event_type, occurred_at DESC);
CREATE INDEX ix_access_events_user_id_occurred_at ON access_events (user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX ix_access_events_correlation_id ON access_events (correlation_id);
CREATE INDEX ix_access_events_result_occurred_at ON access_events (result, occurred_at DESC);
```

---

## Retenção (configurável via `app_settings`)

| Chave | Default | Ação |
|-------|---------|------|
| `observability.retention.observability_days` | 90 | DELETE FROM observability_events |
| `observability.retention.page_view_days` | 180 | DELETE FROM page_views |
| `observability.retention.access_event_days` | 365 | DELETE FROM access_events |
| `observability.retention.aggregates_days` | 730 | DELETE FROM observability_daily_aggregates |

Job: `ObservabilityRetentionHostedService` — diário, 03:00 UTC, respeita flags `observability.retention.enabled`.

---

## Particionamento

**Não implementar na v1.** Reavaliar se `page_views` > 10M linhas/mês.

---

## Entidades EF (preview Fase 5)

```
LioConecta.Domain/Entities/ObservabilityEvent.cs
LioConecta.Domain/Entities/PageView.cs
LioConecta.Domain/Entities/AccessEvent.cs
LioConecta.Domain/Enums/ObservabilitySeverity.cs
LioConecta.Domain/Enums/AccessEventResult.cs
```
