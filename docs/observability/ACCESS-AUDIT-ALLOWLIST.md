# Access Audit — Allowlist GET sensíveis

**Fase:** 2 — Design  
Implementação: `AccessAuditMiddleware` + atributo `[AccessAudited]`

## Regra

Registrar em `access_event` **somente**:

1. Rotas na allowlist configurável, **ou**
2. Endpoints marcados com `[AccessAudited]`, **ou**
3. Respostas `401`/`403` (via authorization handler — sempre)

**Não registrar:** GET `/api/v1/feed`, `/notifications`, health, static.

---

## Mecanismo

### Opção primária: atributo

```csharp
[AccessAudited(Resource = "PayslipPdf", Action = "Download")]
[HttpGet("{year:int}/{month:int}/pdf")]
public async Task<IActionResult> GetPdf(...) { }
```

### Opção secundária: config `app_settings`

Chave JSON `observability.access_audit.route_patterns`:

```json
[
  { "method": "GET", "pattern": "/api/v1/admin/**", "eventName": "Resource.Viewed" },
  { "method": "GET", "pattern": "/api/v1/rh/payslips/**", "eventName": "Resource.Viewed" },
  { "method": "GET", "pattern": "/api/v1/rh/leave/**", "eventName": "Resource.Viewed" },
  { "method": "GET", "pattern": "/api/v1/analytics/**", "eventName": "Resource.Viewed" },
  { "method": "GET", "pattern": "/api/v1/admin/app-settings", "eventName": "Resource.Viewed" }
]
```

Pattern syntax: ASP.NET route template glob (`**` = multi segment).

---

## Allowlist inicial v1 (endpoints)

### Admin

| Method | Route | event_name |
|--------|-------|------------|
| GET | `/api/v1/admin/audit-events` | Resource.Viewed |
| GET | `/api/v1/admin/audit-events/**` | Resource.Viewed |
| GET | `/api/v1/admin/app-settings` | Resource.Viewed |
| GET | `/api/v1/admin/observability/**` | Resource.Viewed |

### RH / dados pessoais

| Method | Route | event_name |
|--------|-------|------------|
| GET | `/api/v1/rh/payslips/**` | Resource.Viewed |
| GET | `/api/v1/rh/benefits/**` | Resource.Viewed |
| GET | `/api/v1/rh/leave/**` | Resource.Viewed |

### Analytics / config

| Method | Route | event_name |
|--------|-------|------------|
| GET | `/api/v1/analytics/**` | Resource.Viewed |

### Pessoas / perfil

| Method | Route | event_name |
|--------|-------|------------|
| GET | `/api/v1/people/{id}` | Resource.Viewed |
| GET | `/api/v1/people/slug/{slug}` | Resource.Viewed |

### Export / download (quando implementados)

| Method | Route | event_name |
|--------|-------|------------|
| GET | `/api/v1/**/export` | Resource.Export |
| GET | `/api/v1/**/*pdf` | Resource.Download |

---

## Authorization denied (sempre)

`IAuthorizationMiddlewareResultHandler` customizado ou filter:

- Em `403`/`401` → `access_event` com `Authorization.AccessDenied` ou `Authentication.AnonymousBlocked`
- Incluir policy que falhou (sem expor claims completos)

---

## Middleware placement

```
UseAuthentication
UseAuthorization
AccessAuditMiddleware        ← NEW (after auth, before audit pipeline)
AuditMiddleware            ← existing
...
```

Grava `access_event` async fire-and-forget (channel + background service) para não bloquear response.

---

## Frontend routes sensíveis (page_view — sempre)

Todas as rotas `/admin/**` e `/servicos/rh/**` registram page view; demais conforme `routeCatalog`.

---

## Volume estimado

Allowlist ~15–25 route patterns vs ~80 GET endpoints totais → redução ~70–80% vs log universal.
