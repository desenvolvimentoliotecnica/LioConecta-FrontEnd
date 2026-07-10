# UAT Saldo de férias (RM) — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_17-57-37`
- **Marker:** E2E-FERIAS-SALDO-1783717057830
- **Ator:** colaborador (leonardo.mendes@liotecnica.com.br)
- **AvailableDays:** 30
- **ExpiredDays:** 0
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_17-57-37`

## Fluxo validado

1. Login colaborador
2. GET /rh/leave/summary + /rh/leave/balance (sync RM)
3. Hub Férias e Ausências
4. Modal Saldo de férias com períodos e vencimento

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-ferias-hub.png` | Hub férias |
| 02 | `02-colaborador-modal-saldo-ferias.png` | Modal saldo |
| 03 | `03-colaborador-saldo-detalhe.png` | Detalhe períodos |

Gerado em: 2026-07-10T20:57:55.955Z
