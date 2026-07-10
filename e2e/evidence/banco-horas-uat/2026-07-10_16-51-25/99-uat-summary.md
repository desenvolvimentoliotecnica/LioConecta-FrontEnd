# UAT Banco de horas — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_16-51-25`
- **Marker:** E2E-BH-1783713085212
- **Atores:** colaborador (leonardo.mendes@liotecnica.com.br), gestor (e2e.ponto.gestor@liotecnica.com.br)
- **Saldo colaborador:** 32.65h
- **Período:** 16/06/2026 – 15/07/2026
- **Entradas extrato:** 48
- **Equipe gestor:** 163 colaborador(es)

## Fluxo validado

1. API self `GET /rh/leave/banco-horas` retorna dados RM (sem mock)
2. Modal Banco de Horas em Férias/Ausências
3. Gestor lista equipe em Gestão de ponto → aba Banco de horas
4. Detalhe do colaborador com saldo/extrato

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-ferias-hub.png` | Hub férias |
| 02 | `02-colaborador-modal-banco-horas.png` | Modal self |
| 04 | `04-gestor-gestao-ponto.png` | Gestão ponto |
| 05 | `05-gestor-aba-banco-horas.png` | Aba equipe |
| 06 | `06-gestor-detalhe-banco-horas.png` | Detalhe |

Gerado em: 2026-07-10T19:51:39.949Z
Pasta: `C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\e2e\evidence\banco-horas-uat\2026-07-10_16-51-25`
