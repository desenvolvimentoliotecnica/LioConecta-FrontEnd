<!-- generated-by: gsd-doc-writer -->

# Página de Perfil de Colaborador (`pessoas-perfil.html`)

Documentação de referência para desenvolvedores e produto sobre a página de perfil completo no módulo **Pessoas** da intranet LioConecta.

| Artefato | Caminho |
|----------|---------|
| Página | `pessoas-perfil.html` |
| Estilos | `assets/pessoas-perfil.css` |
| Lógica / render | `assets/pessoas-perfil.js` (`ProfilePage`) |
| Dados mock | `data/pessoas-perfis.json` (schema **v2**) |
| Gerador de dados | `scripts/generate-pessoas-perfis.py` |
| Rebuild da página (snippets) | `scripts/build-pessoas-perfil-page.py` |
| Modal rápido (organograma) | `assets/org-profile-modal.js` |

### Legenda de maturidade

| Símbolo | Significado |
|---------|-------------|
| **JSON** | Campo presente em `pessoas-perfis.json` |
| **UI** | Renderizado em `pessoas-perfil.html` via `assets/pessoas-perfil.js` |
| **Planejado** | Comportamento de produto ainda não implementado (integrações externas ou backend) |

---

## 1. Visão geral e objetivo

A página de perfil é o **cartão de visita digital** de cada colaborador na intranet. Consolida identidade profissional, contato, histórico, competências e atividade recente.

**Objetivos de produto:**

- Permitir que colaboradores encontrem e conheçam colegas (cargo, área, contato, bio).
- Oferecer visão hierárquica (gestor, subordinados, breadcrumb no organograma).
- Servir como destino do modal “Ver perfil completo” no organograma e, futuramente, do diretório, feed e grupos.
- Diferenciar visibilidade de dados corporativos vs dados pessoais sensíveis (RH vs colega).
- Integrar reconhecimentos, projetos, grupos, documentos e comunicações em um hub único.

**Estado atual:** página funcional com `fetch` de JSON v2 e render dinâmico em `assets/pessoas-perfil.js`. Abas, sidebar enriquecida, hero com ações (Teams, Agendar, vCard, imprimir), mini-organograma, peers, badges, banner de aniversário, visibilidade RH mock (`ProfilePage.setViewerRole`) e estatísticas clicáveis estão **implementados na UI**. Usuário logado no topbar permanece fixo (“Maria Silva”) — RBAC real aguarda backend.

---

## 2. URL e parâmetros

### Rota base

```
pessoas-perfil.html?id={slug}
```

| Parâmetro | Obrigatório | Tipo | Descrição |
|-----------|-------------|------|-----------|
| `id` | Sim | `string` ou `number` | Slug (`simone-alves`) ou `orgChartId` numérico (`13`). |

### Resolução do perfil

```javascript
const person = data.people.find(entry =>
  entry.id === profileId || String(entry.orgChartId) === profileId
);
```

- Slug: minúsculas, sem acentos, hífens (`Júlio Schwartzman` → `julio-schwartzman`).
- `id` ausente ou inválido → `#profile-error` (“Colaborador não encontrado”).

### URLs de exemplo

| Perfil | URL |
|--------|-----|
| CEO | `pessoas-perfil.html?id=julio-schwartzman` |
| Analista de Marketing | `pessoas-perfil.html?id=simone-alves` |
| Por orgChartId | `pessoas-perfil.html?id=13` |

### Parâmetros relacionados

| Origem | URL | Status |
|--------|-----|--------|
| Organograma → modal → perfil | `pessoas-perfil.html?id={slug}` | **UI** |
| Perfil → organograma | `pessoas-organograma.html?focus={slug}` | **UI** |
| Diretório → perfil | `pessoas-perfil.html?id={slug}` | **Planejado** (diretório usa `href="#"`) |
| Impressão | Botão “Imprimir” + `@media print` em `pessoas-perfil.css` | **UI** |

---

## 3. Schema JSON completo

Arquivo: `data/pessoas-perfis.json` — **version 2**, **25 colaboradores**, `updatedAt: "2026-07-04"`.

