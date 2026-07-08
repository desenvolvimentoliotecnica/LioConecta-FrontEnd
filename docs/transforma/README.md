# LioTransforma — Documentação Ágil

> Ecossistema corporativo de aprendizado, desenvolvimento de capacidades e transformação da Liotécnica.

**Status:** Discovery / Planejamento  
**Versão:** 1.0  
**Data:** 08/07/2026  
**Origem:** Visão estratégica da Diretoria de Capacidade e Transformação Digital

---

## Definição de produto

O **LioTransforma** é o ecossistema corporativo de aprendizado, desenvolvimento de capacidades e transformação da Liotécnica. Integrado à intranet social LioConecta, conecta pessoas, conhecimento, competências, comunidades e iniciativas estratégicas, promovendo aprendizado contínuo e aplicação prática para acelerar a evolução das pessoas e do negócio.

**Loop de valor central:**

```
Aprender → Desenvolver Capacidades → Aplicar → Transformar → Compartilhar
```

---

## Índice de documentos

| # | Documento | Público | Conteúdo |
|---|-----------|---------|----------|
| 01 | [Visão Executiva](./01-visao-executiva.md) | Diretoria, sponsors | Problema, visão, proposta de valor, KPIs |
| 02 | [Arquitetura e Integração](./02-arquitetura-integracao.md) | Arquitetura, dev | Menu, rotas, integrações LioConecta, stack |
| 03 | [Épicos](./03-epicos.md) | PO, gestores | 15 épicos com objetivos e escopo |
| 04 | [Histórias de Usuário](./04-historias-usuario.md) | PO, dev, QA | 52 histórias com critérios de aceite |
| 05 | [Backlog Priorizado](./05-backlog-priorizado.md) | PO, time | MoSCoW, dependências, estimativas |
| 06 | [Releases e Fases](./06-releases-fases.md) | Todos | R5–R8, demos, marcos |
| 07 | [Mapa de Capacidades](./07-mapa-capacidades.md) | RH, Transformação | Taxonomia organizacional de skills |
| — | [Protótipos de tela](#prototipos) *(HTML)* | Diretoria, UX | 9 mockups navegáveis no mini-site |
| — | [Specs de implementação](./specs/) | Dev | Pacotes técnicos por domínio |

---

## Épicos (resumo)

| ID | Nome | Prioridade |
|----|------|------------|
| EPIC-TF-01 | Fundação do Módulo | Must |
| EPIC-TF-02 | Aprendizado (LMS/LXP) | Must |
| EPIC-TF-03 | Capacidades & Skills | Must |
| EPIC-TF-04 | PDI Integrado | Must |
| EPIC-TF-05 | Academias Corporativas | Should |
| EPIC-TF-06 | Transformação em Ação | Should |
| EPIC-TF-07 | Desafios de Transformação | Should |
| EPIC-TF-08 | Oportunidades | Should |
| EPIC-TF-09 | Mentoria & Especialistas | Could |
| EPIC-TF-10 | Compartilhamento de Conhecimento | Should |
| EPIC-TF-11 | Feed Social Inteligente | Should |
| EPIC-TF-12 | Gamificação Corporativa | Could |
| EPIC-TF-13 | Perfil Integrado | Should |
| EPIC-TF-14 | Visão do Gestor | Should |
| EPIC-TF-15 | Cockpit Diretoria | Could |

---

## Convenções de nomenclatura

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| Epic | `EPIC-TF-NN` | `EPIC-TF-02` |
| User Story | `US-TF-NNN` | `US-TF-012` |
| Task | `TS-{FE\|BE\|QA\|DOC}-TF-NNNa` | `TS-FE-TF-012a` |
| Spec | `spec-transforma-*` | `spec-transforma-aprendizado` |
| Rota base | `/transforma/*` | `/transforma/explorar/trilhas` |
| Fase roadmap | `F5` | LioTransforma (2027 H2+) |

---

## Integrações LioConecta existentes

| Módulo | Integração |
|--------|------------|
| Feed social (`/`) | Conclusões, desafios, conhecimentos, celebrações |
| Perfil Pessoas (`/pessoas/perfil`) | Capacidades, badges, certificações, projetos |
| Grupos/Comunidades (`/grupos`) | Comunidades de aprendizado (`GROUP_TYPE_COMUNIDADE`) |
| Biblioteca (`/documentos/biblioteca`) | Conteúdos de treinamento, documentos |
| Notificações (SignalR) | Prazos, atribuições, mentorias, desafios |
| Auth/RBAC (`src/api/auth.ts`) | `canAccessTransformaModule`, papéis gestor/RH/admin |

---

## Mini-site HTML (navegação)

Abra a documentação em formato navegável com renderização dos MDs:

```bash
npm run docs:transforma
```

Acesse **http://localhost:4174** — hub com sidebar, busca, modo reunião, **9 protótipos de tela** e links entre documentos.

Windows — abrir direto (requer servidor para carregar MDs):

```powershell
npm run docs:transforma
```

---

## Próximos passos

1. Apresentar [01-visao-executiva.md](./01-visao-executiva.md) à diretoria para validação
2. Priorizar MVP (R5) com EPIC-TF-01, 02, 03, 04
3. Registrar épicos e histórias em `docs/roadmap/assets/roadmap-data.js` (fase F5)
4. Spike técnico: shell do módulo seguindo padrão Loop/Pulse/Compass
