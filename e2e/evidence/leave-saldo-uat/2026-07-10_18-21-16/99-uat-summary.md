# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_18-21-16`
- **Marker:** E2E-FERIAS-SALDO-CLARITY-1783718476682
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-21-16`

### Saldos

- leonardo.mendes@liotecnica.com.br: liberados=0, aquisição=30, vencidos=0
- elton.costa@liotecnica.com.br: liberados=0, aquisição=0, vencidos=30

## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: 2026-07-10T21:21:33.267Z