### Raiz

| Campo | Tipo | Exemplo | Descrição |
|-------|------|---------|-----------|
| `version` | `number` | `2` | Versão do schema |
| `updatedAt` | `string` | `"2026-07-04"` | Data da geração |
| `people` | `Person[]` | `[...]` | Lista de perfis |

### `Person` — identidade e hierarquia

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `id` | `string` | `"simone-alves"` | ✓ | ✓ (URL, links) |
| `orgChartId` | `number` | `13` | ✓ | ✓ (lookup) |
| `name` | `string` | `"Simone Alves"` | ✓ | ✓ |
| `title` | `string` | `"Analista de Conteúdo"` | ✓ | ✓ |
| `dept` | `string` | `"Marketing"` | ✓ | ✓ |
| `deptId` | `string` | `"marketing"` | ✓ | — |
| `img` | `string` | `"avatar-maria-silva.png"` | ✓ | ✓ |
| `tags` | `string[]` | `["member"]` | ✓ | ✓ (badges: CEO, Liderança, Colaborador) |
| `managerId` | `string \| null` | `"camila-rocha"` | ✓ | ✓ |
| `managerName` | `string \| null` | `"Camila Rocha"` | ✓ | ✓ |

### `contact`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `email` | `string` | `"simone.alves@liotecnica.com.br"` | ✓ | ✓ |
| `phone` | `string` | `"(19) 32158"` | ✓ | ✓ |
| `location` | `string` | `"Campinas, SP · Marketing"` | ✓ | ✓ |
| `teams` | `string` | `"@Simone Alves"` | ✓ | ✓ (deep link Teams) |

### Texto e presença

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `admission` | `string` | `"jan de 2021"` | ✓ | ✓ |
| `bio` | `string` | Resumo curto | ✓ | ✓ (fallback do painel Sobre) |
| `aboutMe` | `string` | Texto expandido em 1ª pessoa | ✓ | ✓ (painel Sobre) |
| `pronouns` | `string` | `"Ele/Dele"` | ✓ | ✓ (hero) |
| `availability` | `Availability` | ver abaixo | ✓ | ✓ (sidebar + contato) |
| `links` | `object` | `{ linkedin, github?, portfolio? }` | ✓ | ✓ (aba Visão geral) |
| `roleTenure` | `RoleTenure` | ver abaixo | ✓ | ✓ (stat “Anos no cargo”) |

#### `Availability`

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `workModel` | `string` | `"Híbrido"` — `Presencial`, `Híbrido`, `Remoto` |
| `schedule` | `string` | `"9h–18h"` |
| `timezone` | `string` | `"America/Sao_Paulo"` |
| `floor` | `string` | `"3º andar"` |
| `room` | `string` | `"Marketing · Sala 302"` |

#### `RoleTenure`

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `years` | `number` | `5` |
| `since` | `string` | `"jan de 2021"` |
| `title` | `string` | `"Analista de Conteúdo"` |

### `personal` (dados sensíveis)

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `fullName` | `string` | `"Simone Alves"` | ✓ | ✓ |
| `birthDate` | `string` | `"11 de julho de 1984"` | ✓ | ✓ |
| `birthMonth` | `number` | `7` | — (opcional) | ✓ (banner de aniversário) |
| `birthDay` | `number` | `11` | — (opcional) | ✓ (banner de aniversário) |
| `cpf` | `string` | `"***.***.***-58"` | ✓ | ✓ |
| `rg` | `string` | `"11.158.958-8"` | ✓ | ✓ |
| `maritalStatus` | `string` | `"União estável"` | ✓ | ✓ |
| `nationality` | `string` | `"Brasileira"` | ✓ | ✓ |
| `visibility` | `string` | `"public"` ou `"rh-only"` | ✓ | ✓ (`canViewRhData` + `setViewerRole`) |

~25% dos perfis têm `visibility: "rh-only"` (gerador: `seed % 4 == 0`).

### Competências, formação e carreira

