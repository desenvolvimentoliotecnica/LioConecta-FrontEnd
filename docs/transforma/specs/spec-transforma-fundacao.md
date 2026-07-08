---
type: lioconecta-spec
specId: spec-transforma-fundacao
roadmapVersion: 1.0
exportedAt: 2026-07-08T15:30:00.000Z
source: docs/transforma/specs/spec-transforma-fundacao.md
pendingTasks: 12
totalTasks: 12
---

# LioTransforma — Fundação do Módulo

> Pacote para implementação · EPIC-TF-01

## Metadados

| Campo | Valor |
|-------|-------|
| specId | `spec-transforma-fundacao` |
| Epic | EPIC-TF-01 |
| Release | R5 |
| Stories | US-TF-001, US-TF-002, US-TF-003 |
| Tasks pendentes | 12 / 12 |

## Objetivo

Estabelecer infraestrutura do módulo LioTransforma no LioConecta seguindo padrão Loop/Pulse/Compass.

## Escopo

- `TransformaShell`, `TransformaAccessGate`, navigation config
- Rotas `/transforma/*` em App.tsx
- RBAC `canAccessTransformaModule`
- Home "Para Você" com layout e placeholders
- Telemetry e sitemap

## Tasks

### Frontend

| ID | Story | Tipo | Título | Done |
|----|-------|------|--------|------|
| TS-FE-TF-001a | US-TF-001 | FE | Criar `TransformaShell.tsx` com outlet e layout | [ ] |
| TS-FE-TF-001b | US-TF-001 | FE | Criar `TransformaAccessGate.tsx` com RBAC | [ ] |
| TS-FE-TF-001c | US-TF-001 | FE | Registrar rotas em `App.tsx` | [ ] |
| TS-FE-TF-002a | US-TF-002 | FE | Criar `src/config/transforma/navigation.ts` com menu completo | [ ] |
| TS-FE-TF-002b | US-TF-002 | FE | Sidebar do módulo com submenus expansíveis | [ ] |
| TS-FE-TF-003a | US-TF-003 | FE | `TransformaHomePage.tsx` — cards pendentes, PDI, atalhos | [ ] |
| TS-FE-TF-003b | US-TF-003 | FE | Placeholders para feed inteligente (R6) | [ ] |

### Backend

| ID | Story | Tipo | Título | Done |
|----|-------|------|--------|------|
| TS-BE-TF-001a | US-TF-001 | BE | Endpoint health `/transforma/health` | [ ] |
| TS-BE-TF-001b | US-TF-001 | BE | Roles `transforma:*` no sistema de permissões | [ ] |

### Documentação

| ID | Story | Tipo | Título | Done |
|----|-------|------|--------|------|
| TS-DOC-TF-001a | US-TF-001 | DOC | Atualizar `navigation.ts`, `sitemap.ts`, `routeCatalog.ts` | [ ] |
| TS-DOC-TF-001b | US-TF-001 | DOC | Badge `page-maturity.ts` → `soon` inicial | [ ] |

### QA

| ID | Story | Tipo | Título | Done |
|----|-------|------|--------|------|
| TS-QA-TF-001a | US-TF-001 | QA | Caso: usuário autorizado acessa `/transforma` | [ ] |
| TS-QA-TF-001b | US-TF-001 | QA | Caso: usuário sem role vê acesso negado | [ ] |

## Referências

- `src/components/loop/LoopShell.tsx`
- `src/config/loop/navigation.ts`
