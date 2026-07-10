# UAT Saldo de férias (liberado vs aquisição) — evidências

## Resultado: FALHOU

- **Run:** `2026-07-10_18-19-53`
- **Marker:** E2E-FERIAS-SALDO-CLARITY-1783718393994
- **Atores:** leonardo.mendes@liotecnica.com.br, elton.costa@liotecnica.com.br
- **Pasta:** `e2e\evidence\leave-saldo-uat\2026-07-10_18-19-53`

### Saldos

- leonardo.mendes@liotecnica.com.br: liberados=0, aquisição=30, vencidos=0

## Erro

```
locator.click: Error: strict mode violation: getByRole('button', { name: /Fechar/i }) resolved to 2 elements:
    1) <button type="button" aria-label="Fechar" class="pay-modal__close">…</button> aka getByLabel('Fechar')
    2) <button type="button" class="pay-modal__btn pay-modal__btn--ghost">Fechar</button> aka getByText('Fechar')

Call log:
[2m  - waiting for getByRole('button', { name: /Fechar/i })[22m

```

## Fluxo validado

1. Login de cada colaborador
2. GET summary/balance com classificação liberado / em aquisição / vencido
3. Hub com **Mostrar valores** + labels claros
4. Modal de saldo com situação por período
5. Modal solicitar férias com aviso quando não há dias liberados

Gerado em: 2026-07-10T21:19:56.840Z
