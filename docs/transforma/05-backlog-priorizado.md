# LioTransforma — Backlog Priorizado

> Priorização MoSCoW com dependências e estimativas de alto nível.

---

## 1. Framework de priorização

| Classificação | Significado |
|---------------|-------------|
| **Must** | MVP — sem isso o módulo não entrega valor |
| **Should** | Alta prioridade pós-MVP — diferencial competitivo |
| **Could** | Desejável — entrega incremental de valor |
| **Won't (now)** | Fora do escopo das próximas 4 releases |

---

## 2. MoSCoW por épico

| Epic | Classificação | Justificativa |
|------|---------------|---------------|
| EPIC-TF-01 Fundação | **Must** | Pré-requisito técnico |
| EPIC-TF-02 Aprendizado | **Must** | Core LMS — treinamentos obrigatórios |
| EPIC-TF-03 Capacidades | **Must** | Diferencial estratégico da diretoria |
| EPIC-TF-04 PDI Integrado | **Must** | Dor principal: PDI esquecido |
| EPIC-TF-05 Academias | **Should** | Organização de conteúdo |
| EPIC-TF-06 Transformação em Ação | **Should** | Visão estratégica do diretor |
| EPIC-TF-07 Desafios | **Should** | Engajamento e inovação |
| EPIC-TF-08 Oportunidades | **Should** | Learning → Skills → Projetos |
| EPIC-TF-09 Mentoria | **Could** | Complexidade de matching |
| EPIC-TF-10 Conhecimento UGC | **Should** | Quebra de silos |
| EPIC-TF-11 Feed Inteligente | **Should** | Engajamento na home |
| EPIC-TF-12 Gamificação | **Could** | Reforço de cultura |
| EPIC-TF-13 Perfil Integrado | **Should** | Conexão social |
| EPIC-TF-14 Visão Gestor | **Should** | Valor para liderança |
| EPIC-TF-15 Cockpit Diretoria | **Could** | Analytics avançado |

---

## 3. MVP (Release R5) — Must Have

### Escopo mínimo viável

```
Fundação + Aprendizado básico + Capacidades + PDI + Compliance
```

| # | Item | Story | Estimativa |
|---|------|-------|------------|
| 1 | Shell, nav, RBAC, rotas | US-TF-001, 002 | 5 SP |
| 2 | Home "Para Você" básica | US-TF-003 | 3 SP |
| 3 | Catálogo e consumo de conteúdos | US-TF-004, 005 | 8 SP |
| 4 | Trilhas com progresso | US-TF-006 | 8 SP |
| 5 | Treinamentos obrigatórios + compliance | US-TF-008 | 5 SP |
| 6 | Admin CRUD conteúdos/trilhas | US-TF-012 | 8 SP |
| 7 | Mapa e minhas capacidades | US-TF-013, 014 | 8 SP |
| 8 | Evolução por trilha | US-TF-016 | 3 SP |
| 9 | PDI CRUD + vinculação + progresso | US-TF-018, 019, 020 | 8 SP |
| 10 | Certificados e histórico | US-TF-010, 011 | 5 SP |
| 11 | Quiz básico | US-TF-007 | 5 SP |
| 12 | Backend API domínio transforma | — | 13 SP |
| | **Total MVP** | | **~79 SP** |

*Estimativa: 4–5 sprints de 2 semanas (time de 2 dev FE + 1 BE + 0.5 QA)*

---

## 4. Release R6 — Should Have

| # | Item | Stories | Estimativa |
|---|------|---------|------------|
| 1 | Academias corporativas | US-TF-023–025 | 8 SP |
| 2 | Transformação em Ação | US-TF-026–029 | 13 SP |
| 3 | Desafios de transformação | US-TF-030–034 | 13 SP |
| 4 | Oportunidades | US-TF-035–038 | 8 SP |
| 5 | Conhecimento UGC | US-TF-043–046 | 8 SP |
| 6 | Feed inteligente | US-TF-047–049 | 8 SP |
| 7 | Perfil integrado | US-TF-052 | 5 SP |
| 8 | Eventos (workshops/webinars) | US-TF-009 | 5 SP |
| | **Total R6** | | **~68 SP** |

---

## 5. Release R7 — Could Have

| # | Item | Stories | Estimativa |
|---|------|---------|------------|
| 1 | Mentoria e especialistas | US-TF-039–042 | 13 SP |
| 2 | Gamificação | US-TF-050–051 | 5 SP |
| 3 | Dashboard gestor | US-TF-015, 022 + TF-14 | 13 SP |
| 4 | Skills da organização | US-TF-017 | 8 SP |
| | **Total R7** | | **~39 SP** |

---

## 6. Release R8 — Could Have

| # | Item | Estimativa |
|---|------|------------|
| 1 | Cockpit diretoria | 13 SP |
| 2 | Analytics avançado e exportação | 8 SP |
| 3 | Integração LMS externo (spike) | 5 SP |
| 4 | SCORM tracking | 8 SP |
| | **Total R8** | **~34 SP** |

---

## 7. Matriz de dependências

| Item | Depende de |
|------|------------|
| Trilhas | Fundação, CRUD conteúdos |
| PDI vinculado | Trilhas, PDI CRUD |
| Capacidades evidenciadas | Trilhas, Capacidades |
| Academias | CRUD conteúdos, Trilhas |
| Oportunidades | Capacidades, Trilhas |
| Feed inteligente | Conhecimento, Trilhas, Desafios |
| Perfil integrado | Capacidades, Certificados, Badges |
| Dashboard gestor | Capacidades, PDI, Compliance |
| Cockpit | Dashboard gestor, Skills org, Transformação |
| Mentoria | Capacidades, Perfil |
| Gamificação | Conhecimento, Desafios, Trilhas |

---

## 8. Ordem de implementação sugerida (sprints)

### Sprint 1–2: Fundação + Backend core
- US-TF-001, 002, 003
- API: contents, trails, enrollments
- RBAC transforma

### Sprint 3–4: Aprendizado
- US-TF-004, 005, 006, 007, 012
- Player, progresso, quiz

### Sprint 5: Compliance + Certificados
- US-TF-008, 010, 011
- Notificações de prazo

### Sprint 6–7: Capacidades + PDI
- US-TF-013, 014, 016, 018, 019, 020, 021
- Mapa visual, PDI vivo

### Sprint 8+: R6 features
- Academias → Transformação → Desafios → Oportunidades → UGC → Feed

---

## 9. Riscos de escopo

| Risco | Mitigação no backlog |
|-------|---------------------|
| MVP muito grande | Quiz e eventos podem ir para R6 se necessário |
| Backend greenfield | Priorizar API mínima; mock no FE para paralelizar |
| Conteúdo vazio no launch | Migrar biblioteca "treinamentos" + 3 trilhas piloto |
| PDI sem integração RH | MVP standalone; integração RM em release futura |

---

## 10. Definição de Pronto (DoD)

- [ ] Código revisado e mergeado
- [ ] Testes unitários nos hooks e componentes críticos
- [ ] Rota registrada em sitemap, navigation, routeCatalog
- [ ] RBAC validado
- [ ] Responsivo (desktop + tablet)
- [ ] UAT com product owner
- [ ] Documentação de API atualizada
