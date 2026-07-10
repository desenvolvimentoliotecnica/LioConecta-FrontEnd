# UAT Grupos (comunidades) — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_16-07-35`
- **Marker:** `E2E-GRUPOS-1783710455189`
- **GroupId:** `dde7b7d2-a691-4c53-8d66-813fdc3cc0eb`
- **Atores:** colaborador/gestor simulado (Leonardo; ApproverId reassigned para single-login)


## Fluxo validado

1. Hub Grupos
2. Criar grupo (sempre pendente)
3. Meus grupos — status pendente
4. Reassign ApproverId → Leonardo (fixture UAT)
5. Aprovar em /grupos/aprovacoes
6. Página do grupo — mural (post)
7. Tópicos (criar + responder)
8. Membros
9. Join em grupo seed (quando disponível)

## Observações

- Entrada em grupo ativo é livre (sem aprovação de membership).
- Aprovação de **criação** é do gestor direto; neste run o ApproverId foi reatribuído para permitir UAT com um único login.