#### `skills[]` (objeto com nível)

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `name` | `string` | `"Conteúdo"` | ✓ | ✓ |
| `level` | `number` | `5` (escala 1–5) | ✓ | ✓ (barra de progresso) |
| `endorsements` | `number` | `14` | ✓ | ✓ |

#### `education[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `degree` | `string` | `"Marketing Digital"` | ✓ | ✓ (aba Carreira) |
| `institution` | `string` | `"ESPM"` | ✓ | ✓ |
| `period` | `string` | `"2013–2017"` | ✓ | ✓ |
| `type` | `string` | `"pos"` | ✓ | ✓ |
| `note` | `string` | `"Pós-graduação"` | ✓ | ✓ |

#### `certifications[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `name` | `string` | `"Google Analytics Certification"` | ✓ | ✓ (aba Carreira) |
| `issuer` | `string` | `"Google"` | ✓ | ✓ |
| `year` | `string` | `"2024"` | ✓ | ✓ |
| `type` | `string` | `"certificacao"` | ✓ | ✓ |

#### `languages[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `name` | `string` | `"Português"` | ✓ | ✓ (aba Visão geral) |
| `level` | `string` | `"Nativo"` | ✓ | ✓ |

#### `history[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `date` | `string` | `"2021"` | ✓ | ✓ (aba Carreira) |
| `title` | `string` | `"Analista de Conteúdo"` | ✓ | ✓ |
| `dept` | `string` | `"Marketing"` | ✓ | ✓ |
| `type` | `string` | `"atual"` | ✓ | ✓ |
| `note` | `string` | `"Cargo atual na LioConecta."` | ✓ | ✓ |

### Projetos, grupos e reconhecimentos

#### `projects[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `id` | `string` | `"proj-rebrand"` | ✓ | ✓ (aba Carreira) |
| `name` | `string` | `"Rebranding LioTécnica"` | ✓ | ✓ |
| `role` | `string` | `"Coordenador"` | ✓ | ✓ |
| `status` | `string` | `"ativo"` ou `"concluído"` | ✓ | ✓ |
| `since` | `string` | `"jan de 2024"` | ✓ | ✓ |

#### `groups[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `id` | `string` | `"grupo-marketing"` | ✓ | ✓ (sidebar) |
| `name` | `string` | `"Marketing Interno"` | ✓ | ✓ |
| `role` | `string` | `"Membro"` | ✓ | ✓ |
| `members` | `number` | `16` | ✓ | ✓ |

#### `recognitions[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `date` | `string` | `"2026-06-25"` | ✓ | ✓ (aba Atividade) |
| `author` | `string` | `"Camila Rocha"` | ✓ | ✓ |
| `authorId` | `string` | `"camila-rocha"` | ✓ | ✓ (link perfil) |
| `title` | `string` | `"Espírito colaborativo"` | ✓ | ✓ |
| `detail` | `string` | Texto do reconhecimento | ✓ | ✓ |
| `feedUrl` | `string` | `"intranet-wireframe.html#post-020"` | ✓ | ✓ (link “Ver no feed”) |

### Documentos, comunicações e atividade

#### `documents[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `title` | `string` | `"Manual do Colaborador"` | ✓ | ✓ (aba Documentos) |
| `type` | `string` | `"manual"` | ✓ | ✓ |
| `url` | `string` | `"documentos-manuais-procedimentos.html"` | ✓ | ✓ |
| `date` | `string` | `"2026-05-15"` | ✓ | ✓ |

#### `communications[]`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `title` | `string` | `"Campanha de segurança..."` | ✓ | ✓ (aba Documentos) |
| `type` | `string` | `"urgente"` | ✓ | ✓ |
| `date` | `string` | `"2026-05-10"` | ✓ | ✓ |
| `url` | `string` | `"comunicados-urgentes.html"` | ✓ | ✓ |

