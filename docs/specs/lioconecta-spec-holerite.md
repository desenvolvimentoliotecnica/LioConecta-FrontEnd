---
type: lioconecta-spec
specId: spec-holerite
roadmapVersion: 1.2
exportedAt: 2026-07-07T23:35:00.000Z
source: docs/roadmap/assets/roadmap-data.js
pendingTasks: 0
totalTasks: 8
---

# 1. Visualização de Holerite Integrado

> Pacote para implementação · LioConecta Roadmap

## Como usar este arquivo

1. Forneça este MD ao agente/dev para implementar tasks pendentes (`[ ]`).
2. Após implementar, atualize `docs/roadmap/assets/roadmap-data.js`:
   - `done: true` em cada task concluída
   - `status: "integrated"` na story (se aplicável)
3. Reexporte o MD para refletir o progresso.

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-holerite` |
| Item gestor | G-RM-07 — Visualização de Holerite |
| Status gestor | integrated |
| Epic | EPIC-RM — Integração RM |
| Tasks pendentes | 0 / 8 |
| Exportado em | 07/07/2026, 20:35:00 |

## Especificação funcional

História: US-RM-001 · Rota: /servicos/contracheque

### Objetivo

Colaborador consulta holerite mensal, histórico, PDF, comparativo e informe IR.

### Estado atual

- React ContrachequePage.tsx integrado via /rh/payslips/*
- Sync RM: worker totvs-payslip-sync (SQL read-only)
- Informe IR, FGTS, rubricas e descontos alimentados por dados reais do RM
- Cache holerite 24h on-demand; modais leem Postgres (sem RM live)
- PDF comprovante/carta consignação E2E; card 2ª via removido
- Informe IR filtrado por admissão; retidos via rubrica IRF (cod. 561)
- Grid 3 colunas em telas largas; UAT manual B4–B9 + Obs 1–4 validados

### Gaps / tasks restantes

Nenhum — spec fechada em 07/07/2026 (UAT manual concluído às 20:30).

### API

```
GET /rh/payslips/summary
GET /rh/payslips?month=&year=
GET /rh/payslips/{id}/pdf
GET /rh/payslips/informe/{year}
GET /rh/payslips/consultas/fgts|descontos|rubricas
```

## Histórias de usuário

### [x] US-RM-001 — Consultar holerite, PDF e histórico

- **Status:** integrated
- **Fase:** F1
- **Prioridade:** Alta
- **Feature:** Holerite
- **Rota:** `/servicos/contracheque`
- **Arquivo:** `src/components/contracheque/ContrachequePage.tsx`
- **Tasks:** 8/8 concluídas

#### Tasks

**FE**

- [x] `TS-FE-RM-001a` (F1) — Exibir metadados sync (syncedAt, dataSource) no header do holerite
- [x] `TS-FE-RM-001b` (F1) — Regressão modal comparativo e histórico 12 meses
- [x] `TS-FE-RM-001c` (F1) — Regressão download/print PDF holerite
- [x] `TS-FE-RM-001d` (F1) — Regressão consultas FGTS, descontos, rubricas, informe IR

**BE**

- [x] `TS-BE-RM-001a` (F1) — Validar worker totvs-payslip-sync e período fechamento RM
- [x] `TS-BE-RM-001b` (F1) — Garantir cache /rh/payslips consistente pós-sync

**QA**

- [x] `TS-QA-RM-001a` (F1) — Caso: PDF holerite bate com RM homolog
- [x] `TS-QA-RM-001b` (F1) — Caso: informe IR abre e valores conferem

## Resumo de tasks (todas)

| Status | ID | Tipo | História | Task | Fase |
|--------|-----|------|----------|------|------|
| ✅ | `TS-FE-RM-001a` | FE | US-RM-001 | Exibir metadados sync (syncedAt, dataSource) no header do holerite | F1 |
| ✅ | `TS-FE-RM-001b` | FE | US-RM-001 | Regressão modal comparativo e histórico 12 meses | F1 |
| ✅ | `TS-FE-RM-001c` | FE | US-RM-001 | Regressão download/print PDF holerite | F1 |
| ✅ | `TS-FE-RM-001d` | FE | US-RM-001 | Regressão consultas FGTS, descontos, rubricas, informe IR | F1 |
| ✅ | `TS-BE-RM-001a` | BE | US-RM-001 | Validar worker totvs-payslip-sync e período fechamento RM | F1 |
| ✅ | `TS-BE-RM-001b` | BE | US-RM-001 | Garantir cache /rh/payslips consistente pós-sync | F1 |
| ✅ | `TS-QA-RM-001a` | QA | US-RM-001 | Caso: PDF holerite bate com RM homolog | F1 |
| ✅ | `TS-QA-RM-001b` | QA | US-RM-001 | Caso: informe IR abre e valores conferem | F1 |

## O que foi feito

> Implementado em 07/07/2026 · repos: LioConecta-FrontEnd + LioConecta.Backend

### Rodada UAT manual (07/07 — 20:30)

| Item | Resultado |
|------|-----------|
| B4 — Viewer empilhado / histórico | OK |
| B5 — Comparativo 2 meses FOLHA distintos | OK |
| B6 — Toast download PDF | OK |
| B7 — FGTS e encargos | OK |
| B8 — Adiantamento 404 fora dos descontos | OK |
| B9 — Glossário amigável de rubricas | OK |
| Obs 1 — Cache/sync 1×/dia | OK |
| Obs 2 — Remover card 2ª via | OK |
| Obs 3 — Comprovante/carta PDF real | OK |
| Obs 4 — Informe IR (retidos IRF cod. 561) | OK |
| UX — Grid 3 cards em telas largas | OK |

### Entregas por task

- **TS-FE-RM-001a:** Metadados `syncedAt`/`dataSource` no header via `RhPageHead` + `src/utils/syncMeta.ts`
- **TS-FE-RM-001b:** Histórico limitado a 12 meses; e2e abre comparativo e histórico com dados reais
- **TS-FE-RM-001c:** e2e valida PDF non-empty via API e UI
- **TS-FE-RM-001d:** e2e abre FGTS, descontos, rubricas e informe IR; ano dinâmico do informe
- **TS-BE-RM-001a:** `PayslipCompetenceRules` bloqueia competências futuras; logs worker enriquecidos; unit tests
- **TS-BE-RM-001b:** Sync informe IR do RM (PFFINANC); FGTS via PFPERFF; rubricas/descontos do cache RM; cleanup pós-sync
- **TS-QA-RM-001a:** `PayslipRmConsistencyTests` — detail + PDF vs API local
- **TS-QA-RM-001b:** `PayslipRmConsistencyTests` — informe IR + FGTS vs API local

### Arquivos alterados

- **FrontEnd:** `ContrachequePage.tsx`, modais payslip, `usePayslips.ts`, `payslipHelpers.ts`, `payslipToast.ts`, `contracheque-page.css`, `e2e/contracheque.spec.ts`
- **Backend:** `PayslipService.cs`, `PayslipSyncService.cs`, `PayslipRubricCatalog.cs`, `PayslipIncomeStatementRules.cs`, `PayslipDeductionRules.cs`, `PayslipRhDocumentPdfGenerator.cs`, `TotvsRmPayslipRepository.cs`, migrations FGTS

### Testes executados

- `npm run build` — OK
- `npx playwright test e2e/contracheque.spec.ts` — OK (2/2, API `localhost:5148`, página `127.0.0.1:5174`)
- `dotnet test` PayslipCompetenceRules — OK (8/8)
- `dotnet test` PayslipRmConsistencyTests — OK (4/4)
- UAT manual colaborador real — OK (07/07/2026 20:30)

## Checklist pós-implementação

- [x] Código implementado e revisado
- [x] Tasks marcadas `done: true` em `roadmap-data.js`
- [x] Story/status atualizados no roadmap
- [x] `page-maturity.ts` / `sitemap.ts` revisados (sem nova rota)
- [x] QA da spec executado
- [x] MD reexportado com progresso atualizado
