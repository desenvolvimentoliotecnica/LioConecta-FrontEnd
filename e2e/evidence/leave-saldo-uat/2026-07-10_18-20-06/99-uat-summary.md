# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: FALHOU

- **Run:** `2026-07-10_18-20-06`
- **Marker:** E2E-FERIAS-SALDO-CLARITY-1783718406365
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-20-06`

### Saldos

- leonardo.mendes@liotecnica.com.br: liberados=0, aquisição=30, vencidos=0

## Erro

```
[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/Liberados para gozo/i)
Expected: visible
Error: strict mode violation: getByText(/Liberados para gozo/i) resolved to 3 elements:
    1) <div class="leave-stat__label">Dias liberados para gozo</div> aka getByText('Dias liberados para gozo', { exact: true })
    2) <span>…</span> aka getByText('Liberados para gozo: 0 dia(s)')
    3) <p role="status" class="leave-form__error">Não é possível solicitar férias sem dias liberado…</p> aka getByText('Não é possível solicitar fé')

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/Liberados para gozo/i)[22m

```

## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: 2026-07-10T21:20:09.446Z