#### `interactions[]` (activity stream)

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `date` | `string` | `"2026-06-27"` | ✓ | ✓ (aba Atividade) |
| `type` | `string` | `"recognition"` | ✓ | ✓ |
| `title` | `string` | `"Reconhecimento no feed"` | ✓ | ✓ |
| `detail` | `string` | Descrição | ✓ | ✓ |
| `icon` | `string` | `"fa-solid fa-gift"` | ✓ | ✓ |
| `feedUrl` | `string` | `"intranet-wireframe.html#post-019"` | ✓ | ✓ (card clicável) |

### Mentor, buddy e stats

#### `mentor` / `buddy` (opcionais)

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `id` | `string` | `"camila-rocha"` | ✓ | ✓ (sidebar) |
| `name` | `string` | `"Camila Rocha"` | ✓ | ✓ |
| `since` | `string` | `"jan de 2021"` | ✓ | ✓ |

Regras do gerador (`enrich_mentor_buddy`):

- Admissão ≥ 2024: recebe `buddy` (colega do mesmo dept) + `mentor` (diretor).
- Demais membros: `mentor` = gestor direto.
- CEO não recebe mentor/buddy.

#### `stats`

| Campo | Tipo | Exemplo | JSON | UI |
|-------|------|---------|------|-----|
| `tenureYears` | `number` | `5` | ✓ | ✓ |
| `directReports` | `number` | `0` | ✓ | ✓ (clicável → Visão geral) |
| `groups` | `number` | `2` | ✓ | ✓ (clicável → Visão geral) |
| `recognitions` | `number` | `8` | ✓ | ✓ (clicável → Atividade) |
| `documentsCount` | `number` | `2` | ✓ | — (não exibido como stat) |
| `projectsCount` | `number` | `1` | ✓ | ✓ (clicável → Carreira) |

### Campos derivados na UI (não persistidos no JSON)

| Conceito | Origem na UI | Descrição |
|----------|--------------|-----------|
| `peers` | `managerId` + lista `people` | Colegas com mesmo gestor (`renderPeers`) |
| Badges hero | `tags[]` | Mapeamento `ceo` → CEO, `director` → Liderança, `member` → Colaborador |
| Mini-organograma | hierarquia + `people` | Cadeia gestores + link `?focus=` |
| Pessoas relacionadas | mesmo `dept` | Até 5 chips na aba Visão geral |
| Banner aniversário | `personal.birthMonth` / `birthDay` | UI pronta; gerador v2 ainda exporta só `birthDate` |

### Exemplo completo (trecho — Simone Alves)

```json
{
  "id": "simone-alves",
  "orgChartId": 13,
  "name": "Simone Alves",
  "title": "Analista de Conteúdo",
  "dept": "Marketing",
  "pronouns": "Ele/Dele",
  "availability": {
    "workModel": "Híbrido",
    "schedule": "9h–18h",
    "timezone": "America/Sao_Paulo",
    "floor": "3º andar",
    "room": "Marketing · Sala 302"
  },
  "skills": [
    { "name": "Conteúdo", "level": 5, "endorsements": 14 }
  ],
  "projects": [
    {
      "id": "proj-rebrand",
      "name": "Rebranding LioTécnica",
      "role": "Coordenador",
      "status": "ativo",
      "since": "jan de 2024"
    }
  ],
  "groups": [
    { "id": "grupo-marketing", "name": "Marketing Interno", "role": "Membro", "members": 16 }
  ],
  "recognitions": [
    {
      "date": "2026-06-16",
      "author": "Camila Rocha",
      "authorId": "camila-rocha",
      "title": "Espírito colaborativo",
      "detail": "Destaque por apoiar colegas...",
      "feedUrl": "intranet-wireframe.html#post-020"
    }
  ],
  "mentor": {
    "id": "camila-rocha",
    "name": "Camila Rocha",
    "since": "jan de 2021"
  },
  "personal": {
    "fullName": "Simone Alves",
    "birthDate": "11 de julho de 1984",
    "visibility": "public"
  }
}
```

---

## 4. Seções da UI

Layout: `profile-layout` (sidebar 280px + coluna principal com abas). Cores por departamento via CSS variables em `assets/pessoas-perfil.css`. Render centralizado em `ProfilePage.init()` (`assets/pessoas-perfil.js`).

