# OpenTelemetry — Configuração

**Fase:** 2 — Design | Implementação: Fase 3  
**Stack local existente:** `pmo-tempo`, `pmo-prometheus`, `pmo-grafana` (Docker)

## Objetivo

Tracing distribuído correlacionado com `CorrelationId` e persistência PostgreSQL complementar (não substituta).

```
React → API → Application → Npgsql → (external HTTP)
         ↓ OTLP gRPC/HTTP
      Tempo ← Grafana
         ↓ metrics
    Prometheus ← scrape /metrics ou OTLP
```

---

## Pacotes NuGet (LioConecta.Api)

```xml
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.9.*" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.9.*" />
<PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.9.*" />
<PackageReference Include="OpenTelemetry.Instrumentation.EntityFrameworkCore" Version="1.0.*" />
<PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.9.*" />
<PackageReference Include="OpenTelemetry.Exporter.Prometheus.AspNetCore" Version="1.9.*" />
```

---

## app_settings / Environment

| Chave | Default (Development) | Descrição |
|-------|----------------------|-----------|
| `observability.otel.enabled` | `true` | Master switch |
| `observability.otel.service_name` | `LioConecta.Api` | Resource service.name |
| `observability.otel.otlp_endpoint` | `http://localhost:4317` | Tempo OTLP gRPC |
| `observability.otel.prometheus_enabled` | `true` | Endpoint `/metrics` |
| `observability.otel.trace_sample_ratio` | `1.0` dev / `0.25` prod | ParentBased sampler |

Env override: `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`.

---

## Program.cs (sketch)

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(serviceName))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation(o => {
            o.RecordException = true;
            o.EnrichWithHttpRequest = (activity, req) => {
                activity.SetTag("correlation.id", req.Headers["X-Correlation-Id"]);
            };
        })
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation(o => o.SetDbStatementForText = false)
        .AddOtlpExporter())
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddPrometheusExporter());

app.MapPrometheusScrapingEndpoint("/metrics"); // proteger em prod ou rede interna
```

---

## Correlação Serilog ↔ OTel

Enricher customizado:

```csharp
LogContext.PushProperty("TraceId", Activity.Current?.TraceId.ToString());
LogContext.PushProperty("SpanId", Activity.Current?.SpanId.ToString());
LogContext.PushProperty("CorrelationId", auditContext?.CorrelationId);
```

Ordem middleware: OTel → AuditMiddleware (CorrelationId alinhado ao trace quando possível).

---

## Tempo (Docker PMO)

Verificar `pmo-tempo` container config. Default OTLP:

- gRPC: `localhost:4317`
- HTTP: `localhost:4318`

Se Tempo estiver restarting (observado em dev), corrigir config antes da Fase 3 ou usar `docker run` collector sidecar.

---

## Grafana dashboards (Fase 6+)

Painéis sugeridos:

- Request rate / error rate / duration (RED)
- Top endpoints P95
- Trace search by correlationId
- Link para admin observability hub

---

## Sampling

| Cenário | Taxa |
|---------|------|
| Erros (status >= 500) | 100% |
| Auth failures | 100% |
| Access denied | 100% |
| HTTP 2xx success | `trace_sample_ratio` |
| Health checks | 0% (filter exclude `/health`) |

---

## Segurança

- `/metrics` não expor publicamente em produção — rede interna ou auth
- Spans não incluem query string completa nem bodies
- `SetDbStatementForText = false` no EF instrumentation
