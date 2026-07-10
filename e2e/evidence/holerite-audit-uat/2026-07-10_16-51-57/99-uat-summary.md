# UAT Auditoria holerite — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_16-51-57`
- **Marker:** E2E-PAY-AUDIT-1783713117992
- **Atores:** colaborador (leonardo.mendes@liotecnica.com.br), RH (e2e.ponto.gestor@liotecnica.com.br)
- **Competência acessada:** 2026-07
- **Eventos no access-log:** 2

## Fluxo validado

1. Colaborador visualiza holerite (API detail)
2. Colaborador baixa PDF
3. Eventos `Payslip` view/download gravados
4. Painel RH `/servicos/contracheque/acessos` lista acessos

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 03 | `03-colaborador-contracheque.png` | Hub contracheque |
| 06 | `06-rh-painel-acessos.png` | Painel RH |

Gerado em: 2026-07-10T19:52:08.692Z
Pasta: `C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\e2e\evidence\holerite-audit-uat\2026-07-10_16-51-57`
