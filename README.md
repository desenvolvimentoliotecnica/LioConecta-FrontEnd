# LioConecta FrontEnd

Intranet corporativa LioConecta — React + Vite + React Router.

## Pré-requisitos

- Node.js 20+
- npm 10+

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `src/components/layout/` | Topbar, sidebars, menus (React) |
| `src/components/pages/` | Renderização das páginas migradas |
| `src/generated/pages/` | HTML/CSS extraídos dos wireframes |
| `src/config/` | Navegação, registro de rotas e **mapa do site** (`sitemap.ts`) |
| `public/` | Imagens, scripts legados (perfil, organograma) |
| `legacy/html/` | HTML estático original (referência) |

## Diretrizes

### Mapa do site

A página `/mapa-do-site` lista todo o ecossistema navegável do portal. **Sempre revise e atualize** [`src/config/sitemap.ts`](src/config/sitemap.ts) quando adicionar, remover ou renomear rotas, menus ou itens de sidebar. A regra completa está em [`.cursor/rules/sitemap-maintenance.mdc`](.cursor/rules/sitemap-maintenance.mdc).

## Rotas

26 páginas mapeadas 1:1 com os wireframes HTML anteriores. Exemplos:

- `/` — Feed (home)
- `/comunicados/oficiais`
- `/pessoas/diretorio`
- `/pessoas/perfil?id=maria-silva`
- `/servicos/beneficios`
- `/servicos/help-desk`
- `/servicos/solicitar-equipamento`
- `/servicos/acesso-sistemas`
- `/servicos/vpn-acesso-remoto`
- `/servicos/reservas-salas`
- `/servicos/reserva-veiculos`
- `/servicos/cracha-visitantes`
- `/servicos/encomendas-correios`
- `/servicos/limpeza`
- `/servicos/manutencao-predial`
- `/servicos/copiadora`
- `/servicos/estacionamento`
- `/servicos/refeitorio`
- `/servicos/climatizacao`
- `/servicos/gestao-residuos`
- `/servicos/declaracoes-certidoes`
- `/servicos/assinatura-digital`
- `/servicos/seguro-vida`
- `/servicos/canal-denuncias`
- `/servicos/contratos-minutas`
- `/servicos/lgpd-privacidade`
- `/servicos/codigo-conduta`
- `/servicos/due-diligence`
- `/servicos/procuracoes`
- `/servicos/consultoria-juridica`

## Tag de snapshot pré-migração

```bash
git checkout pre-react-migration
```

Versão HTML estática antes da migração React.
