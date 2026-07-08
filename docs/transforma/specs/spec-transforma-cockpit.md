---
type: lioconecta-spec
specId: spec-transforma-cockpit
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-cockpit.md
pendingTasks: 10
totalTasks: 10
---

# LioTransforma — Gestor & Cockpit Diretoria

> Pacote para implementação · EPIC-TF-14 + EPIC-TF-15

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-cockpit` |
| Epic | EPIC-TF-14, EPIC-TF-15 |
| Release | R7 (gestor) · R8 (cockpit) |
| Stories | US-TF-015, US-TF-017, US-TF-022 + cockpit |
| Tasks pendentes | 10 / 10 |

## Objetivo

Dashboard gestor para capacidades, compliance e PDI do time; cockpit executivo para diretoria.

## API

```
GET    /transforma/insights/team?teamId=
GET    /transforma/insights/team/compliance
GET    /transforma/insights/team/pdi
GET    /transforma/insights/team/knowledge-risks
GET    /transforma/insights/cockpit
GET    /transforma/insights/cockpit/export?format=pdf|xlsx
```

## Dashboard gestor

```
Meu Time — Equipe de Tecnologia (18 colaboradores)

Índice de capacidades: ████████████████░░ 82%

Principais forças          Principais gaps
🟢 Desenvolvimento         🔴 Arquitetura Cloud
🟢 Colaboração             🔴 Segurança
🟢 Resolução de Problemas  🟡 Dados e Analytics

Compliance treinamentos: 16/18 em dia
PDIs ativos: 14/18 | Média progresso: 58%
```

## Cockpit diretoria

```
Capability & Transformation Cockpit

Digitalização             72%
Liderança                 68%
Dados e Analytics         61%
Inovação                  58%
Excelência Operacional    81%

4.281 horas de aprendizado
68% colaboradores ativos
342 capacidades desenvolvidas
128 gaps críticos
42 comunidades ativas
18 iniciativas de transformação
R$ 3,4M impacto potencial
```

## Tasks

### Frontend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-014a | US-TF-014 | `TransformaManagerDashboardPage` | [ ] |
| TS-FE-TF-014b | — | Widget forças/gaps do time | [ ] |
| TS-FE-TF-014c | — | Widget compliance treinamentos | [ ] |
| TS-FE-TF-014d | — | Widget PDIs do time | [ ] |
| TS-FE-TF-015a | US-TF-015 | Cockpit `TransformaCockpitPage` (R8) | [ ] |
| TS-FE-TF-015b | — | Gráficos Recharts por domínio | [ ] |
| TS-FE-TF-015c | — | Botão exportar PDF/Excel | [ ] |

### Backend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-BE-TF-014a | — | Aggregation team capabilities | [ ] |
| TS-BE-TF-014b | — | Knowledge risk (SPOF detection) | [ ] |
| TS-BE-TF-015a | — | Aggregation org-wide cockpit metrics | [ ] |
| TS-BE-TF-015b | — | Export PDF/Excel endpoint | [ ] |

### QA

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-QA-TF-014a | — | Caso: gestor vê apenas seu time | [ ] |
| TS-QA-TF-015a | — | Caso: cockpit restrito a `transforma:director` | [ ] |

## RBAC

- `transforma:manager` → dashboard time
- `transforma:director` → cockpit completo
- Dados agregados anonimizados quando < 5 colaboradores em célula

## Referências

- `src/components/pages/AnalyticsPage.tsx` (padrão de charts)
- Recharts já no projeto
