---
type: lioconecta-spec
specId: spec-transforma-transformacao-desafios
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-transformacao-desafios.md
pendingTasks: 16
totalTasks: 16
---

# LioTransforma — Transformação & Desafios

> Pacote para implementação · EPIC-TF-06 + EPIC-TF-07

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-transformacao-desafios` |
| Epic | EPIC-TF-06, EPIC-TF-07 |
| Release | R6 |
| Stories | US-TF-026 a US-TF-034 |
| Tasks pendentes | 16 / 16 |

## Objetivo

Visibilidade de iniciativas estratégicas e pipeline de desafios colaborativos com ideias, votação e fases.

## Fluxo de desafio

```
Desafio → Ideias → Seleção → Experimentação → Piloto → Escala
```

## API

```
GET    /transforma/initiatives
GET    /transforma/initiatives/{id}
POST   /transforma/initiatives/{id}/join
POST   /transforma/admin/initiatives
GET    /transforma/challenges
GET    /transforma/challenges/{id}
POST   /transforma/challenges
PATCH  /transforma/challenges/{id}/phase
POST   /transforma/challenges/{id}/ideas
POST   /transforma/ideas/{id}/comments
POST   /transforma/ideas/{id}/vote
POST   /transforma/ideas/{id}/team
GET    /transforma/cases
POST   /transforma/cases
GET    /transforma/transformacao/dashboard  # KPIs
```

## Tasks

### Frontend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-026a | US-TF-026 | Dashboard Transformação em Ação + KPIs | [ ] |
| TS-FE-TF-026b | US-TF-026 | Cards iniciativas com progresso | [ ] |
| TS-FE-TF-027a | US-TF-027 | Botão participar + lista participantes | [ ] |
| TS-FE-TF-028a | US-TF-028 | Detalhe iniciativa — timeline, resultados | [ ] |
| TS-FE-TF-030a | US-TF-030 | Lista desafios com contadores | [ ] |
| TS-FE-TF-031a | US-TF-031 | Formulário enviar ideia | [ ] |
| TS-FE-TF-032a | US-TF-032 | Comentários + votação + ranking | [ ] |
| TS-FE-TF-033a | US-TF-033 | Admin transição de fases | [ ] |
| TS-FE-TF-034a | US-TF-034 | Admin publicar desafio | [ ] |
| TS-FE-TF-029a | US-TF-029 | Publicar case de transformação | [ ] |

### Backend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-BE-TF-026a | US-TF-026 | CRUD initiatives + participants | [ ] |
| TS-BE-TF-030a | US-TF-030 | CRUD challenges + phase machine | [ ] |
| TS-BE-TF-031a | US-TF-031 | CRUD ideas + votes | [ ] |
| TS-BE-TF-026b | US-TF-026 | Dashboard aggregation KPIs | [ ] |

### Integração feed

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-034b | US-TF-034 | Post feed ao publicar desafio | [ ] |
| TS-FE-TF-029b | US-TF-029 | Post feed ao publicar case | [ ] |

### QA

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-QA-TF-032a | US-TF-032 | Caso: voto único por desafio | [ ] |
| TS-QA-TF-033a | US-TF-033 | Caso: transição fase notifica participantes | [ ] |

## Exemplo card iniciativa

```
🤖 Automação com IA
Reduzir atividades manuais em processos administrativos
Status: Em execução | Progresso: ████████░░ 78%
8 participantes | [ Ver iniciativa ]
```
