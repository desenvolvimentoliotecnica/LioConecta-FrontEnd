---
type: lioconecta-spec
specId: spec-ferias
roadmapVersion: 1.2
exportedAt: 2026-07-08T00:45:00.000Z
source: docs/roadmap/assets/roadmap-data.js
pendingTasks: 0
totalTasks: 9
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
| Tasks pendentes | 0 / 9 |
| Exportado em | 08/07/2026, 00:45:00 |

## Especificação funcional

Histórias: US-RM-002, US-RM-003 · Rota: `/servicos/ferias-ausencias`

### Objetivo

Colaborador solicita férias, consulta saldo e acompanha status até aprovação RM.

### Estado atual

- React `FeriasAusenciasPage.tsx` integrado via `/rh/leave/*`
- Sync RM read-only: `PFUFERIAS` + `PFUFERIASPER` via `TotvsRmLeaveRepository`
- Cache 24h on-demand; worker `totvs-leave-sync`
- POST `/rh/leave/requests` valida saldo (422 se insuficiente)
- GET `/rh/leave/requests` + detalhe com timeline
- Write-back RM: fila `leave-writeback` + adapter API (`leave.rm.writeback.enabled`)
- UI: formulário com saldo, painel de solicitações, badges e modal de timeline

### Gaps / tasks restantes

Nenhum — spec implementada em 08/07/2026.

### API

```
GET  /rh/leave/summary
GET  /rh/leave/balance
GET  /rh/leave/requests
GET  /rh/leave/requests/{id}
POST /rh/leave/requests
GET  /rh/leave/history
```

### Integração RM

- **Leitura:** SQL `corporerm` — ver [integrations-totvs-rm-leave-sql.md](../../LioConecta.Backend/docs/integrations-totvs-rm-leave-sql.md) no backend
- **Escrita:** `ILeaveRmWriteBack` — fila portal + `TotvsRmApiLeaveWriteBack` quando API middleware habilitada

## Checklist pós-implementação

- [x] Código implementado e revisado
- [x] Tasks marcadas `done: true` em `roadmap-data.js`
- [x] Story/status atualizados no roadmap
- [x] `page-maturity.ts` / `sitemap.ts` revisados (rota existente)
- [ ] UAT manual homolog RM (write-back full quando API plugada)
- [x] MD reexportado com progresso atualizado
