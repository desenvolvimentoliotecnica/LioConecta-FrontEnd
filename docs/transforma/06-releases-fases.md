# LioTransforma — Releases e Fases

> Plano de entregas R5–R8 na fase F5 do roadmap LioConecta.

---

## Posicionamento no roadmap geral

| Fase existente | Período | Foco |
|----------------|---------|------|
| F1 | 2026-07 → 2026-09 | Consolidar o que funciona |
| F2 | 2026-09 → 2027-01 | RM transacional |
| F3 | 2027-01 → 2027-03 | Intranet e engajamento |
| F4 | 2027-02 → 2027-05 | Hub apps + ERP |
| **F5** | **2027-06 → 2028-03** | **LioTransforma** |

---

## Release R5 — MVP LioTransforma

| Campo | Valor |
|-------|-------|
| **Fase** | F5 |
| **Período estimado** | 2027 Q3 (Jul–Set) |
| **Sprints** | 5–6 |
| **Épicos** | TF-01, TF-02, TF-03, TF-04 |

### Nome
**"Aprender, Desenvolver, Evoluir"**

### Demo script (reunião com diretor)

1. Login colaborador → menu **LioTransforma** → home "Para Você"
2. **Explorar** → filtrar conteúdos → assistir vídeo → progresso salvo
3. **Trilha** "LGPD Essencial" → concluir módulos → quiz → certificado PDF
4. **Treinamento obrigatório** destacado com prazo → notificação
5. **Capacidades** → mapa visual → auto-avaliar "Dados e Analytics" ★★★
6. Concluir trilha Power BI → capacidade evolui para ★★★★ evidenciado
7. **Meu PDI 2027** → objetivo + ações vinculadas → progresso 65%
8. Admin → criar novo conteúdo e montar trilha

### Critérios de sucesso R5
- [ ] 3 trilhas piloto publicadas (LGPD, Onboarding, Power BI)
- [ ] 100% treinamentos obrigatórios rastreáveis
- [ ] PDI com ações vinculadas funcionando
- [ ] Mapa de capacidades com 2 domínios completos

---

## Release R6 — Transformação e Engajamento

| Campo | Valor |
|-------|-------|
| **Fase** | F5 |
| **Período estimado** | 2027 Q4 (Out–Dez) |
| **Sprints** | 4–5 |
| **Épicos** | TF-05, TF-06, TF-07, TF-08, TF-10, TF-11, TF-13 |

### Nome
**"Transformar e Compartilhar"**

### Demo script

1. **Academia Digital** → trilhas de IA e dados
2. **Transformação em Ação** → 3 iniciativas ativas → participar
3. **Desafio aberto** → enviar ideia → votar → formar equipe
4. Concluir trilha → **oportunidade recomendada** → "Quero participar"
5. **Publicar conhecimento** → case de IA → aparece no feed
6. Home **Para Você** → feed inteligente com celebrações
7. **Perfil** → capacidades, badges, certificações visíveis

### Critérios de sucesso R6
- [ ] 5 academias com conteúdo curado
- [ ] 1 desafio piloto com ≥ 20 ideias
- [ ] ≥ 10 conhecimentos publicados por colaboradores
- [ ] Feed inteligente ativo na home

---

## Release R7 — Gestão e Mentoria

| Campo | Valor |
|-------|-------|
| **Fase** | F5 |
| **Período estimado** | 2028 Q1 (Jan–Mar) |
| **Sprints** | 3–4 |
| **Épicos** | TF-09, TF-12, TF-14 |

### Nome
**"Liderar o Desenvolvimento"**

### Demo script

1. **Gestor** → dashboard do time → capacidades 82%, gaps em Cloud
2. Compliance treinamentos: 16/18 em dia
3. PDIs do time com progresso
4. **Mentoria** → buscar especialista Power BI → solicitar → aceitar
5. **Badges** → Multiplicador conquistado → post no feed
6. **Skills da organização** → heatmap por área

### Critérios de sucesso R7
- [ ] 5 gestores piloto usando dashboard
- [ ] 10 mentorias concluídas
- [ ] Sistema de badges ativo

---

## Release R8 — Cockpit Executivo

| Campo | Valor |
|-------|-------|
| **Fase** | F5 |
| **Período estimado** | 2028 Q1–Q2 |
| **Sprints** | 2–3 |
| **Épicos** | TF-15 |

### Nome
**"Capability & Transformation Cockpit"**

### Demo script

1. **Diretoria** → cockpit executivo
2. Capacidades organizacionais: Digitalização 72%, Excelência Operacional 81%
3. 4.281 horas de aprendizado · 68% colaboradores ativos
4. 128 gaps críticos · 18 iniciativas · R$ 3,4M impacto
5. Exportar PDF para reunião de diretoria

### Critérios de sucesso R8
- [ ] Cockpit com dados reais (não mock)
- [ ] Exportação PDF/Excel
- [ ] Apresentação validada pela diretoria

---

## Timeline visual

```
2027                    2028
Q3        Q4        Q1        Q2
├─ R5 ────┼─ R6 ────┼─ R7 ────┼─ R8 ──┤
  MVP       Transf.    Gestão    Cockpit
  5-6 sp    4-5 sp     3-4 sp    2-3 sp
```

---

## Conteúdo piloto para launch (R5)

| Academia | Trilha piloto | Tipo | Obrigatório |
|----------|---------------|------|-------------|
| Cultura | LGPD Essencial | Compliance | Sim |
| Cultura | Onboarding Liotécnica | Integração | Sim (novos) |
| Digital | Power BI Intermediário | Técnico | Não |
| Liderança | Feedback Efetivo | Soft skill | Não |
| Industrial | Segurança do Trabalho | Compliance | Sim |

---

## Integração com roadmap existente

Para registrar no `docs/roadmap/assets/roadmap-data.js`:

```js
// Fase
{ id: "F5", name: "LioTransforma — LMS/LXP e Transformação", sprints: "14–18", start: "2027-06", end: "2028-03" },

// Epic
{ id: "EPIC-TF", name: "LioTransforma", color: "#e11d48" },

// Release
{
  id: "R5",
  phase: "F5",
  name: "MVP LioTransforma — Aprender, Desenvolver, Evoluir",
  demo: [ /* ver acima */ ],
},
```

---

## Métricas por release

| Release | Métrica chave | Meta |
|---------|---------------|------|
| R5 | Colaboradores com PDI ativo | ≥ 30% |
| R5 | Compliance treinamentos obrigatórios | ≥ 90% |
| R6 | Ideias em desafios | ≥ 50 total |
| R6 | Conhecimentos publicados | ≥ 30 |
| R7 | Gestores usando dashboard | ≥ 10 |
| R7 | Mentorias concluídas | ≥ 20 |
| R8 | Diretoria usando cockpit mensalmente | Sim |
