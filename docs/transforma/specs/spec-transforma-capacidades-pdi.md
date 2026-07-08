---
type: lioconecta-spec
specId: spec-transforma-capacidades-pdi
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-capacidades-pdi.md
pendingTasks: 18
totalTasks: 18
---

# LioTransforma — Capacidades & PDI

> Pacote para implementação · EPIC-TF-03 + EPIC-TF-04

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-capacidades-pdi` |
| Epic | EPIC-TF-03, EPIC-TF-04 |
| Release | R5 (capacidades + PDI) · R7 (gestor) |
| Stories | US-TF-013 a US-TF-022 |
| Tasks pendentes | 18 / 18 |

## Objetivo

Taxonomia de capacidades com mapa visual, auto-avaliação, evolução por trilhas e PDI vivo com ações vinculadas.

## Taxonomia

Ver [07-mapa-capacidades.md](../07-mapa-capacidades.md) — implementar em `src/config/transforma/capabilities.ts`.

## API

```
GET    /transforma/capabilities/map
GET    /transforma/capabilities/mine
PUT    /transforma/capabilities/mine/{capabilityId}
GET    /transforma/capabilities/organization?area=
POST   /transforma/capabilities/mine/{id}/validate  # gestor
GET    /transforma/pdi/current
POST   /transforma/pdi
PUT    /transforma/pdi/{id}
POST   /transforma/pdi/{id}/actions
PATCH  /transforma/pdi/actions/{actionId}
GET    /transforma/pdi/team  # gestor
```

## Tasks

### Frontend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-013a | US-TF-013 | `TransformaCapabilitiesPage` — mapa hierárquico | [ ] |
| TS-FE-TF-014a | US-TF-014 | `TransformaMyCapabilitiesPage` — seletor estrelas | [ ] |
| TS-FE-TF-016a | US-TF-016 | Listener conclusão trilha → update capability | [ ] |
| TS-FE-TF-018a | US-TF-018 | `TransformaPdiPage` — CRUD objetivo e ações | [ ] |
| TS-FE-TF-019a | US-TF-019 | Autocomplete vincular trilha/evento/oportunidade | [ ] |
| TS-FE-TF-020a | US-TF-020 | Barra progresso PDI + checklist visual | [ ] |
| TS-FE-TF-015a | US-TF-015 | UI validação gestor (R7) | [ ] |
| TS-FE-TF-017a | US-TF-017 | Heatmap skills organização (R7) | [ ] |
| TS-FE-TF-022a | US-TF-022 | Lista PDIs do time — gestor (R7) | [ ] |

### Backend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-BE-TF-013a | US-TF-013 | Seed taxonomia + GET map | [ ] |
| TS-BE-TF-014a | US-TF-014 | CRUD user capabilities | [ ] |
| TS-BE-TF-016a | US-TF-016 | Event handler trail completed → capability | [ ] |
| TS-BE-TF-018a | US-TF-018 | CRUD PDI + actions | [ ] |
| TS-BE-TF-021a | US-TF-021 | Scheduler notificações PDI | [ ] |
| TS-BE-TF-017a | US-TF-017 | Aggregation skills org (anonimizado) | [ ] |

### QA

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-QA-TF-016a | US-TF-016 | Caso: trilha Power BI → Dados ★★★★ evidenciado | [ ] |
| TS-QA-TF-019a | US-TF-019 | Caso: concluir trilha vinculada marca ação PDI ✓ | [ ] |
| TS-QA-TF-020a | US-TF-020 | Caso: 3/5 ações = 60% progresso | [ ] |

## Exemplo UI — PDI

```
Meu PDI 2027
Objetivo: Desenvolver capacidade de liderança técnica.

Ações
✓ Concluir trilha Liderança Técnica
✓ Participar de workshop de feedback
○ Acompanhar projeto estratégico
○ Realizar mentoria com especialista
○ Apresentar case interno

Progresso: ██████████████░░░░░░  65%
```