### Matriz de funcionalidades

| Funcionalidade | Status | Detalhe |
|----------------|--------|---------|
| Abas (Visão geral, Carreira, Atividade, Documentos) | **UI** | `setupTabs()` — troca sem reload |
| Hero (avatar, nome, cargo, dept, pronouns) | **UI** | `#profile-hero` |
| Badges (`tags` → CEO / Liderança / Colaborador) | **UI** | `renderHeroBadges()` |
| Banner de aniversário | **UI** | `#profile-birthday-banner` — requer `birthMonth`/`birthDay` |
| Mini-organograma (cadeia hierárquica) | **UI** | `#profile-mini-org` + link `?focus=` |
| Peers (colegas do time) | **UI** | `#profile-peers` — derivado de `managerId` |
| Grupos | **UI** | `#profile-groups` → `grupos-meus-grupos.html` |
| Subordinados diretos | **UI** | `#profile-reports` |
| Mentor / Buddy | **UI** | `#profile-mentor` |
| Disponibilidade | **UI** | `#profile-availability` |
| Stats clicáveis (troca de aba) | **UI** | `data-tab-target` em `#profile-stats` |
| Competências (nome + nível + endossos) | **UI** | `#profile-skills` |
| Idiomas, links, pessoas relacionadas | **UI** | Aba Visão geral |
| Projetos, formação, certificações, histórico | **UI** | Aba Carreira |
| Reconhecimentos + interações (feed linkado) | **UI** | Aba Atividade |
| Documentos + comunicados | **UI** | Aba Documentos |
| vCard + QR modal | **UI** | `#profile-vcard-modal` — download `.vcf` |
| Impressão | **UI** | `#profile-print-btn` + `@media print` |
| Teams (chat deep link) | **UI** | `#profile-teams-btn` |
| Agendar (Outlook compose) | **UI** | `#profile-schedule-btn` |
| Organograma com `?focus=` | **UI** | Perfil e organograma (`focusOrgChartNode`) |
| Visibilidade RH (`personal.visibility`) | **UI** | `ProfilePage.setViewerRole('rh')` |
| Mensagem interna | **Planejado** | Alert placeholder em `#profile-message-btn` |
| Diretório → perfil | **Planejado** | Links do diretório ainda em `#` |

### Breadcrumb — **UI**

`Início / Pessoas / Organograma / [gestores] / {nome}` — links para perfis ascendentes.

### Hero (`profile-hero`) — **UI**

| Elemento | ID | Dados / ação |
|----------|-----|--------------|
| Avatar | `#profile-avatar` | `img` + cor do dept |
| Nome / cargo / dept / pronomes | `#profile-name`, `#profile-role`, `#profile-dept`, `#profile-pronouns` | |
| Badges | `#profile-badges` | `tags[]` mapeados |
| E-mail | `#profile-email-btn` | `mailto:` |
| Teams | `#profile-teams-btn` | Deep link M365 |
| Agendar | `#profile-schedule-btn` | Outlook compose |
| Mensagem | `#profile-message-btn` | Alert placeholder |
| vCard | `#profile-vcard-btn` | Abre modal QR + download |
| Imprimir | `#profile-print-btn` | `window.print()` |
| Organograma | `#profile-org-link` | `pessoas-organograma.html?focus={id}` |

### Banner de aniversário — **UI**

`#profile-birthday-banner` acima do hero quando `personal.birthMonth` e `personal.birthDay` indicam data próxima (lógica demo em jul/2026). Link para `pessoas-aniversariantes.html`.

### Mini-organograma — **UI**

`#profile-mini-org` — cadeia de gestores com avatares + atalho ao organograma com foco.

### Sidebar (cards) — **UI**

| Card | ID | JSON / origem |
|------|-----|---------------|
| Resumo (stats clicáveis) | `#profile-stats` | `stats`, `roleTenure` |
| Disponibilidade | `#profile-availability` | `availability` |
| Dados pessoais | `#profile-personal` | `personal` (filtrado por `canViewRhData`) |
| Contato | `#profile-contact` | `contact` + admissão + gestor |
| Mentor / Buddy | `#profile-mentor` | `mentor` / `buddy` |
| Colegas do time | `#profile-peers` | derivado (`managerId`) |
| Subordinados | `#profile-reports` | derivado (`managerId`) |
| Grupos | `#profile-groups` | `groups[]` |

