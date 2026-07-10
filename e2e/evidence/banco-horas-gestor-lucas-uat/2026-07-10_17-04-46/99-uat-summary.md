# UAT Banco de horas — gestor Lucas (equipe direta)

## Resultado: PASSOU

- **Run:** `2026-07-10_17-04-46`
- **Marker:** E2E-BH-LUCAS-1783713886897
- **Gestor:** lucas.machado@liotecnica.com.br (LUCAS MUNIZ MACHADO)
- **PersonId:** 48e39073-7ff9-4db5-ab6a-f2abb928751f
- **Equipe (API):** 8 colaborador(es)
- **Diretos no organograma:** 8
- **Contraste:** UAT anterior com `e2e.ponto.gestor` (Key User RH) listava ~163 — escopo global RH, não equipe

## Fluxo validado

1. Test-user do Lucas ligado à Person real + papel **Manager** (escopo Team)
2. `GET /rh/ponto/banco-horas` retorna exatamente os diretos do organograma
3. Contagem UI = API = hierarchy (`8`)
4. Detalhe de um colaborador com saldo/extrato

## Membros da equipe

1. Davi Oliveira da Silva — 0h
2. ELTON DE FREITAS COSTA — -1.72h
3. Gabriel Victor Laudares Celso — 0h
4. Igor Cardoso de Araujo — 0h
5. Leonardo Sabino Mendes — 32.65h
6. Luiz Henrique Franco de Almeida — 0h
7. MARCOS RYUJI TONOOKA — -12.28h
8. Matheus Juvino Da Silva — 0h

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 03 | `03-gestor-gestao-ponto.png` | Gestão de ponto |
| 04 | `04-gestor-aba-banco-horas.png` | Aba equipe (só diretos) |
| 05 | `05-gestor-detalhe-banco-horas.png` | Detalhe saldo/extrato |

Gerado em: 2026-07-10T20:04:55.537Z
Pasta: `C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\e2e\evidence\banco-horas-gestor-lucas-uat\2026-07-10_17-04-46`
