# LGPD e Redaction — Observabilidade

**Fase:** 2 — Design  
Implementação: `TelemetryRedactor.cs` (backend) + extensão de `AuditRedactor` onde compartilhado

## Princípios

1. **Minimização** — só persistir o necessário para diagnóstico, segurança ou métrica.
2. **Separação** — dados sensíveis de negócio ficam no Audit Trail redacted; ops não replica payloads de formulário.
3. **Configurabilidade admin** — retenção e modo IP via `app_settings` (UI em `/admin/observabilidade/configuracoes`).

---

## Denylist (nunca persistir)

| Categoria | Exemplos |
|-----------|----------|
| Credenciais | senha, `password`, `client_secret`, API keys |
| Tokens | JWT, refresh token, `Authorization` header, cookies |
| PII desnecessário | CPF, RG, e-mail em logs técnicos, telefone, endereço |
| Payload bruto | body completo de POST (exceto audit trail já redacted) |
| Segredos infra | connection strings, `app_settings` secret values |

---

## Allowlist metadata_json

Campos permitidos em `properties` / `metadata_json` do cliente:

- `routeTemplate`, `module`, `pageName`, `component`, `actionLabel`
- `statusCode`, `durationMs`, `errorType`, `errorMessage` (truncado 500 chars)
- `filterName`, `exportFormat`, `resourceType`, `resourceId` (UUID interno OK)
- `frontendVersion`, `browserLanguage`

Rejeitar chaves fora da allowlist no ingest (strip ou 400 — decisão implementação: **strip + log warning**).

---

## IP e User-Agent

Config `observability.privacy.ip_mode`:

| Valor | Persiste |
|-------|----------|
| `full` | `ip_address` |
| `hash` | `ip_hash` (SHA-256, primeiros 32 hex) |
| `both` | ambos (**default**) |

User-Agent: truncar 512 chars; sem versão completa de extensions.

---

## Headers sanitizados (request logging)

Remover/mascarar antes de log ou metadata:

```
Authorization, Cookie, Set-Cookie, X-Api-Key,
X-MS-TOKEN, Proxy-Authorization
```

Query string: redact params `token`, `code`, `state`, `password`, `secret`.

---

## Checklist por tipo de evento

| Evento | OK persistir | Proibido |
|--------|--------------|----------|
| Login failed | username (email corp), reason_code, ip/hash | senha, token |
| Access denied | userId, route template, policy | body request |
| Page view | route template, module | query PII (?cpf=) |
| FE error | stack truncado 4KB, route | localStorage contents |
| HTTP error | status, route, correlationId | response body com PII |

---

## Retenção e direitos

- Purge automático conforme `observability.retention.*`
- Export admin auditado (`access_event`: `Resource.Export` no próprio painel)
- Anonimização: job futuro para `user_id` em registros > retenção legal (backlog)

---

## Reutilização

Estender padrão existente em `AuditRedactor.cs`:

```csharp
// Shared sensitive keys
public static class SensitiveDataKeys { ... }

public static class TelemetryRedactor
{
    public static string? RedactMetadata(string? json);
    public static string? HashIp(string? ip);
    public static string? Truncate(string? value, int max);
}
```
