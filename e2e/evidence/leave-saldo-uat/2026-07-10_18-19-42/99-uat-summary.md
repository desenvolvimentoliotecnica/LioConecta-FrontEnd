# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: FALHOU

- **Run:** `2026-07-10_18-19-42`
- **Marker:** E2E-FERIAS-SALDO-CLARITY-1783718382706
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-19-42`

### Saldos

- leonardo.mendes@liotecnica.com.br: liberados=0, aquisição=30, vencidos=0

## Erro

```
[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/completa o período aquisitivo|ainda em aquisição/i)
Expected: visible
Error: strict mode violation: getByText(/completa o período aquisitivo|ainda em aquisição/i) resolved to 2 elements:
    1) <p role="status" class="leave-detail__hint">30 dia(s) ainda em aquisição — poderão ser solici…</p> aka getByText('30 dia(s) ainda em aquisição')
    2) <li>Você completa o período aquisitivo em 12/04/2027.…</li> aka getByText('Você completa o período')

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for getByText(/completa o período aquisitivo|ainda em aquisição/i)[22m

```

## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: 2026-07-10T21:19:45.784Z
