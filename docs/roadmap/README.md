# LioConecta — Roadmap Ágil (mini-site local)

Backlog, especificações, histórias, tasks, QA e releases do portal LioConecta — baseado na diretriz do gestor (Jul/2026).

## Abrir localmente (reunião)

```bash
# Recomendado — a partir da raiz do repo
npm run docs:roadmap
```

Abre em **http://localhost:4173**

### Alternativas

```bash
npx --yes serve docs/roadmap -p 4173
```

Windows — abrir direto no browser (sem servidor):

```powershell
start docs/roadmap/index.html
```

## Estrutura

| Página | Conteúdo |
|--------|----------|
| `index.html` | Hub — checklist gestor, progresso, navegação |
| `01-executivo.html` | Resumo para gestor |
| `02-backlog.html` | Histórias e tasks (filtros) |
| `03-specs-rm.html` | Specs Integração RM |
| `04-specs-intranet.html` | Specs Portal Intranet |
| `05-specs-auth-hub.html` | Specs Auth + Hub + ERP |
| `06-qa.html` | Plano QA + DoD |
| `07-releases.html` | Releases R1–R4 + demo script |
| `08-matriz-maturidade.html` | Código atual vs meta |

## Dados compartilhados

- `assets/roadmap-data.js` — fonte única (histórias, **tasks por spec**, checklist)
- `assets/roadmap.css` — estilos
- `assets/roadmap.js` — nav, busca, filtros, contadores

## Exportar spec para implementação (MD)

Cada bloco de spec tem o botão **Exportar MD desta spec**. No topo da página, **Exportar todas specs** gera um único arquivo.

O Markdown inclui:
- Frontmatter (`specId`, tasks pendentes, versão)
- Especificação funcional (texto da spec)
- Histórias de usuário com checkboxes `[ ]` / `[x]`
- Tasks agrupadas por FE / BE / QA / DOC
- Tabela resumo + checklist pós-implementação

### Atualizar após implementar

Edite `assets/roadmap-data.js`:

```js
{ id: "TS-FE-RM-004a", specId: "spec-ajuste-ponto", story: "US-RM-004", type: "FE", title: "...", phase: "F2", done: true },
```

Para stories concluídas, ajuste `status: "integrated"` ou `done: true` na entrada em `stories`.

Reexporte o MD e envie ao agente — ele verá o que falta pelos `[ ]` restantes.

## Tasks por spec

Cada bloco em **Specs RM / Intranet / Auth** termina com tabela de tasks (FE, BE, QA, DOC) linkadas à user story e fase. Total atual: ver contador no hub ou backlog.

## Modo reunião

Botão **Modo reunião** na barra lateral — aumenta fonte e oculta colunas técnicas.

## Impressão

Cada página suporta impressão (`Ctrl+P`). A sidebar é ocultada automaticamente.
