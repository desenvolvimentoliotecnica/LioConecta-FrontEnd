# Aceite — Onda 1A (Banco de horas + Auditoria holerite)

**Data:** 10/07/2026  
**Status:** DONE (critério 4D atendido)

## Já estava pronto (não reimplementado)

| Item | Rota / evidência |
|------|------------------|
| F1.1 Lista de ramais | `/pessoas/ramais` — CRUD produção |
| F1.2 Hub de sistemas | `/servicos/acesso-sistemas` — catálogo + bookmarks |
| F1.3 Holerite (leitura) | `/servicos/contracheque` — sync RM + PDF |
| F1.5 Benefícios | `/servicos/beneficios` — CMS portal |

## Fechado nesta entrega

### F1.4 Banco de horas real (TOTVS RM)

- **Fonte RM:** `ASALDOBANCOHOR` (saldo sintético, minutos) + `ABANCOHORFUN` (extrato diário)
- **Fórmula saldo:** `(EXTRAANT+EXTRAATU) − (ATRASOANT+ATRASOATU) − (FALTAANT+FALTAATU)` → horas
- **APIs:**
  - `GET /api/v1/rh/leave/banco-horas` (self)
  - `GET /api/v1/rh/ponto/banco-horas` (equipe gestor/RH)
  - `GET /api/v1/rh/ponto/banco-horas/{personId}` (detalhe)
- **UI:** modal em Férias/Ausências; aba “Banco de horas” em Gestão de ponto
- **Sync:** `LeaveSyncService` passa a gravar `BancoHorasBalanceHours` a partir do RM

### Auditoria de acesso ao holerite + painel RH

- Eventos `Resource=Payslip` com metadados (competência, alvo, ação `view`|`download`)
- `GET /api/v1/rh/payslips/access-log` (permissão `payslips.audit`)
- UI: `/servicos/contracheque/acessos`
- Perfis HR / KeyUser-RH recebem `payslips.audit`

## Evidências UAT

| Fluxo | Resultado | Pasta do run |
|-------|-----------|--------------|
| Banco de horas | PASSOU | `C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\e2e\evidence\banco-horas-uat\2026-07-10_16-51-25` |
| Auditoria holerite | PASSOU | `C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\e2e\evidence\holerite-audit-uat\2026-07-10_16-51-57` |

Specs: `e2e/banco-horas-uat.spec.ts`, `e2e/holerite-audit-uat.spec.ts`.

## Fora de escopo / residual (próximas ondas)

- Write-back férias/ponto no RM (Onda 1B)
- F1.8 Movimentações / motor de workflow
- Fase 2 ATS, Fase 4 Power BI, Fase 5 SSO federado, Fase 6 inbox unificado

## Mensagem pronta ao gestor

> Onda 1A concluída. Ramais, hub de sistemas, holerite e benefícios já estavam em produção. Fechamos o que faltava: **banco de horas real do Totvs RM** (saldo + extrato + visão gestor) e **auditoria de acesso ao holerite com painel RH**. UAT/E2E com evidências passou nos dois fluxos. Próximo passo natural: Onda 1B (write-back férias/ponto e motor de workflow para movimentações).

---

## Anexo — Avaliação faseada (F1–F6) para follow-up

### Fase 1 — Integração Totvs RM

**Onda 1A:** Em grande parte já entregue (ramais, hub sistemas, holerite, benefícios). **Agora fechado:** banco de horas real + auditoria holerite.

**Onda 1B:** Férias e ponto estão na metade (leitura + solicitação); falta aprovação + write-back RM (bloqueio fornecedor). Movimentações (F1.8) é o item mais caro — precisa do motor de workflow primeiro.

### Fase 2 — Recrutamento & Seleção

Greenfield; só faz sentido depois de F1.8 (ou se RM R&S já existir). Validar módulo Vitae antes de construir ATS próprio.

### Fase 3 — Comunicados & rede social

Pode e deve antecipar — feed/comunicados/mood/aniversariantes já existem; falta fechar CMS (segmentação/agenda) e feedback.

### Fase 4 — Indicadores

Embed Power BI + RLS (não reinventar). Compass atual é mock.

### Fase 5 — SSO federado

Discovery primeiro; login atual é LDAP/JWT + MSAL pontual. Alerta DPO sobre sessão longa é pertinente.

### Fase 6 — Central de aprovações

Sem motor de aprovação vira agregador frágil; começar pelo inbox interno das aprovações que o próprio LioConecta já gera.
