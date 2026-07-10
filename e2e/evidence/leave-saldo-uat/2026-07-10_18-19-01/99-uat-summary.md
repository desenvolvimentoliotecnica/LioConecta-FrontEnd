# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: FALHOU

- **Run:** `2026-07-10_18-19-01`
- **Marker:** E2E-FERIAS-SALDO-CLARITY-1783718341293
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-19-01`

### Saldos

- leonardo.mendes@liotecnica.com.br: liberados=0, aquisição=30, vencidos=0

## Erro

```
[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('heading', { name: /Férias e Ausências/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByRole('heading', { name: /Férias e Ausências/i })[22m

```

## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: 2026-07-10T21:19:17.701Z
