# Aceite — Onda 1B (Write-back SQL + Workflow)

**Data:** 10/07/2026  
**Status:** DONE (escopo planejado entregue; write-back RM em modo `dry_run` / `apply_rollbackable`)

## Decisões

| Tema | Decisão |
|------|---------|
| Write-back | SQL direto no `corporerm` (não API Labore) |
| Testes | Modes `off` / `dry_run` / `apply_rollbackable` / `apply` + journal/rollback |
| Aprovação | No portal (gestor/RH) antes da fila de write-back |

Spike: [`LioConecta.Backend/docs/spike-writeback-sql-rm.md`](../../LioConecta.Backend/docs/spike-writeback-sql-rm.md)

## Entregue

### F1.6 Férias

- Approve/reject em `/api/v1/rh/leave/management/{id}/approve|reject`
- UI: botões na gestão de férias
- `TotvsRmSqlLeaveWriteBack` + journal; leitura RM corrigida (`DATAINICIO`/`DATAFIM`/`SALDO`)
- Worker `leave-writeback` respeita `leave.rm.writeback.mode`

### F1.7 Ponto

- Approve/reject em `/api/v1/rh/ponto/adjustments/management/{id}/approve|reject`
- UI: botões no detalhe da gestão de ponto
- `TotvsRmSqlPontoWriteBack` + worker `ponto-writeback`
- Colunas `RmSyncStatus` / `RmExternalId` em `ponto_adjustment_records`

### F1.8 Workflow MVP

- Entidades + API `/api/v1/rh/workflows/*`
- Fluxo seed `movimentacao-merito` (gestor → RH)
- Página `/servicos/movimentacoes`

### Segurança / rollback

- `POST /api/v1/admin/rm-writeback/sessions/{sessionId}/rollback`
- `*.rm.writeback.allow_prod` default false; `apply` exige flag; `apply_rollbackable` para UAT

## UAT

| Fluxo | Spec |
|-------|------|
| Aprovação férias | `e2e/onda-1b-leave-approve-uat.spec.ts` |
| Workflow mérito | `e2e/onda-1b-workflow-merito-uat.spec.ts` |

## Mensagem ao gestor

> Onda 1B concluída no portal: aprovação de férias e ponto no LioConecta, write-back SQL ao Totvs RM com modos dry-run/rollback (sem poluir a base em teste), e MVP do motor de workflow com movimentação de mérito. Próximos passos naturais: homologar `apply_rollbackable` com usuário RM de escrita, expandir tipos de movimentação e Fase 6 (inbox unificado).