### Abas principais — **UI**

| Aba | `data-tab` | Conteúdo |
|-----|------------|----------|
| Visão geral | `overview` | Sobre, competências, idiomas, links, pessoas relacionadas |
| Carreira | `career` | Projetos, formação, certificações, histórico |
| Atividade | `activity` | Reconhecimentos + interações (stream unificado) |
| Documentos | `documents` | Documentos + comunicados |

### Modal vCard — **UI**

`#profile-vcard-modal` — QR (mailto) + botão “Baixar vCard” (`.vcf` via `buildVCard()`).

### Cores por departamento

| Departamento | Stroke (avatar) |
|--------------|-----------------|
| Executiva | `#a78bfa` |
| Produto | `#93c5fd` |
| Recursos Humanos | `#f9a8d4` |
| Marketing | `#86efac` |
| TI | `#67e8f9` |
| Comercial | `#fdba74` |
| Financeiro | `#fcd34d` |

---

## 5. Permissões e visibilidade de dados pessoais

### Implementação atual (mock)

- **RBAC simulado** via `ProfilePage.setViewerRole(role)` — valores: `'colleague'` (padrão), `'rh'`, `'manager'`, `'self'`.
- `canViewRhData(person)` retorna `true` se `VIEWER_ROLE === 'rh'` **ou** `personal.visibility !== 'rh-only'`.
- Perfis `rh-only`: card “Dados pessoais” exibe aviso restrito + apenas nome para visitante `colleague`.
- CPF vem mascarado no JSON; RG e data de nascimento visíveis quando permitido.

**Teste no console:**

```javascript
ProfilePage.setViewerRole('rh');
location.reload(); // re-fetch necessário após trocar role
```

### Comportamento pretendido (produção)

| Dado | Colega | Gestor | RH | Self |
|------|--------|--------|-----|------|
| Nome, cargo, dept, bio, aboutMe | Sim | Sim | Sim | Sim |
| E-mail, telefone, Teams, localização | Sim | Sim | Sim | Sim |
| `availability`, `links` públicos | Sim | Sim | Sim | Sim |
| Competências, formação, histórico, projetos | Sim | Sim | Sim | Sim |
| `skills.endorsements` | Sim | Sim | Sim | Sim |
| Nome completo | Sim | Sim | Sim | Sim |
| Aniversário (dia/mês) | Se próximo | Sim | Sim | Sim |
| CPF, RG, estado civil | Não | Não | Sim | Sim |
| `personal.visibility === "rh-only"` | Ocultar card inteiro | Parcial | Sim | Sim |

**Implementação backend sugerida:**

1. API retorna `personal` filtrado por `viewer.role` (`colleague`, `manager`, `hr`, `self`).
2. Frontend usa `personal.visibility` como hint, mas não como única barreira.
3. Respeitar `rh-only` já presente no gerador para testes de UI.

Perfis com `rh-only` para teste: `carlos-mendes`, `patricia-nunes`, `una-ferreira`, `xavier-dias`, `lucas-ferreira`.

---

## 6. Integrações

### Organograma

| Fluxo | Detalhe | Status |
|-------|---------|--------|
| Nó → modal | Menu “Ver perfil” → `OrgProfileModal` | **UI** |
| Modal → perfil | `pessoas-perfil.html?id={slug}` | **UI** |
| Perfil → organograma | Botão hero + breadcrumb + mini-org | **UI** |
| Foco | `pessoas-organograma.html?focus={slug}` | **UI** (`focusOrgChartNode`) |
| Subordinados | `people.filter(p => p.managerId === person.id)` | **UI** |

### Feed

- `recognitions[].feedUrl` e `interactions[].feedUrl` apontam para `intranet-wireframe.html#post-NNN`.
- **UI:** links clicáveis nos painéis de Atividade.
- **Planejado:** filtro no feed real por menção.

