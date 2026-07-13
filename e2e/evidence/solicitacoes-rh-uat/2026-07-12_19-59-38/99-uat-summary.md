# UAT Solicitações RH — pedido, conversa e aprovação

## Resultado: FALHOU

- **Run:** `2026-07-12_19-59-38`
- **Marker:** `E2E-SR-RH-1783897178080`
- **RequestId:** `cf362aeb-b6b7-4183-896e-9fefbd7ad140`
- **Atores:** colaborador/RH (`leonardo.mendes@liotecnica.com.br` — mesmo usuário local com `rh_requests.manage`)
- **Pasta:** `e2e/evidence/solicitacoes-rh-uat/2026-07-12_19-59-38`
- **Erro:** locator.click: Error: strict mode violation: getByRole('button', { name: 'Fechar', exact: true }) resolved to 2 elements:
    1) <button type="button" aria-label="Fechar" class="pay-modal__close">…</button> aka getByLabel('Fechar')
    2) <button type="button" class="pay-modal__btn pay-modal__btn--ghost">Fechar</button> aka getByText('Fechar')

Call log:
[2m  - waiting for getByRole('button', { name: 'Fechar', exact: true })[22m


## Fluxo validado

1. Colaborador abre Benefícios e envia pedido com observação (marker)
2. RH abre a fila, responde com mensagem + anexo PNG
3. Solicitante responde na aba Meus pedidos
4. RH aprova o pedido
5. API confirma status Approved e eventos Submitted/Message/Approved

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-beneficios.png` | Lista de benefícios |
| 02 | `02-colaborador-beneficio-detalhe.png` | Detalhe do benefício |
| 03 | `03-colaborador-formulario-pedido.png` | Formulário de solicitação |
| 04 | `04-colaborador-pedido-enviado.png` | Após envio |
| 06 | `06-rh-fila-pendente.png` | Fila RH com pedido |
| 07 | `07-rh-detalhe-pendente.png` | Detalhe na fila RH |
| 08 | `08-rh-resposta-preenchida.png` | Resposta RH + anexo |
| 09 | `09-rh-conversa-apos-resposta.png` | Conversa após RH |
| 10 | `10-solicitante-meus-pedidos.png` | Meus pedidos |
| 11 | `11-solicitante-detalhe.png` | Detalhe do solicitante |
| 12 | `12-solicitante-resposta-preenchida.png` | Resposta do solicitante |
| 13 | `13-solicitante-conversa-completa.png` | Conversa completa |
| 14 | `14-rh-antes-aprovar.png` | Antes de aprovar |
| 15 | `15-rh-apos-aprovar.png` | Após aprovação |

Gerado em: 2026-07-12T22:59:54.761Z
