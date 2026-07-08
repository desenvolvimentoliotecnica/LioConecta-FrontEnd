---
type: lioconecta-spec
specId: spec-transforma-aprendizado
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-aprendizado.md
pendingTasks: 24
totalTasks: 24
---

# LioTransforma — Aprendizado (LMS/LXP)

> Pacote para implementação · EPIC-TF-02

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-aprendizado` |
| Epic | EPIC-TF-02 |
| Release | R5 |
| Stories | US-TF-004 a US-TF-012 |
| Tasks pendentes | 24 / 24 |

## Objetivo

Catálogo de aprendizado multi-formato com trilhas, quizzes, treinamentos obrigatórios, certificados e histórico.

## Modelo de dados

```
LearningContent { id, title, type, duration, mediaUrl, academyId, mandatory, deadline, capabilities[] }
LearningTrail { id, title, modules[], certificateTemplate, capabilities[] }
Enrollment { id, userId, contentId|trailId, progress, status, completedAt }
Quiz { id, contentId, questions[], passingScore, maxAttempts }
Certificate { id, userId, trailId, issuedAt, verificationCode }
Event { id, title, type, date, capacity, registrations[] }
```

## API

```
GET    /transforma/contents?q=&type=&mandatory=
GET    /transforma/contents/{id}
POST   /transforma/contents/{id}/enroll
PATCH  /transforma/enrollments/{id}/progress
GET    /transforma/trails
GET    /transforma/trails/{id}
POST   /transforma/trails/{id}/enroll
POST   /transforma/quizzes/{id}/submit
GET    /transforma/certificates
GET    /transforma/certificates/{id}/pdf
GET    /transforma/history
GET    /transforma/events?upcoming=true
POST   /transforma/events/{id}/register
POST   /transforma/admin/contents
PUT    /transforma/admin/contents/{id}
POST   /transforma/admin/trails
```

## Tasks

### Frontend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-FE-TF-004a | US-TF-004 | `TransformaExplorePage` — catálogo com filtros | [ ] |
| TS-FE-TF-004b | US-TF-004 | Hook `useTransformaLearning` — list contents | [ ] |
| TS-FE-TF-005a | US-TF-005 | Player vídeo + progresso automático | [ ] |
| TS-FE-TF-005b | US-TF-005 | Viewer PDF e player podcast | [ ] |
| TS-FE-TF-005c | US-TF-005 | Microlearning cards sequenciais | [ ] |
| TS-FE-TF-006a | US-TF-006 | `TransformaTrailsPage` — lista com progresso | [ ] |
| TS-FE-TF-006b | US-TF-006 | Detalhe trilha — módulos sequenciais | [ ] |
| TS-FE-TF-007a | US-TF-007 | Componente quiz com feedback | [ ] |
| TS-FE-TF-008a | US-TF-008 | Badge obrigatório + lista destacada home | [ ] |
| TS-FE-TF-008b | US-TF-008 | Contagem regressiva e status compliance | [ ] |
| TS-FE-TF-009a | US-TF-009 | `TransformaEventsPage` — calendário | [ ] |
| TS-FE-TF-010a | US-TF-010 | `TransformaCertificatesPage` + download PDF | [ ] |
| TS-FE-TF-011a | US-TF-011 | `TransformaHistoryPage` — timeline | [ ] |
| TS-FE-TF-012a | US-TF-012 | Admin CRUD conteúdos com upload | [ ] |
| TS-FE-TF-012b | US-TF-012 | Admin montagem de trilhas (drag modules) | [ ] |

### Backend

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-BE-TF-004a | US-TF-004 | CRUD contents + storage mídia | [ ] |
| TS-BE-TF-006a | US-TF-006 | CRUD trails + enrollments | [ ] |
| TS-BE-TF-007a | US-TF-007 | Quiz engine + scoring | [ ] |
| TS-BE-TF-008a | US-TF-008 | Mandatory assignments + compliance report | [ ] |
| TS-BE-TF-010a | US-TF-010 | Certificate generation PDF | [ ] |
| TS-BE-TF-008b | US-TF-008 | Notificações prazo (7d, 1d) via notificationHub | [ ] |

### QA

| ID | Story | Título | Done |
|----|-------|--------|------|
| TS-QA-TF-005a | US-TF-005 | Caso: progresso vídeo salvo ao 90% | [ ] |
| TS-QA-TF-006a | US-TF-006 | Caso: trilha 100% emite certificado | [ ] |
| TS-QA-TF-008a | US-TF-008 | Caso: treinamento vencido aparece como atrasado | [ ] |

## Migração de conteúdo existente

- Associar itens `area: "treinamentos"` de `biblioteca-corporativa.json` como conteúdos iniciais
- 3 trilhas piloto: LGPD, Onboarding, Power BI
