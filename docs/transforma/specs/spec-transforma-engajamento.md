---
type: lioconecta-spec
specId: spec-transforma-engajamento
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-engajamento.md
pendingTasks: 20
totalTasks: 20
---

# LioTransforma — Engajamento (Oportunidades, Conhecimento, Feed, Gamificação)

> Pacote para implementação · EPIC-TF-08, TF-10, TF-11, TF-12, TF-13

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-engajamento` |
| Epic | EPIC-TF-08, TF-10, TF-11, TF-12, TF-13 |
| Release | R6 (oportunidades, UGC, feed, perfil) · R7 (gamificação) |
| Stories | US-TF-035 a US-TF-052 |
| Tasks pendentes | 20 / 20 |

## Objetivo

Conectar aprendizado a projetos, habilitar UGC, feed inteligente, gamificação e perfil integrado.

## Motor de recomendação

```
TrailCompleted(capabilities[]) + UserCapabilities[] → OpportunityMatch(score)
Score = |intersection(required, user)| / |required|
```

## API

```
GET    /transforma/opportunities/recommended
GET    /transforma/opportunities
POST   /transforma/opportunities
POST   /transforma/opportunities/{id}/apply
PATCH  /transforma/opportunities/{id}/applications/{appId}
GET    /transforma/knowledge?q=&tags=
POST   /transforma/knowledge
GET    /transforma/knowledge/{id}
GET    /transforma/feed/personalized
GET    /transforma/badges/mine
GET    /transforma/badges/catalog
GET    /transforma/profile/{userId}/summary
```

## Tasks

### Oportunidades (R6)

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-035a | US-TF-035 | Cards oportunidade com match de skills | [ ] |
| TS-FE-TF-036a | US-TF-036 | Candidatura "Quero participar" | [ ] |
| TS-FE-TF-037a | US-TF-037 | Gestor publicar oportunidade | [ ] |
| TS-BE-TF-038a | US-TF-038 | Motor matching capabilities | [ ] |

### Conhecimento UGC (R6)

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-043a | US-TF-043 | Editor publicação (TipTap) + tags | [ ] |
| TS-FE-TF-044a | US-TF-044 | Feed conhecimentos com busca | [ ] |
| TS-FE-TF-045a | US-TF-045 | Integração post feed global | [ ] |
| TS-FE-TF-046a | US-TF-046 | Fila moderação curador | [ ] |
| TS-BE-TF-043a | US-TF-043 | CRUD knowledge + moderação | [ ] |

### Feed inteligente (R6)

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-047a | US-TF-047 | Feed personalizado home LioTransforma | [ ] |
| TS-FE-TF-048a | US-TF-048 | Botão celebrar conclusão colega | [ ] |
| TS-FE-TF-049a | US-TF-049 | Seção recomendações na home | [ ] |
| TS-BE-TF-047a | US-TF-047 | Aggregation eventos para feed | [ ] |

### Gamificação (R7)

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-BE-TF-050a | US-TF-050 | Engine badges + regras automáticas | [ ] |
| TS-FE-TF-050a | US-TF-050 | Notificação + post ao conquistar badge | [ ] |
| TS-FE-TF-051a | US-TF-051 | Galeria conquistas + progresso | [ ] |

### Perfil integrado (R6)

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-052a | US-TF-052 | Seções LioTransforma em `pessoas-perfil.js` | [ ] |
| TS-BE-TF-052a | US-TF-052 | API summary perfil transforma | [ ] |

## Badges e regras

| Badge | Critério |
|-------|----------|
| Multiplicador | 10 conhecimentos publicados |
| Inovador | 5 desafios com participação |
| Aprendizado Contínuo | 10 trilhas concluídas |
| Mentor | 5 mentorias concluídas |
| Transformador | 3 iniciativas participadas |
| Explorador Digital | 3 trilhas academia Digital |

## Integração perfil

Estender `docs/pessoas-perfil.md` abas:
- Capacidades (★), Badges, Certificações, Conteúdos, Projetos transformação
