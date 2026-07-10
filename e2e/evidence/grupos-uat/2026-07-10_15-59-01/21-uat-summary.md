# UAT Grupos (comunidades) — evidências

## Resultado: FALHOU

- **Run:** `2026-07-10_15-59-01`
- **Marker:** `E2E-GRUPOS-1783709941457`
- **GroupId:** `37098aa1-2200-41dc-af55-9054e335204c`
- **Atores:** colaborador/gestor simulado (Leonardo; ApproverId reassigned para single-login)
- **Erro:** [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m1[39m
Received: [31m0[39m

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
