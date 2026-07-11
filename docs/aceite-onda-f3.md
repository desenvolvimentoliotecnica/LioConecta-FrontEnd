# Aceite — F3 Comunicados & rede

**Data:** 10/07/2026  
**Status:** DONE (F3.1–F3.6 do gestor; US-INTRA-007 / Power BI permanece na Fase 4)

## Já existia (base)

| Item | Evidência |
|------|-----------|
| Feed social (posts, polls, celebrações) | `/` |
| Comunicados create/list/read | `/comunicados/*` |
| Mood check-in diário | card no feed |
| Aniversariantes / novos (API + legacy) | `/people/birthdays`, `/people/new-hires` |
| Grupos / comunidades | `/grupos` |

## Fechado nesta entrega

### F3.1 CMS maduro
- Status Draft / Scheduled / Published / Archived
- Segmentação por departamento (`AudienceType` + department IDs)
- Agendamento + worker `comunicado-schedule`
- PATCH / publish / archive / schedule / metrics
- RBAC `comunicados.publish.*` / `comunicados.manage`
- Editor FE: rascunho, agendar, audiência

### F3.2 Notícias
- `GET /feed/news`, create `PostType.News` (`news.manage` / `feed.manage`)
- Pin de posts (`feed.manage`)
- Hub `/noticias` com lista real + publicação

### F3.3 / F3.4 Pessoas
- Páginas React `/pessoas/aniversariantes` e `/pessoas/novos-colaboradores`
- Worker `new-hire-announce` (boas-vindas no feed a partir de `HireDate`)

### F3.5 Mood RH
- Métricas com série diária + breakdown por departamento (sem PersonId)
- UI `/servicos/clima` (`mood.analytics`)

### F3.6 Feedback formal
- API `/api/v1/feedback` + triagem RH
- UI `/feedback` e `/feedback/triagem`
- RBAC `feedback.submit` / `feedback.triage`

## UAT

| Fluxo | Resultado | Pasta |
|-------|-----------|-------|
| F3 consolidado | PASSOU | `e2e/evidence/f3-comunicados-rede-uat/2026-07-10_20-11-49` |

Spec: `e2e/f3-comunicados-rede-uat.spec.ts`

## Fora de escopo

- Fase 4 indicadores Power BI (US-INTRA-007)
- ATS / F2 (bem-vindo usa só HireDate sync)
- Anonimato criptográfico do mood
- Unificar posts de Grupos no feed global

## Mensagem ao gestor

> Fase 3 (Comunicados & rede) concluída no portal: CMS de comunicados com rascunho, agendamento e segmentação por área; notícias reais no hub/feed; aniversariantes e novos colaboradores em React com boas-vindas automáticas no feed; painel RH de clima (agregados); e canal formal de feedback com triagem. UAT/E2E com evidências passou. Indicadores por área (Power BI) seguem na Fase 4.
