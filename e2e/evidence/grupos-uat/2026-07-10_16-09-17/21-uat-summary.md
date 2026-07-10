# UAT Grupos (comunidades) — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_16-09-17`
- **Marker:** `E2E-GRUPOS-1783710557504`
- **GroupId:** `95dd03be-34eb-4890-b9a8-3f2ae6eddf3e`
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
