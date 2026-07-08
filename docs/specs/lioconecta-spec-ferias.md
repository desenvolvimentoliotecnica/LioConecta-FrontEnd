---
type: lioconecta-spec
specId: spec-ferias
roadmapVersion: 1.3
exportedAt: 2026-07-08T12:30:00.000Z
source: docs/roadmap/assets/roadmap-data.js
pendingTasks: 0
totalTasks: 14
---

# 2. Solicitação de Férias Integrado

> Pacote para implementação · LioConecta Roadmap

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-ferias` |
| Item gestor | G-RM-05 — Solicitação de férias |
| Status gestor | integrated |
| Epic | EPIC-RM — Integração RM |
| Tasks pendentes | 0 / 14 |
| Exportado em | 08/07/2026 |

## Especificação funcional

Histórias: US-RM-002, US-RM-003 · Rotas: `/servicos/ferias-ausencias`, `/servicos/ferias-ausencias/gestao`

### Objetivo

Colaborador solicita férias, consulta saldo e acompanha status. Gestor/RH acompanham na gestão (somente leitura); aprovação formal permanece no RM Labore. Portal notifica (aviso + e-mail SMTP) e espelha status.

### Estado atual

- React `FeriasAusenciasPage.tsx` + `FeriasGestaoPage.tsx` via `/rh/leave/*`
- Sync RM read-only: `PFUFERIAS` + `PFUFERIASPER` via `TotvsRmLeaveRepository`
- Cache 24h on-demand; worker `totvs-leave-sync`
- POST `/rh/leave/requests` valida saldo (422 se insuficiente); dispara notify portal + e-mail
- Destinatários: gestor (`ManagerId`) ∪ `leave.notify_roles` ∪ `leave.notify_emails`
- E-mail: SMTP via fila; **override ativo por default** (`leave.email.dev_override_enabled=true`, `to=leonardo.mendes@liotecnica.com.br`)
- GET `/rh/leave/requests` + detalhe + PDF comprovante (colaborador)
- GET `/rh/leave/management` + detalhe + PDF (gestor/RH/Admin/allow-list)
- Write-back RM: fila `leave-writeback` + adapter API quando habilitado (sem approve no portal)

### Gaps / tasks restantes

- UAT homolog: confirmar override e-mail; notificação no gestor; PDF
- Em produção: desligar `leave.email.dev_override_enabled` (ou limpar `dev_override_to`)
- Write-back Labore full quando API TOTVS pronta (fora desta entrega de gestão)

### API

```
GET  /rh/leave/summary
GET  /rh/leave/balance
GET  /rh/leave/requests
GET  /rh/leave/requests/{id}
GET  /rh/leave/requests/{id}/pdf
POST /rh/leave/requests
GET  /rh/leave/management?status=&q=
GET  /rh/leave/management/{id}
GET  /rh/leave/management/{id}/pdf
GET  /rh/leave/history
```

### Integração RM

- **Leitura:** SQL `corporerm` — ver docs de leave SQL no backend
- **Escrita:** `ILeaveRmWriteBack` — fila portal + API quando middleware habilitada
- **Aprovação:** somente no Labore; portal não expõe approve/reject

## Checklist pós-implementação

- [x] Código implementado e revisado
- [x] Tasks marcadas `done: true` em `roadmap-data.js`
- [x] Story/status atualizados no roadmap
- [x] `page-maturity.ts` / `sitemap.ts` / `routeCatalog` / navigation revisados
- [x] Help Configurações Backend — override e-mail documentado
- [ ] UAT manual homolog (e-mail override, notificação gestor, PDF)
- [ ] Produção: desligar override de e-mail