### Grupos

- `groups[]` no JSON; `stats.groups` no resumo; interação tipo `group`.
- **UI:** links para `grupos-meus-grupos.html` (ou `group.url` quando presente).

### Documentos

- `documents[].url` → páginas `documentos-*.html`.
- **UI:** aba Documentos.

### Microsoft Teams

- **UI:** `#profile-teams-btn` → `https://teams.microsoft.com/l/chat/0/0?users={email}`

### Outlook / Agendar

- **UI:** `#profile-schedule-btn` → compose no Outlook Web.

### vCard / QR — **UI**

Modal com QR (mailto) e download `.vcf` (nome, e-mail, telefone, cargo, org).

### Impressão — **UI**

Botão “Imprimir” + `@media print` oculta topbar, sidebars, abas e ações; exibe todos os painéis de aba.

### Aniversariantes

- `personal.birthDate` compartilhado com `pessoas-aniversariantes.html`.
- **UI:** banner no perfil quando `birthMonth`/`birthDay` configurados.

---

## 7. Como regenerar dados

### Atualizar `pessoas-perfis.json`

```bash
python scripts/generate-pessoas-perfis.py
```

O script (v2):

1. Monta 25 perfis a partir da árvore organizacional.
2. Gera slugs, contatos, skills com nível, certificações, idiomas, projetos, grupos, reconhecimentos, documentos, comunicações.
3. Aplica `enrich_mentor_buddy()` para mentor/buddy.
4. Define `personal.visibility` alternando `public` / `rh-only`.
5. Escreve `version: 2`, `updatedAt` do dia.

Saída: `Wrote 25 profiles to .../data/pessoas-perfis.json`

### Reconstruir HTML a partir de snippets

```bash
python scripts/build-pessoas-perfil-page.py
```

### Servir localmente

```bash
python -m http.server 8080
# http://localhost:8080/pessoas-perfil.html?id=simone-alves
```

`fetch` não funciona via `file://`.

---

## 8. Roadmap / extensões para backend real

| P | Item | Notas |
|---|------|-------|
| P0 | `GET /people/{id}/profile` | Substituir JSON; incluir `viewerContext` |
| P0 | RBAC em `personal` | Honrar `visibility`; filtro server-side (UI mock pronta) |
| P0 | Sincronia organograma | Mesmo `orgChartId` / `managerId` da fonte RH |
| P1 | Links do diretório → perfil | `pessoas-perfil.html?id={slug}` |
| P1 | Mensagem interna real | Substituir alert do botão Mensagem |
| P1 | `birthMonth`/`birthDay` no gerador | Alimentar banner a partir de `birthDate` |
| P2 | Feed real | Deep links e filtro por menção |
| P2 | Graph API (Teams presence, availability) | Substituir links estáticos |
| P2 | Endorsements de skills | Colegas endossam via intranet |
| P3 | Edição self-service | Bio, foto — workflow RH |

**Fontes sugeridas:** RH/ERP (hierarquia, pessoal), Azure AD/M365 (contato, Teams), intranet (grupos, feed, documentos).

---

## 9. Guia de teste manual

### Pré-requisitos

1. Servidor HTTP na raiz do repositório.
2. `data/pessoas-perfis.json` presente (`version: 2`).
3. Avatares referenciados em `img` existem na raiz.
4. Scripts carregados: `assets/pessoas-perfil.css`, `assets/pessoas-perfil.js`.

### Cenários principais

