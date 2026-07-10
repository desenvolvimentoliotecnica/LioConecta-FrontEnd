# UAT Saldo de férias (RM) — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_18-00-28`
- **Marker:** E2E-FERIAS-SALDO-1783717228157
- **Ator:** colaborador (leonardo.mendes@liotecnica.com.br)
- **AvailableDays:** 30
- **ExpiredDays:** 0
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-00-28`

## Fluxo validado

1. Login colaborador
2. GET /rh/leave/summary + /rh/leave/balance (sync RM)
3. Hub Férias e Ausências com **Mostrar valores** ativo
4. Modal Saldo de férias com números visíveis (não mascarados)

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-ferias-hub.png` | Hub com valores visíveis |
| 02 | `02-colaborador-modal-saldo-ferias.png` | Modal saldo (valores visíveis) |
| 03 | `03-colaborador-saldo-detalhe.png` | Detalhe períodos (valores visíveis) |

Gerado em: 2026-07-10T21:00:35.517Z
