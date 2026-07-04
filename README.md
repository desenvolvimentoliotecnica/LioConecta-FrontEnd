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
| `src/config/` | Navegação e registro de rotas |
| `public/` | Imagens, scripts legados (perfil, organograma) |
| `legacy/html/` | HTML estático original (referência) |

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

## Tag de snapshot pré-migração

```bash
git checkout pre-react-migration
```

Versão HTML estática antes da migração React.