| # | Cenário | URL / ação | Esperado |
|---|---------|------------|----------|
| 1 | Membro Marketing | `?id=simone-alves` | Hero Simone, badge Colaborador, dept verde, gestor Camila, mentor Camila, 0 reportes, 2 grupos |
| 2 | CEO | `?id=julio-schwartzman` | Badge CEO, 6 reportes, sem gestor, abas completas |
| 3 | orgChartId | `?id=13` | Igual simone-alves |
| 4 | Slug inválido | `?id=nao-existe` | Erro + link organograma |
| 5 | Sem id | `pessoas-perfil.html` | Erro |
| 6 | Breadcrumb | CEO → subordinado | Cadeia hierárquica clicável |
| 7 | E-mail / Teams / Agendar | Botões hero | mailto, chat Teams, compose Outlook |
| 8 | vCard / QR | Botão vCard | Modal com QR + download `.vcf` |
| 9 | Impressão | Botão Imprimir | Layout limpo (sem topbar/sidebars) |
| 10 | Organograma inverso | Org → Ver perfil → completo | Mesmo slug; botão Organograma com `?focus=` |
| 11 | Foco organograma | Perfil → Organograma | Nó destacado via `?focus={slug}` |
| 12 | Abas | Clicar Carreira / Atividade / Documentos | Painéis alternam sem reload |
| 13 | Stats clicáveis | Clicar “Reconhecimentos” ou “Projetos” | Aba correspondente ativa |
| 14 | Competências | Qualquer perfil | Nome + barra de nível + endossos |
| 15 | rh-only (colega) | `?id=carlos-mendes` | Card dados pessoais restrito |
| 16 | rh-only (RH) | Console: `setViewerRole('rh')` + reload | Dados pessoais completos |
| 17 | Buddy recente | `?id=una-ferreira` | Buddy + mentor na sidebar |
| 18 | Peers | `?id=simone-alves` | Colegas do time (mesmo gestor) |
| 19 | Feed links | Aba Atividade | “Ver no feed” e interações linkam wireframe |
| 20 | Aniversário | Perfil com `birthMonth`/`birthDay` em julho | Banner visível acima do hero |
| 21 | Responsivo | largura &lt; 960px | Layout empilhado |

### Checklist UI (implementado)

- [x] Abas funcionam sem reload
- [x] Skills mostram nome + nível + endorsements
- [x] `feedUrl` abre post no feed (wireframe)
- [x] `personal.visibility: rh-only` oculta dados para colega (mock)
- [x] Organograma recebe `?focus=`
- [x] vCard válido; print limpo
- [x] Stats clicáveis trocam aba
- [ ] `generate-pessoas-perfis.py` exporta `birthMonth`/`birthDay` (pendente gerador)

---

## Referência — 25 slugs

| id | Nome | dept |
|----|------|------|
| `julio-schwartzman` | Júlio Schwartzman | Executiva |
| `carlos-mendes` | Carlos Mendes | Produto |
| `maria-silva` | Maria Silva | Produto |
| `ricardo-souza` | Ricardo Souza | Produto |
| `julia-santos` | Julia Santos | Produto |
| `patricia-nunes` | Patricia Nunes | Recursos Humanos |
| `renata-gomes` | Renata Gomes | Recursos Humanos |
| `helena-prado` | Helena Prado | Recursos Humanos |
| `diego-martins` | Diego Martins | Recursos Humanos |
| `camila-rocha` | Camila Rocha | Marketing |
| `fernanda-lima` | Fernanda Lima | Marketing |
| `thiago-barros` | Thiago Barros | Marketing |
| `simone-alves` | Simone Alves | Marketing |
| `igor-martins` | Igor Martins | TI |
| `tiago-nunes` | Tiago Nunes | TI |
| `william-souza` | William Souza | TI |
| `rafael-costa` | Rafael Costa | TI |
| `joao-pereira` | João Pereira | Comercial |
| `una-ferreira` | Una Ferreira | Comercial |
| `xavier-dias` | Xavier Dias | Comercial |
| `lucas-ferreira` | Lucas Ferreira | Comercial |
| `marcos-vieira` | Marcos Vieira | Financeiro |
| `vicente-lima` | Vicente Lima | Financeiro |
| `natalia-rocha` | Natália Rocha | Financeiro |
| `bianca-alves` | Bianca Alves | Financeiro |

---

*Alinhado a `pessoas-perfil.html`, `assets/pessoas-perfil.js`, `assets/pessoas-perfil.css` e `data/pessoas-perfis.json` v2 (`updatedAt: 2026-07-04`).*
